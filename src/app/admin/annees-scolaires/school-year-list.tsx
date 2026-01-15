
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

  const openDeleteConfirm = (year: SchoolYear) => {
    setYearToDelete(year);
    setIsAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!yearToDelete) return;
    const result = await deleteSchoolYear(yearToDelete.id);
    if (result.success) {
      toast({ title: 'Année supprimée', description: `L'année ${yearToDelete.name} a été supprimée.` });
      onDelete();
    } else {
      toast({ variant: 'destructive', title: 'Erreur', description: result.message });
    }
    setIsAlertOpen(false);
    setYearToDelete(null);
  };

  const handleActivate = async (id: string) => {
    const result = await setActiveSchoolYear(id);
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
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schoolYears.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  Aucune année scolaire trouvée.
                </TableCell>
              </TableRow>
            ) : (
              schoolYears.map((year) => (
                <TableRow key={year.id}>
                  <TableCell className="font-medium">{year.name}</TableCell>
                  <TableCell>
                    {year.isActive ? (
                       <Badge>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Active
                      </Badge>
                    ) : (
                       <Badge variant="secondary">
                        <Circle className="mr-2 h-4 w-4" />
                        Inactive
                      </Badge>
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
                         {!year.isActive && (
                            <DropdownMenuItem onClick={() => handleActivate(year.id)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activer
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onEdit(year)}>
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openDeleteConfirm(year)} className="text-destructive">
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
