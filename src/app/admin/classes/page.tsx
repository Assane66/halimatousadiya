
'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { ClassList } from './class-list';
import { ClassForm } from './class-form';
import type { Class, SchoolYear } from './types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [activeSchoolYear, setActiveSchoolYear] = useState<SchoolYear | null>(null);
  const [selectedSchoolYearId, setSelectedSchoolYearId] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isNoYearAlertOpen, setIsNoYearAlertOpen] = useState(false);
  const firestore = useFirestore();

  const fetchSchoolYears = useCallback(async () => {
    try {
      const schoolYearsCollection = collection(firestore, 'school_years');
      const q = query(schoolYearsCollection, orderBy('name', 'desc'));
      const yearsSnapshot = await getDocs(q);
      const yearsData = yearsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolYear));
      setSchoolYears(yearsData);

      const activeYear = yearsData.find(y => y.isActive);
      if (activeYear) {
        setActiveSchoolYear(activeYear);
        setSelectedSchoolYearId(activeYear.id);
      } else if (yearsData.length > 0) {
        // Fallback to the most recent year if none is active
        setSelectedSchoolYearId(yearsData[0].id);
      }

    } catch (error) {
      console.error("Erreur de chargement des années scolaires:", error);
    }
  }, [firestore]);


  const fetchClasses = useCallback(async () => {
    if (!selectedSchoolYearId) {
        setClasses([]);
        setIsLoading(false);
        return;
    };
    setIsLoading(true);
    try {
        const classesCollection = collection(firestore, 'classes');
        const classesQuery = query(classesCollection, where('schoolYearId', '==', selectedSchoolYearId));
        const classesSnapshot = await getDocs(classesQuery);
        const classesData = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Class));
        setClasses(classesData);
    } catch (error) {
      console.error("Erreur de chargement des classes:", error);
    }
    setIsLoading(false);
  }, [firestore, selectedSchoolYearId]);


  useEffect(() => {
    fetchSchoolYears();
  }, [fetchSchoolYears]);

  useEffect(() => {
    if(selectedSchoolYearId) {
      fetchClasses();
    }
  }, [selectedSchoolYearId, fetchClasses]);

  const handleAddClass = () => {
    if (!selectedSchoolYearId) {
      setIsNoYearAlertOpen(true);
    } else {
      setSelectedClass(null);
      setIsFormOpen(true);
    }
  };

  const handleEditClass = (cls: Class) => {
    setSelectedClass(cls);
    setIsFormOpen(true);
  };

  const handleFormClose = (shouldReload: boolean) => {
    setIsFormOpen(false);
    if (shouldReload) {
      fetchClasses();
    }
  };

  const currentSchoolYear = schoolYears.find(sy => sy.id === selectedSchoolYearId);

  return (
    <div>
      <PageHeader
        title="Gestion des Classes"
        subtitle={`Année scolaire : ${currentSchoolYear?.name || 'Aucune'}`}
      >
        <div className="flex items-center gap-4">
            <Select
                value={selectedSchoolYearId}
                onValueChange={setSelectedSchoolYearId}
                disabled={schoolYears.length === 0}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Changer d'année" />
                </SelectTrigger>
                <SelectContent>
                    {schoolYears.map(year => (
                        <SelectItem key={year.id} value={year.id}>
                            {year.name} {year.isActive && '(Active)'}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button onClick={handleAddClass}>
                Ajouter une classe
            </Button>
        </div>
      </PageHeader>
      
      <div className="p-4">
        {!selectedSchoolYearId && !isLoading && (
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Aucune année scolaire sélectionnée</AlertTitle>
              <AlertDescription>
                Veuillez d'abord <Link href="/admin/annees-scolaires" className="font-bold hover:underline">créer et activer une année scolaire</Link> pour pouvoir gérer les classes.
              </AlertDescription>
            </Alert>
        )}
        {selectedSchoolYearId && (
             <ClassList
                classes={classes}
                onEdit={handleEditClass}
                onDelete={fetchClasses}
                isLoading={isLoading}
            />
        )}
      </div>

      {isFormOpen && selectedSchoolYearId && (
        <ClassForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          schoolYearId={selectedSchoolYearId}
          classData={selectedClass}
        />
      )}

      <AlertDialog open={isNoYearAlertOpen} onOpenChange={setIsNoYearAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aucune année scolaire sélectionnée</AlertDialogTitle>
            <AlertDialogDescription>
              Pour ajouter une classe, vous devez d'abord sélectionner une année scolaire dans le menu déroulant. Si la liste est vide, veuillez vous rendre sur la page des années scolaires pour en créer et en activer une.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction asChild>
                <Link href="/admin/annees-scolaires">Gérer les Années Scolaires</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
