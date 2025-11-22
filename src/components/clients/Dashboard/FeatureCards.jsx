import { Card } from "@/components/ui/card";
import Image from "next/image";

export function FeatureCards() {
  const cards = [
    {
      title: "Image Creation",
      description: "I need help generating a new image.",
      background: "/images/client/cardbg.webp",
    },
    {
      title: "Video Asset",
      description: "Let's work on a video asset.",
      background: "/images/client/cardbg.webp",
    },
    {
      title: "Show Me Options",
      description: "Show me what you can help me create.",
      background: "/images/client/cardbg.webp",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
      {cards.map((card, index) => (
        <Card
          key={index}
          className="relative maxh-max overflow-hidden rounded-2xl cursor-pointer group transition-transform duration-300 hover:scale-105 py-3 lg:py-4"
        >
          {/* BG image */}
          <Image
            src={card.background}
            alt={card.title}
            fill
            className="object-cover"
            priority={index === 0}
          />

          {/* Soft gradient for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-black/0" />

          {/* Content */}
          <div className="relative h-full p-3 lg:p-5 flex flex-col items-start justify-start gap-3">
            <Image
              src="/images/client/box.png"
              alt="icon"
              width={30}
              height={30}
              className="drop-shadow"
            />
            <div className="mt-2 text-left">
              <h3 className="text-white font-semibold tracking-tight mb-1">
                {card.title}
              </h3>
              <p className="text-white/80 font-light text-sm leading-snug">
                {card.description}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
