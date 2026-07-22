"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Lock } from "lucide-react";

/**
 * DevToolsGuard
 * Detects and blocks Developer Tools access by showing a "Denied" dialog.
 */
export function DevToolsGuard() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 1. Listen for common DevTools shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      
      // F12 key
      if (e.key === 'F12') {
        e.preventDefault();
        setIsOpen(true);
      }

      // Ctrl + Shift + I/J/C (Windows/Linux) or Cmd + Opt + I/J (Mac)
      const ctrlOrMeta = isMac ? e.metaKey : e.ctrlKey;
      const shiftOrAlt = isMac ? e.altKey : e.shiftKey;

      if (ctrlOrMeta && shiftOrAlt && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
        e.preventDefault();
        setIsOpen(true);
      }

      // Ctrl + U (View Source)
      if (ctrlOrMeta && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    // 2. Listen for Right Click (Inspect)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setIsOpen(true);
    };

    // 3. Simple detection via viewport size changes (Optional, sometimes annoying)
    // We skip this for better UX, focusing on explicit manual triggers.

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="rounded-[2.5rem] border-border max-w-sm text-center p-8 gap-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 blur-3xl -mr-16 -mt-16"></div>
        
        <DialogHeader className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center relative">
            <div className="absolute inset-0 bg-destructive/10 animate-ping rounded-3xl opacity-20"></div>
            <ShieldAlert className="w-10 h-10 relative z-10" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="font-headline font-bold text-2xl tracking-tight">Access Denied</DialogTitle>
            <DialogDescription className="text-xs font-medium text-muted-foreground leading-relaxed">
              Developer tools access is strictly restricted on STSPoint infrastructure to protect system integrity and security.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          <Button 
            onClick={() => setIsOpen(false)} 
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10 transition-all active:scale-95"
          >
            I Understand
          </Button>
          <div className="flex items-center justify-center gap-1.5 opacity-30">
            <Lock className="w-3 h-3" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Secure Environment</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
