
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
import { MoreHorizontal, UserCheck, UserX, Wallet, Trash2 } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Student } from './types';
import { toggleStudentStatus, deleteStudent } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useFirestore } from '@/firebase';

interface StudentListProps {
  students: Student[];
  monthlyPayments: Record<string, boolean>;
  onEdit: (student: Student) => void;
  onDelete: () => void; // Used for reloading after status change
  isLoading: boolean;
}

export function StudentList({ students, monthlyPayments, onEdit, onDelete, isLoading }: StudentListProps) {
  const { toast } = useToast();
  const firestore = useFirestore();

  const handleToggleStatus = (student: Student) => {
    const newStatus = !student.isActive;
    toggleStudentStatus(firestore, student.id, newStatus);
    toast({ title: 'Statut modifié', description: `L'élève ${student.firstName} ${student.lastName} a été ${newStatus ? 'réactivé' : 'désactivé'}.` });
    onDelete(); // refetch
  };

  const handleDelete = async (student: Student) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement ${student.firstName} ${student.lastName} ? Cela supprimera également tout son historique de paiements.`)) {
      try {
        await deleteStudent(firestore, student.id);
        toast({ title: 'Élève supprimé', description: "Le dossier et les paiements associés ont été supprimés avec succès." });
        onDelete(); // refetch
      } catch (error) {
        toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de supprimer l'élève." });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-8">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="pl-8 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Étudiant</TableHead>
              <TableHead className="py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Matricule</TableHead>
              <TableHead className="py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Statut</TableHead>
              <TableHead className="py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Paiement</TableHead>
              <TableHead className="py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Caisse</TableHead>
              <TableHead className="text-right pr-8 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-60 text-center py-20 text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                      <MoreHorizontal className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-sm font-medium">Aucun élève dans cette classe.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                  <TableCell className="pl-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">{student.firstName} {student.lastName}</span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Dossier Complet</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <span className="font-mono text-[11px] bg-slate-100 px-2 py-1 rounded text-slate-600">
                      {student.matriculeNumber}
                    </span>
                  </TableCell>
                  <TableCell className="py-5">
                    {student.isActive ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold text-[9px] uppercase tracking-widest px-2">Actif</Badge>
                    ) : (
                      <Badge className="bg-rose-100 text-rose-700 border-none font-bold text-[9px] uppercase tracking-widest px-2">Inactif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-5">
                    {monthlyPayments[student.id] ? (
                      <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px] uppercase tracking-widest px-2">
                        Payé
                      </Badge>
                    ) : (
                      <Link href={`/admin/paiements?studentId=${student.id}`}>
                        <Badge className="bg-amber-50 text-amber-600 border-none font-bold text-[9px] uppercase tracking-widest px-2 hover:bg-amber-100 cursor-pointer">
                          Non payé
                        </Badge>
                      </Link>
                    )}
                  </TableCell>
                  <TableCell className="py-5">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8 rounded-lg gap-2 text-amber-600 hover:bg-amber-50 hover:text-amber-700 font-bold text-[10px] uppercase tracking-wider"
                    >
                      <Link href={`/admin/paiements?studentId=${student.id}`}>
                        <Wallet className="w-3.5 h-3.5" />
                        Finances
                      </Link>
                    </Button>
                  </TableCell>
                  <TableCell className="text-right pr-8 py-5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-slate-100">
                          <MoreHorizontal className="h-4 w-4 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 min-w-[160px]">
                        <DropdownMenuItem
                          onClick={() => onEdit(student)}
                          className="rounded-xl px-4 py-3 text-sm font-medium text-slate-600 focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer"
                        >
                          Modifier le dossier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 bg-slate-50" />
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(student)}
                          className={`rounded-xl px-4 py-3 text-sm font-medium cursor-pointer ${student.isActive ? 'text-rose-600 focus:bg-rose-50' : 'text-emerald-600 focus:bg-emerald-50'}`}
                        >
                          {student.isActive ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                          {student.isActive ? 'Désactiver' : 'Réactiver'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 bg-slate-50" />
                        <DropdownMenuItem
                          onClick={() => handleDelete(student)}
                          className="rounded-xl px-4 py-3 text-sm font-medium text-rose-600 focus:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer le dossier
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
