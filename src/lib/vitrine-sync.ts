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

/* ── Push to Supabase (upsert) ─────────────────────── */
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

/* ── Save with debounce (call this from editor) ─────── */
export function saveWithSync(cfg: VitrineConfig) {
  saveLocal(cfg);
  _notify("saving");

  if (_debounceTimer) clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(async () => {
    const ok = await pushToRemote(cfg);
    _notify(ok ? "saved" : "error");
  }, 2000);
}

/* ── Initial load: merge local + remote (remote wins) ─ */
export async function initialLoad(): Promise<VitrineConfig> {
  const local = loadLocal();
  const remote = await fetchRemote();

  if (!remote) {
    // No remote data — first time or not logged in
    // If local has data, push it to Supabase (migration)
    if (local.username) {
      pushToRemote(local); // fire and forget
    }
    return local;
  }

  // Remote exists — merge (remote wins for conflicts, local adds missing)
  const merged: VitrineConfig = { ...local, ...remote };

  // But keep local products/links/testimonials if remote is empty
  if ((!remote.products || (remote.products as unknown[]).length === 0) && local.products) {
    merged.products = local.products;
  }
  if ((!remote.links || (remote.links as unknown[]).length === 0) && local.links) {
    merged.links = local.links;
  }
  if ((!remote.testimonials || (remote.testimonials as unknown[]).length === 0) && local.testimonials) {
    merged.testimonials = local.testimonials;
  }

  saveLocal(merged);
  return merged;
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

  // Use sendBeacon for non-blocking (with fetch fallback)
  if (navigator.sendBeacon) {
    // sendBeacon can't set auth headers, so use fetch for authenticated inserts
    // But events policy allows anonymous inserts, so we can use a direct POST
    const url = `https://vvpthwzbwvpxddzqucuw.supabase.co/rest/v1/events`;
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    const headers = new Headers({
      "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2cHRod3pid3ZweGRkenF1Y3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0OTA5NDUsImV4cCI6MjA5MTA2Njk0NX0.Yx44DL_-0dNB0NhkIEowsMZPECp5hP8TyVYDsZG8nYI",
      "Content-Type": "application/json",
      "Prefer": "return=minimal",
    });
    // sendBeacon doesn't support custom headers, fallback to fetch
    fetch(url, { method: "POST", headers, body: JSON.stringify(payload), keepalive: true }).catch(() => {});
  } else {
    supabase.from("events").insert(payload).then(() => {});
  }
}
