
'use client';

import { useState, useCallback, useTransition } from 'react';
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from '@/components/ui/command';
import { searchStudents } from './actions';
import type { Student } from './types';
import { Card, CardContent } from '@/components/ui/card';

type StudentSearchResult = {
    id: string;
    name: string;
    matricule: string;
};

interface StudentSearchProps {
  onStudentSelect: (student: Student | null) => void;
}

export function StudentSearch({ onStudentSelect }: StudentSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<StudentSearchResult[]>([]);
  const [selectedStudentDisplay, setSelectedStudentDisplay] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setResults([]);
      return;
    }
    startTransition(async () => {
      const students = await searchStudents(term);
      setResults(students);
    });
  }, []);

  const handleSelect = (studentResult: StudentSearchResult) => {
    // This is a bit of a hack since searchStudents only returns partial data.
    // We create a partial Student object for the parent component.
    const student: Student = {
        id: studentResult.id,
        firstName: studentResult.name.split(' ')[0] || '',
        lastName: studentResult.name.split(' ').slice(1).join(' ') || '',
        matriculeNumber: studentResult.matricule,
    };
    onStudentSelect(student);
    setSelectedStudentDisplay(`${student.firstName} ${student.lastName} (${student.matriculeNumber})`);
    setSearchTerm(''); // Clear search term
    setResults([]); // Close dropdown
  };

  return (
    <Card>
      <CardContent className="p-4">
        <Command shouldFilter={false} className="overflow-visible">
          <CommandInput
            placeholder="Rechercher un élève (nom ou matricule)..."
            value={searchTerm}
            onValueChange={handleSearch}
            disabled={!!selectedStudentDisplay}
          />
          {selectedStudentDisplay && (
            <div className="mt-2 flex items-center justify-between rounded-md border p-2">
                <p className="text-sm font-medium">{selectedStudentDisplay}</p>
                <button 
                    onClick={() => {
                        setSelectedStudentDisplay(null);
                        onStudentSelect(null);
                    }}
                    className="text-sm text-destructive hover:underline"
                >
                    Changer
                </button>
            </div>
          )}
          
          {!selectedStudentDisplay && searchTerm.length > 1 && (
            <CommandList>
              {isPending && <CommandItem>Chargement...</CommandItem>}
              {!isPending && results.length === 0 && searchTerm.length > 1 && <CommandEmpty>Aucun élève trouvé.</CommandEmpty>}
              {results.map((student) => (
                <CommandItem
                  key={student.id}
                  value={`${student.name} ${student.matricule}`}
                  onSelect={() => handleSelect(student)}
                  className="cursor-pointer"
                >
                  {student.name} <span className="ml-2 text-xs text-muted-foreground">{student.matricule}</span>
                </CommandItem>
              ))}
            </CommandList>
          )}
        </Command>
      </CardContent>
    </Card>
  );
}
