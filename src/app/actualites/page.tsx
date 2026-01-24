'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BLOG_POSTS as STATIC_POSTS, SITE_NAME } from "@/lib/constants";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Loader2, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const firestore = useFirestore();

  useEffect(() => {
    async function fetchPosts() {
      if (!firestore) return;
      setIsLoading(true);
      setError(null);
      try {
        const postsRef = collection(firestore, 'posts');
        // Try query with order first
        const q = query(postsRef, where('published', '==', true), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const dynamicPosts = snapshot.docs.map(doc => ({
          slug: doc.id,
          ...doc.data()
        }));

        if (dynamicPosts.length > 0) {
          setPosts(dynamicPosts);
        } else {
          setPosts(STATIC_POSTS);
        }
      } catch (err: any) {
        console.error('Error fetching dynamic posts:', err);

        // If it's an index error, try without order
        if (err.message?.includes('index')) {
          try {
            const postsRef = collection(firestore, 'posts');
            const qSimple = query(postsRef, where('published', '==', true));
            const snapshot = await getDocs(qSimple);
            const simplePosts = snapshot.docs.map(doc => ({
              slug: doc.id,
              ...doc.data()
            }));
            setPosts(simplePosts.length > 0 ? simplePosts : STATIC_POSTS);
            toast.error("Erreur d'index Firestore détectée. Tri désactivé temporairement.");
          } catch (e) {
            setError(err.message);
            setPosts(STATIC_POSTS);
          }
        } else {
          setError(err.message);
          setPosts(STATIC_POSTS);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchPosts();
  }, [firestore]);

  return (
    <>
      <PageHeader
        title="Actualités de l'Institut"
        subtitle="Suivez la vie de notre communauté, nos événements et nos annonces."
      />
      <div className="container mx-auto py-16 md:py-24 px-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            <p className="text-slate-500 font-medium font-outfit uppercase tracking-widest text-xs">Chargement des actualités...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-12 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">Certaines actualités n'ont pu être chargées : {error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => {
                // Prioritize uploaded imageUrl over placeholder
                const displayUrl = post.imageUrl || (post.imageUrlId ? PlaceHolderImages.find(img => img.id === post.imageUrlId)?.imageUrl : null);

                return (
                  <Card key={post.slug} className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group rounded-2xl bg-white flex flex-col h-full">
                    {displayUrl && (
                      <Link href={`/actualites/${post.slug}`}>
                        <div className="h-56 w-full relative overflow-hidden">
                          <Image
                            src={displayUrl}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </Link>
                    )}
                    <CardHeader className="space-y-1">
                      <div className="flex items-center gap-2 text-emerald-600 mb-1">
                        <Calendar className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{post.date}</span>
                      </div>
                      <CardTitle className="text-xl font-bold line-clamp-2 leading-snug tracking-tight">
                        <Link href={`/actualites/${post.slug}`} className="hover:text-emerald-700 transition-colors">{post.title}</Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6">{post.excerpt}</p>
                      <div className="mt-auto">
                        <Link
                          href={`/actualites/${post.slug}`}
                          className="text-emerald-600 text-xs font-bold uppercase tracking-widest flex items-center gap-2 group/btn"
                        >
                          Lire la suite
                          <span className="w-5 h-[1px] bg-emerald-600 transition-all duration-300 group-hover/btn:w-10"></span>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}
