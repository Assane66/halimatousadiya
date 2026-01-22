
'use client';

import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
  Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type FormState = {
  success: boolean;
  message: string;
};

type StudentPayload = {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: 'Masculin' | 'Féminin';
    classId: string;
    parentPhoneNumber: string;
    address: string;
};

async function generateMatriculeNumber(db: Firestore): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2); // Last two digits of the year
    const studentsRef = collection(db, 'students');
    const q = query(studentsRef, orderBy('matriculeNumber', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    
    let lastNumber = 0;
    if (!snapshot.empty) {
        const lastMatricule = snapshot.docs[0].data().matriculeNumber;
        const lastMatriculeNumberPart = lastMatricule.slice(-4);
        if (/^\d{4}$/.test(lastMatriculeNumberPart)) {
            lastNumber = parseInt(lastMatriculeNumberPart, 10);
        }
    }
    
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    return `YHS${year}${newNumber}`;
}

export async function createStudent(db: Firestore, payload: StudentPayload): Promise<FormState> {
  try {
    const matriculeNumber = await generateMatriculeNumber(db);
    
    const data = {
      ...payload,
      matriculeNumber,
      isActive: true,
      createdAt: serverTimestamp(),
      dateOfBirth: Timestamp.fromDate(new Date(payload.dateOfBirth)),
    };

    await addDoc(collection(db, 'students'), data);
    
    return { success: true, message: 'Élève créé avec succès.' };
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'élève:', error);
    errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: 'students',
          operation: 'create',
          requestResourceData: payload,
        })
      );
    return { success: false, message: 'Une erreur est survenue lors de la création.' };
  }
}

export async function updateStudent(db: Firestore, id: string, payload: Partial<StudentPayload>): Promise<FormState> {
  try {
    const updatePayload: any = { ...payload };
    if (payload.dateOfBirth) {
        updatePayload.dateOfBirth = Timestamp.fromDate(new Date(payload.dateOfBirth));
    }
    
    await updateDoc(doc(db, 'students', id), updatePayload);
    return { success: true, message: 'Élève modifié avec succès.' };
  } catch (error: any) {
    console.error('Erreur lors de la modification de l\'élève:', error);
    errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: `students/${id}`,
          operation: 'update',
          requestResourceData: payload,
        })
      );
    return { success: false, message: 'Une erreur est survenue lors de la modification.' };
  }
}

export async function toggleStudentStatus(db: Firestore, id: string, isActive: boolean): Promise<FormState> {
  try {
    await updateDoc(doc(db, 'students', id), { isActive });
    return { success: true, message: `Statut de l'élève mis à jour.` };
  } catch (error: any) {
    console.error('Erreur lors du changement de statut:', error);
    errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: `students/${id}`,
          operation: 'update',
          requestResourceData: { isActive },
        })
      );
    return { success: false, message: 'Une erreur est survenue.' };
  }
}
