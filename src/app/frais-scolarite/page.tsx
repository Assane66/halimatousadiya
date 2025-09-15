import { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { SITE_NAME } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: `Frais de Scolarité | ${SITE_NAME}`,
  description: `Découvrez les frais de scolarité de l'Institut Islamique Yaye Halimatou Saadiya.`,
};

const fees = [
  {
    title: "Internat",
    inscription: "50.000 FCFA",
    mensualite: "40.000 FCFA",
    description: "Hébergement complet, repas, et suivi scolaire.",
    features: ["Hébergement", "Restauration complète", "Suivi pédagogique renforcé"],
  },
  {
    title: "Semi-Internat",
    inscription: "20.000 FCFA",
    mensualite: "18.000 FCFA",
    description: "Repas de midi et études surveillées après les cours.",
    features: ["Repas du midi", "Études surveillées", "Accès aux activités"],
  },
  {
    title: "Externat",
    inscription: "20.000 FCFA",
    mensualite: "10.000 FCFA",
    description: "Accès à l'ensemble du programme scolaire et pédagogique.",
    features: ["Enseignement complet", "Participation aux événements", "Accès à la bibliothèque"],
  },
];

export default function FeesPage() {
  return (
    <>
      <PageHeader
        title="Frais de Scolarité"
        subtitle="Des options flexibles pour répondre aux besoins de chaque famille."
      />
      <div className="container mx-auto py-16 md:py-24">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {fees.map((fee) => (
            <Card key={fee.title} className="flex flex-col">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-primary">
                  {fee.title}
                </CardTitle>
                <CardDescription>{fee.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-grow flex-col justify-between">
                <div className="mb-8">
                  <div className="mb-4 rounded-lg bg-muted p-4 text-center">
                    <p className="text-lg">Inscription</p>
                    <p className="text-3xl font-bold">{fee.inscription}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4 text-center">
                    <p className="text-lg">Mensualité</p>
                    <p className="text-3xl font-bold">{fee.mensualite}</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                    {fee.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-16 text-center text-muted-foreground">
          <p>
            Pour plus d'informations sur les modalités d'inscription et de paiement,
            veuillez nous <a href="/contact" className="text-primary hover:underline">contacter</a>.
          </p>
        </div>
      </div>
    </>
  );
}
