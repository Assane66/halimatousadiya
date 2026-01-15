'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, UserCheck, UserX } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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
import type { Student } from './types';
import { useState } from 'react';
import { toggleStudentStatus } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface StudentListProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: () => void; // Used for reloading after status change
  isLoading: boolean;
}

export function StudentList({ students, onEdit, onDelete, isLoading }: StudentListProps) {
  const { toast } = useToast();

  const handleToggleStatus = async (student: Student) => {
    const newStatus = !student.isActive;
    const result = await toggleStudentStatus(student.id, newStatus);
    if (result.success) {
      toast({ title: 'Statut modifié', description: `L'élève ${student.firstName} ${student.lastName} a été ${newStatus ? 'réactivé' : 'désactivé'}.` });
      onDelete(); // refetch
    } else {
      toast({ variant: 'destructive', title: 'Erreur', description: result.message });
    }
  };

  if (isLoading) {
    return (
        <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Matricule</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead>Date de Naissance</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Aucun élève trouvé pour cette classe.
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-mono text-xs">{student.matriculeNumber}</TableCell>
                  <TableCell className="font-medium">{student.lastName}</TableCell>
                  <TableCell>{student.firstName}</TableCell>
                  <TableCell>{student.dateOfBirth ? format(student.dateOfBirth, 'dd MMMM yyyy', { locale: fr }) : 'N/A'}</TableCell>
                  <TableCell>
                    {student.isActive ? (
                       <Badge variant="default">Actif</Badge>
                    ) : (
                       <Badge variant="destructive">Inactif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Ouvrir le menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(student)}>Modifier</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleStatus(student)}>
                          {student.isActive ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                          {student.isActive ? 'Désactiver' : 'Réactiver'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}