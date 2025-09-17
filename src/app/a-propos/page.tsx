import Image from "next/image";
import { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { CONTACT_INFO, SITE_NAME, TEAM_MEMBERS } from "@/lib/constants";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const metadata: Metadata = {
  title: `À propos de nous | ${SITE_NAME}`,
  description: `Découvrez l'histoire, la mission et l'équipe de l'Institut Islamique Yaye Halimatou Saadiya.`,
};

export default function AboutPage() {
  const aboutImage = PlaceHolderImages.find((img) => img.id === "about-1");

  return (
    <>
      <PageHeader
        title="À Propos de Notre Institut"
        subtitle="Notre histoire, notre mission et les visages derrière notre engagement."
      />

      <section className="py-16 md:py-24">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            {aboutImage && (
              <div className="order-last h-96 w-full md:order-first">
                <Image
                  src={aboutImage.imageUrl}
                  alt={aboutImage.description}
                  width={600}
                  height={450}
                  className="h-full w-full rounded-lg object-cover shadow-lg"
                  data-ai-hint={aboutImage.imageHint}
                />
              </div>
            )}
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">
                  Notre Histoire
                </h2>
                <p className="text-muted-foreground">
                  L’Institut Islamique Yaye Halimatou Saadiya est né d’une ambition noble : ériger à Tivaouane Peulh un pôle d’excellence éducative et spirituelle, au service des générations présentes et futures. Portant le nom d’une figure maternelle dont la sagesse et la piété demeurent une source d’inspiration, notre institut incarne l’héritage d’un amour pour le savoir, la foi et le service de la communauté. Depuis sa fondation, nous travaillons avec constance et dévouement pour offrir à chaque élève un environnement où l’apprentissage rime avec épanouissement, et où l’éducation s’élève au rang de mission sacrée.
                </p>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">
                  Mission et Valeurs
                </h2>
                <p className="text-muted-foreground">
                  Notre mission est de fournir une éducation holistique qui
                  équilibre parfaitement les sciences islamiques et les matières
                  académiques. Nous nous efforçons de former des individus
                  dotés d'un caractère islamique solide, d'un esprit critique
                  aiguisé et d'un sens profond de la responsabilité sociale. Nos
                  valeurs de foi, de respect, d'intégrité et de service à la
                  communauté sont au cœur de tout ce que nous faisons.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
