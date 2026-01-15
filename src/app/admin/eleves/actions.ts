'use server';

import { revalidatePath } from 'next/cache';
import { firestore } from '@/firebase/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

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

// Function to generate a unique matricule number
async function generateMatriculeNumber(): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2); // Last two digits of the year
    const studentsRef = firestore.collection('students');
    const snapshot = await studentsRef.orderBy('matriculeNumber', 'desc').limit(1).get();
    
    let lastNumber = 0;
    if (!snapshot.empty) {
        const lastMatricule = snapshot.docs[0].data().matriculeNumber;
        // Extract the numeric part (last 4 digits)
        const lastMatriculeNumberPart = lastMatricule.slice(-4);
        if (/^\d{4}$/.test(lastMatriculeNumberPart)) {
            lastNumber = parseInt(lastMatriculeNumberPart, 10);
        }
    }
    
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    return `YHS${year}${newNumber}`;
}

export async function createStudent(payload: StudentPayload): Promise<FormState> {
  try {
    const matriculeNumber = await generateMatriculeNumber();
    const docRef = firestore.collection('students').doc();
    
    await docRef.set({
      ...payload,
      id: docRef.id,
      matriculeNumber,
      isActive: true, // Default status for a new student
      createdAt: FieldValue.serverTimestamp(),
      dateOfBirth: Timestamp.fromDate(new Date(payload.dateOfBirth)),
    });
    
    revalidatePath('/admin/eleves');
    return { success: true, message: 'Élève créé avec succès.' };
  } catch (error) {
    console.error('Erreur lors de la création de l\'élève:', error);
    return { success: false, message: 'Une erreur est survenue lors de la création.' };
  }
}

export async function updateStudent(id: string, payload: Partial<StudentPayload>): Promise<FormState> {
  try {
    const studentRef = firestore.collection('students').doc(id);
    
    const updatePayload: any = { ...payload };
    if (payload.dateOfBirth) {
        updatePayload.dateOfBirth = Timestamp.fromDate(new Date(payload.dateOfBirth));
    }
    
    await studentRef.update(updatePayload);
    revalidatePath('/admin/eleves');
    return { success: true, message: 'Élève modifié avec succès.' };
  } catch (error) {
    console.error('Erreur lors de la modification de l\'élève:', error);
    return { success: false, message: 'Une erreur est survenue lors de la modification.' };
  }
}

export async function toggleStudentStatus(id: string, isActive: boolean): Promise<FormState> {
  try {
    await firestore.collection('students').doc(id).update({ isActive });
    revalidatePath('/admin/eleves');
    return { success: true, message: `Statut de l'élève mis à jour.` };
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error);
    return { success: false, message: 'Une erreur est survenue.' };
  }
}

// Note: A full delete function is often discouraged for student records.
// Toggling status is usually preferred. We'll omit a hard delete for now.