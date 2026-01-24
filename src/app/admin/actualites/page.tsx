
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Eye, Newspaper, Loader2, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Post {
    id: string;
    title: string;
    date: string;
    excerpt: string;
    imageUrlId: string;
    published: boolean;
    createdAt: any;
}

export default function AdminActualitesPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const firestore = useFirestore();

    useEffect(() => {
        fetchPosts();
    }, [firestore]);

    const fetchPosts = async () => {
        if (!firestore) return;
        setIsLoading(true);
        try {
            const postsRef = collection(firestore, 'posts');
            const q = query(postsRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const postsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Post[];
            setPosts(postsData);
        } catch (error) {
            console.error('Error fetching posts:', error);
            toast.error('Erreur lors du chargement des actualités');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!firestore || !window.confirm('Êtes-vous sûr de vouloir supprimer cette actualité ?')) return;

        try {
            await deleteDoc(doc(firestore, 'posts', id));
            toast.success('Actualité supprimée');
            setPosts(posts.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting post:', error);
            toast.error('Erreur lors de la suppression');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Actualités</h2>
                    <p className="text-slate-500">Gérez les articles et évènements affichés sur le site.</p>
                </div>
                <Button asChild className="rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200">
                    <Link href="/admin/actualites/new">
                        <Plus className="w-5 h-5" />
                        Ajouter une Actualité
                    </Link>
                </Button>
            </div>

            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <Newspaper className="w-5 h-5 text-emerald-600" />
                        <CardTitle className="text-lg font-semibold">Liste des Articles</CardTitle>
                    </div>
                    <CardDescription>Vous avez {posts.length} article(s) enregistré(s).</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                            <p className="text-slate-500 font-medium">Chargement des articles...</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                                <Newspaper className="w-8 h-8 text-slate-300" />
                            </div>
                            <div>
                                <p className="text-slate-900 font-semibold">Aucun article pour le moment</p>
                                <p className="text-slate-500 text-sm">Commencez par créer votre première actualité.</p>
                            </div>
                            <Button asChild variant="outline" className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                                <Link href="/admin/actualites/new">Créer un article</Link>
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="pl-6 py-4">Titre</TableHead>
                                    <TableHead>Date d'affichage</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {posts.map((post) => (
                                    <TableRow key={post.id} className="group transition-colors hover:bg-slate-50">
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 line-clamp-1">{post.title}</span>
                                                <span className="text-xs text-slate-500 line-clamp-1 italic">{post.excerpt}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span className="text-sm font-medium">{post.date}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={post.published ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}>
                                                {post.published ? 'Publié' : 'Brouillon'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" asChild title="Voir sur le site">
                                                    <Link href={`/actualites/${post.id}`} target="_blank">
                                                        <Eye className="w-4 h-4 text-slate-400" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild title="Modifier">
                                                    <Link href={`/admin/actualites/${post.id}/edit`}>
                                                        <Pencil className="w-4 h-4 text-emerald-600" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" title="Supprimer" onClick={() => handleDelete(post.id)}>
                                                    <Trash2 className="w-4 h-4 text-rose-600" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
