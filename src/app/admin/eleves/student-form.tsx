
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
    try {
      if (isEditing && studentData) {
        await updateStudent(firestore, studentData.id, values);
      } else {
        await createStudent(firestore, values);
      }

      toast({
        title: isEditing ? 'Élève modifié' : 'Élève inscrit',
        description: `L'élève ${values.firstName} ${values.lastName} a été ${isEditing ? 'mis à jour' : 'inscrit'}.`,
      });
      onClose(true);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'enregistrement.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-2xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
        <DialogHeader className="bg-emerald-600 p-8 text-white">
          <DialogTitle className="text-2xl font-bold uppercase tracking-tight">
            {isEditing ? 'Modifier l\'élève' : 'Inscrire un élève'}
          </DialogTitle>
          <DialogDescription className="text-emerald-100 opacity-90">
            Remplissez les informations de l'élève. Le matricule est automatique.
          </DialogDescription>
        </DialogHeader>
        <div className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-slate-900 font-bold uppercase tracking-widest text-[10px]">Nom</FormLabel>
                    <FormControl><Input placeholder="Ex: Ba" {...field} className="rounded-xl border-slate-200 h-11" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-slate-900 font-bold uppercase tracking-widest text-[10px]">Prénom</FormLabel>
                    <FormControl><Input placeholder="Ex: Assane" {...field} className="rounded-xl border-slate-200 h-11" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField control={form.control} name="dateOfBirth" render={({ field }) => {
                  const [dateInput, setDateInput] = useState(field.value ? format(field.value, "dd/MM/yyyy") : '');

                  return (
                    <FormItem className="flex flex-col space-y-1">
                      <FormLabel className="text-slate-900 font-bold uppercase tracking-widest text-[10px]">Date de Naissance</FormLabel>
                      <Popover>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              placeholder="JJ/MM/AAAA"
                              className="rounded-xl border-slate-200 h-11 flex-1"
                              value={dateInput}
                              onChange={(e) => {
                                const val = e.target.value;
                                setDateInput(val);
                                if (val.length === 10) {
                                  const [d, m, y] = val.split('/').map(Number);
                                  const date = new Date(y, m - 1, d);
                                  if (!isNaN(date.getTime()) && y > 1900 && y < 2100) {
                                    field.onChange(date);
                                  }
                                }
                              }}
                            />
                          </FormControl>
                          <PopoverTrigger asChild>
                            <Button variant={"outline"} className="w-11 h-11 rounded-xl border-slate-200 p-0 flex items-center justify-center shrink-0 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                              <CalendarIcon className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                        </div>
                        <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              if (date) setDateInput(format(date, "dd/MM/yyyy"));
                            }}
                            disabled={(date) => date > new Date() || date < new Date("1930-01-01")}
                            initialFocus
                            captionLayout="dropdown-buttons"
                            fromYear={1930}
                            toYear={new Date().getFullYear()}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-slate-900 font-bold uppercase tracking-widest text-[10px]">Sexe</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="rounded-xl border-slate-200 h-11"><SelectValue placeholder="Choisir" /></SelectTrigger></FormControl>
                      <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                        <SelectItem value="Masculin" className="rounded-xl cursor-pointer focus:bg-emerald-50 focus:text-emerald-700">Masculin</SelectItem>
                        <SelectItem value="Féminin" className="rounded-xl cursor-pointer focus:bg-emerald-50 focus:text-emerald-700">Féminin</SelectItem>
                      </SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField control={form.control} name="classId" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-slate-900 font-bold uppercase tracking-widest text-[10px]">Classe</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="rounded-xl border-slate-200 h-11"><SelectValue placeholder="Choisir" /></SelectTrigger></FormControl>
                      <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                        {classes.map(c => <SelectItem key={c.id} value={c.id} className="rounded-xl cursor-pointer focus:bg-emerald-50 focus:text-emerald-700">{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="parentPhoneNumber" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-slate-900 font-bold uppercase tracking-widest text-[10px]">Téléphone Parent</FormLabel>
                    <FormControl><Input placeholder="Ex: 78 777 07 07" {...field} className="rounded-xl border-slate-200 h-11" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-slate-900 font-bold uppercase tracking-widest text-[10px]">Adresse</FormLabel>
                  <FormControl><Input placeholder="Quartier, Rue ..." {...field} className="rounded-xl border-slate-200 h-11" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

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
