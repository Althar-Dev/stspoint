"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChevronLeft,
    User,
    Mail,
    Calendar,
    Key,
    Shield,
    Wallet,
    CreditCard,
    Landmark,
    CheckCircle2,
    Clock,
    XCircle,
    Building2,
    RefreshCcw,
    Edit3,
    ArrowUpRight,
    Loader2,
    Copy,
    Check,
    Coins,
    History,
    Activity,
    Crown,
    Sparkles,
    Zap,
    Globe,
    Smartphone,
    Package
} from "lucide-react";
import { format } from "date-fns";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, where, updateDoc, serverTimestamp, setDoc, increment } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const db = useFirestore();
    const userId = params.id as string;

    // Balance Adjust State
    const [isAdjustBalanceOpen, setIsAdjustBalanceOpen] = useState(false);
    const [balanceType, setBalanceType] = useState<"main" | "stspay">("main");
    const [adjustAmount, setAdjustAmount] = useState("");
    const [adjustMode, setAdjustMode] = useState<"add" | "set">("add");
    
    // Grant Plan State
    const [isGrantPlanOpen, setIsGrantPlanOpen] = useState(false);
    const [grantServiceId, setGrantServiceId] = useState<string>("gomerchant");
    const [grantPlanId, setGrantPlanId] = useState<string>("pro");
    const [grantDurationDays, setGrantDurationDays] = useState<string>("30");
    const [customQuotaInput, setCustomQuotaInput] = useState<string>("50000");
    const [customDurationInput, setCustomDurationInput] = useState<string>("30");

    const [isUpdating, setIsUpdating] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // References
    const userRef = useMemoFirebase(() => {
        if (!db || !userId) return null;
        return doc(db, "users", userId);
    }, [db, userId]);

    const stspaySvcRef = useMemoFirebase(() => {
        if (!db || !userId) return null;
        return doc(db, "users", userId, "services", "stspay");
    }, [db, userId]);

    const servicesCollectionRef = useMemoFirebase(() => {
        if (!db || !userId) return null;
        return collection(db, "users", userId, "services");
    }, [db, userId]);

    const userTxsQuery = useMemoFirebase(() => {
        if (!db || !userId) return null;
        return query(collection(db, "transactions"), where("userId", "==", userId));
    }, [db, userId]);

    const stspayTxsQuery = useMemoFirebase(() => {
        if (!db || !userId) return null;
        return query(collection(db, "stspay_transactions"), where("userId", "==", userId));
    }, [db, userId]);

    // Firestore Hooks
    const { data: userProfile, loading: userLoading } = useDoc(userRef);
    const { data: stspaySvc, loading: stspayLoading } = useDoc(stspaySvcRef);
    const { data: userServices, loading: servicesLoading } = useCollection(servicesCollectionRef);
    const { data: rawTxs, loading: txsLoading } = useCollection(userTxsQuery);
    const { data: rawStsTxs, loading: stsTxsLoading } = useCollection(stspayTxsQuery);

    // Combine transactions
    const allUserTxs = useMemo(() => {
        const combined = [...rawTxs, ...rawStsTxs];
        const uniqueMap = new Map();
        combined.forEach(t => {
            if (!uniqueMap.has(t.id)) {
                uniqueMap.set(t.id, t);
            }
        });
        return Array.from(uniqueMap.values()).sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return dateB.getTime() - dateA.getTime();
        });
    }, [rawTxs, rawStsTxs]);

    // Filter Subscription Transactions
    const subscriptionTxs = useMemo(() => {
        return allUserTxs.filter(t => {
            const type = String(t.type || "").toLowerCase();
            const item = String(t.itemName || t.description || "").toLowerCase();
            const hasSubMetadata = t.metadata?.serviceId || t.metadata?.planId;
            return type === "subscription" || item.includes("pro") || item.includes("premium") || item.includes("sub") || item.includes("subscribe") || hasSubMetadata;
        });
    }, [allUserTxs]);

    // Active Service Subscriptions
    const servicesList = useMemo(() => {
        const knownServices = [
            { id: "gomerchant", name: "GoMerchant", type: "GoPay / QRIS", icon: Globe, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { id: "shopeepay", name: "ShopeePay", type: "ShopeePay", icon: Smartphone, color: "text-[#EE4D2D]", bg: "bg-[#EE4D2D]/10" },
            { id: "ovo", name: "OVO", type: "OVO", icon: Zap, color: "text-purple-500", bg: "bg-purple-500/10" },
        ];

        return knownServices.map(ks => {
            const docData = userServices?.find(s => 
                s.id === ks.id || 
                s.docId === ks.id || 
                s.serviceId === ks.id || 
                (ks.id === "shopeepay" && s.id === "shopee")
            );
            const rawPlan = docData?.plan || docData?.planId || docData?.planName || "free";
            const planLower = String(rawPlan || "").toLowerCase();
            const hasPlan = planLower !== "free" && planLower !== "no plan" && planLower !== "";

            const isPlanActive = hasPlan || (docData?.status && String(docData.status).toLowerCase() === "active") || !!docData?.token;
            const status = isPlanActive ? "Active" : "Inactive";
            const planName = hasPlan ? String(rawPlan).toUpperCase() : "NO PLAN";
            const quota = docData?.quota || 0;
            const expiry = docData?.planExpiry?.toDate ? docData.planExpiry.toDate() : (docData?.expiresAt?.toDate ? docData.expiresAt.toDate() : null);
            const isLifetime = !!docData?.isLifetime || docData?.grantDurationDays === "0" || (expiry && expiry.getFullYear() > 2090);

            return {
                ...ks,
                docData,
                isConnected: isPlanActive,
                status,
                plan: planName,
                quota,
                expiry,
                isLifetime,
                updatedAt: docData?.updatedAt
            };
        });
    }, [userServices]);

    const mainBalance = userProfile?.balance || 0;
    const stspayBalance = stspaySvc?.balance ?? userProfile?.stspayBalance ?? 0;

    const copyToClipboard = (text: string, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(label);
        toast({ title: "Copied!", description: `${label} copied to clipboard.` });
        setTimeout(() => setCopiedField(null), 2000);
    };

    const toggleDevStatus = async () => {
        if (!db || !userId || !userProfile) return;
        setIsUpdating(true);
        const current = !!userProfile.dev;
        try {
            await updateDoc(doc(db, "users", userId), {
                dev: !current,
                updatedAt: serverTimestamp()
            });
            toast({ title: "DevRoot Updated", description: `DevRoot access ${!current ? 'granted' : 'revoked'}.` });
        } catch (e: any) {
            toast({ variant: "destructive", title: "Update Failed", description: e.message });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleConfirmBank = async () => {
        if (!db || !userId) return;
        setIsUpdating(true);
        try {
            await updateDoc(doc(db, "users", userId), {
                payoutAccountStatus: "VERIFIED",
                updatedAt: serverTimestamp()
            });
            toast({ title: "Bank Verified", description: "Rekening bank berhasil diverifikasi." });
        } catch (e: any) {
            toast({ variant: "destructive", title: "Verification Failed", description: e.message });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSaveBalanceAdjustment = async () => {
        if (!db || !userId) return;
        const val = parseInt(adjustAmount);
        if (isNaN(val)) {
            toast({ variant: "destructive", title: "Invalid Nominal", description: "Masukkan angka yang valid." });
            return;
        }

        setIsUpdating(true);
        try {
            if (balanceType === "main") {
                const newBal = adjustMode === "set" ? val : mainBalance + val;
                await updateDoc(doc(db, "users", userId), {
                    balance: newBal,
                    updatedAt: serverTimestamp()
                });
            } else {
                const newBal = adjustMode === "set" ? val : stspayBalance + val;
                if (stspaySvcRef) {
                    await updateDoc(stspaySvcRef, {
                        balance: newBal,
                        updatedAt: serverTimestamp()
                    });
                }
                await updateDoc(doc(db, "users", userId), {
                    stspayBalance: newBal,
                    updatedAt: serverTimestamp()
                });
            }

            toast({ title: "Balance Updated", description: `Saldo ${balanceType === 'main' ? 'Utama' : 'STSPay'} berhasil diperbarui.` });
            setIsAdjustBalanceOpen(false);
            setAdjustAmount("");
        } catch (e: any) {
            toast({ variant: "destructive", title: "Update Failed", description: e.message });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleGrantPlan = async () => {
        if (!db || !userId) return;
        setIsUpdating(true);

        const PLAN_CONFIG: Record<string, { name: string; defaultQuota: number }> = {
            pro: { name: "Pro", defaultQuota: 5000 },
            premium: { name: "Premium", defaultQuota: 15000 },
            enterprise: { name: "Enterprise", defaultQuota: 50000 },
            free: { name: "Free", defaultQuota: 0 }
        };

        const serviceLabels: Record<string, string> = {
            gomerchant: "GoMerchant",
            shopeepay: "ShopeePay",
            ovo: "OVO"
        };

        const sName = serviceLabels[grantServiceId] || grantServiceId;
        const planInfo = PLAN_CONFIG[grantPlanId] || { name: grantPlanId, defaultQuota: 0 };
        const fullPlanName = `${sName} ${planInfo.name}`;

        try {
            const targetSvcRef = doc(db, "users", userId, "services", grantServiceId);

            // Determine Quota
            let finalQuota = planInfo.defaultQuota;
            if (grantPlanId === "enterprise") {
                const parsedQuota = parseInt(customQuotaInput);
                finalQuota = !isNaN(parsedQuota) ? parsedQuota : 50000;
            } else if (grantPlanId === "free") {
                finalQuota = 0;
            }

            // Determine Expiry & Duration
            const isLifetime = grantDurationDays === "0";
            const isCustomDuration = grantDurationDays === "custom";

            let planExpiryDate: Date | null = null;
            if (isLifetime) {
                // Set to 100 years in future (2126) for lifetime so API checks never fail
                planExpiryDate = new Date();
                planExpiryDate.setFullYear(planExpiryDate.getFullYear() + 100);
            } else if (isCustomDuration) {
                const days = parseInt(customDurationInput);
                if (!isNaN(days) && days > 0) {
                    planExpiryDate = new Date();
                    planExpiryDate.setDate(planExpiryDate.getDate() + days);
                }
            } else {
                const days = parseInt(grantDurationDays);
                if (!isNaN(days) && days > 0) {
                    planExpiryDate = new Date();
                    planExpiryDate.setDate(planExpiryDate.getDate() + days);
                }
            }

            const isFreeOrReset = grantPlanId === "free";

            const updatePayload = {
                plan: grantPlanId,
                planId: grantPlanId,
                planName: fullPlanName,
                planExpiry: planExpiryDate,
                expiresAt: planExpiryDate,
                isLifetime: isLifetime,
                grantDurationDays: grantDurationDays,
                quota: isFreeOrReset ? 0 : finalQuota,
                status: isFreeOrReset ? "inactive" : "active",
                grantedByDev: true,
                grantedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await setDoc(targetSvcRef, updatePayload, { merge: true });

            // Record transaction audit log
            const trxId = `SUB-DEV-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            const subTxData = {
                id: trxId,
                userId: userId,
                amount: 0,
                priceAmount: 0,
                status: "PAID",
                type: "subscription",
                itemName: `${fullPlanName} (Admin Grant)`,
                metadata: {
                    serviceId: grantServiceId,
                    planId: grantPlanId,
                    quota: finalQuota,
                    isLifetime: isLifetime,
                    grantedByAdmin: true
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await setDoc(doc(db, "stspay_transactions", trxId), subTxData);

            toast({
                title: "Plan Activated!",
                description: `Paket ${fullPlanName} (${isLifetime ? 'Lifetime' : finalQuota > 0 ? finalQuota.toLocaleString('id-ID') + ' Quota' : 'Reset'}) telah aktif untuk ${userProfile?.name || 'user'}.`
            });
            setIsGrantPlanOpen(false);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Gagal Memberikan Plan", description: error.message });
        } finally {
            setIsUpdating(false);
        }
    };

    const isLoading = userLoading || stspayLoading;

    if (isLoading) {
        return (
            <div className="space-y-6 max-w-6xl mx-auto pb-10 animate-pulse">
                <Skeleton className="h-10 w-48 rounded-lg" />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Skeleton className="h-28 rounded-xl" />
                    <Skeleton className="h-28 rounded-xl" />
                    <Skeleton className="h-28 rounded-xl" />
                    <Skeleton className="h-28 rounded-xl" />
                </div>
            </div>
        );
    }

    if (!userProfile && !isLoading) {
        return (
            <div className="py-24 text-center space-y-4">
                <p className="text-muted-foreground font-bold">User with ID "{userId}" not found.</p>
                <Button onClick={() => router.back()} variant="outline" className="rounded-xl">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Kembali
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12">
            {/* Header / Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="w-fit h-9 px-3 rounded-xl gap-2 font-bold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
                >
                    <ChevronLeft className="w-4 h-4" /> Kembali ke Registry
                </Button>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        size="sm"
                        onClick={() => {
                            setGrantServiceId("gomerchant");
                            setGrantPlanId("pro");
                            setIsGrantPlanOpen(true);
                        }}
                        className="rounded-xl h-9 px-4 text-xs font-bold gap-2 bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                    >
                        <Crown className="w-3.5 h-3.5" /> Beri Plan
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setBalanceType("main");
                            setAdjustAmount("");
                            setIsAdjustBalanceOpen(true);
                        }}
                        className="rounded-xl h-9 px-4 text-xs font-bold gap-2 bg-card border-border"
                    >
                        <Edit3 className="w-3.5 h-3.5 text-primary" /> Adjust Saldo
                    </Button>

                    <Button
                        size="sm"
                        variant={userProfile.dev ? "destructive" : "default"}
                        onClick={toggleDevStatus}
                        disabled={isUpdating}
                        className="rounded-xl h-9 px-4 text-xs font-bold gap-2"
                    >
                        <Shield className="w-3.5 h-3.5" />
                        {userProfile.dev ? "Revoke DevRoot" : "Grant DevRoot"}
                    </Button>
                </div>
            </div>

            {/* Profile Overview Card */}
            <Card className="border-border shadow-sm rounded-3xl bg-card overflow-hidden">
                <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start md:items-center gap-5">
                            <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-primary/20 rounded-2xl shrink-0 shadow-md">
                                <AvatarImage src={userProfile.photoURL} />
                                <AvatarFallback className="bg-primary/10 text-primary font-headline font-bold text-xl rounded-2xl">
                                    {userProfile.name?.[0]?.toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>

                            <div className="space-y-1.5 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-xl sm:text-2xl font-headline font-bold tracking-tight text-foreground">
                                        {userProfile.name || "Unnamed User"}
                                    </h1>
                                    {userProfile.dev && (
                                        <Badge className="bg-primary text-primary-foreground border-none text-[9px] uppercase px-2 h-5 font-bold">
                                            DevRoot
                                        </Badge>
                                    )}
                                    {userProfile.partner && (
                                        <Badge className="bg-blue-500 text-white border-none text-[9px] uppercase px-2 h-5 font-bold">
                                            Partner
                                        </Badge>
                                    )}
                                    <Badge variant="outline" className="border-border text-[9px] uppercase px-2 h-5 font-bold text-muted-foreground">
                                        {userProfile.role || "Merchant"}
                                    </Badge>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5 text-muted-foreground/60" />
                                        <span>{userProfile.email}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-muted-foreground/60" />
                                        <span>
                                            Joined {userProfile.createdAt ? format(userProfile.createdAt.toDate ? userProfile.createdAt.toDate() : new Date(userProfile.createdAt), "dd MMM yyyy, HH:mm") : "N/A"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Identifiers */}
                        <div className="flex flex-wrap md:flex-col gap-3 justify-end border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">User ID (UID)</p>
                                <div className="flex items-center gap-2">
                                    <code className="text-xs font-mono font-bold bg-muted/50 px-2 py-1 rounded-md">{userId}</code>
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(userId, "User ID")}>
                                        {copiedField === "User ID" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                    </Button>
                                </div>
                            </div>

                            {(userProfile.merchantId || userProfile.clientKey) && (
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Merchant ID / Key</p>
                                    <div className="flex items-center gap-2">
                                        <code className="text-xs font-mono font-bold bg-primary/10 text-primary px-2 py-1 rounded-md">
                                            {userProfile.merchantId || userProfile.clientKey}
                                        </code>
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(userProfile.merchantId || userProfile.clientKey, "Merchant ID")}>
                                            {copiedField === "Merchant ID" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-border shadow-sm rounded-2xl bg-card">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => { setBalanceType("main"); setIsAdjustBalanceOpen(true); }} className="h-6 text-[10px] font-bold uppercase text-emerald-600">
                                Edit
                            </Button>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Main Balance (PPOB)</p>
                        <h3 className="text-xl font-headline font-bold text-emerald-600">
                            Rp {mainBalance.toLocaleString('id-ID')}
                        </h3>
                    </CardContent>
                </Card>

                <Card className="border-border shadow-sm rounded-2xl bg-card">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <Coins className="w-5 h-5" />
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => { setBalanceType("stspay"); setIsAdjustBalanceOpen(true); }} className="h-6 text-[10px] font-bold uppercase text-primary">
                                Edit
                            </Button>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">STSPay Balance</p>
                        <h3 className="text-xl font-headline font-bold text-primary">
                            Rp {stspayBalance.toLocaleString('id-ID')}
                        </h3>
                    </CardContent>
                </Card>

                <Card className="border-border shadow-sm rounded-2xl bg-card">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                                <Crown className="w-5 h-5" />
                            </div>
                            <Badge className="bg-amber-500/10 text-amber-600 border-none text-[8px] font-bold uppercase px-2 py-0.5">
                                {subscriptionTxs.filter(t => t.status === 'PAID' || t.status === 'Success').length} Active
                            </Badge>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Subscribers Package</p>
                        <h3 className="text-xl font-headline font-bold text-foreground">
                            {subscriptionTxs.length} Subscriptions
                        </h3>
                    </CardContent>
                </Card>

                <Card className="border-border shadow-sm rounded-2xl bg-card">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                                <History className="w-5 h-5" />
                            </div>
                            <Badge variant="outline" className="text-[8px] font-bold uppercase px-1.5 py-0.5 border-border">Total</Badge>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Transactions</p>
                        <h3 className="text-xl font-headline font-bold text-foreground">
                            {allUserTxs.length} Records
                        </h3>
                    </CardContent>
                </Card>
            </div>

            {/* 👑 Active Services & Subscriptions Section */}
            <Card className="border-border shadow-sm rounded-3xl bg-card overflow-hidden">
                <CardHeader className="bg-muted/30 dark:bg-[#0A0A0A] px-6 py-4 border-b border-border flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-500" />
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Active Services & Subscriptions
                        </CardTitle>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => { setGrantServiceId("gomerchant"); setGrantPlanId("pro"); setIsGrantPlanOpen(true); }}
                        className="h-8 px-3 text-[10px] font-bold uppercase bg-amber-500 hover:bg-amber-600 text-white gap-1 rounded-xl"
                    >
                        <Crown className="w-3.5 h-3.5" /> Beri Plan
                    </Button>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {servicesList.map((svc) => (
                            <div key={svc.id} className="p-4 rounded-2xl border border-border bg-muted/20 flex flex-col justify-between space-y-3 hover:border-primary/20 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${svc.bg} ${svc.color}`}>
                                            <svc.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-foreground">{svc.name}</h4>
                                            <p className="text-[9px] uppercase font-bold text-muted-foreground">{svc.type}</p>
                                        </div>
                                    </div>
                                    <Badge className={`${svc.isConnected ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'} border-none font-bold text-[8px] uppercase px-2 py-0.5 rounded-sm`}>
                                        {svc.status}
                                    </Badge>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-border/50">
                                    <div className="flex items-center justify-between text-xs font-medium">
                                        <span className="text-muted-foreground text-[10px] uppercase font-bold">Package Plan:</span>
                                        <Badge variant="outline" className={`${svc.plan !== 'NO PLAN' ? 'border-amber-500/30 bg-amber-500/10 text-amber-600' : 'border-border text-muted-foreground'} font-mono text-[9px] uppercase font-bold`}>
                                            {svc.plan}
                                        </Badge>
                                    </div>

                                    {svc.quota > 0 && (
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="text-muted-foreground font-bold">Quota:</span>
                                            <span className="font-mono font-bold text-foreground">
                                                {svc.quota >= 999999 ? 'Unlimited' : `${svc.quota.toLocaleString('id-ID')} / bulan`}
                                            </span>
                                        </div>
                                    )}

                                    {svc.isLifetime ? (
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="text-muted-foreground font-bold">Berlaku s/d:</span>
                                            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">Selamanya (Lifetime)</span>
                                        </div>
                                    ) : svc.expiry ? (
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="text-muted-foreground font-bold">Berlaku s/d:</span>
                                            <span className="font-mono font-bold text-foreground">{format(svc.expiry, "dd MMM yyyy")}</span>
                                        </div>
                                    ) : null}

                                    <div className="pt-1 flex justify-end">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                setGrantServiceId(svc.id);
                                                setGrantPlanId("pro");
                                                setIsGrantPlanOpen(true);
                                            }}
                                            className="h-6 px-2 text-[9px] font-bold uppercase text-amber-600 hover:bg-amber-500/10 gap-1 rounded-md"
                                        >
                                            <Crown className="w-3 h-3" /> Beri Plan
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* 💳 Subscription Transactions History Table */}
            <Card className="border-border shadow-sm rounded-3xl bg-card overflow-hidden">
                <CardHeader className="bg-muted/30 dark:bg-[#0A0A0A] px-6 py-4 border-b border-border flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-primary" />
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Subscription Purchase History ({subscriptionTxs.length})
                        </CardTitle>
                    </div>
                </CardHeader>
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[600px] text-xs text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-3.5 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">TXID / Reference</th>
                                <th className="px-6 py-3.5 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Subscription Package</th>
                                <th className="px-6 py-3.5 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Amount</th>
                                <th className="px-6 py-3.5 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Date</th>
                                <th className="px-6 py-3.5 font-bold uppercase tracking-widest text-[9px] text-muted-foreground text-right whitespace-nowrap">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {txsLoading || stsTxsLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-3.5"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-3.5"><Skeleton className="h-4 w-32" /></td>
                                        <td className="px-6 py-3.5"><Skeleton className="h-4 w-20" /></td>
                                        <td className="px-6 py-3.5"><Skeleton className="h-4 w-20" /></td>
                                        <td className="px-6 py-3.5 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : subscriptionTxs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic text-xs">
                                        Pengguna ini belum pernah melakukan pembelian paket langganan.
                                    </td>
                                </tr>
                            ) : (
                                subscriptionTxs.map((sub, i) => {
                                    const statusStr = String(sub.status || "Pending").toUpperCase();
                                    const isPaid = statusStr === 'PAID' || statusStr === 'SUCCESS';
                                    const isPending = statusStr === 'PENDING';
                                    const dateStr = sub.createdAt ? format(sub.createdAt.toDate ? sub.createdAt.toDate() : new Date(sub.createdAt), "dd MMM yyyy, HH:mm") : "---";

                                    return (
                                        <tr key={i} className="hover:bg-muted/10 transition-colors">
                                            <td className="px-6 py-3.5 font-mono font-bold text-foreground/80 whitespace-nowrap uppercase">
                                                {sub.id?.substring(0, 16)}
                                            </td>
                                            <td className="px-6 py-3.5 font-bold text-foreground whitespace-nowrap">
                                                {sub.itemName || sub.description || "Package Subscription"}
                                            </td>
                                            <td className="px-6 py-3.5 font-bold text-emerald-600 whitespace-nowrap">
                                                Rp {(sub.amount || sub.totalAmount || sub.priceAmount || 0).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-3.5 font-mono text-muted-foreground text-[10px] whitespace-nowrap">
                                                {dateStr}
                                            </td>
                                            <td className="px-6 py-3.5 text-right whitespace-nowrap">
                                                <Badge className={`${isPaid ? 'bg-emerald-500/10 text-emerald-600' : isPending ? 'bg-amber-500/10 text-amber-600' : 'bg-destructive/10 text-destructive'} border-none font-bold text-[8px] uppercase px-2 py-0.5 rounded-sm`}>
                                                    {statusStr}
                                                </Badge>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Bank Info & All Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 border-border shadow-sm rounded-3xl bg-card p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Landmark className="w-4 h-4 text-emerald-500" />
                            Rekening Bank Payout
                        </h3>
                    </div>

                    <div className="space-y-3 text-xs">
                        <div>
                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Bank Provider</p>
                            <p className="font-bold text-foreground text-sm uppercase">{userProfile.payoutBankName || "Belum diisi"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Nomor Rekening</p>
                            <p className="font-mono font-bold text-foreground text-sm">{userProfile.payoutAccountNumber || "Belum diisi"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Nama Pemilik Rekening</p>
                            <p className="font-bold text-foreground text-sm uppercase">{userProfile.payoutAccountName || "Belum diisi"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Status Verifikasi</p>
                            <div className="mt-1">
                                {userProfile.payoutAccountStatus === "VERIFIED" ? (
                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[9px] uppercase px-2 py-0.5">
                                        Verified
                                    </Badge>
                                ) : (
                                    <Badge className="bg-amber-500/10 text-amber-600 border-none font-bold text-[9px] uppercase px-2 py-0.5">
                                        Pending Verification
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* All Transaction History for User */}
                <Card className="lg:col-span-2 border-border shadow-sm rounded-3xl bg-card overflow-hidden flex flex-col h-[480px]">
                    <CardHeader className="bg-muted/30 dark:bg-[#0A0A0A] px-6 py-4 border-b border-border flex flex-row items-center justify-between shrink-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" />
                            All User Transaction Logs ({allUserTxs.length})
                        </CardTitle>
                    </CardHeader>
                    <div className="flex-1 overflow-x-auto overflow-y-auto w-full">
                        <table className="w-full min-w-[600px] text-xs text-left">
                            <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-md">
                                <tr>
                                    <th className="px-6 py-3 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">TXID / Time</th>
                                    <th className="px-6 py-3 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Item / Description</th>
                                    <th className="px-6 py-3 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Amount</th>
                                    <th className="px-6 py-3 font-bold uppercase tracking-widest text-[9px] text-muted-foreground text-right whitespace-nowrap">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {txsLoading || stsTxsLoading ? (
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-6 py-3"><Skeleton className="h-4 w-24" /></td>
                                            <td className="px-6 py-3"><Skeleton className="h-4 w-32" /></td>
                                            <td className="px-6 py-3"><Skeleton className="h-4 w-20" /></td>
                                            <td className="px-6 py-3 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : allUserTxs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-16 text-center text-muted-foreground italic">
                                            Belum ada riwayat transaksi untuk pengguna ini.
                                        </td>
                                    </tr>
                                ) : (
                                    allUserTxs.map((tx, i) => {
                                        const statusStr = String(tx.status || "Pending").toUpperCase();
                                        const isSuccess = ['PAID', 'SUCCESS', 'SUCCEEDED', 'COMPLETED'].includes(statusStr);
                                        const isPending = statusStr === 'PENDING';
                                        const dateStr = tx.createdAt ? format(tx.createdAt.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt), "dd MMM HH:mm") : "---";

                                        return (
                                            <tr key={i} className="hover:bg-muted/10 transition-colors">
                                                <td className="px-6 py-3.5 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="font-mono font-bold text-foreground/80 uppercase">{tx.id?.substring(0, 14)}</span>
                                                        <span className="text-[9px] text-muted-foreground">{dateStr}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5 font-bold text-foreground/80 whitespace-nowrap truncate max-w-[200px]">
                                                    {tx.itemName || tx.description || tx.gameName || "Transaction"}
                                                </td>
                                                <td className="px-6 py-3.5 font-bold text-primary whitespace-nowrap">
                                                    {tx.price || `Rp ${(tx.amount || tx.priceAmount || 0).toLocaleString('id-ID')}`}
                                                </td>
                                                <td className="px-6 py-3.5 text-right whitespace-nowrap">
                                                    <Badge className={`${isSuccess ? 'bg-emerald-500/10 text-emerald-600' : isPending ? 'bg-amber-500/10 text-amber-600' : 'bg-destructive/10 text-destructive'} border-none font-bold text-[8px] uppercase px-2 py-0.5 rounded-sm`}>
                                                        {statusStr}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Grant Plan Dialog */}
            <Dialog open={isGrantPlanOpen} onOpenChange={setIsGrantPlanOpen}>
                <DialogContent className="rounded-3xl border-border w-[94vw] md:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-headline font-bold flex items-center gap-2">
                            <Crown className="w-5 h-5 text-amber-500" />
                            Beri Plan Langganan
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Berikan paket langganan secara manual untuk pengguna <strong>{userProfile.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Layanan (Service)</Label>
                            <Select value={grantServiceId} onValueChange={setGrantServiceId}>
                                <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-transparent font-bold text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="gomerchant" className="text-xs font-bold">GoMerchant</SelectItem>
                                    <SelectItem value="shopeepay" className="text-xs font-bold">ShopeePay</SelectItem>
                                    <SelectItem value="ovo" className="text-xs font-bold">OVO</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Paket Plan</Label>
                            <Select value={grantPlanId} onValueChange={setGrantPlanId}>
                                <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-transparent font-bold text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="pro" className="text-xs font-bold">Pro (60 RPM & 7-Day History - 5.000 Quota)</SelectItem>
                                    <SelectItem value="premium" className="text-xs font-bold">Premium (180 RPM & Priority - 15.000 Quota)</SelectItem>
                                    <SelectItem value="enterprise" className="text-xs font-bold">Enterprise (Custom Quota & Custom Duration)</SelectItem>
                                    <SelectItem value="free" className="text-xs font-bold text-destructive">Reset / Basic (Revoke Plan)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {grantPlanId === "enterprise" && (
                            <div className="space-y-2 animate-in fade-in duration-200">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-amber-600 ml-1">
                                    Custom Quota (Per Bulan / Request Limit)
                                </Label>
                                <Input
                                    type="number"
                                    placeholder="Masukkan quota (e.g. 50000 atau 999999)"
                                    value={customQuotaInput}
                                    onChange={(e) => setCustomQuotaInput(e.target.value)}
                                    className="rounded-xl h-11 font-mono text-sm border-amber-500/30 bg-amber-500/5"
                                />
                                <p className="text-[9px] text-muted-foreground ml-1">Tips: Gunakan 999999 untuk Quota Unlimited.</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Masa Berlaku (Durasi)</Label>
                            <Select value={grantDurationDays} onValueChange={setGrantDurationDays}>
                                <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-transparent font-bold text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="30" className="text-xs font-bold">30 Hari (1 Bulan)</SelectItem>
                                    <SelectItem value="90" className="text-xs font-bold">90 Hari (3 Bulan)</SelectItem>
                                    <SelectItem value="365" className="text-xs font-bold">365 Hari (1 Tahun)</SelectItem>
                                    <SelectItem value="custom" className="text-xs font-bold text-primary">Custom Jumlah Hari...</SelectItem>
                                    <SelectItem value="0" className="text-xs font-bold text-amber-600">Selamanya (Lifetime / Permanent)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {grantDurationDays === "custom" && (
                            <div className="space-y-2 animate-in fade-in duration-200">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">
                                    Custom Jumlah Hari Active
                                </Label>
                                <Input
                                    type="number"
                                    placeholder="Masukkan jumlah hari (e.g. 14, 45, 60, 180)"
                                    value={customDurationInput}
                                    onChange={(e) => setCustomDurationInput(e.target.value)}
                                    className="rounded-xl h-11 font-mono text-sm border-primary/30 bg-primary/5"
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={handleGrantPlan}
                            disabled={isUpdating}
                            className="w-full h-11 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white gap-2"
                        >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                            Simpan & Berikan Plan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Adjust Balance Dialog */}
            <Dialog open={isAdjustBalanceOpen} onOpenChange={setIsAdjustBalanceOpen}>
                <DialogContent className="rounded-3xl border-border w-[94vw] md:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-headline font-bold">
                            Adjust Saldo {balanceType === "main" ? "Utama (PPOB)" : "STSPay"}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Sesuaikan saldo untuk pengguna <strong>{userProfile.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tipe Saldo</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    type="button"
                                    variant={balanceType === "main" ? "default" : "outline"}
                                    onClick={() => setBalanceType("main")}
                                    className="h-10 rounded-xl font-bold text-xs"
                                >
                                    Main Balance
                                </Button>
                                <Button
                                    type="button"
                                    variant={balanceType === "stspay" ? "default" : "outline"}
                                    onClick={() => setBalanceType("stspay")}
                                    className="h-10 rounded-xl font-bold text-xs"
                                >
                                    STSPay Balance
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Mode Penyesuaian</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    type="button"
                                    variant={adjustMode === "add" ? "secondary" : "ghost"}
                                    onClick={() => setAdjustMode("add")}
                                    className="h-9 rounded-xl font-bold text-xs"
                                >
                                    Tambah (+) / Kurang (-)
                                </Button>
                                <Button
                                    type="button"
                                    variant={adjustMode === "set" ? "secondary" : "ghost"}
                                    onClick={() => setAdjustMode("set")}
                                    className="h-9 rounded-xl font-bold text-xs"
                                >
                                    Set Langsung (=)
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                                {adjustMode === "add" ? "Nominal Penambahan / Pengurangan (e.g. 50000 atau -10000)" : "Nominal Baru Saldo (Rp)"}
                            </Label>
                            <Input
                                type="number"
                                placeholder="Masukkan nominal..."
                                value={adjustAmount}
                                onChange={(e) => setAdjustAmount(e.target.value)}
                                className="rounded-xl h-11 font-mono text-sm"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={handleSaveBalanceAdjustment}
                            disabled={isUpdating || !adjustAmount}
                            className="w-full h-11 rounded-xl font-bold bg-primary text-primary-foreground gap-2"
                        >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Simpan Perubahan Saldo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
