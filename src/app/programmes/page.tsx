import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PROGRAMS, SITE_NAME } from "@/lib/constants";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export const metadata: Metadata = {
  title: `Nos Programmes | ${SITE_NAME}`,
  description: `Découvrez les programmes éducatifs offerts par l'Institut Islamique Yaye Halimatou Saadiya, de la maternelle au collège.`,
};

export default function ProgramsPage() {
  return (
    <>
      <PageHeader
        title="Nos Programmes Éducatifs"
        subtitle="Des parcours d'apprentissage conçus pour l'épanouissement spirituel et académique de chaque enfant."
      />
      <div className="container mx-auto py-16 md:py-24">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {PROGRAMS.map((program) => {
            const programImage = PlaceHolderImages.find(
              (img) => img.id === program.imageUrlId
            );
            return (
              <Card
                key={program.slug}
                className="flex flex-col overflow-hidden"
              >
                {programImage && (
                  <div className="h-56 w-full">
                    <Image
                      src={programImage.imageUrl}
                      alt={program.name}
                      width={600}
                      height={400}
                      className="h-full w-full object-cover"
                      data-ai-hint={programImage.imageHint}
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{program.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription>{program.description}</CardDescription>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="default" className="w-full" disabled={program.objectives.length === 0}>
                    <Link href={`/programmes/${program.slug}`}>
                      Voir les détails <ArrowRight className="ml-2" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
