'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { startOfMonth, endOfMonth } from 'date-fns';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { StudentList } from './student-list';
import { StudentForm } from './student-form';
import type { Student, Class, SchoolYear } from './types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Terminal, Users, Plus, School, Calendar, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [selectedSchoolYearId, setSelectedSchoolYearId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [monthlyPayments, setMonthlyPayments] = useState<Record<string, boolean>>({});

  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const firestore = useFirestore();
  const { toast } = useToast();

  const fetchSchoolYears = useCallback(async () => {
    try {
      const schoolYearsCollection = collection(firestore, 'school_years');
      const q = query(schoolYearsCollection, orderBy('name', 'desc'));
      const yearsSnapshot = await getDocs(q);
      const yearsData = yearsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolYear));
      setSchoolYears(yearsData);

      const activeYear = yearsData.find(y => y.isActive);
      if (activeYear) {
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
      setSelectedClassId('');
      return;
    };
    try {
      const classesCollection = collection(firestore, 'classes');
      const classesQuery = query(classesCollection, where('schoolYearId', '==', selectedSchoolYearId));
      const classesSnapshot = await getDocs(classesQuery);
      const classesData = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Class));
      setClasses(classesData);

      // If we have classes, and either no class is selected OR the selected class isn't in this year's list
      if (classesData.length > 0) {
        const isCurrentClassInNewList = classesData.some(c => c.id === selectedClassId);
        if (!selectedClassId || !isCurrentClassInNewList) {
          setSelectedClassId(classesData[0].id);
        }
      } else {
        setSelectedClassId('');
      }
    } catch (error) {
      console.error("Erreur de chargement des classes:", error);
    }
  }, [firestore, selectedSchoolYearId, selectedClassId]);

  const fetchMonthlyPayments = useCallback(async (studentIds: string[]) => {
    if (!firestore || studentIds.length === 0) return;
    const now = new Date();
    const firstOfMonth = startOfMonth(now);
    const lastOfMonth = endOfMonth(now);
    const paymentsRef = collection(firestore, 'payments');

    try {
      // Primary: Optimized query (Requires Composite Index)
      const q = query(
        paymentsRef,
        where('studentId', 'in', studentIds.slice(0, 30)),
        where('date', '>=', Timestamp.fromDate(firstOfMonth)),
        where('date', '<=', Timestamp.fromDate(lastOfMonth))
      );

      const snapshot = await getDocs(q);
      const paidMap: Record<string, boolean> = {};
      snapshot.forEach(doc => {
        paidMap[doc.data().studentId] = true;
      });
      setMonthlyPayments(prev => ({ ...prev, ...paidMap }));
    } catch (error: any) {
      console.warn("Monthly status fetch failed, trying fallback:", error);

      // Fallback: If index missing, fetch all payments for the month and filter in JS
      if (error.message?.includes('index')) {
        try {
          const qMonth = query(
            paymentsRef,
            where('date', '>=', Timestamp.fromDate(firstOfMonth)),
            where('date', '<=', Timestamp.fromDate(lastOfMonth))
          );
          const snapshot = await getDocs(qMonth);
          const paidMap: Record<string, boolean> = {};
          const studentIdsSet = new Set(studentIds);

          snapshot.forEach(doc => {
            const sId = doc.data().studentId;
            if (studentIdsSet.has(sId)) {
              paidMap[sId] = true;
            }
          });
          setMonthlyPayments(prev => ({ ...prev, ...paidMap }));
        } catch (innerError) {
          console.error("Monthly status fallback failed:", innerError);
        }
      }
    }
  }, [firestore]);

  const fetchStudents = useCallback(async () => {
    if (!selectedClassId) {
      setStudents([]);
      setIsLoading(false);
      return;
    };
    setIsLoading(true);
    try {
      const studentsCollection = collection(firestore, 'students');
      // Temporarily removed orderBy to check if it's an index issue
      const studentsQuery = query(studentsCollection, where('classId', '==', selectedClassId));
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsData = studentsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dateOfBirth: (data.dateOfBirth as Timestamp)?.toDate(),
        } as Student;
      });
      setStudents(studentsData);

      if (studentsData.length > 0) {
        fetchMonthlyPayments(studentsData.map(s => s.id));
      }
    } catch (error: any) {
      console.error("Erreur de chargement des élèves:", error);
      toast({
        variant: 'destructive',
        title: 'Erreur de chargement',
        description: error.message || 'Impossible de charger la liste des élèves.',
      });
    }
    setIsLoading(false);
  }, [firestore, selectedClassId, toast]);


  useEffect(() => {
    fetchSchoolYears();
  }, [fetchSchoolYears]);

  useEffect(() => {
    fetchClasses();
  }, [selectedSchoolYearId, fetchClasses]);

  useEffect(() => {
    fetchStudents();
  }, [selectedClassId, fetchStudents]);

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setIsFormOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
  };

  const handleFormClose = (shouldReload: boolean) => {
    setIsFormOpen(false);
    if (shouldReload) {
      fetchStudents();
    }
  };

  const currentSchoolYear = schoolYears.find(sy => sy.id === selectedSchoolYearId);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit uppercase">
            Gestion des Élèves
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold text-[10px] uppercase tracking-widest px-2">
              {currentSchoolYear?.name || '...'}
            </Badge>
            <p className="text-slate-500 text-sm">Inscriptions et dossiers</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedSchoolYearId} onValueChange={setSelectedSchoolYearId}>
            <SelectTrigger className="w-[180px] rounded-xl border-slate-200 bg-white h-11 focus:ring-emerald-500 transition-all">
              <SelectValue placeholder="Année scolaire" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
              {schoolYears.map(year => (
                <SelectItem key={year.id} value={year.id} className="rounded-xl px-4 py-2 cursor-pointer focus:bg-emerald-50 focus:text-emerald-700">
                  {year.name} {year.isActive && '(A)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedClassId} onValueChange={setSelectedClassId} disabled={!selectedSchoolYearId || classes.length === 0}>
            <SelectTrigger className="w-[180px] rounded-xl border-slate-200 bg-white h-11 focus:ring-emerald-500 transition-all">
              <SelectValue placeholder="Classe" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id} className="rounded-xl px-4 py-2 cursor-pointer focus:bg-emerald-50 focus:text-emerald-700">{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddStudent}
            disabled={!selectedClassId}
            className="rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200 h-11 px-6 transition-all hover:scale-105 active:scale-95 text-xs font-bold uppercase tracking-widest"
          >
            <Users className="w-4 h-4" />
            Inscrire un élève
          </Button>
        </div>
      </div>

      <div className="">
        {!selectedSchoolYearId && !isLoading && (
          <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
                <Terminal className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Année scolaire requise</h3>
              <p className="text-slate-500 text-sm">Veuillez d'abord créer et activer une année scolaire pour gérer les élèves.</p>
              <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700 mt-4 h-auto py-4 px-6">
                <Link href="/admin/annees-scolaires" className="font-bold flex items-center gap-2">
                  Aller aux Années <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </Card>
        )}
        {selectedSchoolYearId && !selectedClassId && !isLoading && (
          <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-6">
                <School className="w-10 h-10 text-indigo-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Classe requise</h3>
              <p className="text-slate-500 text-sm">Veuillez sélectionner ou créer une classe pour cette année scolaire.</p>
              <Button asChild className="rounded-xl bg-indigo-600 hover:bg-indigo-700 mt-4 h-auto py-4 px-6">
                <Link href="/admin/classes" className="font-bold flex items-center gap-2">
                  Gérer les Classes <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </Card>
        )}
        {selectedClassId && (
          <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2.5rem]">
            <CardHeader className="border-b border-slate-50 bg-slate-50/30 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">Effectif de la classe</CardTitle>
                    <CardDescription>{students.length} élève(s) inscrit(s) actuellement.</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <StudentList
                students={students}
                monthlyPayments={monthlyPayments}
                onEdit={handleEditStudent}
                onDelete={fetchStudents}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {isFormOpen && selectedClassId && (
        <StudentForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          classId={selectedClassId}
          studentData={selectedStudent}
          classes={classes}
        />
      )}
    </div>
  );
}
