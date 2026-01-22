
'use client';

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type ClassPayload = {
    name: string;
    level: string;
    schoolYearId: string;
};

export function createClass(db: Firestore, payload: ClassPayload) {
  const data = { ...payload };
  addDoc(collection(db, 'classes'), data)
    .catch((serverError) => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: 'classes',
          operation: 'create',
          requestResourceData: data,
        })
      );
      console.error('Erreur lors de la création de la classe:', serverError);
    });
}

export function updateClass(db: Firestore, id: string, payload: Partial<ClassPayload>) {
  const data = { ...payload };
  updateDoc(doc(db, 'classes', id), data)
    .catch((serverError) => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: `classes/${id}`,
          operation: 'update',
          requestResourceData: data,
        })
      );
      console.error('Erreur lors de la modification de la classe:', serverError);
    });
}

export function deleteClass(db: Firestore, id: string) {
  deleteDoc(doc(db, 'classes', id))
    .catch((serverError) => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: `classes/${id}`,
          operation: 'delete',
        })
      );
      console.error('Erreur lors de la suppression de la classe:', serverError);
    });
}
