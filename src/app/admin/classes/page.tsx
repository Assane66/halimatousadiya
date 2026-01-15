
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { ClassList } from './class-list';
import { ClassForm } from './class-form';
import type { Class, SchoolYear } from './types';

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [activeSchoolYear, setActiveSchoolYear] = useState<SchoolYear | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const firestore = useFirestore();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const schoolYearsCollection = collection(firestore, 'school_years');
      const activeYearQuery = query(schoolYearsCollection, where('isActive', '==', true));
      const allYearsSnapshot = await getDocs(schoolYearsCollection);
      const activeYearSnapshot = await getDocs(activeYearQuery);

      const allYears = allYearsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolYear));
      setSchoolYears(allYears);

      if (!activeYearSnapshot.empty) {
        const activeYear = { id: activeYearSnapshot.docs[0].id, ...activeYearSnapshot.docs[0].data() } as SchoolYear;
        setActiveSchoolYear(activeYear);
        
        const classesCollection = collection(firestore, 'classes');
        const classesQuery = query(classesCollection, where('schoolYearId', '==', activeYear.id));
        const classesSnapshot = await getDocs(classesQuery);
        const classesData = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Class));
        setClasses(classesData);
      } else {
        setClasses([]);
        setActiveSchoolYear(null);
      }
    } catch (error) {
      console.error("Erreur de chargement des données:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [firestore]);

  const handleAddClass = () => {
    setSelectedClass(null);
    setIsFormOpen(true);
  };

  const handleEditClass = (cls: Class) => {
    setSelectedClass(cls);
    setIsFormOpen(true);
  };

  const handleFormClose = (shouldReload: boolean) => {
    setIsFormOpen(false);
    if (shouldReload) {
      fetchData();
    }
  };

  return (
    <div>
      <PageHeader
        title="Gestion des Classes"
        subtitle={`Année scolaire active : ${activeSchoolYear?.name || 'Aucune'}`}
      >
         <Button onClick={handleAddClass} disabled={!activeSchoolYear}>
            Ajouter une classe
        </Button>
      </PageHeader>
      
      <div className="p-4">
        {!activeSchoolYear && !isLoading && (
            <div className="text-center text-muted-foreground p-8 bg-muted rounded-lg">
                <p>Aucune année scolaire n'est active.</p>
                <p>Veuillez activer une année scolaire pour pouvoir gérer les classes.</p>
            </div>
        )}
        {activeSchoolYear && (
             <ClassList
                classes={classes}
                onEdit={handleEditClass}
                onDelete={fetchData}
                isLoading={isLoading}
            />
        )}
      </div>

      {isFormOpen && activeSchoolYear && (
        <ClassForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          schoolYearId={activeSchoolYear.id}
          classData={selectedClass}
        />
      )}
    </div>
  );
}
