import Image from "next/image";
import { Metadata } from "next";

import { BLOG_POSTS, SITE_NAME } from "@/lib/constants";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";

const post = BLOG_POSTS.find((p) => p.slug === "journee-portes-ouvertes-2024");

export const metadata: Metadata = {
  title: `${post?.title} | Actualités | ${SITE_NAME}`,
  description: post?.excerpt,
};

export default function BlogPostPage() {
  if (!post) {
    return <div>Article non trouvé.</div>;
  }

  const postImage = PlaceHolderImages.find((p) => p.id === post.imageUrlId);

  return (
    <article className="py-16 md:py-24">
      <div className="container mx-auto max-w-4xl">
        <header className="text-center">
          <Badge variant="secondary">Actualités</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-muted-foreground">{post.date}</p>
        </header>

        {postImage && (
          <div className="relative my-8 h-96 w-full overflow-hidden rounded-lg">
            <Image
              src={postImage.imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              data-ai-hint={postImage.imageHint}
            />
          </div>
        )}

        <div
          className="prose prose-lg mx-auto mt-12 max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </article>
  );
}
