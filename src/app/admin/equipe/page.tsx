
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Users, Loader2, UserCircle, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface TeamMember {
    id: string;
    name: string;
    title: string;
    bio: string;
    photoUrlId: string;
    createdAt: any;
}

export default function AdminEquipePage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const firestore = useFirestore();

    const [newMember, setNewMember] = useState({
        name: '',
        title: '',
        bio: '',
        photoUrlId: 'teacher-1',
    });

    useEffect(() => {
        fetchMembers();
    }, [firestore]);

    const fetchMembers = async () => {
        if (!firestore) return;
        setIsLoading(true);
        try {
            const teamRef = collection(firestore, 'team');
            const q = query(teamRef, orderBy('createdAt', 'asc'));
            const snapshot = await getDocs(q);
            const teamData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as TeamMember[];
            setMembers(teamData);
        } catch (error) {
            console.error('Error fetching team:', error);
            toast.error('Erreur lors du chargement de l\'équipe');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore) return;

        setIsLoading(true);
        try {
            await addDoc(collection(firestore, 'team'), {
                ...newMember,
                createdAt: serverTimestamp(),
            });
            toast.success('Membre ajouté à l\'équipe');
            setIsAdding(false);
            setNewMember({ name: '', title: '', bio: '', photoUrlId: 'teacher-1' });
            fetchMembers();
        } catch (error) {
            console.error('Error adding team member:', error);
            toast.error('Erreur lors de l\'ajout');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!firestore || !window.confirm('Supprimer ce membre de l\'équipe ?')) return;

        try {
            await deleteDoc(doc(firestore, 'team', id));
            toast.success('Membre supprimé');
            setMembers(members.filter(m => m.id !== id));
        } catch (error) {
            console.error('Error deleting team member:', error);
            toast.error('Erreur lors de la suppression');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Notre Équipe</h2>
                    <p className="text-slate-500">Gérez le personnel et les enseignants de l'Institut.</p>
                </div>
                <Button
                    onClick={() => setIsAdding(!isAdding)}
                    className={`rounded-xl gap-2 shadow-lg transition-all ${isAdding ? 'bg-slate-200 text-slate-900 hover:bg-slate-300 shadow-none' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}
                >
                    {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {isAdding ? 'Annuler' : 'Ajouter un Membre'}
                </Button>
            </div>

            {isAdding && (
                <Card className="border-none shadow-md bg-white animate-in slide-in-from-top-4 duration-300">
                    <CardHeader>
                        <CardTitle className="text-lg">Informations du membre</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nom complet</Label>
                                        <Input
                                            id="name"
                                            value={newMember.name}
                                            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                            placeholder="Ex: Assane Ba"
                                            required
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Fonction / Titre</Label>
                                        <Input
                                            id="title"
                                            value={newMember.title}
                                            onChange={(e) => setNewMember({ ...newMember, title: e.target.value })}
                                            placeholder="Ex: Professeur d'Arabe"
                                            required
                                            className="rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="photoUrlId">ID Photo (Placeholder)</Label>
                                    <Input
                                        id="photoUrlId"
                                        value={newMember.photoUrlId}
                                        onChange={(e) => setNewMember({ ...newMember, photoUrlId: e.target.value })}
                                        placeholder="Ex: teacher-1"
                                        required
                                        className="rounded-xl"
                                    />
                                    <p className="text-[10px] text-slate-500 italic">Utilisez teacher-1 à teacher-4 pour le moment</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Biographie courte</Label>
                                    <Textarea
                                        id="bio"
                                        value={newMember.bio}
                                        onChange={(e) => setNewMember({ ...newMember, bio: e.target.value })}
                                        placeholder="Brève description du parcours..."
                                        required
                                        className="rounded-xl min-h-[100px]"
                                    />
                                </div>

                                <Button type="submit" disabled={isLoading} className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700">
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Enregistrer le membre
                                </Button>
                            </div>

                            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                                {PlaceHolderImages.find(img => img.id === newMember.photoUrlId) ? (
                                    <div className="space-y-4">
                                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl mx-auto">
                                            <Image
                                                src={PlaceHolderImages.find(img => img.id === newMember.photoUrlId)!.imageUrl}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{newMember.name || 'Prénom Nom'}</p>
                                            <p className="text-emerald-600 font-medium text-sm">{newMember.title || 'Fonction'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <UserCircle className="w-16 h-16 text-slate-300 mb-2" />
                                        <p className="text-sm text-slate-500">Aperçu du profil</p>
                                    </>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [...Array(3)].map((_, i) => (
                        <Card key={i} className="border-none shadow-sm animate-pulse">
                            <CardContent className="p-6 space-y-4">
                                <div className="w-20 h-20 rounded-full bg-slate-200 mx-auto" />
                                <div className="space-y-2">
                                    <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto" />
                                    <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : members.length === 0 ? (
                    <div className="col-span-full py-20 bg-white rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center gap-4">
                        <Users className="w-12 h-12 text-slate-300" />
                        <div>
                            <p className="text-slate-900 font-semibold">Aucun membre enregistré</p>
                            <p className="text-slate-500 text-sm">Ajoutez les membres de votre équipe pour les afficher sur le site.</p>
                        </div>
                    </div>
                ) : (
                    members.map((member) => {
                        const imgData = PlaceHolderImages.find(p => p.id === member.photoUrlId);
                        return (
                            <Card key={member.id} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all duration-300">
                                <CardHeader className="relative pb-0 pt-8 flex flex-col items-center">
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-4 right-4 w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleDelete(member.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-50 shadow-md">
                                        {imgData ? (
                                            <Image
                                                src={imgData.imageUrl}
                                                alt={member.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                <UserCircle className="w-12 h-12 text-slate-300" />
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 text-center">
                                    <h3 className="text-lg font-bold text-slate-900">{member.name}</h3>
                                    <p className="text-emerald-600 font-semibold text-sm mb-4 uppercase tracking-wider">{member.title}</p>
                                    <p className="text-slate-500 text-xs leading-relaxed italic line-clamp-3">
                                        "{member.bio}"
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
