
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/logo";
import { Mail, Lock, ArrowRight, AlertCircle, ChevronLeft, UserCircle, Building2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

export default function SignInPage() {
  const auth = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"merchant" | "partner">("merchant");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // 1. Sync session cookie to root domain (for production subdomains)
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      });

      // 2. Determine redirect destination
      const isProd = !window.location.hostname.includes("localhost") && !window.location.hostname.includes("firebaseapp.com");
      
      if (isProd) {
        // Redirect to absolute subdomain URL in production
        const targetHost = role === "merchant" ? "console.stspoint.id" : "partner.stspoint.id";
        window.location.href = `https://${targetHost}/console`;
      } else {
        // Local/Workspace redirect
        router.push(role === "merchant" ? "/console" : "/client");
      }

      toast({ title: "Welcome back!", description: `Logged in as ${role === 'merchant' ? 'Merchant' : 'Partner'}.` });
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 blur-[120px] -translate-y-1/2 opacity-50"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 blur-[120px] translate-y-1/2 opacity-50"></div>

      <Link href="/" className="absolute top-8 left-8">
        <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </Link>

      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-8 space-y-2">
          <Logo className="w-12 h-12 mb-2" />
          <h1 className="text-2xl font-headline font-bold tracking-tighter">STSPoint</h1>
          <p className="text-muted-foreground text-sm">Unified Access Gateway</p>
        </div>

        <Card className="border-border shadow-2xl rounded-[2rem] overflow-hidden bg-card/50 backdrop-blur-xl">
          <CardHeader className="space-y-4 pt-8 px-8">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">Authentication</CardTitle>
              <CardDescription>Select your portal and sign in.</CardDescription>
            </div>
            
            <Tabs value={role} onValueChange={(v: any) => setRole(v)} className="w-full">
              <TabsList className="grid grid-cols-2 h-12 p-1 bg-muted/50 rounded-xl">
                <TabsTrigger value="merchant" className="rounded-lg gap-2 text-xs font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Building2 className="w-3.5 h-3.5" />
                  Merchant
                </TabsTrigger>
                <TabsTrigger value="partner" className="rounded-lg gap-2 text-xs font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <UserCircle className="w-3.5 h-3.5" />
                  Partner
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent className="px-8 space-y-6">
            {error && (
              <Alert variant="destructive" className="rounded-xl border-destructive/20 bg-destructive/5 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@company.com" 
                    required 
                    className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Password</Label>
                  <Link href="#" className="text-[10px] font-bold text-primary hover:underline">Forgot?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    required 
                    className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/10 transition-all active:scale-95" disabled={loading}>
                {loading ? "Processing..." : `Sign In as ${role === 'merchant' ? 'Merchant' : 'Partner'}`}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>
          <CardFooter className="px-8 pb-8 pt-4 justify-center">
            <p className="text-xs text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary font-bold hover:underline">Sign up</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
