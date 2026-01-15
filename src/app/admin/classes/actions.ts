
'use server';

import { revalidatePath } from 'next/cache';
import { firestore } from '@/firebase/admin';

type FormState = {
  success: boolean;
  message: string;
};

// Types correspondants aux entités Firestore
type ClassPayload = {
    name: string;
    level: string;
    schoolYearId: string;
};

export async function createClass(payload: ClassPayload): Promise<FormState> {
  try {
    await firestore.collection('classes').add(payload);
    revalidatePath('/admin/classes');
    return { success: true, message: 'Classe créée avec succès.' };
  } catch (error) {
    console.error('Erreur lors de la création de la classe:', error);
    return { success: false, message: 'Une erreur est survenue.' };
  }
}

export async function updateClass(id: string, payload: ClassPayload): Promise<FormState> {
  try {
    await firestore.collection('classes').doc(id).update(payload);
    revalidatePath('/admin/classes');
    return { success: true, message: 'Classe modifiée avec succès.' };
  } catch (error) {
    console.error('Erreur lors de la modification de la classe:', error);
    return { success: false, message: 'Une erreur est survenue.' };
  }
}

export async function deleteClass(id: string): Promise<FormState> {
  try {
    // Note : Ajouter une logique pour vérifier si la classe contient des élèves avant suppression
    await firestore.collection('classes').doc(id).delete();
    revalidatePath('/admin/classes');
    return { success: true, message: 'Classe supprimée avec succès.' };
  } catch (error) {
    console.error('Erreur lors de la suppression de la classe:', error);
    return { success: false, message: 'Une erreur est survenue.' };
  }
}

