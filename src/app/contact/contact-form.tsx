
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  phone: z.string().optional(),
  message: z.string().min(10, {
    message: "Le message doit contenir au moins 10 caractères.",
  }),
});

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const { name, email, phone, message } = values;

    // 1. Save to Firestore
    try {
      const firestore = (window as any).firebaseFirestore; // Quick access or better import
      // Since useFirestore is not available here easily without refactoring, I'll use the client access if possible
      // But better to just use regular firebase client
      const { getFirestore, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const { getApp } = await import('firebase/app');
      const db = getFirestore(getApp());

      await addDoc(collection(db, 'messages'), {
        name,
        email,
        phone: phone || "Non fourni",
        message,
        status: 'new',
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Error saving message to firestore", e);
    }

    const whatsappMessage = `
Bonjour,
Je vous contacte depuis votre site web.
*Nom :* ${name}
*Email :* ${email}
*Téléphone :* ${phone || "Non fourni"}
*Message :*
${message}
    `;

    const encodedMessage = encodeURIComponent(whatsappMessage.trim());
    const whatsappUrl = `https://wa.me/221786881105?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");

    form.reset();
    setIsSubmitting(false);
  }

  return (
    <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
      <CardHeader className="bg-emerald-600 p-8 text-white">
        <CardTitle className="text-2xl font-bold">Envoyez-nous un message</CardTitle>
        <p className="text-emerald-100 text-sm mt-2">Nous vous répondrons dans les plus brefs délais.</p>
      </CardHeader>
      <CardContent className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-slate-900 font-bold uppercase tracking-widest text-[10px]">Nom complet</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Assane Ba" {...field} className="rounded-xl border-slate-200 focus:ring-emerald-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-slate-900 font-bold uppercase tracking-widest text-[10px]">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Votre email" {...field} className="rounded-xl border-slate-200 focus:ring-emerald-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-slate-900 font-bold uppercase tracking-widest text-[10px]">Téléphone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 78 777 07 07"
                        {...field}
                        className="rounded-xl border-slate-200 focus:ring-emerald-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-slate-900 font-bold uppercase tracking-widest text-[10px]">Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tapez votre message ici..."
                      className="min-h-[150px] rounded-2xl border-slate-200 focus:ring-emerald-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full py-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200 font-bold uppercase tracking-widest text-xs transition-all hover:scale-[1.02]">
              {isSubmitting
                ? "Traitement en cours..."
                : "Envoyer le message"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
