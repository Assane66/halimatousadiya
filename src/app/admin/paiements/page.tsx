
'use client';

import { useState, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Student, Payment, SchoolYear } from './types';
import { StudentSearch } from './student-search';
import { PaymentList } from './payment-list';
import { PaymentForm } from './payment-form';

export default function PaymentsPage() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleStudentSelect = useCallback((student: Student | null) => {
    setSelectedStudent(student);
    if (student) {
      fetchPayments(student.id);
    } else {
      setPayments([]);
    }
  }, []);

  const fetchPayments = useCallback(async (studentId: string) => {
    setIsLoadingPayments(true);
    try {
      const paymentsCollection = collection(firestore, 'payments');
      const q = query(paymentsCollection, where('studentId', '==', studentId), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const paymentsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: (data.date as Timestamp)?.toDate(),
        } as Payment;
      });
      setPayments(paymentsData);
    } catch (error) {
      console.error("Erreur de chargement des paiements:", error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les paiements pour cet élève.',
      });
    } finally {
      setIsLoadingPayments(false);
    }
  }, [firestore, toast]);

  const handleFormClose = (shouldReload: boolean) => {
    setIsFormOpen(false);
    if (shouldReload && selectedStudent) {
      fetchPayments(selectedStudent.id);
    }
  };

  return (
    <div>
      <PageHeader
        title="Gestion des Paiements"
        subtitle="Recherchez un élève pour enregistrer ou consulter ses paiements."
      >
        {selectedStudent && (
          <Button onClick={() => setIsFormOpen(true)}>
            Ajouter un paiement
          </Button>
        )}
      </PageHeader>

      <div className="p-4 space-y-6">
        <StudentSearch onStudentSelect={handleStudentSelect} />
        
        {selectedStudent && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Historique pour {selectedStudent.firstName} {selectedStudent.lastName}
            </h2>
            <PaymentList payments={payments} isLoading={isLoadingPayments} />
          </div>
        )}
      </div>

      {isFormOpen && selectedStudent && (
        <PaymentForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          studentId={selectedStudent.id}
        />
      )}
    </div>
  );
}
