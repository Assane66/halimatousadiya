
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Wallet, TrendingUp, Users, Calendar } from "lucide-react";

interface PaymentSummaryProps {
    monthlyTotal: number;
    monthlyCount: number;
    dailyTotal: number;
    dailyCount: number;
    monthName: string;
    onViewDaily: () => void;
}

export function PaymentSummary({ monthlyTotal, monthlyCount, dailyTotal, dailyCount, monthName, onViewDaily }: PaymentSummaryProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-none shadow-xl shadow-emerald-100 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-[2rem] overflow-hidden">
                <CardContent className="p-6 relative">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest">Total Journée</p>
                            <h3 className="text-2xl font-black mt-1">
                                {new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(dailyTotal)}
                            </h3>
                            <p className="text-[10px] text-emerald-200 mt-1 uppercase font-bold tracking-tight">Mois: {new Intl.NumberFormat('fr-SN').format(monthlyTotal)} FCFA</p>
                        </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                        <TrendingUp className="w-24 h-24" />
                    </div>
                </CardContent>
            </Card>

            <Card
                onClick={onViewDaily}
                className="border-none shadow-xl shadow-blue-100 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-[2rem] overflow-hidden cursor-pointer hover:scale-[1.02] transition-all"
            >
                <CardContent className="p-6 relative">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest">Versements du Jour</p>
                            <h3 className="text-2xl font-black mt-1">{dailyCount} Opération(s)</h3>
                            <p className="text-[10px] text-blue-200 mt-1 font-bold uppercase underline">Cliquez pour voir la liste</p>
                        </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                        <Users className="w-24 h-24" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-amber-100 bg-white rounded-[2rem] overflow-hidden border border-slate-100">
                <CardContent className="p-6 relative">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Période</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1 capitalize">{monthName}</h3>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
