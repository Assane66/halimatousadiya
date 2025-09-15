import { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { SITE_NAME } from "@/lib/constants";
import { MediaGallery } from "./media-gallery";

export const metadata: Metadata = {
  title: `Galerie Média | ${SITE_NAME}`,
  description: `Explorez les moments forts de la vie de l'institut à travers notre galerie de photos et de vidéos.`,
};

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        title="Galerie Média"
        subtitle="Revivez les moments forts de notre communauté à travers nos photos."
      />
      <div className="container mx-auto py-16 md:py-24">
        <MediaGallery />
      </div>
    </>
  );
}
