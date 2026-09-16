
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { Mail, Lock, ArrowRight, AlertCircle, ChevronLeft, UserCircle, Building2, Loader2, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

export default function SignInPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { user, loading: authLoading } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"merchant" | "partner">("merchant");
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile, loading: profileLoading } = useDoc(profileRef);

  useEffect(() => {
    if (!authLoading && user && !profileLoading && profile) {
      const isPartner = !!profile.partner;
      const targetPath = isPartner ? "/client" : "/console";
      const targetSub = isPartner ? 'partner' : 'console';

      const hostname = window.location.hostname;
      const isDev =
        hostname.includes("localhost") ||
        hostname.includes("127.0.0.1") ||
        hostname.includes("cloudworkstations.dev") ||
        hostname.includes("firebaseapp.com");

      if (!isDev) {
        if (!hostname.startsWith(targetSub + ".")) {
          window.location.href = `https://${targetSub}.stspoint.id/`;
          return;
        }
      }

      router.push(targetPath);
    }
  }, [user, authLoading, profile, profileLoading, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname.startsWith("partner.")) {
        setRole("partner");
      } else {
        setRole("merchant");
      }
    }
  }, []);

  const handleRoleSwitch = (newRole: string) => {
    const targetRole = newRole as "merchant" | "partner";
    setRole(targetRole);

    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const isDev =
        hostname.includes("localhost") ||
        hostname.includes("cloudworkstations.dev") ||
        hostname.includes("firebaseapp.com");

      if (!isDev) {
        const targetSubdomain = targetRole === "merchant" ? "console" : "partner";
        if (!hostname.startsWith(targetSubdomain + ".")) {
          window.location.href = `https://${targetSubdomain}.stspoint.id/signin`;
        }
      }
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setSigningIn(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      try {
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: idToken }),
        });
      } catch (sessionErr) {
        console.warn("Session sync warning:", sessionErr);
      }

      toast({ title: "Welcome back!", description: "Successfully authenticated." });
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found'
        ? "Invalid email or password."
        : "An error occurred during sign in.");
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Subtle Ambient Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none"></div>

      <Link href="/" className="absolute top-8 left-8 z-20">
        <Button variant="ghost" size="sm" className="gap-2 rounded-xl hover:bg-muted/80">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
      </Link>

      <Link href="/" className="absolute top-8 right-8 z-20 hover:scale-105 transition-transform duration-200">
        <Logo className="w-10 h-10" />
      </Link>

      <div className="w-full max-w-md z-10 flex flex-col space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <h1 className="text-3xl font-headline font-bold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="text-muted-foreground text-sm max-w-xs">
            Sign in to access your portal and manage your account
          </p>
        </div>

          {/* Role Switcher Toggle (Smooth Sliding Indicator) */}
          <div className="relative grid grid-cols-2 h-11 w-full rounded-xl border border-border bg-muted/30 p-1 select-none overflow-hidden">
            {/* Smooth Sliding Active Pill */}
            <div
              className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-primary rounded-lg transition-transform duration-300 ease-in-out ${
                role === "merchant" ? "translate-x-0" : "translate-x-full"
              }`}
            />

            <button
              type="button"
              onClick={() => handleRoleSwitch("merchant")}
              className={`relative z-10 h-full flex items-center justify-center gap-2 text-xs font-bold transition-colors duration-300 ${
                role === "merchant"
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="w-4 h-4" />
              Merchant
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch("partner")}
              className={`relative z-10 h-full flex items-center justify-center gap-2 text-xs font-bold transition-colors duration-300 ${
                role === "partner"
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserCircle className="w-4 h-4" />
              Partner
            </button>
          </div>

          {error && (
            <Alert variant="destructive" className="rounded-xl border-destructive/30 bg-destructive/10 text-destructive font-medium">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs font-semibold">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSignIn} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-foreground ml-1">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  className="pl-10 h-12 rounded-xl bg-background border border-border text-foreground font-medium placeholder:text-muted-foreground/60 transition-all shadow-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-xs font-bold text-foreground">
                  Password
                </Label>
                <Link href="#" className="text-xs font-bold text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="pl-10 pr-10 h-12 rounded-xl bg-background border border-border text-foreground font-medium placeholder:text-muted-foreground/60 transition-all shadow-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl font-bold transition-all active:scale-[0.99] gap-2 text-sm bg-primary text-primary-foreground shadow-none"
              disabled={signingIn}
            >
              {signingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {signingIn ? "Authenticating..." : `Sign In as ${role === 'merchant' ? 'Merchant' : 'Partner'}`}
              {!signingIn && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          <div className="pt-2 text-center">
            <p className="text-xs font-medium text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary font-bold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
      </div>
    </div>
  );
}
