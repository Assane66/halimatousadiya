
'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, Plus, Settings2, Info } from 'lucide-react';
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
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit uppercase">
            Années Scolaires
          </h2>
          <p className="text-slate-500 mt-1">Structurez les cycles d'apprentissage de l'institut.</p>
        </div>
        <Button
          onClick={handleAdd}
          className="rounded-2xl gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200 py-6 px-6 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold uppercase tracking-widest text-xs">Ajouter une année</span>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden rounded-[2.5rem]">
          <CardHeader className="border-b border-slate-50 bg-slate-50/30 p-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Liste des Années</CardTitle>
                <CardDescription>Gérez les périodes d'activité scolaire.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <SchoolYearList
              schoolYears={schoolYears}
              onEdit={handleEdit}
              onDelete={fetchData}
              onActivate={fetchData}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-indigo-600 text-white rounded-[2.5rem] overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-8 -translate-y-8 transition-transform group-hover:scale-110">
              <Settings2 className="w-40 h-40" />
            </div>
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Info className="w-5 h-5" />
                Configuration
              </CardTitle>
              <CardDescription className="text-indigo-100">L'année active détermine quelle période est sélectionnée par défaut lors des inscriptions et paiements.</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-0">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                <p className="text-xs font-medium leading-relaxed">
                  Une seule année peut être active à la fois. L'activation d'une nouvelle année désactivera automatiquement la précédente.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
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
