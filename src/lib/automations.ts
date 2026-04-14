import { supabase } from "@/integrations/supabase/client";

/* ── Types ──────────────────────────────────── */
export type TriggerType = "compra" | "lead" | "visualizacao";
export type ActionType = "email" | "liberar" | "redirecionar";

export interface Automation {
  id: string;
  vitrine_id: string;
  name: string;
  trigger_type: TriggerType;
  action_type: ActionType;
  active: boolean;
  description: string;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateAutomationInput {
  name: string;
  trigger_type: TriggerType;
  action_type: ActionType;
  description?: string;
  config?: Record<string, unknown>;
}

/* ── Helper: get current user's vitrine_id ──── */
async function getVitrineId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data } = await supabase
    .from("vitrines")
    .select("id")
    .eq("user_id", session.user.id)
    .maybeSingle();

  return data?.id || null;
}

/* ── CRUD ───────────────────────────────────── */

export async function fetchAutomations(): Promise<Automation[]> {
  const vitrineId = await getVitrineId();
  if (!vitrineId) return [];

  const { data, error } = await supabase
    .from("automations")
    .select("*")
    .eq("vitrine_id", vitrineId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[automations] fetch error:", error.message);
    return [];
  }

  return (data || []) as Automation[];
}

export async function createAutomation(input: CreateAutomationInput): Promise<Automation | null> {
  const vitrineId = await getVitrineId();
  if (!vitrineId) return null;

  const { data, error } = await supabase
    .from("automations")
    .insert({
      vitrine_id: vitrineId,
      name: input.name,
      trigger_type: input.trigger_type,
      action_type: input.action_type,
      description: input.description || "",
      config: input.config || {},
    })
    .select()
    .single();

  if (error) {
    console.error("[automations] create error:", error.message);
    return null;
  }

  return data as Automation;
}

export async function updateAutomation(
  id: string,
  updates: Partial<Pick<Automation, "name" | "active" | "description" | "config" | "trigger_type" | "action_type">>
): Promise<boolean> {
  const { error } = await supabase
    .from("automations")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("[automations] update error:", error.message);
    return false;
  }

  return true;
}

export async function deleteAutomation(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("automations")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[automations] delete error:", error.message);
    return false;
  }

  return true;
}
