
'use client';

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  getDocs,
  writeBatch,
  Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type FormState = {
  success: boolean;
  message: string;
};

type SchoolYearPayload = {
    name: string;
};

export function createSchoolYear(db: Firestore, payload: SchoolYearPayload) {
  const data = { ...payload, isActive: false };
  addDoc(collection(db, 'school_years'), data)
    .catch((serverError) => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: 'school_years',
            operation: 'create',
            requestResourceData: data,
          })
        );
    });
}

export function updateSchoolYear(db: Firestore, id: string, payload: SchoolYearPayload) {
  const data = { ...payload };
  updateDoc(doc(db, 'school_years', id), data)
    .catch((serverError) => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: `school_years/${id}`,
          operation: 'update',
          requestResourceData: data,
        })
      );
    });
}

export function deleteSchoolYear(db: Firestore, id: string) {
  deleteDoc(doc(db, 'school_years', id))
    .catch((serverError) => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: `school_years/${id}`,
          operation: 'delete',
        })
      );
    });
}

export async function setActiveSchoolYear(db: Firestore, id: string): Promise<FormState> {
    const batch = writeBatch(db);
    const schoolYearsRef = collection(db, 'school_years');
    
    try {
        const querySnapshot = await getDocs(schoolYearsRef);
        querySnapshot.forEach((docSnap) => {
            if (docSnap.id !== id) {
                batch.update(docSnap.ref, { isActive: false });
            }
        });

        const docRef = doc(db, 'school_years', id);
        batch.update(docRef, { isActive: true });

        await batch.commit();

        return { success: true, message: 'Année scolaire activée avec succès.' };

    } catch (error: any) {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: 'school_years',
            operation: 'list', // Could be list or update
          })
        );
        return { success: false, message: 'Une erreur est survenue lors de l\'activation.' };
    }
}
