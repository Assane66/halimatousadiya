
'use client';

import { useState, useCallback, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, Timestamp, doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Plus, Search, Wallet, TrendingUp, Filter, Loader2 } from 'lucide-react';
import type { Student, Payment, SchoolYear } from './types';
import { StudentSearch } from './student-search';
import { PaymentList } from './payment-list';
import { PaymentForm } from './payment-form';
import { PaymentSummary } from './payment-summary';
import { useSearchParams } from 'next/navigation';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Suspense } from 'react';

function PaymentsContent() {
  const searchParams = useSearchParams();
  const studentIdParam = searchParams.get('studentId');

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [summaryData, setSummaryData] = useState({
    monthlyTotal: 0,
    monthlyCount: 0,
    dailyTotal: 0,
    dailyCount: 0
  });
  const [todayPayments, setTodayPayments] = useState<Payment[]>([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isDailyPaymentsOpen, setIsDailyPaymentsOpen] = useState(false);

  const firestore = useFirestore();
  const { toast } = useToast();

  const fetchPayments = useCallback(async (studentId: string) => {
    setIsLoadingPayments(true);
    const paymentsCollection = collection(firestore, 'payments');

    try {
      // 1. Try with ordering (Requires index)
      const q = query(paymentsCollection, where('studentId', '==', studentId), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      console.log(`Paiements trouvés pour l'élève ${studentId}: ${querySnapshot.size}`);
      const paymentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: (doc.data().date as Timestamp)?.toDate(),
      } as Payment));
      setPayments(paymentsData);
    } catch (error: any) {
      console.error("Fetch payments failed, trying fallback:", error);

      // Fallback: Fetch without ordering (works without index)
      try {
        const qSimple = query(paymentsCollection, where('studentId', '==', studentId));
        const snapshot = await getDocs(qSimple);
        const simpleData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: (doc.data().date as Timestamp)?.toDate(),
        } as Payment)).sort((a, b) => {
          const dateA = a.date instanceof Date ? a.date.getTime() : 0;
          const dateB = b.date instanceof Date ? b.date.getTime() : 0;
          return dateB - dateA;
        });

        setPayments(simpleData);

        if (error.message?.includes('index')) {
          toast({
            title: "Indexation requise",
            description: "Certaines fonctions de tri seront limitées jusqu'à la création de l'index Firestore.",
          });
        }
      } catch (innerError) {
        console.error("Fallback failed:", innerError);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de charger l\'historique des paiements.',
        });
      }
    } finally {
      setIsLoadingPayments(false);
    }
  }, [firestore, toast]);

  const handleStudentSelect = useCallback((student: Student | null) => {
    setSelectedStudent(student);
    if (student) {
      fetchPayments(student.id);
    } else {
      setPayments([]);
    }
  }, [fetchPayments]);

  const fetchFinanceStats = useCallback(async () => {
    if (!firestore) return;
    setIsLoadingSummary(true);
    try {
      const now = new Date();
      const firstOfMonth = startOfMonth(now);
      const lastOfMonth = endOfMonth(now);
      const startOfToday = startOfDay(now);
      const endOfToday = endOfDay(now);

      const paymentsRef = collection(firestore, 'payments');

      // 1. Fetch Month Data
      const qMonth = query(
        paymentsRef,
        where('date', '>=', Timestamp.fromDate(firstOfMonth)),
        where('date', '<=', Timestamp.fromDate(lastOfMonth))
      );
      const monthSnapshot = await getDocs(qMonth);
      let monthlyTotal = 0;
      monthSnapshot.forEach(doc => {
        monthlyTotal += Number(doc.data().amount || 0);
      });

      // 2. Fetch Daily Data
      console.log(`Checking daily payments for: ${format(startOfToday, 'PP HH:mm')} to ${format(endOfToday, 'PP HH:mm')}`);
      const qDaily = query(
        paymentsRef,
        where('date', '>=', Timestamp.fromDate(startOfToday)),
        where('date', '<=', Timestamp.fromDate(endOfToday))
      );
      const dailySnapshot = await getDocs(qDaily);
      let dailyTotal = 0;
      const dailyPayments: Payment[] = [];

      // 3. Map Daily Payments (Resolving names as best effort)
      const studentCache = new Map<string, string>();

      console.log(`Paiements trouvés - Mois: ${monthSnapshot.size}, Jour: ${dailySnapshot.size}`);

      for (const d of dailySnapshot.docs) {
        const data = d.data();
        const amt = Number(data.amount || 0);
        dailyTotal += amt; // Fixed accumulation

        let studentName = "Élève";
        const sId = data.studentId;

        if (sId) {
          try {
            if (studentCache.has(sId)) {
              studentName = studentCache.get(sId)!;
            } else {
              const sDoc = await getDoc(doc(firestore, 'students', sId));
              if (sDoc.exists()) {
                studentName = `${sDoc.data().firstName} ${sDoc.data().lastName}`;
                studentCache.set(sId, studentName);
              }
            }
          } catch (e) { console.warn("Erreur resolution nom élève:", e); }
        }

        dailyPayments.push({
          id: d.id,
          ...data,
          studentName,
          date: (data.date as Timestamp).toDate()
        } as Payment);
      }

      console.log("Calcul final - Mensuel:", monthlyTotal, "Journalier:", dailyTotal);

      setSummaryData({
        monthlyTotal,
        monthlyCount: monthSnapshot.size,
        dailyTotal,
        dailyCount: dailySnapshot.size
      });
      setTodayPayments(dailyPayments);
    } catch (error: any) {
      console.error("Finance stats error:", error);
      toast({
        variant: "destructive",
        title: "Erreur statistiques",
        description: "Impossible de mettre à jour les compteurs financiers."
      });
    } finally {
      setIsLoadingSummary(false);
    }
  }, [firestore, toast]);

  useEffect(() => {
    fetchFinanceStats();
  }, [fetchFinanceStats]);

  useEffect(() => {
    async function loadStudentFromParam() {
      if (!firestore || !studentIdParam || selectedStudent) return;

      try {
        const studentDoc = await getDoc(doc(firestore, 'students', studentIdParam));
        if (studentDoc.exists()) {
          const data = studentDoc.data();
          const student = {
            id: studentDoc.id,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            matriculeNumber: data.matriculeNumber || '',
          } as Student;
          handleStudentSelect(student);
        }
      } catch (error) {
        console.error("Error loading student from param:", error);
      }
    }
    loadStudentFromParam();
  }, [firestore, studentIdParam, handleStudentSelect, selectedStudent]);

  const [isExporting, setIsExporting] = useState(false);

  const handleExportReport = async () => {
    if (!firestore) return;
    setIsExporting(true);
    try {
      const now = new Date();
      const firstDay = startOfMonth(now);
      const lastDay = endOfMonth(now);

      const paymentsRef = collection(firestore, 'payments');
      const q = query(
        paymentsRef,
        where('date', '>=', Timestamp.fromDate(firstDay)),
        where('date', '<=', Timestamp.fromDate(lastDay))
      );

      console.log("Exportation: Recherche des paiements entre", firstDay, "et", lastDay);
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        toast({ title: "Aucune donnée", description: "Il n'y a pas encore de paiements pour ce mois-ci." });
        return;
      }

      const csvRows = [['Date', 'Eleve', 'Type', 'Montant (FCFA)'].join(';')];
      for (const d of snapshot.docs) {
        const data = d.data();
        csvRows.push([
          format((data.date as Timestamp).toDate(), 'dd/MM/yyyy HH:mm'),
          data.studentId, // We could resolve names but it would be many queries
          data.type,
          data.amount
        ].join(';'));
      }

      const blob = new Blob(["\uFEFF" + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rapport_Financier_${format(now, 'MMMM_yyyy', { locale: fr })}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "✓ Succès", description: "Le rapport financier a été exporté." });
    } catch (e: any) {
      if (e.message?.includes('index')) {
        toast({ variant: 'destructive', title: "Index Requis", description: "Veuillez créer l'index Firestore via le lien dans la console pour activer l'exportation triée." });
      } else {
        toast({ variant: 'destructive', title: "Erreur", description: "Échec de l'exportation." });
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleFormClose = (shouldReload: boolean) => {
    setIsFormOpen(false);
    console.log("Formulaire fermé, rafraîchissement demandé:", shouldReload);
    if (shouldReload) {
      setTimeout(() => {
        fetchFinanceStats();
        if (selectedStudent) fetchPayments(selectedStudent.id);
      }, 500); // Small delay to let Firebase consistency settle
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 font-outfit uppercase">
            Gestion Financière
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold text-[10px] uppercase tracking-widest px-2">
              Scolarité
            </Badge>
            <p className="text-slate-500 text-sm font-medium">Encaissements et suivi des dossiers élèves</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="rounded-xl gap-2 border-slate-200"
            onClick={handleExportReport}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
            Rapports
          </Button>
          {selectedStudent && (
            <Button
              onClick={() => setIsFormOpen(true)}
              className="rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200 h-11 px-6 transition-all hover:scale-105 active:scale-95 text-xs font-bold uppercase tracking-widest"
            >
              <Plus className="w-4 h-4" />
              Nouveau Versement
            </Button>
          )}
        </div>
      </div>

      <PaymentSummary
        monthlyTotal={summaryData.monthlyTotal}
        monthlyCount={summaryData.monthlyCount}
        dailyTotal={summaryData.dailyTotal}
        dailyCount={summaryData.dailyCount}
        monthName={format(new Date(), 'MMMM yyyy', { locale: fr })}
        onViewDaily={() => setIsDailyPaymentsOpen(true)}
      />

      <Dialog open={isDailyPaymentsOpen} onOpenChange={setIsDailyPaymentsOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] border-none p-0 overflow-hidden shadow-2xl">
          <div className="bg-blue-600 p-8 text-white relative">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight font-outfit">Recettes du Jour</DialogTitle>
              <DialogDescription className="text-blue-100 font-medium opacity-90">
                Résumé des encaissements pour le {format(new Date(), 'dd MMMM yyyy', { locale: fr })}
              </DialogDescription>
            </DialogHeader>
            <TrendingUp className="absolute right-6 top-1/2 -translate-y-1/2 w-20 h-20 text-white opacity-10" />
          </div>
          <div className="p-8">
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {todayPayments.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Aucun versement aujourd'hui</p>
                </div>
              ) : (
                todayPayments.sort((a, b) => b.date.getTime() - a.date.getTime()).map((p, idx) => (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm text-blue-600 flex items-center justify-center font-black text-xs group-hover:scale-110 transition-transform">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{p.studentName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(p.date, 'HH:mm')} • {p.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-slate-900 font-outfit">{new Intl.NumberFormat('fr-SN').format(p.amount)} FCFA</p>
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Confirmé ✓</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Journée</span>
                <span className="text-2xl font-black text-blue-600 font-outfit">{new Intl.NumberFormat('fr-SN').format(summaryData.dailyTotal)} FCFA</span>
              </div>
              <Button onClick={() => setIsDailyPaymentsOpen(false)} className="rounded-xl bg-slate-900 hover:bg-slate-800 font-bold px-6">Fermer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2.5rem] p-8 overflow-hidden relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-slate-50 text-emerald-600 flex items-center justify-center border border-slate-100">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-slate-900 text-sm uppercase tracking-wider">Recherche</span>
                <p className="text-[10px] text-slate-500 font-medium">Trouver un élève</p>
              </div>
            </div>
            <StudentSearch onStudentSelect={handleStudentSelect} />
          </Card>

          <Card className="border-none shadow-xl shadow-indigo-100 bg-indigo-600 text-white rounded-[2.5rem] overflow-hidden group">
            <CardContent className="p-8 relative">
              <div className="relative z-10">
                <CardTitle className="text-xl font-black uppercase tracking-tight">Règles de Sécurité</CardTitle>
                <p className="text-indigo-100 text-xs mt-3 leading-relaxed font-medium">
                  Chaque transaction est archivée avec l'identité de l'opérateur et un horodatage précis. Une fois validé, un paiement ne peut être modifié sans autorisation.
                </p>
              </div>
              <div className="absolute -right-6 -bottom-6 opacity-20 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                <Wallet className="w-32 h-32" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {!selectedStudent ? (
            <Card className="h-full min-h-[400px] border-none shadow-xl shadow-slate-100 bg-white rounded-[2.5rem] p-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-100">
              <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6 animate-pulse">
                <TrendingUp className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-outfit">Saisie des Paiements</h3>
              <p className="text-slate-400 text-sm max-w-[280px] mx-auto mt-2 leading-relaxed">
                Recherchez et sélectionnez un élève pour gérer son historique financier et imprimer des reçus.
              </p>
            </Card>
          ) : (
            <Card className="border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden rounded-[2.5rem]">
              <CardHeader className="border-b border-slate-50 bg-slate-50/20 px-8 py-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-200">
                      {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black text-slate-900 font-outfit uppercase">
                        {selectedStudent.firstName} {selectedStudent.lastName}
                      </CardTitle>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge className="bg-emerald-100 text-emerald-700 border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                          ID: {selectedStudent.id.substring(0, 8)}
                        </Badge>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Historique financier</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-black text-slate-900">Statut Solvable</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Compte Actif</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <PaymentList
                  payments={payments}
                  isLoading={isLoadingPayments}
                  studentName={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {isFormOpen && selectedStudent && (
        <PaymentForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          studentId={selectedStudent.id}
        />
      )}
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center animate-pulse text-emerald-600 font-bold">Chargement...</div>}>
      <PaymentsContent />
    </Suspense>
  );
}
