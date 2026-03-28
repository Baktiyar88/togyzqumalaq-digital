"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/schemas/auth";

export async function serverLogin(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function serverRegister(
  email: string,
  password: string,
  displayName: string,
  locale: string
): Promise<{ success: boolean; error?: string }> {
  const parsed = registerSchema.safeParse({ email, password, displayName, locale });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName, locale: parsed.data.locale },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
