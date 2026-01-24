
'use client';

import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  where,
  writeBatch,
  doc,
  serverTimestamp,
  Timestamp,
  Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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

export async function createStudent(db: Firestore, payload: StudentPayload) {
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
  } catch (error: any) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: 'students',
        operation: 'create',
      })
    );
    throw error;
  }
}

export async function updateStudent(db: Firestore, id: string, payload: Partial<StudentPayload>) {
  try {
    const updatePayload: any = { ...payload };
    if (payload.dateOfBirth) {
      updatePayload.dateOfBirth = Timestamp.fromDate(new Date(payload.dateOfBirth));
    }

    await updateDoc(doc(db, 'students', id), updatePayload);
  } catch (error: any) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: `students/${id}`,
        operation: 'update',
      })
    );
    throw error;
  }
}

export async function toggleStudentStatus(db: Firestore, id: string, isActive: boolean) {
  try {
    await updateDoc(doc(db, 'students', id), { isActive });
  } catch (error: any) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: `students/${id}`,
        operation: 'update',
      })
    );
    throw error;
  }
}

export async function deleteStudent(db: Firestore, id: string) {
  try {
    const batch = writeBatch(db);

    // 1. Find and delete all payments for this student
    const paymentsRef = collection(db, 'payments');
    const q = query(paymentsRef, where('studentId', '==', id));
    const paymentsSnapshot = await getDocs(q);

    paymentsSnapshot.forEach((paymentDoc) => {
      batch.delete(paymentDoc.ref);
    });

    // 2. Delete the student document
    batch.delete(doc(db, 'students', id));

    // 3. Commit the batch
    await batch.commit();
  } catch (error: any) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: `students/${id}`,
        operation: 'delete',
      })
    );
    throw error;
  }
}
