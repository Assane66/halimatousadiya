
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

export function createStudent(db: Firestore, payload: StudentPayload) {
    (async () => {
        try {
            const matriculeNumber = await generateMatriculeNumber(db);
            
            const data = {
              ...payload,
              matriculeNumber,
              isActive: true,
              createdAt: serverTimestamp(),
              dateOfBirth: Timestamp.fromDate(new Date(payload.dateOfBirth)),
            };
        
            addDoc(collection(db, 'students'), data)
                .catch((serverError) => {
                    errorEmitter.emit(
                        'permission-error',
                        new FirestorePermissionError({
                          path: 'students',
                          operation: 'create',
                          requestResourceData: data,
                        })
                      );
                });
        } catch (error: any) {
            errorEmitter.emit(
                'permission-error',
                new FirestorePermissionError({
                  path: 'students',
                  operation: 'list', // For the getDocs in generateMatriculeNumber
                })
              );
        }
    })();
}

export function updateStudent(db: Firestore, id: string, payload: Partial<StudentPayload>) {
  const updatePayload: any = { ...payload };
  if (payload.dateOfBirth) {
      updatePayload.dateOfBirth = Timestamp.fromDate(new Date(payload.dateOfBirth));
  }
  
  updateDoc(doc(db, 'students', id), updatePayload)
    .catch((serverError) => {
        errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
              path: `students/${id}`,
              operation: 'update',
              requestResourceData: updatePayload,
            })
          );
    });
}

export function toggleStudentStatus(db: Firestore, id: string, isActive: boolean) {
    updateDoc(doc(db, 'students', id), { isActive })
        .catch((serverError) => {
            errorEmitter.emit(
                'permission-error',
                new FirestorePermissionError({
                  path: `students/${id}`,
                  operation: 'update',
                  requestResourceData: { isActive },
                })
              );
        });
}
