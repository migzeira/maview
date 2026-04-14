import { supabase } from "@/integrations/supabase/client";

/* ── Client-side rate limiter ────────────────────────── */
const rateLimitStore: Record<string, number[]> = {};
function isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  if (!rateLimitStore[key]) rateLimitStore[key] = [];
  rateLimitStore[key] = rateLimitStore[key].filter(t => now - t < windowMs);
  if (rateLimitStore[key].length >= maxRequests) return true;
  rateLimitStore[key].push(now);
  return false;
}

const LS_KEY = "maview_vitrine_config";

export interface VitrineConfig {
  displayName?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  whatsapp?: string;
  theme?: string;
  design?: Record<string, unknown>;
  products?: unknown[];
  links?: unknown[];
  testimonials?: unknown[];
  blocks?: unknown[];
  onboardingDone?: boolean;
  [key: string]: unknown;
}

type SyncStatus = "idle" | "saving" | "saved" | "error";
type SyncListener = (status: SyncStatus) => void;

let _debounceTimer: ReturnType<typeof setTimeout> | null = null;
let _listeners: SyncListener[] = [];
let _pendingConfig: VitrineConfig | null = null;
let _retryCount = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 3000;

export function onSyncStatus(fn: SyncListener) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(l => l !== fn); };
}

function _notify(s: SyncStatus) {
  _listeners.forEach(fn => fn(s));
}

/* ── Read from localStorage ─────────────────────────── */
export function loadLocal(): VitrineConfig {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return {};
  }
}

/* ── Write to localStorage ──────────────────────────── */
export function saveLocal(cfg: VitrineConfig) {
  localStorage.setItem(LS_KEY, JSON.stringify(cfg));
}

/* ── Fetch vitrine from Supabase (for current user) ── */
export async function fetchRemote(): Promise<VitrineConfig | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data, error } = await supabase
    .from("vitrines")
    .select("*")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    displayName: data.display_name || undefined,
    username: data.username ? `@${data.username}` : undefined,
    bio: data.bio || undefined,
    avatarUrl: data.avatar_url || undefined,
    whatsapp: data.whatsapp || undefined,
    theme: data.theme || "dark-purple",
    design: (data.design as Record<string, unknown>) || {},
    products: (data.products as unknown[]) || [],
    links: (data.links as unknown[]) || [],
    testimonials: (data.testimonials as unknown[]) || [],
    blocks: (data.blocks as unknown[]) || [],
    onboardingDone: true,
  };
}

/* ── Fetch vitrine by username (public, for Profile) ── */
export async function fetchByUsername(username: string): Promise<VitrineConfig | null> {
  const { data, error } = await supabase
    .from("vitrines")
    .select("*")
    .eq("username", username)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) return null;

  return {
    displayName: data.display_name || undefined,
    username: data.username ? `@${data.username}` : undefined,
    bio: data.bio || undefined,
    avatarUrl: data.avatar_url || undefined,
    whatsapp: data.whatsapp || undefined,
    theme: data.theme || "dark-purple",
    design: (data.design as Record<string, unknown>) || {},
    products: (data.products as unknown[]) || [],
    links: (data.links as unknown[]) || [],
    testimonials: (data.testimonials as unknown[]) || [],
    blocks: (data.blocks as unknown[]) || [],
  };
}

/* ── Push to Supabase (upsert) with retry ────────────── */
async function pushToRemote(cfg: VitrineConfig): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return false;

  const username = (cfg.username || "").replace(/^@/, "").toLowerCase().trim();
  if (!username) return false;

  const { error } = await supabase
    .from("vitrines")
    .upsert({
      user_id: session.user.id,
      username,
      display_name: cfg.displayName || null,
      bio: cfg.bio || null,
      avatar_url: cfg.avatarUrl || null,
      whatsapp: cfg.whatsapp || null,
      theme: cfg.theme || "dark-purple",
      design: cfg.design || {},
      products: cfg.products || [],
      links: cfg.links || [],
      testimonials: cfg.testimonials || [],
      blocks: cfg.blocks || [],
      published: true,
    }, { onConflict: "user_id" });

  return !error;
}

/* ── Retry failed pushes ─────────────────────────────── */
function scheduleRetry() {
  if (!_pendingConfig || _retryCount >= MAX_RETRIES) {
    _pendingConfig = null;
    _retryCount = 0;
    return;
  }
  _retryCount++;
  setTimeout(async () => {
    if (!_pendingConfig) return;
    const cfg = _pendingConfig;
    const ok = await pushToRemote(cfg);
    if (ok) {
      _pendingConfig = null;
      _retryCount = 0;
      _notify("saved");
    } else {
      scheduleRetry();
    }
  }, RETRY_DELAY * _retryCount);
}

