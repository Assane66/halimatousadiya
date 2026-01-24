'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Users,
  School,
  Wallet,
  Receipt,
  Calendar,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { collection, query, where, limit, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface Student {
  firstName: string;
  lastName: string;
  createdAt?: any;
}

interface Payment {
  id: string;
  studentId: string;
  studentName?: string;
  amount: number;
  date: Date;
  schoolYearId: string;
}

const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    students: 0,
    classes: 0,
    revenue: 0,
    activeYearName: 'Chargement...',
  });

  const [revenueChartData, setRevenueChartData] = useState<any[]>([]);
  const [registrationChartData, setRegistrationChartData] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [indexError, setIndexError] = useState(false);

  const firestore = useFirestore();

  const processRevenueData = (payments: any[]) => {
    const monthlyData = new Array(12).fill(0).map((_, i) => ({
      month: MONTHS_FR[i],
      amount: 0,
    }));

    payments.forEach(p => {
      const date = p.date instanceof Date ? p.date : (p.date as Timestamp).toDate();
      const month = date.getMonth();
      monthlyData[month].amount += Number(p.amount || 0);
    });

    return monthlyData;
  };

  const processRegistrationData = (students: any[]) => {
    const monthlyData = new Array(12).fill(0).map((_, i) => ({
      month: MONTHS_FR[i],
      count: 0
    }));

    students.forEach(s => {
      if (s.createdAt) {
        try {
          const date = s.createdAt.toDate();
          const month = date.getMonth();
          monthlyData[month].count += 1;
        } catch (e) { }
      }
    });

    return monthlyData;
  };

  const fetchData = useCallback(async () => {
    if (!firestore) return;
    setIsLoading(true);
    setIndexError(false);

    try {
      // 1. Get active school year
      const schoolYearsRef = collection(firestore, 'school_years');
      const qYear = query(schoolYearsRef, where('isActive', '==', true), limit(1));
      const yearSnapshot = await getDocs(qYear);

      if (yearSnapshot.empty) {
        setIsLoading(false);
        setStats(prev => ({ ...prev, activeYearName: 'Aucune session active' }));
        return;
      }

      const activeYearDoc = yearSnapshot.docs[0];
      const activeYearId = activeYearDoc.id;
      const activeYearName = activeYearDoc.data().name;

      // 3. Get classes for year
      const classesRef = collection(firestore, 'classes');
      const qClasses = query(classesRef, where('schoolYearId', '==', activeYearId));
      const classesSnapshot = await getDocs(qClasses);
      const totalClasses = classesSnapshot.size;
      const classIds = classesSnapshot.docs.map(doc => doc.id);

      // 2. Get students (Filtered by classes of this year)
      let totalStudents = 0;
      const studentMap = new Map<string, string>();
      const studentsRef = collection(firestore, 'students');

      let allStudentsData: any[] = [];

      if (classIds.length > 0) {
        // Firestore 'in' query supports up to 30 items.
        // For a school dashboard, 10-20 classes is normal.
        // We'll batch if needed or just query all active students and filter in JS if many classes.
        const qStudents = query(
          studentsRef,
          where('isActive', '==', true),
          where('classId', 'in', classIds.slice(0, 30))
        );
        const studentsSnapshot = await getDocs(qStudents);
        totalStudents = studentsSnapshot.size;
        allStudentsData = studentsSnapshot.docs.map(d => d.data());

        studentsSnapshot.docs.forEach(doc => {
          const data = doc.data() as Student;
          studentMap.set(doc.id, `${data.firstName} ${data.lastName}`);
        });
      }
      setRegistrationChartData(processRegistrationData(allStudentsData));


      // 4. Get all payments for year
      const paymentsRef = collection(firestore, 'payments');
      const qPayments = query(paymentsRef, where('schoolYearId', '==', activeYearId));
      const paymentsSnapshot = await getDocs(qPayments);

      const allPayments = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: (doc.data().date as Timestamp).toDate()
      }));

      const totalRevenue = allPayments.reduce((sum, p: any) => sum + Number(p.amount || 0), 0);

      // 5. Recent payments
      let recentP: Payment[] = [];
      try {
        const qRecent = query(paymentsRef, where('schoolYearId', '==', activeYearId), orderBy('date', 'desc'), limit(5));
        const recentSnapshot = await getDocs(qRecent);
        recentP = recentSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: (doc.data().date as Timestamp).toDate(),
          studentName: studentMap.get(doc.data().studentId) || 'Élève'
        } as Payment));
      } catch (err: any) {
        if (err.message?.includes('index')) {
          setIndexError(true);
          recentP = (allPayments as Payment[])
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 5)
            .map(p => ({ ...p, studentName: studentMap.get(p.studentId) || 'Élève' }));
        }
      }

      setStats({
        students: totalStudents,
        classes: totalClasses,
        revenue: totalRevenue,
        activeYearName,
      });

      setRecentPayments(recentP);
      setRevenueChartData(processRevenueData(allPayments));

    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [firestore]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formattedRevenue = useMemo(() => {
    return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(stats.revenue);
  }, [stats.revenue]);

  const StatCard = ({ title, value, icon: Icon, trend, color, isLoading }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: { val: string; up: boolean };
    color: string;
    isLoading: boolean;
  }) => (
    <Card className="overflow-hidden border-none shadow-xl shadow-slate-100/50 bg-white group hover:scale-[1.02] transition-all duration-300 rounded-[2.5rem]">
      <CardContent className="p-8">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <div className={`p-4 rounded-2xl ${color} shadow-lg shadow-current/20 group-hover:rotate-6 transition-transform`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          {trend && (
            <Badge variant="secondary" className={`flex items-center gap-1 font-bold ${trend.up ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
              {trend.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend.val}
            </Badge>
          )}
        </div>
        <div className="mt-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
          {isLoading ? (
            <Skeleton className="h-10 w-24 mt-2 rounded-xl" />
          ) : (
            <div className="text-4xl font-black text-slate-900 mt-1 tracking-tight font-outfit">{value}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 font-outfit uppercase">Tableau de Bord</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-slate-500 text-sm font-medium">Vue d'ensemble en temps réel • Institut YHS</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-5 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{stats.activeYearName}</span>
          </div>
          <Button className="rounded-2xl gap-3 bg-slate-900 hover:bg-slate-800 shadow-2xl shadow-slate-200 h-14 px-8 text-xs font-black uppercase tracking-widest transition-all hover:-translate-y-1 active:scale-95">
            <Receipt className="w-4 h-4" />
            Exporter Rapport
          </Button>
        </div>
      </div>

      {indexError && (
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3 text-amber-800 text-sm font-bold animate-pulse">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          INDEXATION FIREBASE REQUISE : Les statistiques sont calculées en mode dégradé (local).
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-3">
        <StatCard
          title="Élèves Actifs"
          value={stats.students}
          icon={Users}
          trend={{ val: 'Total', up: true }}
          color="bg-indigo-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Classes de l'Année"
          value={stats.classes}
          icon={School}
          trend={{ val: 'Actives', up: true }}
          color="bg-amber-500"
          isLoading={isLoading}
        />
        <StatCard
          title="Revenu Global"
          value={formattedRevenue}
          icon={Wallet}
          trend={{ val: 'Collecté', up: true }}
          color="bg-emerald-600"
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden rounded-[3rem]">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-10 py-8">
            <div>
              <CardTitle className="text-2xl font-black text-slate-900 font-outfit uppercase tracking-tight">Flux Financier</CardTitle>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Évolution des recettes mensuelles</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1 text-[10px] font-black uppercase">Recettes {new Date().getFullYear()}</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-10 py-10 h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }}
                  dy={20}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }}
                  labelStyle={{ fontWeight: 'black', marginBottom: '8px', textTransform: 'uppercase', fontSize: '10px', color: '#64748b' }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#10b981"
                  strokeWidth={6}
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-2xl shadow-slate-200/50 bg-white flex flex-col rounded-[3rem] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-10 py-8 bg-slate-50/30">
            <div>
              <CardTitle className="text-2xl font-black text-slate-900 font-outfit uppercase tracking-tight flex items-center gap-3">
                Transactions
              </CardTitle>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Derniers encaissements</p>
            </div>
            <Link href="/admin/paiements" className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600 hover:scale-110 transition-transform">
              <ArrowRight className="w-6 h-6" />
            </Link>
          </CardHeader>
          <CardContent className="px-10 py-8 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-8">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-3xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4 rounded-lg" />
                      <Skeleton className="h-3 w-1/2 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-10">
                {recentPayments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                      <Receipt className="w-10 h-10 text-slate-200" />
                    </div>
                    <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Aucune Transaction</p>
                  </div>
                ) : (
                  recentPayments.map((p, idx) => (
                    <div key={p.id} className="group flex items-center justify-between animate-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className="flex items-center gap-5">
                        <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-2xl font-black shadow-sm group-hover:rotate-3 transition-transform ${idx % 3 === 0 ? 'bg-indigo-50 text-indigo-600' : idx % 3 === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                          {p.studentName?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-base font-black text-slate-900 uppercase truncate">{p.studentName}</h4>
                          <p className="text-[11px] text-slate-400 font-black flex items-center gap-2 mt-1 uppercase tracking-wider">
                            <span className="text-emerald-500">PAYÉ ✓</span> • {format(p.date, "d MMM", { locale: fr })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900">
                          {new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(p.amount)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
          <div className="p-10 bg-slate-900 mt-auto">
            <Button className="w-full rounded-[1.5rem] bg-emerald-600 hover:bg-emerald-500 text-sm font-black uppercase tracking-[0.2em] h-16 shadow-2xl shadow-emerald-900/40 border-none" asChild>
              <Link href="/admin/paiements">Accéder à la gestion financière</Link>
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden rounded-[3rem]">
          <CardHeader className="px-10 py-8 border-b border-slate-50">
            <CardTitle className="text-2xl font-black text-slate-900 font-outfit uppercase tracking-tight">Tendance Inscriptions</CardTitle>
            <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">Dossiers créés par mois</p>
          </CardHeader>
          <CardContent className="px-10 py-10 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={registrationChartData}>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }}
                  dy={15}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }}
                  labelStyle={{ fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px', color: '#64748b' }}
                />
                <Bar
                  dataKey="count"
                  fill="#4f46e5"
                  radius={[12, 12, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-[0_35px_60px_-15px_rgba(79,70,229,0.3)] bg-gradient-to-br from-indigo-600 to-indigo-800 text-white overflow-hidden relative rounded-[3rem]">
          <div className="absolute -top-20 -right-20 p-8 opacity-20 transform rotate-45 scale-150">
            <School className="w-96 h-96" />
          </div>
          <CardHeader className="p-12 relative z-10">
            <div className="w-20 h-20 rounded-[2rem] bg-white/20 backdrop-blur-xl flex items-center justify-center mb-8">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-4xl font-black uppercase tracking-tighter leading-none">Vision &<br />Excellence</CardTitle>
            <p className="text-indigo-100 text-sm mt-4 font-bold uppercase tracking-widest opacity-80">Rappel stratégique du jour</p>
          </CardHeader>
          <CardContent className="relative z-10 px-12 pb-12 pt-0">
            <p className="text-2xl font-light text-indigo-50 leading-relaxed italic border-l-4 border-emerald-400 pl-8 mb-12">
              "L'éducation ne consiste pas seulement à remplir des seaux, mais à allumer des feux."
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all cursor-default group">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2 group-hover:text-emerald-300 transition-colors">Qualité</p>
                <p className="text-sm font-bold opacity-90 leading-tight">Vérification de 100% des matricules élèves</p>
              </div>
              <div className="p-6 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all cursor-default group">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2 group-hover:text-emerald-300 transition-colors">Trésorerie</p>
                <p className="text-sm font-bold opacity-90 leading-tight">Suivi hebdomadaire des impayés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
