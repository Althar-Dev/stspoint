
"use client";

import Link from "next/link";
import { Headphones, User, Menu, Home, HelpCircle, Activity, Zap, Users, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Logo } from "@/components/logo";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { title: "Home", href: "/", icon: Home },
    { title: "About", href: "/about", icon: Users },
    { title: "Feature", href: "/#features", icon: Zap },
    { title: "Faq", href: "/#faq", icon: HelpCircle },
    { title: "Status", href: "/status", icon: Activity },
    { title: "Contact", href: "/support", icon: Headphones },
  ];

  return (
    <nav className={`fixed top-4 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass top-[-4px] py-4 shadow-sm' : 'bg-transparent py-6'}`}>
      <div className={`w-full flex items-center justify-between gap-4 transition-all duration-300 relative ${isScrolled ? 'px-6 md:px-10' : 'px-10 md:px-14'}`}>
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <Logo className="w-10 h-10 md:w-11 md:h-11 transition-transform group-hover:scale-105" />
            <span className={`font-headline font-bold text-lg md:text-xl tracking-tighter hidden sm:block ${isScrolled ? 'text-foreground' : 'text-white'}`}>Point</span>
          </Link>
        </div>

        {/* Desktop Navigation Links - Centered */}
        <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <Link 
              key={link.title} 
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isScrolled ? 'text-muted-foreground' : 'text-white/70'
              }`}
            >
              {link.title}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <Link href="/signin">
            <Button variant="outline" size="sm" className={`hidden sm:flex h-9 px-4 text-xs rounded-lg font-bold transition-all ${
              isScrolled 
                ? 'border-primary/20 hover:border-primary/50 hover:bg-primary/5 text-foreground' 
                : 'bg-white text-black hover:bg-white/90 border-transparent shadow-lg shadow-white/10'
            }`}>
              <User className="w-3.5 h-3.5 mr-2" />
              Masuk
            </Button>
          </Link>

          {/* Mobile Menu Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={`h-9 w-9 lg:hidden rounded-lg ${isScrolled ? 'hover:bg-primary/5 text-foreground' : 'hover:bg-white/10 text-white'}`}>
                <Menu className="w-5 h-5"/>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full border-l border-black/5">
              <SheetHeader className="text-left mb-8 flex flex-row items-center justify-between">
                <SheetTitle className="font-headline font-bold text-xl tracking-tighter flex items-center gap-2">
                  <Logo className="w-8 h-8" />
                  STSPoint
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">Navigasi</p>
                  <div className="grid gap-1">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.title}>
                        <Link href={link.href}>
                          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 text-sm font-medium transition-colors group">
                            <link.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                            {link.title}
                          </div>
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                </div>
                
                <div className="pt-6 border-t border-black/5">
                  <Link href="/signin">
                    <Button className="w-full bg-primary hover:bg-primary/90 h-11 font-bold rounded-xl shadow-lg shadow-primary/20 text-white">
                      Masuk Akun
                    </Button>
                  </Link>
                  <p className="text-[10px] text-center text-muted-foreground mt-4">© 2024 STSPoint. All rights reserved.</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