/* ── Save with debounce (call this from editor) ─────── */
export function saveWithSync(cfg: VitrineConfig) {
  saveLocal(cfg);
  _pendingConfig = cfg;
  _notify("saving");

  if (_debounceTimer) clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(async () => {
    const ok = await pushToRemote(cfg);
    if (ok) {
      _pendingConfig = null;
      _retryCount = 0;
      _notify("saved");
    } else {
      _notify("error");
      scheduleRetry();
    }
  }, 2000);
}

/* ── Force save immediately (for manual save button) ─── */
export async function forceSaveNow(cfg: VitrineConfig): Promise<boolean> {
  if (_debounceTimer) {
    clearTimeout(_debounceTimer);
    _debounceTimer = null;
  }
  saveLocal(cfg);
  _notify("saving");
  const ok = await pushToRemote(cfg);
  if (ok) {
    _pendingConfig = null;
    _retryCount = 0;
    _notify("saved");
  } else {
    _notify("error");
    _pendingConfig = cfg;
    scheduleRetry();
  }
  return ok;
}

/* ── Flush pending changes (for beforeunload) ────────── */
export function flushSync() {
  if (_debounceTimer) {
    clearTimeout(_debounceTimer);
    _debounceTimer = null;
  }
  if (_pendingConfig) {
    const cfg = _pendingConfig;
    const username = (cfg.username || "").replace(/^@/, "").toLowerCase().trim();
    if (!username) return;

    // Save to localStorage as safety net
    saveLocal(cfg);

    // Try sendBeacon for reliability during page unload
    const url = `${supabase.supabaseUrl}/rest/v1/vitrines?username=eq.${encodeURIComponent(username)}`;
    const anonKey = supabase.supabaseKey;
    const payload = JSON.stringify({
      display_name: cfg.displayName || "",
      bio: cfg.bio || "",
      avatar_url: cfg.avatarUrl || "",
      whatsapp: cfg.whatsapp || "",
      theme: cfg.theme || "dark-purple",
      design: cfg.design || {},
      products: cfg.products || [],
      links: cfg.links || [],
      testimonials: cfg.testimonials || [],
      blocks: cfg.blocks || [],
    });

    // sendBeacon works during page unload when fetch doesn't
    const sent = navigator.sendBeacon?.(
      url,
      new Blob([payload], { type: "application/json" })
    );

    // Fallback: also try regular push (may or may not complete)
    if (!sent) {
      pushToRemote(cfg).catch(() => {});
    }
    _pendingConfig = null;
  }
}

/* ── Initial load: Supabase is source of truth ───────── */
export async function initialLoad(): Promise<VitrineConfig> {
  const local = loadLocal();
  const remote = await fetchRemote();

  if (!remote) {
    // No remote data — first time or not logged in
    // If local has data, migrate it to Supabase
    if (local.username) {
      pushToRemote(local); // fire and forget migration
    }
    return local;
  }

  // Remote exists — Supabase is source of truth
  // Only use local data for fields that remote doesn't have yet (migration)
  const merged: VitrineConfig = { ...remote };

  // Migration: if remote has no products but local does, push local data up
  // This only runs once — after that, remote is always authoritative
  const needsMigration =
    (!remote.products || (remote.products as unknown[]).length === 0) && local.products && (local.products as unknown[]).length > 0 ||
    (!remote.links || (remote.links as unknown[]).length === 0) && local.links && (local.links as unknown[]).length > 0 ||
    (!remote.testimonials || (remote.testimonials as unknown[]).length === 0) && local.testimonials && (local.testimonials as unknown[]).length > 0;

  if (needsMigration) {
    if (!remote.products?.length && local.products?.length) merged.products = local.products;
    if (!remote.links?.length && local.links?.length) merged.links = local.links;
    if (!remote.testimonials?.length && local.testimonials?.length) merged.testimonials = local.testimonials;
    // Push migrated data to Supabase so future loads are purely remote
    pushToRemote(merged);
  }

  saveLocal(merged);
  return merged;
}

/* ── Register beforeunload handler ───────────────────── */
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    if (_pendingConfig) {
      // Try to flush pending changes
      const cfg = _pendingConfig;
      const username = (cfg.username || "").replace(/^@/, "").toLowerCase().trim();
      if (username) {
        // Use navigator.sendBeacon as last resort (limited but reliable)
        try {
          const payload = JSON.stringify({
            user_id: "pending", // Will be resolved server-side via RLS
            username,
            display_name: cfg.displayName || null,
            bio: cfg.bio || null,
            avatar_url: cfg.avatarUrl || null,
            whatsapp: cfg.whatsapp || null,
            theme: cfg.theme || "dark-purple",
            design: cfg.design || {},
            products: cfg.products || [],
            links: cfg.links || [],
            testimonials: cfg.testimonials || [],
            blocks: cfg.blocks || [],
            published: true,
          });
          // Mark as pending in localStorage so next load can retry
          localStorage.setItem("maview_pending_sync", payload);
        } catch { /* best effort */ }
      }
    }
  });
}

