
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import type { Student, Class } from './types';
import { createStudent, updateStudent } from './actions';
import { useFirestore } from '@/firebase';

const formSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis.'),
  lastName: z.string().min(2, 'Le nom est requis.'),
  dateOfBirth: z.date({ required_error: 'La date de naissance est requise.' }),
  gender: z.enum(['Masculin', 'Féminin'], { required_error: 'Le sexe est requis.' }),
  classId: z.string({ required_error: 'La classe est requise.' }),
  parentPhoneNumber: z.string().min(9, 'Numéro de téléphone invalide.'),
  address: z.string().min(3, 'L\'adresse est requise.'),
});

interface StudentFormProps {
  isOpen: boolean;
  onClose: (shouldReload: boolean) => void;
  classId: string;
  classes: Class[];
  studentData?: Student | null;
}

export function StudentForm({ isOpen, onClose, classId, classes, studentData }: StudentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isEditing = !!studentData;
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: studentData?.firstName || '',
      lastName: studentData?.lastName || '',
      dateOfBirth: studentData?.dateOfBirth,
      gender: studentData?.gender as 'Masculin' | 'Féminin' | undefined,
      classId: studentData?.classId || classId,
      parentPhoneNumber: studentData?.parentPhoneNumber || '',
      address: studentData?.address || '',
    },
  });

  useEffect(() => {
    form.reset({
      firstName: studentData?.firstName || '',
      lastName: studentData?.lastName || '',
      dateOfBirth: studentData?.dateOfBirth ? new Date(studentData.dateOfBirth) : undefined,
      gender: studentData?.gender as 'Masculin' | 'Féminin' | undefined,
      classId: studentData?.classId || classId,
      parentPhoneNumber: studentData?.parentPhoneNumber || '',
      address: studentData?.address || '',
    });
  }, [studentData, classId, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    const result = isEditing && studentData
      ? await updateStudent(firestore, studentData.id, values)
      : await createStudent(firestore, values);

    if (result.success) {
      toast({
        title: isEditing ? 'Élève modifié' : 'Élève inscrit',
        description: `L'élève ${values.firstName} ${values.lastName} a été ${isEditing ? 'mis à jour' : 'inscrit'}.`,
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier l\'élève' : 'Inscrire un nouvel élève'}</DialogTitle>
          <DialogDescription>
            Remplissez les informations de l'élève. Le numéro matricule sera généré automatiquement.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem><FormLabel>Nom</FormLabel><FormControl><Input placeholder="Nom de famille" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem><FormLabel>Prénom</FormLabel><FormControl><Input placeholder="Prénom" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </div>
             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                  <FormItem className="flex flex-col"><FormLabel>Date de Naissance</FormLabel><Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "dd MMMM yyyy", { locale: fr }) : <span>Choisir une date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1930-01-01")} initialFocus />
                    </PopoverContent>
                  </Popover><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem><FormLabel>Sexe</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner le sexe" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Masculin">Masculin</SelectItem>
                      <SelectItem value="Féminin">Féminin</SelectItem>
                    </SelectContent>
                  </Select><FormMessage /></FormItem>
                )}/>
             </div>
             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField control={form.control} name="classId" render={({ field }) => (
                  <FormItem><FormLabel>Classe</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Choisir une classe" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="parentPhoneNumber" render={({ field }) => (
                    <FormItem><FormLabel>Téléphone Parent</FormLabel><FormControl><Input placeholder="Numéro de téléphone du parent" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
            <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem><FormLabel>Adresse</FormLabel><FormControl><Input placeholder="Adresse de l'élève" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onClose(false)} disabled={isSubmitting}>Annuler</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Enregistrement...' : 'Enregistrer'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
