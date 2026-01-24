
'use client';

import { useState, useCallback, useTransition } from 'react';
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from '@/components/ui/command';
import { searchStudents } from './actions';
import type { Student } from './types';
import { useFirestore } from '@/firebase';
import { X, User, Check, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  const firestore = useFirestore();

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setResults([]);
      return;
    }
    startTransition(async () => {
      const students = await searchStudents(firestore, term);
      setResults(students);
    });
  }, [firestore]);

  const handleSelect = (studentResult: StudentSearchResult) => {
    const student: Student = {
      id: studentResult.id,
      firstName: studentResult.name.split(' ')[0] || '',
      lastName: studentResult.name.split(' ').slice(1).join(' ') || '',
      matriculeNumber: studentResult.matricule,
    };
    onStudentSelect(student);
    setSelectedStudentDisplay(`${student.firstName} ${student.lastName}`);
    setSearchTerm('');
    setResults([]);
  };

  return (
    <div className="space-y-4">
      <Command shouldFilter={false} className="overflow-visible border-none bg-transparent">
        {!selectedStudentDisplay && (
          <div className="relative group">
            <CommandInput
              placeholder="Chercher par nom ou matricule..."
              value={searchTerm}
              onValueChange={handleSearch}
              className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:ring-emerald-500 pl-4 pr-10"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
              <Search className="w-5 h-5 group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>
        )}

        {selectedStudentDisplay && (
          <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <User className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-sm font-black text-emerald-700 uppercase tracking-tight">{selectedStudentDisplay}</p>
            </div>
            <button
              onClick={() => {
                setSelectedStudentDisplay(null);
                onStudentSelect(null);
              }}
              className="p-2 rounded-xl hover:bg-emerald-100 text-emerald-600 transition-colors"
              title="Changer d'élève"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {!selectedStudentDisplay && searchTerm.length > 1 && (
          <div className="relative">
            <CommandList className="absolute top-1 z-50 w-full rounded-2xl border border-slate-100 bg-white shadow-2xl p-2 animate-in slide-in-from-top-2 duration-300">
              {isPending && (
                <div className="flex items-center justify-center py-6 gap-2 text-slate-400">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" />
                  <span className="text-xs font-bold uppercase tracking-widest">Recherche...</span>
                </div>
              )}
              {!isPending && results.length === 0 && <CommandEmpty className="py-6 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Aucun élève trouvé</CommandEmpty>}
              {results.map((student) => (
                <CommandItem
                  key={student.id}
                  onSelect={() => handleSelect(student)}
                  className="flex flex-col items-start gap-1 p-3 rounded-xl cursor-pointer hover:bg-emerald-50 aria-selected:bg-emerald-50 transition-colors"
                >
                  <div className="w-full flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase tracking-tight text-sm">{student.name}</span>
                    <Check className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100" />
                  </div>
                  <Badge variant="outline" className="text-[9px] font-black tracking-widest uppercase border-slate-100 text-slate-400">
                    ID: {student.matricule || student.id.substring(0, 8)}
                  </Badge>
                </CommandItem>
              ))}
            </CommandList>
          </div>
        )}
      </Command>
    </div>
  );
}
