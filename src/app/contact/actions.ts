
"use server";

import { z } from "zod";
import { Resend } from "resend";
import { CONTACT_INFO } from "@/lib/constants";

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
  } | null;
  message?: string | null;
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
    };
  }

  const { name, email, phone, message } = validatedFields.data;

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set. Email not sent.");
    // In a real app, you might want to return a more user-friendly error
    // but for now, we'll pretend it was successful to not block UI work.
     return {
      message: "Le service d'email n'est pas configuré. Veuillez contacter l'administrateur.",
      errors: null,
    };
  }
  
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: `Contact Form <onboarding@resend.dev>`,
      to: [CONTACT_INFO.email],
      subject: "Nouveau message depuis le formulaire de contact",
      text: `Nom: ${name}\nEmail: ${email}\nTéléphone: ${phone || "Non fourni"}\n\nMessage:\n${message}`,
      reply_to: email,
    });

    if (error) {
      console.error("Resend error:", error);
      return {
        message: "Une erreur est survenue lors de l'envoi du message.",
        errors: null,
      };
    }

    return {
      message: "Merci ! Votre message a été envoyé avec succès.",
      errors: null,
    };
  } catch (error) {
    console.error("Failed to send email", error);
    return {
      message: "Une erreur interne est survenue. Veuillez réessayer plus tard.",
      errors: null,
    };
  }
}
