
'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, School, Wallet, Receipt } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface SchoolYear {
    id: string;
    isActive: boolean;
}

interface Payment {
    id: string;
    amount: number;
    date: Date;
    studentId: string;
    studentName?: string; // Will be populated later
}

interface Student {
    id: string;
    firstName: string;
    lastName: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    students: 0,
    classes: 0,
    revenue: 0,
  });
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // 1. Find active school year
        const schoolYearsRef = collection(firestore, 'school_years');
        const qYear = query(schoolYearsRef, where('isActive', '==', true), limit(1));
        const yearSnapshot = await getDocs(qYear);
        const activeSchoolYear = yearSnapshot.docs.length > 0 ? yearSnapshot.docs[0] : null;

        // 2. Fetch all active students
        const studentsRef = collection(firestore, 'students');
        const qStudents = query(studentsRef, where('isActive', '==', true));
        const studentsSnapshot = await getDocs(qStudents);
        const totalStudents = studentsSnapshot.size;
        
        const studentMap = new Map<string, string>();
        studentsSnapshot.docs.forEach(doc => {
            const data = doc.data() as Student;
            studentMap.set(doc.id, `${data.firstName} ${data.lastName}`);
        });

        let totalClasses = 0;
        let totalRevenue = 0;
        let paymentsData: Payment[] = [];

        if (activeSchoolYear) {
            // 3. Fetch classes for active year
            const classesRef = collection(firestore, 'classes');
            const qClasses = query(classesRef, where('schoolYearId', '==', activeSchoolYear.id));
            const classesSnapshot = await getDocs(qClasses);
            totalClasses = classesSnapshot.size;

            // 4. Fetch payments for active year
            const paymentsRef = collection(firestore, 'payments');
            const qPayments = query(paymentsRef, where('schoolYearId', '==', activeSchoolYear.id));
            const paymentsSnapshot = await getDocs(qPayments);
            totalRevenue = paymentsSnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0);

            // 5. Fetch recent payments
            const qRecentPayments = query(paymentsRef, where('schoolYearId', '==', activeSchoolYear.id), orderBy('date', 'desc'), limit(5));
            const recentPaymentsSnapshot = await getDocs(qRecentPayments);
            paymentsData = recentPaymentsSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    date: (data.date as Timestamp).toDate(),
                    studentName: studentMap.get(data.studentId) || 'Élève inconnu'
                } as Payment;
            });
        }
        
        setStats({
          students: totalStudents,
          classes: totalClasses,
          revenue: totalRevenue,
        });
        setRecentPayments(paymentsData);

      } catch (error) {
        console.error("Erreur de chargement du tableau de bord:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [firestore]);

  const formattedRevenue = useMemo(() => {
    return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(stats.revenue);
  }, [stats.revenue]);

  const StatCard = ({ title, value, icon: Icon, isLoading }: { title: string; value: string | number; icon: React.ElementType; isLoading: boolean }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <Skeleton className="h-8 w-1/2" />
        ) : (
            <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div>
      <PageHeader
        title="Tableau de Bord"
        subtitle="Vue d'ensemble de votre établissement"
      />
      <div className="p-4 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
            <StatCard title="Élèves Actifs" value={stats.students} icon={Users} isLoading={isLoading} />
            <StatCard title="Classes (Année Actuelle)" value={stats.classes} icon={School} isLoading={isLoading} />
            <StatCard title="Revenus (Année Actuelle)" value={formattedRevenue} icon={Wallet} isLoading={isLoading} />
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Receipt className="mr-2 h-5 w-5" />
                    Paiements Récents
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-2">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Élève</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Montant</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentPayments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center">Aucun paiement récent.</TableCell>
                                </TableRow>
                            ) : (
                                recentPayments.map(p => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium">{p.studentName}</TableCell>
                                        <TableCell>{format(p.date, 'dd MMMM yyyy', { locale: fr })}</TableCell>
                                        <TableCell className="text-right">{new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(p.amount)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
