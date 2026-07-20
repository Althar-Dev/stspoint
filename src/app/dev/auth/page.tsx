"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { Terminal, ShieldAlert, Lock, Mail, ArrowRight, Loader2, ChevronLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

export default function DevSignInPage() {
  const auth = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDevSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      // Coba sinkronisasi sesi (hanya di produksi)
      const hostname = window.location.hostname;
      const isProduction = hostname.endsWith("stspoint.id") && !hostname.includes("localhost");

      if (isProduction) {
        try {
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: idToken }),
          });
        } catch (sessionErr) {
          console.error("Session sync failed, continuing anyway...");
        }
      }

      toast({ title: "Login Berhasil", description: "Mengalihkan ke Root Console..." });
      
      // Berikan jeda kecil agar Firestore listener di layout bisa menangkap state
      setTimeout(() => {
        router.push("/dev");
      }, 500);

    } catch (err: any) {
      console.error("Login error:", err);
      toast({ 
        variant: "destructive", 
        title: "Login Gagal", 
        description: err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' 
          ? "Email atau password salah." 
          : "Terjadi kesalahan saat autentikasi." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full"></div>
      </div>

      <Link href="/" className="absolute top-8 left-8 z-20">
        <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white hover:bg-white/5 gap-2 rounded-xl">
          <ChevronLeft className="w-4 h-4" />
          Home
        </Button>
      </Link>

      <div className="w-full max-w-md z-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 rounded-3xl bg-zinc-900 border border-white/5 shadow-2xl">
            <Logo className="w-16 h-16 grayscale brightness-200" />
          </div>
          <div className="text-center space-y-1">
             <h1 className="text-white text-2xl font-headline font-bold tracking-tighter flex items-center gap-2 justify-center">
               <Terminal className="w-5 h-5 text-primary" />
               DEV_ROOT_AUTH
             </h1>
             <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em]">Secure Infrastructure Access</p>
          </div>
        </div>

        <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-black overflow-hidden">
          <CardHeader className="pt-10 px-10 pb-6 text-center border-b border-white/5 bg-zinc-900/30">
            <CardTitle className="text-white text-lg font-bold">Privileged Access</CardTitle>
            <CardDescription className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Authorized Personnel Only</CardDescription>
          </CardHeader>
          <CardContent className="p-10 space-y-6">
            <form onSubmit={handleDevSignIn} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Root Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
                  <Input 
                    type="email" 
                    placeholder="admin@stspoint.id"
                    required
                    className="h-14 pl-12 bg-black border-white/5 text-white rounded-2xl focus:ring-primary/20 focus:border-primary/30 transition-all font-mono text-xs"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Access Phrase</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
                  <Input 
                    type="password" 
                    placeholder="••••••••••••"
                    required
                    className="h-14 pl-12 bg-black border-white/5 text-white rounded-2xl focus:ring-primary/20 focus:border-primary/30 transition-all font-mono text-xs"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-14 bg-white text-black hover:bg-zinc-200 font-black rounded-2xl uppercase tracking-widest text-xs transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-white/5"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Verify Identity
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="pb-8 pt-0 justify-center">
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
              Don't have an account? <Link href="/signup" className="text-white hover:underline ml-1">Sign Up</Link>
            </p>
          </CardFooter>
        </Card>

        <div className="flex items-start gap-4 p-6 rounded-2xl border border-white/5 bg-zinc-900/30">
          <ShieldAlert className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
            WARNING: Unauthorized access attempts are monitored and logged. Ensure you have 'dev' permissions assigned to your UID in Firestore.
          </p>
        </div>
      </div>

      <div className="absolute bottom-8 text-center w-full opacity-20">
         <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.5em]">STS_ROOT_SYSTEM_V2.1.0</p>
      </div>
    </div>
  );
}