
'use server';

import { revalidatePath } from 'next/cache';
import { firestore } from '@/firebase/admin';
import { collection, getDocs, writeBatch } from 'firebase/firestore';

type FormState = {
  success: boolean;
  message: string;
};

type SchoolYearPayload = {
    name: string;
};

export async function createSchoolYear(payload: SchoolYearPayload): Promise<FormState> {
  try {
    // Par défaut, une nouvelle année n'est pas active
    await firestore.collection('school_years').add({ ...payload, isActive: false });
    revalidatePath('/admin/annees-scolaires');
    return { success: true, message: 'Année scolaire créée avec succès.' };
  } catch (error) {
    console.error("Erreur lors de la création de l'année scolaire:", error);
    return { success: false, message: 'Une erreur est survenue.' };
  }
}

export async function updateSchoolYear(id: string, payload: SchoolYearPayload): Promise<FormState> {
  try {
    await firestore.collection('school_years').doc(id).update(payload);
    revalidatePath('/admin/annees-scolaires');
    return { success: true, message: 'Année scolaire modifiée avec succès.' };
  } catch (error) {
    console.error("Erreur lors de la modification de l'année scolaire:", error);
    return { success: false, message: 'Une erreur est survenue.' };
  }
}

export async function deleteSchoolYear(id: string): Promise<FormState> {
  try {
    // Note : Ajouter une logique pour vérifier si l'année scolaire contient des données avant suppression
    await firestore.collection('school_years').doc(id).delete();
    revalidatePath('/admin/annees-scolaires');
    return { success: true, message: 'Année scolaire supprimée avec succès.' };
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return { success: false, message: 'Une erreur est survenue.' };
  }
}

export async function setActiveSchoolYear(id: string): Promise<FormState> {
    const batch = writeBatch(firestore);
    const schoolYearsRef = firestore.collection('school_years');
    
    try {
        // 1. Mettre à jour toutes les autres années à isActive: false
        const querySnapshot = await getDocs(collection(firestore, 'school_years'));
        querySnapshot.forEach((doc) => {
            if (doc.id !== id) {
                batch.update(doc.ref, { isActive: false });
            }
        });

        // 2. Mettre l'année sélectionnée à isActive: true
        const docRef = schoolYearsRef.doc(id);
        batch.update(docRef, { isActive: true });

        // 3. Appliquer les changements
        await batch.commit();

        revalidatePath('/admin/annees-scolaires');
        revalidatePath('/admin/classes'); // Pour rafraichir la page des classes
        return { success: true, message: 'Année scolaire activée avec succès.' };

    } catch (error) {
        console.error("Erreur lors de l'activation de l'année scolaire:", error);
        return { success: false, message: 'Une erreur est survenue.' };
    }
}
