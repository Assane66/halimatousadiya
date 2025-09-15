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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GALLERY_EVENTS } from "@/lib/constants";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent } from "@/components/ui/card";

type ImageType = {
  id: string;
  imageUrlId: string;
  description: string;
};

export function MediaGallery() {
  const [selectedImage, setSelectedImage] = React.useState<ImageType | null>(
    null
  );
  const eventKeys = Object.keys(GALLERY_EVENTS);

  const getFullImageData = (image: ImageType) => {
    const placeholder = PlaceHolderImages.find(
      (p) => p.id === image.imageUrlId
    );
    return placeholder
      ? { ...image, fullUrl: placeholder.imageUrl, hint: placeholder.imageHint }
      : null;
  };

  return (
    <>
      <Tabs defaultValue={eventKeys[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          {eventKeys.map((key) => (
            <TabsTrigger key={key} value={key}>
              {GALLERY_EVENTS[key as keyof typeof GALLERY_EVENTS].name}
            </TabsTrigger>
          ))}
        </TabsList>
        {eventKeys.map((key) => (
          <TabsContent key={key} value={key}>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {GALLERY_EVENTS[key as keyof typeof GALLERY_EVENTS].images.map(
                (image) => {
                  const imageData = getFullImageData(image);
                  return (
                    imageData && (
                      <Card
                        key={image.id}
                        className="cursor-pointer overflow-hidden"
                        onClick={() => setSelectedImage(image)}
                      >
                        <CardContent className="p-0">
                          <div className="relative h-60 w-full">
                            <Image
                              src={imageData.fullUrl}
                              alt={image.description}
                              fill
                              className="object-cover transition-transform duration-300 hover:scale-105"
                              data-ai-hint={imageData.hint}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )
                  );
                }
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      <Dialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
      >
        {selectedImage && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Image</DialogTitle>
              <DialogDescription>{selectedImage.description}</DialogDescription>
            </DialogHeader>
            <div className="relative mt-4 h-[70vh] w-full">
              {(() => {
                const imageData = getFullImageData(selectedImage);
                return (
                  imageData && (
                    <Image
                      src={imageData.fullUrl}
                      alt={selectedImage.description}
                      fill
                      className="object-contain"
                      data-ai-hint={imageData.hint}
                    />
                  )
                );
              })()}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
