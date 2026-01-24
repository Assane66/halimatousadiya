
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { SchoolYear } from './types';
import { createSchoolYear, updateSchoolYear } from './actions';
import { useFirestore } from '@/firebase';

const formSchema = z.object({
  name: z.string().min(4, "Le nom doit contenir au moins 4 caractères, ex: '2024-2025'."),
});

interface SchoolYearFormProps {
  isOpen: boolean;
  onClose: (shouldReload: boolean) => void;
  schoolYearData?: SchoolYear | null;
}

export function SchoolYearForm({ isOpen, onClose, schoolYearData }: SchoolYearFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isEditing = !!schoolYearData;
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: schoolYearData?.name || '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    if (isEditing && schoolYearData) {
      updateSchoolYear(firestore, schoolYearData.id, values);
    } else {
      createSchoolYear(firestore, values);
    }

    toast({
      title: isEditing ? 'Année scolaire modifiée' : 'Année scolaire créée',
      description: `L'année "${values.name}" a été ${isEditing ? 'mise à jour' : 'créée'}.`,
    });
    onClose(true);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
        <DialogHeader className="bg-emerald-600 p-8 text-white">
          <DialogTitle className="text-2xl font-bold uppercase tracking-tight">
            {isEditing ? 'Modifier l\'année' : 'Nouvelle Année'}
          </DialogTitle>
          <DialogDescription className="text-emerald-100 opacity-90">
            Configurez une période scolaire au format "2024-2025".
          </DialogDescription>
        </DialogHeader>
        <div className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-slate-900 font-bold uppercase tracking-widest text-[10px]">Nom de l'année scolaire</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 2024-2025"
                        {...field}
                        className="rounded-xl border-slate-200 focus:ring-emerald-500 h-12 text-lg font-medium"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex gap-3 sm:justify-between items-center sm:gap-0 mt-8">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onClose(false)}
                  disabled={isSubmitting}
                  className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-12 px-6"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold uppercase tracking-widest text-[10px] h-12 px-8 shadow-lg shadow-emerald-200"
                >
                  {isSubmitting ? 'Traitement...' : 'Enregistrer'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
