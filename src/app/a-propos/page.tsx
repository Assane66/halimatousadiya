'use client';

import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { PageHeader } from "@/components/page-header";
import { CONTACT_INFO, SITE_NAME, TEAM_MEMBERS as STATIC_MEMBERS } from "@/lib/constants";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Users } from "lucide-react";

export default function AboutPage() {
    const [team, setTeam] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const firestore = useFirestore();

    const aboutImage = PlaceHolderImages.find((img) => img.id === "about-1");

    useEffect(() => {
        async function fetchTeam() {
            if (!firestore) return;
            try {
                const teamRef = collection(firestore, 'team');
                const q = query(teamRef, orderBy('createdAt', 'asc'));
                const snapshot = await getDocs(q);
                const dynamicTeam = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                if (dynamicTeam.length > 0) {
                    setTeam([...dynamicTeam, ...STATIC_MEMBERS]);
                } else {
                    setTeam(STATIC_MEMBERS);
                }
            } catch (error) {
                console.error('Error fetching team:', error);
                setTeam(STATIC_MEMBERS);
            } finally {
                setIsLoading(false);
            }
        }
        fetchTeam();
    }, [firestore]);

    return (
        <>
            <PageHeader
                title="À Propos de Notre Institut"
                subtitle="Notre histoire, notre mission et les visages derrière notre engagement."
            />

            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
                        {aboutImage && (
                            <div className="order-last relative h-[400px] md:h-[600px] w-full md:order-first rounded-[3rem] overflow-hidden shadow-2xl shadow-emerald-100/50 transform md:-rotate-1 transition-transform hover:rotate-0">
                                <Image
                                    src={aboutImage.imageUrl}
                                    alt={aboutImage.description}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-emerald-900/10 mix-blend-multiply" />
                            </div>
                        )}
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <Badge className="bg-emerald-50 text-emerald-700 border-none px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest">Notre Histoire</Badge>
                                <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                                    Un héritage de foi et <br /> d'excellence
                                </h2>
                                <p className="text-slate-600 leading-relaxed text-lg">
                                    L’Institut Islamique Yaye Halimatou Saadiya est né d’une ambition noble : ériger à Tivaouane Peulh un pôle d’excellence éducative et spirituelle, au service des générations présentes et futures. Portant le nom d’une figure maternelle dont la sagesse et la piété demeurent une source d’inspiration, notre institut incarne l’héritage d’un amour pour le savoir, la foi et le service de la communauté.
                                </p>
                                <p className="text-slate-600 leading-relaxed">
                                    Depuis sa fondation, nous travaillons avec constance et dévouement pour offrir à chaque élève un environnement où l’apprentissage rime avec épanouissement, et où l’éducation s’élève au rang de mission sacrée.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                <div className="space-y-1">
                                    <p className="text-3xl font-black text-emerald-600">2018</p>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Année de Fondation</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-3xl font-black text-emerald-600">500+</p>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Élèves Formés</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-24 bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-600/5 clip-path-diagonal hidden md:block" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                        <Badge className="bg-emerald-100 text-emerald-700 border-none px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest">Notre Équipe</Badge>
                        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">Les visages de notre engagement</h2>
                        <p className="text-slate-500 text-lg">Une équipe dévouée d'éducateurs et de professionnels passionnés par la transmission du savoir.</p>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {team.map((member) => {
                                const memberImage = PlaceHolderImages.find((img) => img.id === member.photoUrlId);
                                return (
                                    <Card key={member.id} className="border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2rem] overflow-hidden group bg-white">
                                        <CardHeader className="p-0">
                                            <div className="relative h-64 w-full overflow-hidden">
                                                {memberImage ? (
                                                    <Image
                                                        src={memberImage.imageUrl}
                                                        alt={member.name}
                                                        fill
                                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                        <Users className="w-12 h-12 text-slate-300" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                                    <p className="text-white text-[10px] font-bold uppercase tracking-widest mb-1">Contact</p>
                                                    <p className="text-white/80 text-xs truncate">direction@halimatousadiya.sn</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6 text-center">
                                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{member.name}</h3>
                                            <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest mt-1 mb-3">{member.title}</p>
                                            <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                                                {member.bio}
                                            </p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}>
            {children}
        </span>
    );
}
