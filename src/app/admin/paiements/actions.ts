
'use server';

import { revalidatePath } from 'next/cache';
import { firestore } from '@/firebase/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

type FormState = {
  success: boolean;
  message: string;
};

type PaymentPayload = {
    studentId: string;
    amount: number;
    type: 'Inscription' | 'Mensualite' | 'Autre';
    date: Date;
    schoolYearId: string;
};

type StudentSearchResult = {
    id: string;
    name: string;
    matricule: string;
};

export async function searchStudents(searchTerm: string): Promise<StudentSearchResult[]> {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }
  const studentsRef = firestore.collection('students');
  
  // This is a simplified search. For production, consider a more robust search solution like Algolia or Typesense.
  // We search by name and matricule number.
  const nameQuery = studentsRef
    .where('lastName', '>=', searchTerm)
    .where('lastName', '<=', searchTerm + '\uf8ff')
    .limit(5);

  const matriculeQuery = studentsRef
    .where('matriculeNumber', '>=', searchTerm.toUpperCase())
    .where('matriculeNumber', '<=', searchTerm.toUpperCase() + '\uf8ff')
    .limit(5);

  const [nameSnapshot, matriculeSnapshot] = await Promise.all([
    nameQuery.get(),
    matriculeQuery.get(),
  ]);

  const studentsMap = new Map<string, StudentSearchResult>();

  nameSnapshot.forEach(doc => {
    const data = doc.data();
    studentsMap.set(doc.id, {
      id: doc.id,
      name: `${data.firstName} ${data.lastName}`,
      matricule: data.matriculeNumber,
    });
  });

  matriculeSnapshot.forEach(doc => {
    const data = doc.data();
    studentsMap.set(doc.id, {
      id: doc.id,
      name: `${data.firstName} ${data.lastName}`,
      matricule: data.matriculeNumber,
    });
  });

  return Array.from(studentsMap.values());
}


async function getActiveSchoolYearId(): Promise<string> {
    const schoolYearRef = firestore.collection('school_years');
    const q = schoolYearRef.where('isActive', '==', true).limit(1);
    const snapshot = await q.get();
    if (snapshot.empty) {
        throw new Error("Aucune année scolaire active trouvée. Veuillez en activer une.");
    }
    return snapshot.docs[0].id;
}


export async function createPayment(payload: Omit<PaymentPayload, 'schoolYearId'>): Promise<FormState> {
  try {
    const activeSchoolYearId = await getActiveSchoolYearId();
    const docRef = firestore.collection('payments').doc();
    
    await docRef.set({
      ...payload,
      id: docRef.id,
      schoolYearId: activeSchoolYearId,
      amount: Number(payload.amount), // Ensure amount is a number
      date: Timestamp.fromDate(new Date(payload.date)),
      createdAt: FieldValue.serverTimestamp(),
    });
    
    // Revalidating the generic path, as we don't have a specific student page yet
    revalidatePath('/admin/paiements');
    return { success: true, message: 'Paiement enregistré avec succès.' };
  } catch (error: any) {
    console.error('Erreur lors de la création du paiement:', error);
    return { success: false, message: error.message || 'Une erreur est survenue.' };
  }
}
