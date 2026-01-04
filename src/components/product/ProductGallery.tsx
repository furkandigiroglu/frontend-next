"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { StoredFile } from "@/types/product";

interface ProductGalleryProps {
  files: StoredFile[];
  productName: string;
}

export function ProductGallery({ files, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!files || files.length === 0) {
    return (
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-slate-100 relative">
        <Image
          src="/window.svg"
          alt={productName}
          fill
          className="h-full w-full object-cover object-center"
        />
      </div>
    );
  }

  const getImageUrl = (file: StoredFile) => 
    `http://185.96.163.183:8000/api/v1/storage/${file.namespace}/${file.entity_id}/${file.filename}`;

  return (
    <div className="flex flex-col-reverse gap-4">
      {/* Image Selector - Desktop */}
      <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
        <div className="grid grid-cols-4 gap-6" aria-orientation="horizontal" role="tablist">
          {files.map((file, index) => (
            <button
              key={file.filename}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-4",
                selectedIndex === index ? "ring ring-slate-900 ring-offset-2" : "ring-transparent"
              )}
            >
              <span className="sr-only">{productName} image {index + 1}</span>
              <span className="absolute inset-0 overflow-hidden rounded-md">
                <Image
                  src={getImageUrl(file)}
                  alt=""
                  fill
                  className="h-full w-full object-cover object-center"
                />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Image Selector - Mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 sm:hidden snap-x">
        {files.map((file, index) => (
          <button
            key={file.filename}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "relative flex-none h-20 w-20 cursor-pointer rounded-md bg-white snap-start",
              selectedIndex === index ? "ring-2 ring-slate-900" : "ring-1 ring-slate-200"
            )}
          >
            <span className="absolute inset-0 overflow-hidden rounded-md">
              <Image
                src={getImageUrl(file)}
                alt=""
                fill
                className="h-full w-full object-cover object-center"
              />
            </span>
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="aspect-square w-full">
        <div className="relative h-full w-full overflow-hidden rounded-lg">
          <Image
            src={getImageUrl(files[selectedIndex])}
            alt={productName}
            fill
            className="h-full w-full object-cover object-center"
            priority
          />
        </div>
      </div>
    </div>
  );
}
