"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useAuth, useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/logo";
import { Mail, Lock, User, ArrowRight, AlertCircle, ChevronLeft, ShieldCheck, HelpCircle, Key, Loader2, Building2, UserCircle, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

export default function SignUpPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { user: existingUser, loading: authLoading } = useUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("merchant");
  const [licenseKey, setLicenseKey] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const profileRef = useMemoFirebase(() => {
    if (!db || !existingUser?.uid) return null;
    return doc(db, "users", existingUser.uid);
  }, [db, existingUser?.uid]);

  const { data: profile, loading: profileLoading } = useDoc(profileRef);

  useEffect(() => {
    if (!authLoading && existingUser && !profileLoading && profile) {
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
  }, [existingUser, authLoading, profile, profileLoading, router]);

  const generateMerchantId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `STS-${result}`;
  };

  const generateSecretKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `STS-Key-${result}`;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) {
      setError("System authentication or database not available.");
      return;
    }

    if (!agreed) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (role === 'partner') {
        const cleanKey = licenseKey.trim();
        if (!cleanKey) {
          throw new Error("Client Key wajib diisi untuk pendaftaran Partner.");
        }

        const keyRef = doc(db, 'Client_Keys', cleanKey);
        const keySnap = await getDoc(keyRef);

        if (!keySnap.exists()) {
          throw new Error("Kunci Lisensi tidak valid. Silakan hubungi pengembang.");
        }

        if (keySnap.data().status === 'used') {
          throw new Error("Kunci Lisensi ini sudah pernah digunakan.");
        }
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      await updateProfile(user, { displayName: name });

      try {
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: idToken }),
        });
      } catch (sessionErr) {
        console.warn("Session sync warning:", sessionErr);
      }

      const merchantId = generateMerchantId();
      const secretKey = generateSecretKey();

      const userRef = doc(db, 'users', user.uid);
      const userData: any = {
        uid: user.uid,
        name,
        email,
        clientKey: role === 'partner' ? licenseKey.trim() : "",
        merchantId: role === 'merchant' ? merchantId : "",
        secretKey: secretKey,
        balance: 0,
        createdAt: serverTimestamp(),
      };

      if (role === 'partner') {
        userData.partner = true;
      } else {
        userData.role = 'merchant';
      }

      await setDoc(userRef, userData);

      // Inisialisasi Layanan dengan Kuota 0 (Wajib beli plan)
      const providers = ['orderkuota', 'gomerchant', 'stspay', 'shopeepay', 'ovo'];
      for (const providerId of providers) {
        const providerRef = doc(db, 'users', user.uid, 'services', providerId);
        await setDoc(providerRef, {
          id: "",
          username: (['stspay', 'shopeepay', 'ovo'].includes(providerId)) ? email : "",
          token: "",
          refreshToken: "",
          baseQr: "",
          balance: 0,
          quota: 0, // Reset ke 0 agar user harus upgrade plan
          autoWithdrawEnabled: false,
          minWithdrawAmount: 1000,
          withdrawInterval: 5,
          updatedAt: serverTimestamp()
        });
      }

      const aiConfigRef = doc(db, 'users', user.uid, 'ai', 'config');
      await setDoc(aiConfigRef, {
        id: "config",
        plan: "Pro",
        usage: 0,
        limit: 100,
        updatedAt: serverTimestamp()
      });

      if (role === 'partner') {
        const keyRef = doc(db, 'Client_Keys', licenseKey.trim());
        await updateDoc(keyRef, {
          status: 'used',
          usedBy: user.uid,
          updatedAt: serverTimestamp()
        });
      }

      toast({ title: "Account Created!", description: "Redirecting to your dashboard..." });
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 relative overflow-y-auto py-8">
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

      <div className="w-full max-w-md z-10 flex flex-col space-y-8 my-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <h1 className="text-3xl font-headline font-bold tracking-tight text-foreground">
            Create an account
          </h1>
          <p className="text-muted-foreground text-sm font-medium max-w-xs">
            Start building your digital infrastructure today
          </p>
        </div>

        {/* Form Container (No Card) */}
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive" className="rounded-xl border-destructive/30 bg-destructive/10 text-destructive font-medium">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs font-semibold">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold text-foreground ml-1">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  className="pl-10 h-12 rounded-xl bg-background border border-border text-foreground font-medium placeholder:text-muted-foreground/60 transition-all shadow-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="role" className="text-xs font-bold text-foreground">
                    Account Type
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button type="button" className="inline-flex items-center justify-center rounded-full hover:bg-muted p-0.5 transition-colors focus:outline-none focus:ring-1 focus:ring-primary/20">
                        <HelpCircle className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors cursor-help" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      side="top"
                      align="center"
                      className="max-w-[280px] p-4 rounded-2xl bg-popover border border-border shadow-2xl z-[100]"
                      sideOffset={10}
                    >
                      <div className="space-y-3">
                        <div>
                          <p className="text-[11px] font-bold text-primary uppercase tracking-tight mb-1">Partner</p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">
                            For specialized partners who purchased a website source. A valid Client Key is required for registration.
                          </p>
                        </div>
                        <div className="pt-2 border-t border-border">
                          <p className="text-[11px] font-bold text-primary uppercase tracking-tight mb-1">Merchant</p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">
                            Designed for developers who want to access APIs, manage Secret Keys, and build integrations.
                          </p>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              {/* Smooth Sliding Role Toggle */}
              <div className="relative grid grid-cols-2 h-11 w-full rounded-xl border border-border bg-muted/30 p-1 select-none overflow-hidden">
                <div
                  className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-primary rounded-lg transition-transform duration-300 ease-in-out ${
                    role === "merchant" ? "translate-x-0" : "translate-x-full"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setRole("merchant")}
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
                  onClick={() => setRole("partner")}
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
            </div>

            {role === 'partner' && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <Label htmlFor="licenseKey" className="text-xs font-bold text-foreground ml-1">
                  Client Key
                </Label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70" />
                  <Input
                    id="licenseKey"
                    type="text"
                    placeholder="STS-Client_XXXXXXXX"
                    required
                    className="pl-10 h-12 rounded-xl bg-background border border-border text-foreground font-medium placeholder:text-muted-foreground/60 transition-all shadow-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                  />
                </div>
                <p className="text-[11px] font-medium text-muted-foreground ml-1">Enter the 1x use Client Key provided by your developer.</p>
              </div>
            )}

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
              <Label htmlFor="password" className="text-xs font-bold text-foreground ml-1">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  minLength={6}
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

            <div className="flex items-start space-x-2 px-1 pt-2">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                className="mt-0.5 rounded-md border-2 border-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-xs font-medium leading-relaxed text-foreground/80 cursor-pointer"
                >
                  I agree to the <Link href="/terms-of-service" className="text-primary font-bold hover:underline">Terms of Service</Link> and <Link href="/privacy-policy" className="text-primary font-bold hover:underline">Privacy Policy</Link>.
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl font-bold transition-all active:scale-[0.99] gap-2 text-sm mt-2 bg-primary text-primary-foreground shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !agreed}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Creating Account..." : "Create Account"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          <div className="pt-2 text-center">
            <p className="text-xs font-medium text-muted-foreground">
              Already have an account?{" "}
              <Link href="/signin" className="text-primary font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
