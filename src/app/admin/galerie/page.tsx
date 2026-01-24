
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ImageIcon, Loader2, Camera, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { uploadToCloudinary } from '@/lib/cloudinary';

interface GalleryImage {
    id: string;
    imageUrl?: string;
    imageUrlId?: string;
    description: string;
    createdAt: any;
}

export default function AdminGaleriePage() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const firestore = useFirestore();

    const [newImage, setNewImage] = useState({
        imageUrl: '',
        description: '',
    });

    useEffect(() => {
        fetchImages();
    }, [firestore]);

    const fetchImages = async () => {
        if (!firestore) return;
        setIsLoading(true);
        try {
            const imagesRef = collection(firestore, 'gallery');
            const q = query(imagesRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const imagesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as GalleryImage[];
            setImages(imagesData);
        } catch (error) {
            console.error('Error fetching gallery:', error);
            toast.error('Erreur lors du chargement de la galerie');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddImage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore || !newImage.imageUrl) return;

        setIsLoading(true);
        try {
            await addDoc(collection(firestore, 'gallery'), {
                imageUrl: newImage.imageUrl,
                description: newImage.description,
                createdAt: serverTimestamp(),
            });
            toast.success('Image ajoutée à la galerie');
            setIsAdding(false);
            setNewImage({ imageUrl: '', description: '' });
            fetchImages();
        } catch (error) {
            console.error('Error adding image:', error);
            toast.error('Erreur lors de l\'ajout');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!firestore || !window.confirm('Supprimer cette image de la galerie ?')) return;

        try {
            await deleteDoc(doc(firestore, 'gallery', id));
            toast.success('Image supprimée');
            setImages(images.filter(img => img.id !== id));
        } catch (error) {
            console.error('Error deleting image:', error);
            toast.error('Erreur lors de la suppression');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Galerie Photos</h2>
                    <p className="text-slate-500">Gérez les photos souvenirs et les évènements de l'Institut.</p>
                </div>
                <Button
                    onClick={() => setIsAdding(!isAdding)}
                    className={`rounded-xl gap-2 shadow-lg transition-all ${isAdding ? 'bg-slate-200 text-slate-900 hover:bg-slate-300 shadow-none' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}
                >
                    {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {isAdding ? 'Annuler' : 'Ajouter une Photo'}
                </Button>
            </div>

            {isAdding && (
                <Card className="border-none shadow-md bg-white animate-in slide-in-from-top-4 duration-300">
                    <CardHeader>
                        <CardTitle className="text-lg">Ajouter une nouvelle photo</CardTitle>
                        <CardDescription>Remplissez les détails pour ajouter une image à la galerie publique.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddImage} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="image">Sélectionner une image</Label>
                                    <div
                                        onClick={() => document.getElementById('image-upload')?.click()}
                                        className="cursor-pointer group relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 transition-all"
                                    >
                                        <input
                                            type="file"
                                            id="image-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setIsLoading(true);
                                                    try {
                                                        const url = await uploadToCloudinary(file);
                                                        setNewImage({ ...newImage, imageUrl: url });
                                                        toast.success('Image téléchargée sur Cloudinary');
                                                    } catch (err: any) {
                                                        toast.error(err.message || 'Erreur lors de l\'upload');
                                                    } finally {
                                                        setIsLoading(false);
                                                    }
                                                }
                                            }}
                                        />
                                        {newImage.imageUrl ? (
                                            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm">
                                                <Image src={newImage.imageUrl} alt="Preview" fill className="object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Camera className="w-8 h-8 text-white" />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                                    <Camera className="w-6 h-6 text-emerald-600" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-600">Cliquer pour choisir une photo</p>
                                                <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider">PNG, JPG jusqu'à 10MB</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Légende / Description</Label>
                                    <Input
                                        id="description"
                                        value={newImage.description}
                                        onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
                                        placeholder="Ex: Sortie pédagogique des élèves au zoo..."
                                        required
                                        className="rounded-xl h-11"
                                    />
                                </div>
                                <Button type="submit" disabled={isLoading || !newImage.imageUrl} className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200">
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Ajouter à la Galerie
                                </Button>
                            </div>
                            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-100 rounded-3xl text-center">
                                <div className="w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center mb-4">
                                    <ImageIcon className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-900 mb-1">Upload Cloudinary</h4>
                                <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
                                    Vos photos sont maintenant stockées de manière professionnelle et sécurisée.
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card className="border-none shadow-sm bg-white">
                <CardHeader className="border-b border-slate-50">
                    <div className="flex items-center gap-2">
                        <Camera className="w-5 h-5 text-emerald-600" />
                        <CardTitle className="text-lg">Photos de la Galerie</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                            <p className="text-slate-500 font-medium">Chargement des photos...</p>
                        </div>
                    ) : images.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-slate-300" />
                            </div>
                            <div>
                                <p className="text-slate-900 font-semibold">Galerie vide</p>
                                <p className="text-slate-500 text-sm">Ajoutez des photos pour embellir le site.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {images.map((img) => {
                                const displayUrl = img.imageUrl || (img.imageUrlId ? PlaceHolderImages.find(p => p.id === img.imageUrlId)?.imageUrl : null);
                                return (
                                    <div key={img.id} className="group relative rounded-2xl overflow-hidden bg-slate-100 aspect-square shadow-sm transition-all hover:shadow-md">
                                        {displayUrl && (
                                            <Image
                                                src={displayUrl}
                                                alt={img.description}
                                                fill
                                                className="object-cover transition-transform duration-300 group-hover:scale-110"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                            <p className="text-white text-xs font-medium line-clamp-2 mb-3">{img.description}</p>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="w-full rounded-lg h-8 text-[10px] uppercase font-bold tracking-wider"
                                                onClick={() => handleDelete(img.id)}
                                            >
                                                <Trash2 className="w-3 h-3 mr-2" />
                                                Supprimer
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}


