import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BLOG_POSTS, SITE_NAME } from "@/lib/constants";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export const metadata: Metadata = {
  title: `Actualités | ${SITE_NAME}`,
  description: `Restez informés des derniers événements, annonces et nouvelles de l'Institut Islamique Yaye Halimatou Saadiya.`,
};

export default function BlogPage() {
  return (
    <>
      <PageHeader
        title="Actualités de l'Institut"
        subtitle="Suivez la vie de notre communauté, nos événements et nos annonces."
      />
      <div className="container mx-auto py-16 md:py-24">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {BLOG_POSTS.map((post) => {
            const postImage = PlaceHolderImages.find(
              (img) => img.id === post.imageUrlId
            );
            return (
              <Card key={post.slug} className="overflow-hidden">
                {postImage && (
                  <Link href={`/actualites/${post.slug}`}>
                    <div className="h-56 w-full">
                      <Image
                        src={postImage.imageUrl}
                        alt={post.title}
                        width={400}
                        height={225}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        data-ai-hint={postImage.imageHint}
                      />
                    </div>
                  </Link>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">
                    <Link href={`/actualites/${post.slug}`}>{post.title}</Link>
                  </CardTitle>
                  <CardDescription>{post.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{post.excerpt}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
