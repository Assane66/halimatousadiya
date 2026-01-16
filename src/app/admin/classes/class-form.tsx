
'use client';

import { useState, useEffect } from 'react';
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
import type { Class } from './types';
import { createClass, updateClass } from './actions';

const formSchema = z.object({
  name: z.string().min(1, 'Le nom est requis.'),
  level: z.string().min(1, 'Le niveau est requis.'),
});

interface ClassFormProps {
  isOpen: boolean;
  onClose: (shouldReload: boolean) => void;
  schoolYearId: string;
  classData?: Class | null;
}

export function ClassForm({ isOpen, onClose, schoolYearId, classData }: ClassFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isEditing = !!classData;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      level: '',
    },
  });
  
  useEffect(() => {
    if (isOpen) {
        form.reset({
            name: classData?.name || '',
            level: classData?.level || '',
        });
    }
  }, [isOpen, classData, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    const payload = { ...values, schoolYearId };
    
    const result = isEditing && classData
      ? await updateClass(classData.id, payload)
      : await createClass(payload);

    if (result.success) {
      toast({
        title: isEditing ? 'Classe modifiée' : 'Classe créée',
        description: `La classe "${values.name}" a été ${isEditing ? 'mise à jour' : 'créée'}.`,
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier la classe' : 'Ajouter une classe'}</DialogTitle>
          <DialogDescription>
            Remplissez les détails de la classe ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la classe</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 6ème A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 6ème" {...field} />
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
