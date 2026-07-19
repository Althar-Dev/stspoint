"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { Icon } from "@iconify/react";

export function Footer() {
  const socials = [
    { icon: "mdi:instagram", href: "https://instagram.com/starvale.id", key: 'instagram' },
    { icon: "mdi:whatsapp", href: "https://whatsapp.com/channel/0029VbAXqb3Chq6Gh1c3fd42", key: 'whatsapp' },
    { icon: "mdi:linkedin", href: "https://www.linkedin.com/in/starvaleid", key: 'linkedin' },
    { icon: "mdi:twitter", href: "https://x.com/StarValeID", key: 'twitter' },
  ];

  return (
    <footer className="bg-secondary/30 w-full py-16 px-6 md:px-12 lg:px-20 border-t border-black/5">
      <div className="w-full max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Logo className="w-10 h-10" />
              <span className="font-headline font-bold text-2xl tracking-tighter">Point</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-sm">
              Integrated digital gateway infrastructure platform for modern business. We provide API solutions, payments, and cloud services in one place.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/docs" className="hover:text-primary transition-colors">API Documentation</Link></li>
              <li><Link href="/console" className="hover:text-primary transition-colors">H2H Dashboard</Link></li>
              <li><Link href="/support" className="hover:text-primary transition-colors">Help Center</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-black/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-[10px] md:text-xs">© 2026 STSPoint. Infrastructure as a Service.</p>
          <div className="flex gap-4">
            {socials.map((social) => (
              <a 
                key={social.key} 
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center hover:bg-primary/10 cursor-pointer transition-colors text-muted-foreground hover:text-primary"
              >
                <Icon icon={social.icon} className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}