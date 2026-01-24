
'use client';

import {
  collection,
  query,
  where,
  getDocs,
  limit,
  addDoc,
  serverTimestamp,
  Timestamp,
  Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type PaymentPayload = {
  studentId: string;
  amount: number;
  type: 'Inscription' | 'Mensualite' | 'Autre';
  date: Date;
};

type StudentSearchResult = {
  id: string;
  name: string;
  matricule: string;
};

export async function searchStudents(db: Firestore, searchTerm: string): Promise<StudentSearchResult[]> {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }
  const studentsRef = collection(db, 'students');

  const searchTermUpper = searchTerm.toUpperCase();
  const nameQuery = query(studentsRef,
    where('lastName', '>=', searchTerm),
    where('lastName', '<=', searchTerm + '\uf8ff'),
    limit(5));

  const matriculeQuery = query(studentsRef,
    where('matriculeNumber', '>=', searchTermUpper),
    where('matriculeNumber', '<=', searchTermUpper + '\uf8ff'),
    limit(5));

  try {
    const [nameSnapshot, matriculeSnapshot] = await Promise.all([
      getDocs(nameQuery),
      getDocs(matriculeQuery),
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
  } catch (error) {
    console.error("Erreur lors de la recherche d'élèves:", error);
    return [];
  }
}

async function getActiveSchoolYearId(db: Firestore): Promise<string> {
  const schoolYearRef = collection(db, 'school_years');
  const q = query(schoolYearRef, where('isActive', '==', true), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    throw new Error("Aucune année scolaire active trouvée. Veuillez en activer une.");
  }
  return snapshot.docs[0].id;
}


export async function createPayment(db: Firestore, payload: PaymentPayload): Promise<void> {
  try {
    const activeSchoolYearId = await getActiveSchoolYearId(db);

    console.log("Année scolaire active pour le paiement:", activeSchoolYearId);

    const data = {
      ...payload,
      schoolYearId: activeSchoolYearId,
      amount: Number(payload.amount),
      date: Timestamp.fromDate(new Date(payload.date)),
      createdAt: serverTimestamp(),
    };

    console.log("Tentative d'enregistrement du paiement:", data);
    await addDoc(collection(db, 'payments'), data);
    console.log("Paiement enregistré avec succès !");
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: 'payments',
          operation: 'create',
        })
      );
    }
    throw error;
  }
}