/* ── Retry pending sync from previous session ────────── */
export async function retryPendingSync() {
  const pending = localStorage.getItem("maview_pending_sync");
  if (!pending) return;
  try {
    const cfg = JSON.parse(pending) as VitrineConfig;
    const ok = await pushToRemote(cfg);
    if (ok) {
      localStorage.removeItem("maview_pending_sync");
    }
  } catch {
    localStorage.removeItem("maview_pending_sync");
  }
}

/* ── Check username availability ───────────────────── */
export async function checkUsername(username: string): Promise<"available" | "taken"> {
  const { data } = await supabase
    .from("vitrines")
    .select("username")
    .eq("username", username)
    .maybeSingle();

  return data ? "taken" : "available";
}

/* ── Upload image to Supabase Storage ──────────────── */
export async function uploadImage(
  file: File,
  bucket: "avatars" | "products",
): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${session.user.id}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: "3600", upsert: true });

  if (error) return null;

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return urlData.publicUrl;
}

/* ── Submit lead (email capture on public profile) ──── */
export async function submitLead(
  vitrineUsername: string,
  email: string,
  name?: string,
  source: string = "profile",
): Promise<boolean> {
  // Rate limit: max 5 leads per minute per session
  if (isRateLimited("lead_submit", 5, 60_000)) return false;

  const { data: vitrine } = await supabase
    .from("vitrines")
    .select("id")
    .eq("username", vitrineUsername)
    .maybeSingle();
  if (!vitrine) return false;
  const { error } = await supabase.from("leads").insert({
    vitrine_id: vitrine.id,
    email,
    name: name || null,
    source,
  });
  if (error && error.code !== "23505") return false;

  // Fire webhook if configured
  const { data: vitrineData } = await supabase
    .from("vitrines").select("design").eq("id", vitrine.id).maybeSingle();
  const webhookUrl = (vitrineData?.design as any)?.webhookUrl;
  if (webhookUrl) {
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "new_lead", email, name, source, timestamp: new Date().toISOString() }),
    }).catch(() => {});
  }

  return true;
}

/* ── Fetch leads for current user's vitrine ──────────── */
export async function fetchLeads(): Promise<Array<{
  id: string; email: string; name: string | null; source: string; created_at: string;
}>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return [];
  const { data: vitrine } = await supabase
    .from("vitrines").select("id").eq("user_id", session.user.id).maybeSingle();
  if (!vitrine) return [];
  const { data, error } = await supabase
    .from("leads").select("id, email, name, source, created_at")
    .eq("vitrine_id", vitrine.id).order("created_at", { ascending: false }).limit(100);
  if (error || !data) return [];
  return data;
}

/* ── Fetch orders for current user's vitrine ────────── */
export interface Order {
  id: string;
  payment_id: string | null;
  payment_status: string;
  payment_method: string | null;
  product_title: string;
  amount: number;
  buyer_email: string | null;
  buyer_name: string | null;
  created_at: string;
}

export async function fetchOrders(): Promise<Order[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return [];
  const { data: vitrine } = await supabase
    .from("vitrines").select("id").eq("user_id", session.user.id).maybeSingle();
  if (!vitrine) return [];
  const { data, error } = await supabase
    .from("orders")
    .select("id, payment_id, payment_status, payment_method, product_title, amount, buyer_email, buyer_name, created_at")
    .eq("vitrine_id", vitrine.id)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error || !data) return [];
  return data as Order[];
}

/* ── Create order in Supabase ──────────────────────── */
export async function createOrder(order: {
  vitrine_id: string;
  payment_id: string;
  payment_status: string;
  payment_method: string;
  product_title: string;
  amount: number;
  buyer_email: string | null;
  buyer_name: string | null;
  delivery_url?: string | null;
}): Promise<boolean> {
  const { error } = await supabase.from("orders").insert(order);
  if (error) { console.error("createOrder error:", error); return false; }
  return true;
}

/* ── Get vitrine_id by username (public, no auth needed) ── */
export async function getVitrineIdByUsername(username: string): Promise<string | null> {
  const { data } = await supabase
    .from("vitrines")
    .select("id")
    .eq("username", username.replace(/^@/, "").toLowerCase().trim())
    .maybeSingle();
  return data?.id || null;
}

/* ── Track analytics event ─────────────────────────── */
export async function trackEvent(
  vitrineUsername: string,
  eventType: string,
  metadata: Record<string, unknown> = {},
) {
  // Rate limit: max 30 events per minute per session
  if (isRateLimited("track_event", 30, 60_000)) return;

  // Lookup vitrine_id by username
  const { data: vitrine } = await supabase
    .from("vitrines")
    .select("id")
    .eq("username", vitrineUsername)
    .maybeSingle();

  if (!vitrine) return;

  const device = /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";

  const payload = {
    vitrine_id: vitrine.id,
    event_type: eventType,
    referrer: document.referrer || null,
    device,
    metadata,
  };

  // Use supabase client for non-blocking insert (anon key from client config)
  supabase.from("events").insert(payload).then(() => {}).catch(() => {});
}
