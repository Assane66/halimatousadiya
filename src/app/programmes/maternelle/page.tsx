import Image from "next/image";
import { Metadata } from "next";
import { CheckCircle } from "lucide-react";

import { PROGRAMS, SITE_NAME } from "@/lib/constants";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";

const program = PROGRAMS.find((p) => p.slug === "maternelle");

export const metadata: Metadata = {
  title: `${program?.name} | Programmes | ${SITE_NAME}`,
  description: program?.description,
};

export default function MaternellePage() {
  if (!program) {
    return <div>Programme non trouvé.</div>;
  }

  const programImage = PlaceHolderImages.find(
    (img) => img.id === program.imageUrlId
  );

  return (
    <div className="bg-muted">
      <div className="container mx-auto py-16 md:py-24">
        <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-2">
          <div className="space-y-6">
            <Badge variant="secondary">{program.name}</Badge>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
              {program.name}
            </h1>
            <p className="text-lg text-muted-foreground">
              {program.description}
            </p>
            {programImage && (
              <div className="relative mt-8 h-80 w-full overflow-hidden rounded-lg">
                <Image
                  src={programImage.imageUrl}
                  alt={program.name}
                  fill
                  className="object-cover"
                  data-ai-hint={programImage.imageHint}
                />
              </div>
            )}
          </div>
          <div className="space-y-8 rounded-lg bg-background p-8 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold">Objectifs du Programme</h2>
              <ul className="mt-4 space-y-2">
                {program.objectives.map((obj, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Matières Enseignées</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {program.subjects.map((sub, index) => (
                  <Badge key={index} variant="outline">
                    {sub}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Conditions d'Admission</h2>
              <p className="mt-4 text-muted-foreground">{program.admission}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
