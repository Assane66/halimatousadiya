
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2, Wallet, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { createPayment } from './actions';
import { useFirestore } from '@/firebase';

const formSchema = z.object({
  amount: z.preprocess(
    (val) => Number(String(val)),
    z.number()
      .min(500, "Le montant minimum est de 500 FCFA")
      .positive("Le montant doit être positif.")
  ),
  type: z.enum(['Inscription', 'Mensualite', 'Autre'], { required_error: 'Le type est requis.' }),
  date: z.date({ required_error: 'La date est requise.' }),
});

interface PaymentFormProps {
  isOpen: boolean;
  onClose: (shouldReload: boolean) => void;
  studentId: string;
}

export function PaymentForm({ isOpen, onClose, studentId }: PaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      type: 'Mensualite',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const payload = { ...values, studentId };
      await createPayment(firestore, payload);

      toast({
        title: '✓ Versement Enregistré',
        description: `Le versement de ${new Intl.NumberFormat('fr-SN').format(values.amount)} FCFA a été ajouté.`,
        className: 'bg-emerald-600 text-white border-none rounded-2xl'
      });
      onClose(true);
    } catch (error) {
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
      <DialogContent className="sm:max-w-[425px] border-none rounded-[2rem] p-0 overflow-hidden bg-white shadow-2xl">
        <div className="bg-emerald-600 p-8 text-white relative">
          <div className="relative z-10">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight font-outfit">Encaisser</DialogTitle>
            <DialogDescription className="text-emerald-100 mt-1 font-medium">
              Saisie d'un nouveau versement scolaire
            </DialogDescription>
          </div>
          <Wallet className="absolute right-6 top-1/2 -translate-y-1/2 w-20 h-20 text-white opacity-10" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Montant du versement (FCFA)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="Ex: 25000"
                          {...field}
                          className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:ring-emerald-500 text-lg font-bold pl-4"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-300">FCFA</div>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-none shadow-xl">
                          <SelectItem value="Mensualite" className="rounded-lg">Mensualité</SelectItem>
                          <SelectItem value="Inscription" className="rounded-lg">Inscription</SelectItem>
                          <SelectItem value="Autre" className="rounded-lg">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("h-12 rounded-2xl border-slate-100 bg-slate-50 pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                              {field.value ? format(field.value, "dd/MM/yyyy") : <span>Date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="end">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-100 text-sm font-black uppercase tracking-widest gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                {isSubmitting ? 'Enregistrement...' : 'Valider le paiement'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onClose(false)}
                disabled={isSubmitting}
                className="w-full h-12 rounded-2xl text-slate-400 font-bold text-xs uppercase hover:bg-slate-50"
              >
                Annuler
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
