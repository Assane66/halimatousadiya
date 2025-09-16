
"use server";

// This file is no longer used for the contact form as it now redirects to WhatsApp.
// It is kept for potential future use or alternative contact methods.

import { z } from "zod";
import { Resend } from "resend";
import { CONTACT_INFO } from "@/lib/constants";
import { ContactEmailTemplate } from "@/components/email-template";

const contactSchema = z.object({
  name: z.string().min(2, "Le nom est requis."),
  email: z.string().email("L'email est invalide."),
  phone: z.string().optional(),
  message: z.string().min(10, "Le message est trop court."),
});

type State = {
  errors?: {
    name?: string[];
    email?: string[];
    phone?: string[];
    message?: string[];
    _form?: string[];
  } | null;
  message?: string | null;
  success?: boolean;
} | null;

export async function submitContactForm(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Veuillez corriger les erreurs et réessayer.",
      success: false,
    };
  }

  return {
    message: `Merci pour votre intérêt ! Pour finaliser votre demande, veuillez nous contacter directement par email à ${CONTACT_INFO.email} ou par téléphone.`,
    errors: null,
    success: true,
  };
}
