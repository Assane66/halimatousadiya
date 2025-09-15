"use server";

import { z } from "zod";

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

  // In a real application, you would send an email here using a service like Resend or Nodemailer.
  // For this example, we'll just log the data to the console.
  console.log("Contact form submission received:");
  console.log("Name:", validatedFields.data.name);
  console.log("Email:", validatedFields.data.email);
  console.log("Phone:", validatedFields.data.phone);
  console.log("Message:", validatedFields.data.message);

  return {
    message: "Merci ! Votre message a été envoyé avec succès.",
    errors: null,
  };
}
