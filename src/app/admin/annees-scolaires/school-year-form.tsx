
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: schoolYearData?.name || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    const result = isEditing
      ? await updateSchoolYear(schoolYearData.id, values)
      : await createSchoolYear(values);

    if (result.success) {
      toast({
        title: isEditing ? 'Année scolaire modifiée' : 'Année scolaire créée',
        description: `L'année "${values.name}" a été ${isEditing ? 'mise à jour' : 'créée'}.`,
      });
      onClose(true);
    } else {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: result.message,
      });
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier l\'année scolaire' : 'Ajouter une année scolaire'}</DialogTitle>
          <DialogDescription>
            Utilisez un format comme "2024-2025".
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'année scolaire</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 2024-2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onClose(false)} disabled={isSubmitting}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
