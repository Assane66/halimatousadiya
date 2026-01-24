
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
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
import type { Class } from './types';
import { useState } from 'react';
import { deleteClass } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useFirestore } from '@/firebase';

interface ClassListProps {
  classes: Class[];
  onEdit: (cls: Class) => void;
  onDelete: () => void;
  isLoading: boolean;
}

export function ClassList({ classes, onEdit, onDelete, isLoading }: ClassListProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();

  const openDeleteConfirm = (cls: Class) => {
    setClassToDelete(cls);
    setIsAlertOpen(true);
  };

  const handleDelete = () => {
    if (!classToDelete) return;
    deleteClass(firestore, classToDelete.id);
    toast({ title: 'Classe supprimée', description: `La classe ${classToDelete.name} a été supprimée.` });
    onDelete();
    setIsAlertOpen(false);
    setClassToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
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
              <TableHead className="pl-8 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Classe</TableHead>
              <TableHead className="py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Niveau</TableHead>
              <TableHead className="text-right pr-8 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-40 text-center py-20 text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                      <MoreHorizontal className="w-6 h-6 text-slate-200" />
                    </div>
                    <p className="text-sm font-medium">Aucune classe pour cette année.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              classes.map((cls) => (
                <TableRow key={cls.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                  <TableCell className="pl-8 py-6">
                    <span className="font-bold text-slate-900 text-base">{cls.name}</span>
                  </TableCell>
                  <TableCell className="py-6">
                    <Badge variant="outline" className="text-indigo-600 bg-indigo-50 border-indigo-100 font-bold uppercase tracking-widest text-[9px] px-2">
                      {cls.level}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-8 py-6">
                    <div className="flex items-center justify-end gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-slate-100">
                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 min-w-[160px]">
                          <DropdownMenuItem
                            onClick={() => onEdit(cls)}
                            className="rounded-xl px-4 py-3 text-sm font-medium text-slate-600 focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer"
                          >
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteConfirm(cls)}
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
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette classe ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible et supprimera la classe "{classToDelete?.name}". Les élèves inscrits dans cette classe ne seront plus associés.
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
