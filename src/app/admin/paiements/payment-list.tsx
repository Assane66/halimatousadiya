
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
import type { Payment } from './types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PaymentListProps {
  payments: Payment[];
  isLoading: boolean;
}

export function PaymentList({ payments, isLoading }: PaymentListProps) {

  if (isLoading) {
    return (
        <div className="space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Montant</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                Aucun paiement trouvé pour cet élève.
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {format(payment.date, 'dd MMMM yyyy', { locale: fr })}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{payment.type}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(payment.amount)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
