
'use client';

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { BLOG_POSTS, SITE_NAME } from "@/lib/constants";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BlogPostPage() {
    const { slug } = useParams();
    const [post, setPost] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const firestore = useFirestore();

    useEffect(() => {
        async function fetchPost() {
            // 1. Try static posts first
            const staticPost = BLOG_POSTS.find((p) => p.slug === slug);
            if (staticPost) {
                setPost(staticPost);
                setIsLoading(false);
                return;
            }

            // 2. Try Firestore
            if (firestore && slug) {
                try {
                    const docRef = doc(firestore, 'posts', slug as string);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setPost({ id: docSnap.id, ...docSnap.data() });
                    }
                } catch (error) {
                    console.error("Error fetching dynamic post:", error);
                }
            }
            setIsLoading(false);
        }
        fetchPost();
    }, [firestore, slug]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-4">Article non trouvé</h1>
                <Button asChild variant="outline">
                    <Link href="/actualites">Retour aux actualités</Link>
                </Button>
            </div>
        );
    }

    const postImage = PlaceHolderImages.find((p) => p.id === post.imageUrlId);

    return (
        <article className="py-16 md:py-24 bg-white">
            <div className="container mx-auto max-w-4xl px-4">
                <header className="text-center mb-12">
                    <Link href="/actualites" className="inline-flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-widest text-xs mb-8 hover:ml-[-8px] transition-all">
                        <ArrowLeft className="w-4 h-4" />
                        Retour aux actualités
                    </Link>
                    <div className="flex justify-center mb-6">
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 px-4 py-1 rounded-full uppercase tracking-widest text-[10px] font-bold">
                            Évènement
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl text-slate-900 leading-tight">
                        {post.title}
                    </h1>
                    <div className="mt-6 flex items-center justify-center gap-3 text-slate-500">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <p className="text-sm font-medium">{post.date}</p>
                    </div>
                </header>

                {(() => {
                    const displayUrl = post.imageUrl || (post.imageUrlId ? PlaceHolderImages.find((p) => p.id === post.imageUrlId)?.imageUrl : null);
                    return displayUrl && (
                        <div className="relative my-12 h-[300px] md:h-[500px] w-full overflow-hidden rounded-[2.5rem] shadow-2xl shadow-emerald-100/50">
                            <Image
                                src={displayUrl}
                                alt={post.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                    );
                })()}

                <div
                    className="prose prose-emerald prose-lg mx-auto mt-12 max-w-none text-slate-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <div className="mt-16 pt-8 border-t border-slate-100">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <p className="font-bold text-slate-900">Partager cet article</p>
                            <p className="text-sm text-slate-500">Aidez-nous à faire rayonner notre institut.</p>
                        </div>
                        <div className="flex gap-4">
                            {/* Placeholder for social sharing */}
                            <Button variant="outline" className="rounded-full w-10 h-10 p-0">F</Button>
                            <Button variant="outline" className="rounded-full w-10 h-10 p-0">T</Button>
                            <Button variant="outline" className="rounded-full w-10 h-10 p-0">W</Button>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
