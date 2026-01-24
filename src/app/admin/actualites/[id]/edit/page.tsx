
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import PostForm from '../../post-form';
import { Loader2 } from 'lucide-react';

export default function EditPostPage() {
    const { id } = useParams();
    const [post, setPost] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const firestore = useFirestore();

    useEffect(() => {
        async function fetchPost() {
            if (!firestore || !id) return;
            try {
                const docRef = doc(firestore, 'posts', id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setPost({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (error) {
                console.error('Error fetching post:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchPost();
    }, [firestore, id]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                <p className="text-slate-500 font-medium">Chargement de l'article...</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="text-center py-20">
                <p className="text-rose-600 font-bold text-xl">Article non trouvé</p>
            </div>
        );
    }

    return <PostForm initialData={post} isEditing />;
}
