"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  createUserWithEmailAndPassword, 
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useAuth, useFirestore } from "@/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
import { Logo } from "@/components/logo";
import { Mail, Lock, User, ArrowRight, AlertCircle, ChevronLeft, ShieldCheck, HelpCircle, Key } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SignUpPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("merchant");
  const [licenseKey, setLicenseKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generateMerchantId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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

    setLoading(true);
    setError("");
    
    try {
      // 1. If Client, validate license key first
      if (role === 'client') {
        if (!licenseKey) {
          throw new Error("License Key is required for Client registration.");
        }
        const keyRef = doc(db, 'license_keys', licenseKey);
        const keySnap = await getDoc(keyRef);

        if (!keySnap.exists()) {
          throw new Error("Invalid License Key. Please contact support.");
        }

        if (keySnap.data().status === 'used') {
          throw new Error("This License Key has already been used.");
        }
      }

      // 2. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: name });
      
      const merchantId = generateMerchantId();
      const secretKey = generateSecretKey();
      
      // 3. Save Main User Data
      const userRef = doc(db, 'users', user.uid);
      const userData = {
        uid: user.uid,
        name,
        email,
        role,
        clientKey: role === 'client' ? licenseKey : "",
        merchantId: role === 'merchant' ? merchantId : "",
        secretKey: secretKey,
        balance: 0,
        createdAt: serverTimestamp(),
      };

      await setDoc(userRef, userData);

      // 4. Save Provider Data to Sub-Collection (Excluding DigiFlazz)
      const providers = ['orderkuota', 'gomerchant'];
      for (const providerId of providers) {
        const providerRef = doc(db, 'users', user.uid, 'services', providerId);
        await setDoc(providerRef, {
          id: "",
          username: "",
          token: "",
          refreshToken: "",
          baseQr: "",
          balance: 0,
          quota: 0,
          autoWithdrawEnabled: false,
          minWithdrawAmount: 1000,
          withdrawInterval: 5,
          updatedAt: serverTimestamp()
        });
      }

      // 5. Initialize AI Config
      const aiConfigRef = doc(db, 'users', user.uid, 'ai', 'config');
      await setDoc(aiConfigRef, {
        id: "config",
        plan: "Pro",
        usage: 0,
        limit: 100,
        updatedAt: serverTimestamp()
      });

      // 6. If Client, consume the license key
      if (role === 'client') {
        const keyRef = doc(db, 'license_keys', licenseKey);
        await updateDoc(keyRef, {
          status: 'used',
          usedBy: user.uid,
          updatedAt: serverTimestamp()
        }).catch(err => console.error("Failed to update license key status:", err));
      }
      
      router.push("/console");
      
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 blur-[120px] -translate-y-1/2 opacity-50 z-0"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 blur-[120px] translate-y-1/2 opacity-50 z-0"></div>

      <Link href="/" className="absolute top-8 left-8 z-20">
        <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </Link>

      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-8 space-y-2">
          <Logo className="w-12 h-12 mb-2" />
          <h1 className="text-2xl font-headline font-bold tracking-tighter text-center">Join STSPoint</h1>
          <p className="text-muted-foreground text-sm text-center px-4">Build your digital infrastructure today.</p>
        </div>

        <Card className="border-border shadow-2xl rounded-[2rem] overflow-hidden bg-card/50 backdrop-blur-xl relative z-10">
          <CardHeader className="space-y-1 pt-8 px-8">
            <CardTitle className="text-xl font-bold">Sign Up</CardTitle>
            <CardDescription>Create a new account to get started.</CardDescription>
          </CardHeader>
          <CardContent className="px-8 space-y-6">
            {error && (
              <Alert variant="destructive" className="rounded-xl border-destructive/20 bg-destructive/5 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="name" 
                    type="text" 
                    placeholder="John Doe" 
                    required 
                    className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="role" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Account Type</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" className="inline-flex items-center justify-center rounded-full hover:bg-muted p-0.5 transition-colors focus:outline-none focus:ring-1 focus:ring-primary/20">
                          <HelpCircle className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors cursor-help" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent 
                        side="top" 
                        align="center"
                        className="max-w-[280px] p-4 rounded-2xl bg-popover border-border shadow-2xl z-[100]"
                        sideOffset={10}
                      >
                        <div className="space-y-3">
                          <div>
                            <p className="text-[11px] font-bold text-primary uppercase tracking-tight mb-1">Client</p>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                              For specialized partners who purchased a website source. A valid License Key is required for registration.
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
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <SelectValue placeholder="Select type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border z-[100]">
                    <SelectItem value="client" className="rounded-lg">Client (Business Integration)</SelectItem>
                    <SelectItem value="merchant" className="rounded-lg">Merchant (Console Access)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {role === 'client' && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="licenseKey" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">License Key</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="licenseKey" 
                      type="text" 
                      placeholder="STS-Client_XXXXXXXX" 
                      required 
                      className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all"
                      value={licenseKey}
                      onChange={(e) => setLicenseKey(e.target.value)}
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground ml-1">Enter the 1x use license key provided by your developer.</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
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
                <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••"
                    required 
                    minLength={6}
                    className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/10 transition-all active:scale-95" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>
          <CardFooter className="px-8 pb-8 pt-4 justify-center">
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href="/signin" className="text-primary font-bold hover:underline">Sign In</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
