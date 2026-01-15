'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Users } from 'lucide-react';
import Link from 'next/link';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [selectedSchoolYearId, setSelectedSchoolYearId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
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
        if (classesData.length > 0 && !selectedClassId) {
            setSelectedClassId(classesData[0].id);
        } else if (classesData.length === 0) {
            setSelectedClassId('');
        }
    } catch (error) {
      console.error("Erreur de chargement des classes:", error);
    }
  }, [firestore, selectedSchoolYearId, selectedClassId]);

  const fetchStudents = useCallback(async () => {
    if (!selectedClassId) {
        setStudents([]);
        setIsLoading(false);
        return;
    };
    setIsLoading(true);
    try {
        const studentsCollection = collection(firestore, 'students');
        const studentsQuery = query(studentsCollection, where('classId', '==', selectedClassId), orderBy('lastName', 'asc'));
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
    } catch (error) {
      console.error("Erreur de chargement des élèves:", error);
    }
    setIsLoading(false);
  }, [firestore, selectedClassId]);


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
    <div>
      <PageHeader
        title="Gestion des Élèves"
        subtitle={`Gestion des inscriptions et informations des élèves pour l'année ${currentSchoolYear?.name || '...'}`}
      >
        <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedSchoolYearId} onValueChange={setSelectedSchoolYearId}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Année scolaire" />
                </SelectTrigger>
                <SelectContent>
                    {schoolYears.map(year => (
                        <SelectItem key={year.id} value={year.id}>
                            {year.name} {year.isActive && '(A)'}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={selectedClassId} onValueChange={setSelectedClassId} disabled={!selectedSchoolYearId || classes.length === 0}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Classe" />
                </SelectTrigger>
                <SelectContent>
                    {classes.map(cls => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button onClick={handleAddStudent} disabled={!selectedClassId}>
                <Users className="mr-2 h-4 w-4" />
                Inscrire un élève
            </Button>
        </div>
      </PageHeader>
      
      <div className="p-4">
        {!selectedSchoolYearId && !isLoading && (
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Aucune année scolaire active</AlertTitle>
              <AlertDescription>
                Veuillez d'abord <Link href="/admin/annees-scolaires" className="font-bold hover:underline">créer et activer une année scolaire</Link> pour gérer les élèves.
              </AlertDescription>
            </Alert>
        )}
        {selectedSchoolYearId && !selectedClassId && !isLoading && (
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Aucune classe sélectionnée</AlertTitle>
              <AlertDescription>
                Veuillez <Link href="/admin/classes" className="font-bold hover:underline">créer une classe</Link> pour cette année scolaire afin d'y ajouter des élèves.
              </AlertDescription>
            </Alert>
        )}
        {selectedClassId && (
             <StudentList
                students={students}
                onEdit={handleEditStudent}
                onDelete={fetchStudents} // onDelete/onToggleActive, just refetch
                isLoading={isLoading}
            />
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