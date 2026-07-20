"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";

const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  { ssr: false }
);

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-500">
        {/* Lottie Animation Container - Reduced bottom margin to compensate for Lottie internal padding */}
        <div className="relative mx-auto w-64 h-64 md:w-80 md:h-80 drop-shadow-2xl -mb-10 md:-mb-14">
          <Player
            autoplay
            loop
            src="/assets/lottie/404.json"
            style={{ height: "100%", width: "100%" }}
          />
        </div>

        <div className="space-y-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Error 404 • Path Not Found
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-foreground">
              Halaman <span className="text-primary/40">Hilang.</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-xs mx-auto leading-relaxed">
              Sepertinya Anda tersesat di infrastruktur kami. Jalur yang Anda cari tidak tersedia.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button asChild className="w-full sm:w-auto h-12 px-8 rounded-xl font-bold gap-2 shadow-lg shadow-primary/10">
              <Link href="/">
                <Home className="w-4 h-4" />
                Kembali ke Beranda
              </Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="w-full sm:w-auto h-12 px-8 rounded-xl font-bold gap-2 border-border"
            >
              <ArrowLeft className="w-4 h-4" />
              Sebelumnya
            </Button>
          </div>
        </div>

        <div className="pt-16 opacity-20">
           <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted-foreground">STSPoint Gateway Engine</p>
        </div>
      </div>
    </div>
  );
}
