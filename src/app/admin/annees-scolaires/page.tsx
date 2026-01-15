
'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import type { SchoolYear } from './types';
import { SchoolYearList } from './school-year-list';
import { SchoolYearForm } from './school-year-form';

export default function SchoolYearsPage() {
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<SchoolYear | null>(null);
  const firestore = useFirestore();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const schoolYearsCollection = collection(firestore, 'school_years');
      const q = query(schoolYearsCollection, orderBy('name', 'desc'));
      const querySnapshot = await getDocs(q);
      const yearsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolYear));
      setSchoolYears(yearsData);
    } catch (error) {
      console.error("Erreur de chargement des années scolaires:", error);
    }
    setIsLoading(false);
  }, [firestore]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = () => {
    setSelectedYear(null);
    setIsFormOpen(true);
  };

  const handleEdit = (year: SchoolYear) => {
    setSelectedYear(year);
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
        title="Gestion des Années Scolaires"
        subtitle="Créez et activez les années scolaires pour organiser vos données."
      >
         <Button onClick={handleAdd}>
            Ajouter une année scolaire
        </Button>
      </PageHeader>
      
      <div className="p-4">
        <SchoolYearList
            schoolYears={schoolYears}
            onEdit={handleEdit}
            onDelete={fetchData}
            onActivate={fetchData}
            isLoading={isLoading}
        />
      </div>

      {isFormOpen && (
        <SchoolYearForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          schoolYearData={selectedYear}
        />
      )}
    </div>
  );
}
