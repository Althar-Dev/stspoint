"use client";

import { GameCard } from "@/components/game-card";
import { Badge } from "@/components/ui/badge";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const GAMES = [
  { id: 'mlbb', name: 'Mobile Legends', developer: 'Moonton', slug: 'mobile-legends' },
  { id: 'pubg', name: 'PUBG Mobile', developer: 'Tencent', slug: 'pubg-mobile' },
  { id: 'genshin', name: 'Genshin Impact', developer: 'HoYoverse', slug: 'genshin-impact' },
  { id: 'valorant', name: 'Valorant', developer: 'Riot Games', slug: 'valorant' },
  { id: 'freefire', name: 'Free Fire', developer: 'Garena', slug: 'free-fire' },
  { id: 'codm', name: 'COD Mobile', developer: 'Activision', slug: 'cod-mobile' },
];

export function CatalogSection() {
  return (
    <section id="catalog" className="w-full py-12 scroll-mt-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-primary rounded-full"></div>
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Katalog Produk</h2>
          </div>
          <p className="text-sm text-muted-foreground">Pilih game favoritmu dan tingkatkan level hari ini.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar shrink-0">
          {['Semua Game', 'Mobile', 'PC / Konsol', 'Voucher'].map((tab, i) => (
            <Badge 
              key={tab} 
              variant={i === 0 ? "default" : "outline"} 
              className={`px-4 py-1.5 rounded-xl cursor-pointer text-xs whitespace-nowrap transition-all ${i === 0 ? 'bg-primary shadow-lg shadow-primary/20' : 'border-white/5 hover:bg-white/5'}`}
            >
              {tab}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-8">
        {GAMES.map((game) => {
          const placeholder = PlaceHolderImages.find(p => p.id === game.id);
          return (
            <GameCard 
              key={game.id}
              id={game.id}
              name={game.name}
              developer={game.developer}
              imageUrl={placeholder?.imageUrl || ""}
              slug={game.slug}
            />
          );
        })}
      </div>
    </section>
  );
}
