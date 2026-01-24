
'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
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
import { Terminal, Plus, School, Calendar, ArrowRight, Info } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    if (selectedSchoolYearId) {
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
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit uppercase">
            Gestion des Classes
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold text-[10px] uppercase tracking-widest px-2">
              {currentSchoolYear?.name || 'Aucune année'}
            </Badge>
            <p className="text-slate-500 text-sm">Organisation pédagogique</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={selectedSchoolYearId}
            onValueChange={setSelectedSchoolYearId}
            disabled={schoolYears.length === 0}
          >
            <SelectTrigger className="w-[200px] rounded-xl border-slate-200 bg-white h-11 transition-all focus:ring-emerald-500">
              <SelectValue placeholder="Changer d'année" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
              {schoolYears.map(year => (
                <SelectItem key={year.id} value={year.id} className="rounded-xl px-4 py-2 cursor-pointer focus:bg-emerald-50 focus:text-emerald-700">
                  {year.name} {year.isActive && '(Active)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddClass}
            className="rounded-xl gap-2 bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-200 h-11 px-6 transition-all hover:scale-105 active:scale-95 text-xs font-bold uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" />
            Ajouter une classe
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-6">
          {!selectedSchoolYearId && !isLoading && (
            <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-12 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
                  <Terminal className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Configuration requise</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Veuillez d'abord créer et activer une année scolaire pour pouvoir gérer les classes et les inscriptions.
                </p>
                <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700 mt-4 px-8 py-6 h-auto">
                  <Link href="/admin/annees-scolaires" className="font-bold flex items-center gap-2">
                    Gérer les Années <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          )}
          {selectedSchoolYearId && (
            <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2.5rem]">
              <CardHeader className="border-b border-slate-50 bg-slate-50/30 px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600">
                    <School className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">Liste des Classes</CardTitle>
                    <CardDescription>Consultez et modifiez les classes de l'année {currentSchoolYear?.name}.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ClassList
                  classes={classes}
                  onEdit={handleEditClass}
                  onDelete={fetchClasses}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-indigo-600 text-white rounded-[2.5rem] overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-8 -translate-y-8">
              <Info className="w-40 h-40" />
            </div>
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-bold">Informations</CardTitle>
              <p className="text-indigo-100 text-sm mt-2 leading-relaxed">
                Chaque classe est liée à une année spécifique. Les élèves inscrits dans une classe sont automatiquement rattachés à l'année scolaire correspondante.
              </p>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="p-4 rounded-xl bg-white/10 border border-white/20">
                <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-200">Total Classes</p>
                <p className="text-3xl font-black mt-1">{classes.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-8 overflow-hidden relative border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-900 text-sm">Dates clés</span>
            </div>
            <div className="space-y-4">
              <div className="pb-4 border-b border-slate-50">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Rentrée scolaire</p>
                <p className="text-sm font-semibold text-slate-700">10 Octobre 2025</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Fin inscriptions</p>
                <p className="text-sm font-semibold text-slate-700">30 Novembre 2025</p>
              </div>
            </div>
          </Card>
        </div>
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
        <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl p-10 bg-white max-w-md">
          <AlertDialogHeader>
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
              <Terminal className="w-8 h-8" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold">Année requise</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-base leading-relaxed">
              Pour ajouter une classe, vous devez d'abord sélectionner une année scolaire.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3 sm:gap-2">
            <AlertDialogCancel className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-12 bg-slate-50 border-none">Annuler</AlertDialogCancel>
            <AlertDialogAction asChild className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-12 bg-emerald-600 hover:bg-emerald-700">
              <Link href="/admin/annees-scolaires">Gérer les Années</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
