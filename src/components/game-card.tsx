"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Gamepad2 } from "lucide-react";

interface GameCardProps {
  id: string;
  name: string;
  developer: string;
  imageUrl: string;
  slug: string;
}

export function GameCard({ name, developer, imageUrl, slug }: GameCardProps) {
  return (
    <Link href={`/games/${slug}`} className="group block">
      <div className="relative aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden mb-2 md:mb-2.5 border border-white/5 transition-all duration-300 group-hover:border-primary/30 group-hover:-translate-y-1 shadow-sm">
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 15vw"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex flex-col items-center justify-center gap-2">
            <Gamepad2 className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground opacity-20" />
            <span className="text-[8px] md:text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Preview</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute bottom-1.5 left-1.5 md:bottom-2 md:left-2">
          <Badge className="bg-black/70 backdrop-blur-md text-[7px] md:text-[8px] py-0 px-1 md:px-1.5 uppercase tracking-widest border-none text-white/90">
            Official
          </Badge>
        </div>
      </div>
      <div className="space-y-0.5 px-0.5">
        <h3 className="font-headline font-bold text-xs md:text-sm group-hover:text-primary transition-colors flex items-center justify-between">
          <span className="truncate">{name}</span>
          <ChevronRight className="w-2.5 h-2.5 md:w-3 md:h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary shrink-0" />
        </h3>
        <p className="text-[9px] md:text-[10px] text-muted-foreground font-medium truncate opacity-70">{developer}</p>
      </div>
    </Link>
  );
}