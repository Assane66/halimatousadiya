
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

  const openDeleteConfirm = (cls: Class) => {
    setClassToDelete(cls);
    setIsAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!classToDelete) return;
    const result = await deleteClass(classToDelete.id);
    if (result.success) {
      toast({ title: 'Classe supprimée', description: `La classe ${classToDelete.name} a été supprimée.` });
      onDelete();
    } else {
      toast({ variant: 'destructive', title: 'Erreur', description: result.message });
    }
    setIsAlertOpen(false);
    setClassToDelete(null);
  };

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
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom de la classe</TableHead>
              <TableHead>Niveau</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  Aucune classe trouvée.
                </TableCell>
              </TableRow>
            ) : (
              classes.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>{cls.level}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Ouvrir le menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(cls)}>
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteConfirm(cls)} className="text-destructive">
                          Supprimer
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

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette classe ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible et supprimera la classe "{classToDelete?.name}".
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
