"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type AuthResult = {
  error?: string;
  success?: boolean;
  needsConfirmation?: boolean;
  message?: string;
};

export async function signUp(
  _previousState: AuthResult | undefined,
  formData: FormData
): Promise<AuthResult> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "").trim();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name: name || "Default Profile" },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session) {
    redirect("/", "replace");
  }

  return {
    success: true,
    needsConfirmation: true,
    message: "Check your email to confirm your account before signing in.",
  };
}

export async function signIn(
  _previousState: AuthResult | undefined,
  formData: FormData
): Promise<AuthResult> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/", "replace");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login", "replace");
}
