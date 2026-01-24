"use client";

import Image from "next/image";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GALLERY_IMAGES as STATIC_IMAGES } from "@/lib/constants";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent } from "@/components/ui/card";
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Loader2 } from "lucide-react";

type ImageType = {
  id: string;
  imageUrl?: string;
  imageUrlId?: string;
  description: string;
};

export function MediaGallery() {
  const [images, setImages] = React.useState<ImageType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedImage, setSelectedImage] = React.useState<ImageType | null>(
    null
  );
  const firestore = useFirestore();

  React.useEffect(() => {
    async function fetchImages() {
      if (!firestore) return;
      try {
        const galleryRef = collection(firestore, 'gallery');
        const q = query(galleryRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const dynamicImages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ImageType[];

        if (dynamicImages.length > 0) {
          setImages([...dynamicImages, ...STATIC_IMAGES]);
        } else {
          setImages(STATIC_IMAGES);
        }
      } catch (error) {
        console.error('Error fetching gallery images:', error);
        setImages(STATIC_IMAGES);
      } finally {
        setIsLoading(false);
      }
    }
    fetchImages();
  }, [firestore]);

  const getFullImageData = (image: ImageType) => {
    if (image.imageUrl) {
      return { ...image, fullUrl: image.imageUrl, hint: "Cloudinary Image" };
    }
    const placeholder = PlaceHolderImages.find(
      (p) => p.id === image.imageUrlId
    );
    return placeholder
      ? { ...image, fullUrl: placeholder.imageUrl, hint: placeholder.imageHint }
      : null;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium text-xs uppercase tracking-[0.2em]">Chargement des souvenirs...</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 md:px-0">
        {images.map((image) => {
          const imageData = getFullImageData(image);
          return (
            imageData && (
              <Card
                key={image.id}
                className="group cursor-pointer overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-3xl bg-white aspect-[4/5] sm:aspect-square"
                onClick={() => setSelectedImage(image)}
              >
                <CardContent className="p-0 h-full">
                  <div className="relative h-full w-full overflow-hidden">
                    <Image
                      src={imageData.fullUrl}
                      alt={image.description}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <p className="text-white text-sm font-medium line-clamp-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{image.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          );
        })}
      </div>

      <Dialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
      >
        {selectedImage && (
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-none rounded-[2rem]">
            <div className="relative h-[80vh] w-full flex items-center justify-center">
              {(() => {
                const imageData = getFullImageData(selectedImage);
                return (
                  imageData && (
                    <Image
                      src={imageData.fullUrl}
                      alt={selectedImage.description}
                      fill
                      className="object-contain p-4"
                    />
                  )
                );
              })()}
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent">
                <h3 className="text-white text-xl font-bold mb-2">Image</h3>
                <p className="text-white/80 text-sm leading-relaxed">{selectedImage.description}</p>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
