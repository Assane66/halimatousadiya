
import { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { CONTACT_INFO, SITE_NAME } from "@/lib/constants";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: `Contact | ${SITE_NAME}`,
  description: `Contactez l'Institut Islamique Yaye Halimatou Saadiya pour toute question ou pour une inscription.`,
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contactez-Nous"
        subtitle="Nous sommes à votre disposition pour toute question. Remplissez le formulaire ou utilisez nos coordonnées."
      />
      <div className="container mx-auto py-16 md:py-24">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold">Nos Coordonnées</h2>
              <p className="mt-2 text-muted-foreground">
                N'hésitez pas à nous appeler, nous envoyer un email ou nous
                rendre visite.
              </p>
              <div className="mt-6 space-y-4">
                <div className="flex items-start">
                  <Phone className="mr-4 mt-1 h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Téléphone</h3>
                    <p className="text-muted-foreground">
                      {CONTACT_INFO.phone1}
                    </p>
                    <p className="text-muted-foreground">
                      {CONTACT_INFO.phone2}
                    </p>
                    <p className="text-muted-foreground">
                      {CONTACT_INFO.phone3}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="mr-4 mt-1 h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-muted-foreground">{CONTACT_INFO.email}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="mr-4 mt-1 h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Adresse</h3>
                    <p className="text-muted-foreground">
                      {CONTACT_INFO.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <ContactForm />
          </div>
        </div>

        <div className="mt-16">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Notre Emplacement
          </h2>
          <div className="overflow-hidden rounded-lg shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1196.9730207362957!2d-17.291513077355052!3d14.802748315336803!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sfr!2ssn!4v1758123791002!5m2!1sfr!2ssn"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </>
  );
}
