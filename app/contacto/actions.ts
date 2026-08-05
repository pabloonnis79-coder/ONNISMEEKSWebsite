"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";

const schema = z.object({
  name: z.string().trim().min(2, "Escribí tu nombre").max(120),
  email: z.string().trim().email("Revisá el correo, no parece válido"),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  budget: z.string().trim().max(60).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(20, "Contanos un poco más, al menos 20 caracteres")
    .max(4000),
  // Campo trampa: los formularios automáticos lo completan, las personas no.
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "message", string>>;
};

export async function sendContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company"),
    budget: formData.get("budget"),
    message: formData.get("message"),
    website: formData.get("website"),
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    if (flat.website) return { status: "ok", message: "Mensaje enviado." };

    return {
      status: "error",
      message: "Revisá los campos marcados.",
      fieldErrors: {
        name: flat.name?.[0],
        email: flat.email?.[0],
        message: flat.message?.[0],
      },
    };
  }

  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      status: "error",
      message:
        "El formulario todavía no está conectado. Escribinos por correo y te respondemos igual.",
    };
  }

  const { name, email, company, budget, message } = parsed.data;

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      company: company || null,
      budget: budget || null,
      message,
    });

    if (error) throw new Error(error.message);

    return {
      status: "ok",
      message: "Recibimos tu mensaje. Te respondemos dentro de las 48 horas hábiles.",
    };
  } catch (error) {
    console.error("[contacto]", error);
    return {
      status: "error",
      message: "No pudimos enviar el mensaje. Probá de nuevo o escribinos por correo.",
    };
  }
}
