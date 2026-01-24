
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Printer, FileText } from 'lucide-react';
import type { Payment } from './types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PaymentListProps {
  payments: Payment[];
  isLoading: boolean;
  studentName?: string;
}

export function PaymentList({ payments, isLoading, studentName }: PaymentListProps) {

  const handlePrint = (payment: Payment) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const amountStr = new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(payment.amount);

    printWindow.document.write(`
      <html>
        <head>
          <title>Reçu de Paiement - ${studentName}</title>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
            .receipt { border: 2px solid #10b981; padding: 30px; border-radius: 20px; max-width: 600px; margin: auto; }
            .header { text-align: center; border-bottom: 2px solid #f0fdf4; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-weight: bold; font-size: 24px; color: #065f46; margin-bottom: 5px; }
            .title { text-transform: uppercase; letter-spacing: 2px; font-size: 14px; font-weight: bold; color: #10b981; }
            .row { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px dashed #eee; padding-bottom: 5px; }
            .label { font-weight: bold; color: #666; }
            .value { font-weight: bold; color: #111; }
            .amount { font-size: 32px; font-weight: 900; color: #10b981; text-align: center; margin: 30px 0; }
            .footer { text-align: center; font-size: 12px; color: #999; margin-top: 40px; border-top: 1px solid #eee; pt: 20px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="logo">Institut Yaye Halimatou Saadiya</div>
              <div class="title">Reçu de Paiement Officiel</div>
            </div>
            <div class="row"><span class="label">Élève:</span> <span class="value">${studentName}</span></div>
            <div class="row"><span class="label">Type de Frais:</span> <span class="value">${payment.type}</span></div>
            <div class="row"><span class="label">Date:</span> <span class="value">${format(payment.date, 'dd MMMM yyyy', { locale: fr })}</span></div>
            <div class="row"><span class="label">Référence:</span> <span class="value">REF-${payment.id.substring(0, 8).toUpperCase()}</span></div>
            
            <div class="amount">${amountStr}</div>
            
            <div class="row"><span class="label">Mode:</span> <span class="value">Espèces / Chèque</span></div>
            
            <div class="footer">
              Ce reçu sert de preuve de paiement. Aucune modification manuelle n'est valide.<br>
              Généré le ${format(new Date(), 'dd/MM/yyyy HH:mm')}
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-none bg-slate-50/50">
            <TableHead className="pl-8 py-5 text-slate-400 font-black uppercase tracking-widest text-[10px]">Date</TableHead>
            <TableHead className="py-5 text-slate-400 font-black uppercase tracking-widest text-[10px]">Type de frais</TableHead>
            <TableHead className="py-5 text-slate-400 font-black uppercase tracking-widest text-[10px]">Montant</TableHead>
            <TableHead className="text-right pr-8 py-5 text-slate-400 font-black uppercase tracking-widest text-[10px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-60 text-center py-20 text-slate-500">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                    <FileText className="w-6 h-6 text-slate-200" />
                  </div>
                  <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Aucun versement enregistré</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id} className="group hover:bg-emerald-50/30 transition-all border-none">
                <TableCell className="pl-8 py-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{format(payment.date, 'dd MMM yyyy', { locale: fr })}</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase">{format(payment.date, 'HH:mm')}</span>
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <Badge className={`
                    border-none font-black uppercase tracking-widest text-[9px] px-3 py-1 rounded-full
                    ${payment.type === 'Inscription' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}
                  `}>
                    {payment.type}
                  </Badge>
                </TableCell>
                <TableCell className="py-6">
                  <span className="font-black text-slate-900 text-lg">
                    {new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(payment.amount)}
                  </span>
                </TableCell>
                <TableCell className="text-right pr-8 py-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePrint(payment)}
                    className="rounded-xl gap-2 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-all font-bold text-xs uppercase tracking-tight"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Reçu</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
