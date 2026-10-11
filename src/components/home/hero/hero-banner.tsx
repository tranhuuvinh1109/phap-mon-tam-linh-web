import Image from "next/image";
import React from "react";

interface HeroBannerProps {
  quote?: string;
  author?: string;
  bannerImage?: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  quote = "“Pháp môn tâm linh - Quảng Độ Chúng Sanh Hữu Duyên.”",
  author = "",
  bannerImage = "/images/home-hero-banner.jpg",
}) => {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#EBE2D4]/60 shadow-sm sm:rounded-3xl">
      {/* Background Panoramic Image */}
      <div className="relative h-44 w-full sm:h-52 md:h-60 lg:h-64">
        <Image
          src={bannerImage}
          alt={quote}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 65vw"
          className="object-cover object-[center_35%]"
        />

        {/* Ambient Dark-to-Transparent Gradient for Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />

        {/* Floating Quote Content */}
        <div className="absolute inset-y-0 left-0 z-10 flex max-w-lg flex-col justify-center px-6 text-white sm:px-10">
          <h2
            className="text-2xl font-bold tracking-wide text-white/95 drop-shadow-md sm:text-3xl md:text-4xl"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {quote}
          </h2>
          <p className="mt-2 text-sm font-medium tracking-wide text-amber-200/90 sm:text-base">
            {author}
          </p>
        </div>
      </div>
    </section>
  );
};
