
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
import { CheckCircle, MoreHorizontal, AlertTriangle, Circle } from 'lucide-react';
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
import type { SchoolYear } from './types';
import { useState } from 'react';
import { deleteSchoolYear, setActiveSchoolYear } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useFirestore } from '@/firebase';

interface SchoolYearListProps {
  schoolYears: SchoolYear[];
  onEdit: (year: SchoolYear) => void;
  onDelete: () => void;
  onActivate: () => void;
  isLoading: boolean;
}

export function SchoolYearList({ schoolYears, onEdit, onDelete, onActivate, isLoading }: SchoolYearListProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [yearToDelete, setYearToDelete] = useState<SchoolYear | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();

  const openDeleteConfirm = (year: SchoolYear) => {
    setYearToDelete(year);
    setIsAlertOpen(true);
  };

  const handleDelete = () => {
    if (!yearToDelete) return;
    deleteSchoolYear(firestore, yearToDelete.id);
    toast({ title: 'Année supprimée', description: `L'année ${yearToDelete.name} a été supprimée.` });
    onDelete();
    setIsAlertOpen(false);
    setYearToDelete(null);
  };

  const handleActivate = async (id: string) => {
    const result = await setActiveSchoolYear(firestore, id);
    if (result.success) {
      toast({ title: 'Année activée', description: result.message });
      onActivate();
    } else {
      toast({ variant: 'destructive', title: 'Erreur', description: result.message });
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="pl-8 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Nom de l'année</TableHead>
              <TableHead className="py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Statut</TableHead>
              <TableHead className="text-right pr-8 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schoolYears.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-20 text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className="w-10 h-10 text-slate-200" />
                    <p>Aucune année scolaire trouvée.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              schoolYears.map((year) => (
                <TableRow key={year.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                  <TableCell className="pl-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${year.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                      <span className="font-bold text-slate-900 text-base">{year.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    {year.isActive ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-none px-3 py-1 font-bold uppercase tracking-widest text-[10px]">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none px-3 py-1 font-bold uppercase tracking-widest text-[10px]">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-8 py-6">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!year.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleActivate(year.id)}
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl font-bold text-[10px] uppercase tracking-wider"
                        >
                          Activer
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-slate-100">
                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 min-w-[160px]">
                          <DropdownMenuItem
                            onClick={() => onEdit(year)}
                            className="rounded-xl px-4 py-3 text-sm font-medium text-slate-600 focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer"
                          >
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1 bg-slate-50" />
                          <DropdownMenuItem
                            onClick={() => openDeleteConfirm(year)}
                            className="rounded-xl px-4 py-3 text-sm font-medium text-rose-600 focus:bg-rose-50 focus:text-rose-700 cursor-pointer"
                          >
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette année ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible et supprimera l'année "{yearToDelete?.name}". Les classes et élèves associés pourraient devenir orphelins.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
