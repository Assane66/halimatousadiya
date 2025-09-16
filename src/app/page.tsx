import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  HeartHandshake,
  Lightbulb,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { BLOG_POSTS, SITE_NAME } from "@/lib/constants";

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === "hero-1");
  const aboutImage = PlaceHolderImages.find((img) => img.id === "about-1");

  return (
    <div className="flex flex-col">
      <section className="relative grid w-full grid-cols-1 md:grid-cols-2">
        <div className="relative flex min-h-[60vh] flex-col justify-center bg-background p-8 md:p-16">
          <div className="max-w-md space-y-4 text-left">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">
              Bienvenue à Boun Nourou
            </p>
            <h1 className="font-headline text-5xl font-bold tracking-tight text-foreground md:text-7xl">
              DAARA MODERNE DE L'EXCELLENCE
            </h1>
            <p className="font-headline text-3xl text-muted-foreground">
              Boun Nourou
            </p>
            <Button asChild size="lg" className="mt-4">
              <Link href="/contact">
                Obtenir un devis <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative min-h-[60vh] w-full">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-background/50 to-background" />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Bienvenue à l'Institut Yaye Halimatou Saadiya
              </h2>
              <p className="text-lg text-muted-foreground">
                Fondé sur des valeurs de foi, d'excellence et de communauté,
                notre institut se consacre à offrir une éducation islamique et
                académique de qualité, préparant nos élèves à devenir des
                leaders éclairés et des citoyens responsables.
              </p>
              <Button asChild variant="link" className="p-0 text-base">
                <Link href="/a-propos">
                  En savoir plus sur notre mission{" "}
                  <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </div>
            <div className="h-80 w-full overflow-hidden rounded-lg shadow-lg">
              {aboutImage && (
                <Image
                  src={aboutImage.imageUrl}
                  alt={aboutImage.description}
                  width={600}
                  height={400}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  data-ai-hint={aboutImage.imageHint}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted py-16 md:py-24">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Nos Valeurs Fondamentales
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Au cœur de notre enseignement se trouvent des principes qui guident
            chaque aspect de la vie à l'institut.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Lightbulb />
                </div>
                <CardTitle className="mt-4">Savoir</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Nous cultivons la soif de connaissance, en alliant sciences
                  islamiques et matières académiques pour un savoir complet.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <BookOpen />
                </div>
                <CardTitle className="mt-4">Spiritualité</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Nous encourageons une connexion profonde avec la foi à
                  travers la prière, l'étude du Coran et la pratique des
                  valeurs éthiques.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <HeartHandshake />
                </div>
                <CardTitle className="mt-4">Communauté</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Nous bâtissons un environnement de respect, d'entraide et de
                  fraternité, où chaque élève peut s'épanouir.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
            Dernières Actualités
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {BLOG_POSTS.slice(0, 3).map((post) => {
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
          <div className="mt-12 text-center">
            <Button asChild>
              <Link href="/actualites">
                Voir toutes les actualités <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Rejoignez notre communauté
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg">
            Vous souhaitez en savoir plus sur nos programmes ou inscrire votre
            enfant ? Contactez-nous dès aujourd'hui.
          </p>
          <Button asChild variant="secondary" size="lg" className="mt-8">
            <Link href="/contact">Nous contacter</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
