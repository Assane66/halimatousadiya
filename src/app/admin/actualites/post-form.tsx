
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Camera, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { uploadToCloudinary } from '@/lib/cloudinary';
import Image from 'next/image';

interface PostFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function PostForm({ initialData, isEditing }: PostFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const firestore = useFirestore();
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        date: initialData?.date || '',
        excerpt: initialData?.excerpt || '',
        content: initialData?.content || '',
        imageUrl: initialData?.imageUrl || '',
        imageUrlId: initialData?.imageUrlId || '',
        published: initialData?.published ?? true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore) return;

        setIsLoading(true);
        try {
            const postData = {
                ...formData,
                updatedAt: serverTimestamp(),
            };

            if (isEditing && initialData?.id) {
                await setDoc(doc(firestore, 'posts', initialData.id), postData, { merge: true });
                toast.success('Actualité mise à jour avec succès');
            } else {
                await addDoc(collection(firestore, 'posts'), {
                    ...postData,
                    createdAt: serverTimestamp(),
                });
                toast.success('Actualité créée avec succès');
            }
            router.push('/admin/actualites');
            router.refresh();
        } catch (error) {
            console.error('Error saving post:', error);
            toast.error('Erreur lors de l\'enregistrement');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            setFormData({ ...formData, imageUrl: url, imageUrlId: '' });
            toast.success('Image téléchargée avec succès');
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Erreur lors du téléchargement');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link href="/admin/actualites">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                        {isEditing ? 'Modifier l\'article' : 'Nouvel Article'}
                    </h2>
                </div>
                <Button
                    type="submit"
                    disabled={isLoading || isUploading}
                    className="rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 px-8"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Enregistrer
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                            <CardTitle className="text-lg">Contenu de l'article</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-sm font-semibold text-slate-700">Titre de l'Actualité</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Ex: Visite du Musée du Prophète..."
                                    required
                                    className="rounded-xl h-12 border-slate-200 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="excerpt" className="text-sm font-semibold text-slate-700">Résumé court (Extrait)</Label>
                                <Textarea
                                    id="excerpt"
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    placeholder="Une brève description pour la carte d'aperçu..."
                                    className="rounded-xl min-h-[100px] border-slate-200 focus:ring-emerald-500"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content" className="text-sm font-semibold text-slate-700">Contenu complet (HTML possible)</Label>
                                <Textarea
                                    id="content"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Ecrivez votre article ici..."
                                    className="rounded-xl min-h-[400px] border-slate-200 focus:ring-emerald-500 font-mono text-sm"
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                            <CardTitle className="text-lg">Image de couverture</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div
                                onClick={() => document.getElementById('image-upload')?.click()}
                                className="cursor-pointer group relative flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 transition-all aspect-video overflow-hidden"
                            >
                                <input
                                    type="file"
                                    id="image-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={isUploading}
                                />
                                {isUploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                                        <p className="text-xs font-medium text-emerald-600">Téléchargement...</p>
                                    </div>
                                ) : formData.imageUrl ? (
                                    <>
                                        <Image src={formData.imageUrl} alt="Preview" fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="w-8 h-8 text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                            <Camera className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Choisir une image</p>
                                        <p className="text-[10px] text-slate-400 mt-1">Recommandé: 1200x800px</p>
                                    </div>
                                )}
                            </div>

                            {!formData.imageUrl && (
                                <div className="space-y-2">
                                    <Label htmlFor="imageUrlId" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ou utiliser un Placeholder ID</Label>
                                    <div className="relative">
                                        <Input
                                            id="imageUrlId"
                                            value={formData.imageUrlId}
                                            onChange={(e) => setFormData({ ...formData, imageUrlId: e.target.value })}
                                            placeholder="Ex: blog-1"
                                            className="rounded-xl pl-10 h-10 border-slate-200"
                                        />
                                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    </div>
                                </div>
                            )}

                            {formData.imageUrl && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-slate-200"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setFormData({ ...formData, imageUrl: '' });
                                    }}
                                >
                                    <X className="w-4 h-4 mr-2" /> Supprimer l'image
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                            <CardTitle className="text-lg">Paramètres</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="date" className="text-sm font-semibold text-slate-700">Date à afficher</Label>
                                <Input
                                    id="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    placeholder="Ex: 24 Janvier 2026"
                                    required
                                    className="rounded-xl h-11 border-slate-200"
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-semibold">Publier immédiatement</Label>
                                    <p className="text-[10px] text-slate-500">L'article sera visible sur le site.</p>
                                </div>
                                <Switch
                                    checked={formData.published}
                                    onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
