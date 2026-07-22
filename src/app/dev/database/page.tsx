"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, setDoc, serverTimestamp, deleteDoc, query, where, updateDoc, addDoc, increment } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { 
  Search, 
  History, 
  Building2, 
  UserCircle, 
  Globe2, 
  Activity, 
  Link2, 
  Plus,
  Clock, 
  Loader2,
  Copy,
  CheckCircle2,
  Layers,
  LayoutGrid,
  CreditCard,
  Edit2,
  Trash2,
  ImageIcon,
  Coins,
  Scale,
  Landmark,
  Banknote,
  XCircle,
  Check,
  Ticket
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import { checkEndpointHealth } from "./actions";
import { toast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ClientKeyManagement } from "@/components/partner/clientkey";

type ManagementView = "clients" | "merchants" | "transactions" | "gateway" | "licenses" | "channels" | "bank-accounts" | "withdrawals";

interface GatewayItem {
  provider: string;
  name: string;
  type: string;
  endpoint: string;
  status: string;
  latency: number;
  lastCheck: string;
  httpCode: number;
  isChecking?: boolean;
}

const STATIC_CHANNELS = [
  { id: 'QRIS', name: 'QRIS', group: 'QR', fee: '0.7%', min: '1000', provider: 'Xendit', settlement: 'T+2' },
  { id: 'BRI', name: 'BRI Virtual Account', group: 'VA', fee: '4000', min: '10000', provider: 'Xendit', settlement: 'T+1' },
  { id: 'BNI', name: 'BNI Virtual Account', group: 'VA', fee: '4000', min: '10000', provider: 'Xendit', settlement: 'T+1' },
  { id: 'MANDIRI', name: 'Mandiri Virtual Account', group: 'VA', fee: '4000', min: '10000', provider: 'Xendit', settlement: 'T+1' },
  { id: 'PERMATA', name: 'Permata Virtual Account', group: 'VA', fee: '4000', min: '10000', provider: 'Xendit', settlement: 'T+1' },
  { id: 'BSI', name: 'BSI Virtual Account', group: 'VA', fee: '4000', min: '10000', provider: 'Xendit', settlement: 'T+1' },
  { id: 'BJB', name: 'BJB Virtual Account', group: 'VA', fee: '4000', min: '10000', provider: 'Xendit', settlement: 'T+1' },
  { id: 'CIMB', name: 'CIMB Virtual Account', group: 'VA', fee: '4000', min: '10000', provider: 'Xendit', settlement: 'T+1' },
  { id: 'SAHABAT_SAMPOERNA', name: 'Sahabat Sampoerna VA', group: 'VA', fee: '3000', min: '10000', provider: 'Xendit', settlement: 'T+1' },
  { id: 'OVO', name: 'OVO', group: 'E-Wallet', fee: '2.0%', min: '1000', provider: 'Xendit', settlement: 'T+1' },
  { id: 'ALFAMART', name: 'Alfamart', group: 'Retail', fee: '5000', min: '10000', provider: 'Xendit', settlement: 'T+1' },
  { id: 'INDOMARET', name: 'Indomaret', group: 'Retail', fee: '5000', min: '10000', provider: 'Xendit', settlement: 'T+1' },
];

function ManagementContent() {
  const db = useFirestore();
  const searchParams = useSearchParams();
  
  const view = (searchParams.get("view") as ManagementView) || "gateway";
  const [search, setSearch] = useState("");
  
  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [channelForm, setChannelForm] = useState({
    id: "",
    name: "",
    provider: "Xendit",
    group: "VA",
    fee: "",
    minPay: "",
    logo: "",
    settlement: "T+1",
    status: true
  });

  const [gateways, setGateways] = useState<GatewayItem[]>([
    { 
      provider: "DigiFlazz",
      name: "PPOB Catalog", 
      type: "GET", 
      endpoint: "https://api.digiflazz.com/v1/price-list",
      status: "Initializing", 
      latency: 0,
      lastCheck: "Never",
      httpCode: 0
    },
    { 
      provider: "DigiFlazz",
      name: "Order Engine", 
      type: "POST", 
      endpoint: "https://api.digiflazz.com/v1/transaction",
      status: "Initializing", 
      latency: 0,
      lastCheck: "Never",
      httpCode: 0
    },
    { 
      provider: "Orderkuota",
      name: "OTP Gateway", 
      type: "GET", 
      endpoint: "https://api.qrispay.biz.id/orderkuota/getotp",
      status: "Initializing", 
      latency: 0,
      lastCheck: "Never",
      httpCode: 0
    },
    { 
      provider: "Orderkuota",
      name: "Token Exchange", 
      type: "GET", 
      endpoint: "https://api.qrispay.biz.id/orderkuota/gettoken",
      status: "Initializing", 
      latency: 0,
      lastCheck: "Never",
      httpCode: 0
    },
    { 
      provider: "Orderkuota",
      name: "QRIS Mutation", 
      type: "GET", 
      endpoint: "https://api.qrispay.biz.id/orderkuota/mutasiqr",
      status: "Initializing", 
      latency: 0,
      lastCheck: "Never",
      httpCode: 0
    },
    { 
      provider: "Orderkuota",
      name: "Withdraw Bridge", 
      type: "GET", 
      endpoint: "https://api.qrispay.biz.id/orderkuota/wdqr",
      status: "Initializing", 
      latency: 0,
      lastCheck: "Never",
      httpCode: 0
    },
    { 
      provider: "GoMerchant",
      name: "Login Session", 
      type: "POST", 
      endpoint: "https://api.gomerchant.biz.id/v1/login",
      status: "Initializing", 
      latency: 0,
      lastCheck: "Never",
      httpCode: 0
    },
    { 
      provider: "GoMerchant",
      name: "Live Mutation", 
      type: "POST", 
      endpoint: "https://api.gomerchant.biz.id/v1/mutations",
      status: "Initializing", 
      latency: 0,
      lastCheck: "Never",
      httpCode: 0
    }
  ]);

  const performAudit = useCallback(async () => {
    setGateways(prev => prev.map(gw => ({ ...gw, isChecking: !!gw.endpoint })));

    for (let i = 0; i < gateways.length; i++) {
      const gw = gateways[i];
      if (!gw.endpoint) continue;

      const result = await checkEndpointHealth(gw.endpoint);
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      setGateways(prev => {
        const newData = [...prev];
        newData[i] = {
          ...newData[i],
          status: result.status,
          httpCode: result.httpCode,
          latency: result.latency,
          lastCheck: timeStr,
          isChecking: false
        };
        return newData;
      });
    }
  }, [gateways.length]);

  useEffect(() => {
    if (view === 'gateway') {
      performAudit();
      const interval = setInterval(performAudit, 30000);
      return () => clearInterval(interval);
    }
  }, [view, performAudit]);

  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "users");
  }, [db]);

  const txsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "transactions");
  }, [db]);

  const stspayTxsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "stspay_transactions"), where("type", "==", "payout"));
  }, [db]);

  const channelsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "payment_channels");
  }, [db]);

  const { data: users, loading: usersLoading } = useCollection(usersQuery);
  const { data: transactions, loading: txLoading } = useCollection(txsQuery);
  const { data: stspayTransactions, loading: stsTxLoading } = useCollection(stspayTxsQuery);
  const { data: paymentChannels, loading: channelsLoading } = useCollection(channelsQuery);

  const filteredData = useMemo(() => {
    const s = search.toLowerCase();
    
    if (view === "clients") {
      return users
        .filter(u => u.role === 'client')
        .filter(u => u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s));
    }
    
    if (view === "merchants") {
      return users
        .filter(u => u.role === 'merchant')
        .filter(u => u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s));
    }

    if (view === "bank-accounts") {
      return users
        .filter(u => u.payoutAccountNumber)
        .filter(u => u.name?.toLowerCase().includes(s) || u.payoutAccountNumber?.toLowerCase().includes(s));
    }

    if (view === "withdrawals") {
      return [...stspayTransactions].sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      }).filter(t => 
        t.id?.toLowerCase().includes(s) || 
        t.userId?.toLowerCase().includes(s)
      );
    }

    if (view === "transactions") {
      return transactions.filter(t => 
        t.id?.toLowerCase().includes(s) || 
        t.userId?.toLowerCase().includes(s) || 
        t.itemName?.toLowerCase().includes(s)
      );
    }

    if (view === "channels") {
      const dbChannels = paymentChannels || [];
      const staticChannels = STATIC_CHANNELS.map(sc => {
        const found = dbChannels.find(dbc => dbc.id.toUpperCase() === sc.id.toUpperCase());
        return found ? { ...sc, ...found } : sc;
      });

      const customChannels = dbChannels.filter(dbc => !STATIC_CHANNELS.find(sc => sc.id.toUpperCase() === dbc.id.toUpperCase()));
      const all = [...staticChannels, ...customChannels];

      return all.filter(c => 
        c.name.toLowerCase().includes(s) || 
        c.group.toLowerCase().includes(s) ||
        c.id.toLowerCase().includes(s)
      );
    }

    return [];
  }, [users, transactions, stspayTransactions, paymentChannels, view, search]);

  const groupedGateways = useMemo(() => {
    return gateways.reduce((acc, curr) => {
      if (!acc[curr.provider]) acc[curr.provider] = [] as GatewayItem[];
      acc[curr.provider].push(curr);
      return acc;
    }, {} as Record<string, GatewayItem[]>);
  }, [gateways]);

  const getHttpBadge = (code: number) => {
    if (code === 0) return <Badge variant="outline" className="border-border text-muted-foreground/30">---</Badge>;
    if (code >= 200 && code < 300) return <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-mono">{code}</Badge>;
    if (code >= 300 && code < 400) return <Badge className="bg-blue-500/10 text-blue-600 border-none font-mono">{code}</Badge>;
    if (code >= 400 && code < 500) return <Badge className="bg-amber-500/10 text-amber-600 border-none font-mono">{code}</Badge>;
    return <Badge className="bg-destructive/10 text-destructive border-none font-mono">{code}</Badge>;
  };

  const handleUpdateChannelStatus = async (channelId: string, channelName: string, channelGroup: string, status: boolean, feeValue: string, minPay: string, provider: string, settlement: string, logoUrl?: string) => {
    if (!db) return;
    const channelRef = doc(db, "payment_channels", channelId);
    const newStatus = status ? 'active' : 'inactive';
    const data: any = {
      id: channelId,
      name: channelName,
      group: channelGroup,
      status: newStatus,
      fee: feeValue,
      min: minPay,
      provider: provider,
      settlement: settlement,
      updatedAt: serverTimestamp()
    };

    if (logoUrl !== undefined) data.logo = logoUrl;

    setDoc(channelRef, data, { merge: true })
      .then(() => {
        toast({ title: "Updated", description: `${channelName} settings saved.` });
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: channelRef.path,
          operation: 'write',
          requestResourceData: data,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleDeleteChannel = async (id: string) => {
    if (!db) return;
    setIsDeleting(id);
    try {
      await deleteDoc(doc(db, "payment_channels", id));
      toast({ title: "Deleted", description: `Channel ${id} removed successfully.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete channel." });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSaveChannel = async () => {
    if (!db) return;
    const { id, name, group, fee, minPay, status, logo, provider, settlement } = channelForm;
    if (!id || !name) {
      toast({ variant: "destructive", title: "Error", description: "Channel ID and Name are required." });
      return;
    }

    const channelId = id.toUpperCase();
    const data = {
      id: channelId,
      name,
      group,
      fee,
      min: minPay,
      logo,
      provider,
      settlement,
      status: status ? 'active' : 'inactive',
      updatedAt: serverTimestamp()
    };

    try {
      if (editingChannel && editingChannel.id !== channelId) {
        await deleteDoc(doc(db, "payment_channels", editingChannel.id));
      }

      await setDoc(doc(db, "payment_channels", channelId), data);
      toast({ title: "Success", description: `Channel ${name} has been saved.` });
      setIsChannelDialogOpen(false);
      setEditingChannel(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save channel." });
    }
  };

  const handleConfirmBankAccount = async (userId: string) => {
    if (!db) return;
    const userRef = doc(db, "users", userId);
    
    updateDoc(userRef, {
      payoutAccountStatus: 'VERIFIED',
      updatedAt: serverTimestamp()
    })
    .then(async () => {
      const notificationsRef = collection(db, "users", userId, "notifications");
      const notifData = {
        title: "Rekening Terverifikasi",
        message: "Rekening bank Anda telah berhasil dikonfirmasi oleh tim admin.",
        type: "success",
        isRead: false,
        createdAt: serverTimestamp()
      };

      addDoc(notificationsRef, notifData)
        .catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: notificationsRef.path,
            operation: 'create',
            requestResourceData: notifData,
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        });

      toast({ title: "Confirmed", description: "Bank account has been verified." });
    })
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: userRef.path,
        operation: 'update',
        requestResourceData: { payoutAccountStatus: 'VERIFIED' },
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleUpdateWithdrawalStatus = async (txId: string, status: 'PAID' | 'FAILED', userId: string, amount: number) => {
    if (!db) return;
    const txRef = doc(db, "stspay_transactions", txId);
    const globalTxRef = doc(db, "transactions", txId);
    const userHistoryRef = doc(db, "users", userId, "transactions", txId);

    const updateData = {
      status: status,
      updatedAt: serverTimestamp()
    };

    updateDoc(txRef, updateData)
      .then(async () => {
        if (status === 'FAILED') {
          const stspaySvcRef = doc(db, "users", userId, "services", "stspay");
          updateDoc(stspaySvcRef, {
            balance: increment(amount),
            updatedAt: serverTimestamp()
          }).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: stspaySvcRef.path,
              operation: 'update',
              requestResourceData: { balance: increment(amount) },
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
          });
        }

        const ledgerStatus = status === 'PAID' ? 'Success' : 'Failed';
        const ledgerUpdate = { status: ledgerStatus, updatedAt: serverTimestamp() };
        
        setDoc(globalTxRef, ledgerUpdate, { merge: true });
        setDoc(userHistoryRef, ledgerUpdate, { merge: true });

        const notificationsRef = collection(db, "users", userId, "notifications");
        const notifData = {
          title: status === 'PAID' ? "Penarikan Berhasil" : "Penarikan Gagal",
          message: status === 'PAID' 
            ? `Dana penarikan sebesar Rp ${amount.toLocaleString()} telah dikirim ke rekening bank Anda.` 
            : `Permintaan penarikan Rp ${amount.toLocaleString()} ditolak. Saldo Anda telah dikembalikan.`,
          type: status === 'PAID' ? "success" : "error",
          isRead: false,
          createdAt: serverTimestamp()
        };

        addDoc(notificationsRef, notifData).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: notificationsRef.path,
            operation: 'create',
            requestResourceData: notifData,
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        });

        toast({ title: `Withdrawal ${status}`, description: `Status updated and notified.` });
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: txRef.path,
          operation: 'update',
          requestResourceData: updateData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const openAddChannel = () => {
    setEditingChannel(null);
    setChannelForm({ id: "", name: "", provider: "Xendit", group: "VA", fee: "", minPay: "", status: true, logo: "", settlement: "T+1" });
    setIsChannelDialogOpen(true);
  };

  const openEditChannel = (channel: any) => {
    const dbEntry = paymentChannels?.find(pc => pc.id.toUpperCase() === channel.id.toUpperCase());
    setEditingChannel(channel);
    setChannelForm({
      id: channel.id,
      name: channel.name,
      provider: dbEntry?.provider || channel.provider || "Xendit",
      group: channel.group,
      fee: dbEntry?.fee || channel.fee || "",
      minPay: dbEntry?.min || channel.min || "",
      logo: dbEntry?.logo || channel.logo || "",
      settlement: dbEntry?.settlement || channel.settlement || "T+1",
      status: dbEntry?.status !== 'inactive'
    });
    setIsChannelDialogOpen(true);
  };

  const getLogoPreview = (channel: any) => {
    const dbEntry = paymentChannels?.find(pc => pc.id.toUpperCase() === channel.id.toUpperCase());
    const logoSource = dbEntry?.logo || channel.logo;

    if (logoSource) {
      const isFullUrl = logoSource.startsWith('http') || logoSource.startsWith('data:');
      const src = isFullUrl ? logoSource : `/assets/bank/${logoSource}`;
      return (
        <div className="relative w-14 flex items-center justify-center">
          <img src={src} alt={channel.id} className="object-contain w-full h-full" />
        </div>
      );
    }

    const id = channel.id.toUpperCase();
    const commonLogos = ['BRI', 'BNI', 'MANDIRI', 'PERMATA', 'BJB', 'CIMB', 'OVO', 'ALFAMART', 'INDOMARET', 'QRIS'];
    if (commonLogos.includes(id)) {
      return (
        <div className="relative w-14 flex items-center justify-center">
          <img src={`/assets/bank/${id.toLowerCase()}.png`} alt={id} className="object-contain w-full h-full" />
        </div>
      );
    }
    if (id === 'BSI') return <img src="/assets/bank/bsi-logo.svg" alt="BSI" className="w-14 object-contain" />;
    if (id === 'SAHABAT_SAMPOERNA') return <img src="/assets/bank/bss-logo.svg" alt="BSS" className="w-14 object-contain" />;

    return <div className="w-14 flex items-center justify-center text-muted-foreground"><ImageIcon className="w-10 h-10" /></div>;
  };

  const getViewHeader = () => {
     switch(view) {
       case 'gateway': return { title: 'Infrastructure Gateways', icon: Globe2, color: 'text-emerald-500' };
       case 'clients': return { title: 'Clients Registry', icon: UserCircle, color: 'text-blue-500' };
       case 'merchants': return { title: 'Merchants Registry', icon: Building2, color: 'text-primary' };
       case 'bank-accounts': return { title: 'Rekening Bank', icon: Landmark, color: 'text-emerald-500' };
       case 'withdrawals': return { title: 'Withdrawal Requester', icon: Banknote, color: 'text-amber-500' };
       case 'transactions': return { title: 'Transactions Registry', icon: History, color: 'text-amber-500' };
       case 'licenses': return { title: 'License Registry', icon: Ticket, color: 'text-purple-500' };
       case 'channels': return { title: 'Payment Channels', icon: LayoutGrid, color: 'text-primary' };
       default: return { title: 'System Management', icon: Layers, color: 'text-primary' };
     }
  };

  const header = getViewHeader();

  if (view === 'licenses') {
    return <ClientKeyManagement />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-3 px-4 h-11 bg-card border border-border rounded-md shadow-sm">
             <header.icon className={`w-3.5 h-3.5 ${header.color}`} />
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/80">{header.title}</span>
          </div>

          {view === 'channels' && (
            <Dialog open={isChannelDialogOpen} onOpenChange={setIsChannelDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={openAddChannel}
                  className="w-full sm:w-auto h-11 bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-widest rounded-md px-6 gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[94%] sm:max-w-[425px] rounded-xl border-border p-6 overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="font-headline font-bold">
                    {editingChannel ? "Edit Payment Channel" : "New Payment Channel"}
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Configure official payment provider details.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Provider Name</Label>
                    <Select 
                      value={channelForm.provider} 
                      onValueChange={(val) => setChannelForm({ ...channelForm, provider: val })}
                    >
                      <SelectTrigger className="h-12 rounded-md">
                        <SelectValue placeholder="Select Provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Xendit">Xendit</SelectItem>
                        <SelectItem value="Midtrans">Midtrans</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Channel ID</Label>
                    <Input 
                      placeholder="e.g. BCA, QRIS, OVO" 
                      value={channelForm.id} 
                      onChange={(e) => setChannelForm({ ...channelForm, id: e.target.value })}
                      className="rounded-md h-12 uppercase font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Display Name</Label>
                    <Input 
                      placeholder="e.g. BCA Virtual Account" 
                      value={channelForm.name} 
                      onChange={(e) => setChannelForm({ ...channelForm, name: e.target.value })}
                      className="rounded-md h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Logo</Label>
                    <Input 
                      placeholder="e.g. bca.png or https://..." 
                      value={channelForm.logo} 
                      onChange={(e) => setChannelForm({ ...channelForm, logo: e.target.value })}
                      className="rounded-md h-12"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Group</Label>
                      <Select 
                        value={channelForm.group} 
                        onValueChange={(val) => setChannelForm({ ...channelForm, group: val })}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VA">VA</SelectItem>
                          <SelectItem value="QR">QR</SelectItem>
                          <SelectItem value="E-Wallet">E-Wallet</SelectItem>
                          <SelectItem value="Retail">Retail</SelectItem>
                          <SelectItem value="Paylater">Paylater</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Fee / MDR</Label>
                      <Input 
                        placeholder="e.g. 0.7% or 4000" 
                        value={channelForm.fee} 
                        onChange={(e) => setChannelForm({ ...channelForm, fee: e.target.value })}
                        className="rounded-md h-12"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Min Pay</Label>
                      <Input 
                        placeholder="e.g. 1000" 
                        value={channelForm.minPay} 
                        onChange={(e) => setChannelForm({ ...channelForm, minPay: e.target.value })}
                        className="rounded-md h-12 font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Settlement</Label>
                      <Input 
                        placeholder="e.g. T+1" 
                        value={channelForm.settlement} 
                        onChange={(e) => setChannelForm({ ...channelForm, settlement: e.target.value })}
                        className="rounded-md h-12 font-bold"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-md border border-border">
                    <div className="space-y-0.5">
                       <p className="text-[10px] font-bold uppercase tracking-widest">Global Status</p>
                       <p className="text-[9px] text-muted-foreground uppercase">Enable for all</p>
                    </div>
                    <Switch 
                      checked={channelForm.status} 
                      onCheckedChange={(val) => setChannelForm({ ...channelForm, status: val })} 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    className="w-full h-11 rounded-md font-bold"
                    onClick={handleSaveChannel}
                  >
                    Save Configuration
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-md bg-muted border border-border shrink-0">
            <div className={`h-1.5 w-1.5 rounded-full bg-emerald-500 ${view === 'gateway' ? 'animate-pulse' : ''}`}></div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Monitor Active</span>
          </div>
        </div>

        {view !== 'gateway' && (
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input 
              className="pl-9 rounded-md h-11 bg-card border-border focus:ring-primary/20 text-xs" 
              placeholder={`Search registry...`} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
      </div>

      <Card className="bg-card border-border rounded-md overflow-hidden shadow-sm">
        <CardHeader className="bg-muted/30 dark:bg-[#0A0A0A] px-6 py-4 border-b border-border">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            {view === 'gateway' ? (
              <>
                <Globe2 className="w-4 h-4 text-emerald-500" />
                Infrastructure Gateway Cluster
              </>
            ) : view === 'channels' ? (
               <>
                <LayoutGrid className="w-4 h-4 text-primary" />
                Payment Channels Registry
              </>
            ) : (
              <>
                {view === 'clients' && <UserCircle className="w-4 h-4 text-blue-500" />}
                {view === 'merchants' && <Building2 className="w-4 h-4 text-primary" />}
                {view === 'bank-accounts' && <Landmark className="w-4 h-4 text-emerald-500" />}
                {view === 'withdrawals' && <Banknote className="w-4 h-4 text-amber-500" />}
                {view === 'transactions' && <History className="w-4 h-4 text-amber-500" />}
                {view === 'bank-accounts' ? 'Rekening Bank' : view.charAt(0).toUpperCase() + view.slice(1).replace('-', ' ')} Registry
              </>
            )}
          </CardTitle>
        </CardHeader>
        <div className="w-full overflow-x-auto">
          {view === "gateway" ? (
            <table className="w-full min-w-full text-[10px] md:text-xs text-left">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Endpoint Path</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Method</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap text-center">HTTP</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap text-center">Latency</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap text-center">Verification</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground text-right whitespace-nowrap">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Object.entries(groupedGateways).map(([provider, items]) => (
                  <React.Fragment key={provider}>
                    <tr className="bg-muted/20 border-y border-border">
                      <td colSpan={6} className="px-6 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-primary/80">
                        {provider} Infrastructure
                      </td>
                    </tr>
                    {items.map((gw, idx) => (
                      <tr key={`${provider}-${idx}`} className="hover:bg-muted/10 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-md ${!gw.endpoint ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground group-hover:text-primary transition-colors'}`}>
                              {gw.isChecking ? <Loader2 className="w-3 h-3 animate-spin text-primary" /> : <Activity className="w-3 h-3" />}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-foreground/80 text-[11px]">{gw.name}</span>
                              <div className="flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground/40 truncate max-w-[250px] group-hover:text-muted-foreground transition-colors">
                                 <Link2 className="w-2.5 h-2.5" />
                                 {gw.endpoint || "---"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <Badge variant="outline" className="border-border text-[9px] font-mono font-bold py-0 h-5 px-1.5 text-muted-foreground">
                             {gw.type}
                           </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {getHttpBadge(gw.httpCode)}
                        </td>
                        <td className="px-6 py-4 font-mono text-primary font-bold text-center whitespace-nowrap">
                          {gw.endpoint && gw.latency > 0 ? `${gw.latency}ms` : '---'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                           <div className="flex items-center justify-center gap-1.5 text-[9px] text-muted-foreground/50">
                              <Clock className="w-3 h-3" />
                              {gw.lastCheck}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <Badge className={`${
                            !gw.endpoint ? 'bg-destructive/10 text-destructive' :
                            gw.status === 'Operational' ? 'bg-emerald-500/10 text-emerald-600' : 
                            gw.status === 'Unstable' ? 'bg-amber-500/10 text-amber-600' : 'bg-destructive/10 text-destructive'
                          } border-none font-bold uppercase text-[8px] px-2 py-0.5 rounded-sm`}>
                            {!gw.endpoint ? 'No Set' : gw.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : view === "channels" ? (
             <table className="w-full min-w-full text-[10px] md:text-xs text-left">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Provider</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap text-center">Logo</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Channel ID</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Name</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap text-center">Group</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Fee</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap text-center">Min Pay</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap text-center">Settlement</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap text-center">Status</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {channelsLoading ? (
                  <tr><td colSpan={10} className="px-6 py-12 text-center text-muted-foreground/30 italic">Synchronizing channel registry...</td></tr>
                ) : filteredData.length === 0 ? (
                  <tr><td colSpan={10} className="px-6 py-12 text-center text-muted-foreground/30 italic">No channels found.</td></tr>
                ) : (
                  filteredData.map((channel, i) => {
                    const dbChannel = paymentChannels?.find(pc => pc.id.toUpperCase() === channel.id.toUpperCase());
                    const isActive = dbChannel?.status === 'active' || (channel.status === 'active' && !dbChannel);
                    const providerName = dbChannel?.provider || channel.provider || "Xendit";
                    const settlement = dbChannel?.settlement || channel.settlement || "T+1";
                    
                    return (
                      <tr key={i} className="hover:bg-muted/10 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap text-[10px] font-bold">{providerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                           <div className="flex justify-center">
                             {getLogoPreview(channel)}
                           </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-primary whitespace-nowrap uppercase">{channel.id}</td>
                        <td className="px-6 py-4 font-bold text-foreground/80 whitespace-nowrap">{channel.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                           <Badge variant="outline" className="text-[8px] uppercase font-bold px-2 py-0.5 border-border">
                             {channel.group}
                           </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono">{dbChannel?.fee || channel.fee || ""}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center font-mono">{dbChannel?.min || channel.min || ""}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center font-bold">{settlement}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                           <Badge className={`${isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'} border-none uppercase text-[8px] px-2 py-0.5 rounded-sm font-bold`}>
                              {isActive ? 'Active' : 'Inactive'}
                           </Badge>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                           <div className="flex items-center justify-end gap-2">
                             <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-md hover:bg-primary/5 hover:text-primary"
                              onClick={() => openEditChannel(channel)}
                             >
                               <Edit2 className="w-3.5 h-3.5" />
                             </Button>

                             <AlertDialog>
                               <AlertDialogTrigger asChild>
                                 <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 rounded-md hover:bg-destructive/5 hover:text-destructive"
                                  disabled={isDeleting === channel.id}
                                 >
                                   {isDeleting === channel.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                 </Button>
                               </AlertDialogTrigger>
                               <AlertDialogContent className="rounded-xl">
                                 <AlertDialogHeader>
                                   <AlertDialogTitle className="font-headline font-bold">Delete Payment Channel?</AlertDialogTitle>
                                   <AlertDialogDescription className="text-sm">
                                     This will permanently remove the channel <strong>{channel.name}</strong> ({channel.id}) from the registry.
                                   </AlertDialogDescription>
                                 </AlertDialogHeader>
                                 <AlertDialogFooter>
                                   <AlertDialogCancel className="rounded-md">Cancel</AlertDialogCancel>
                                   <AlertDialogAction 
                                    className="bg-destructive hover:bg-destructive/90 rounded-md font-bold"
                                    onClick={() => handleDeleteChannel(channel.id)}
                                   >
                                     Confirm Delete
                                   </AlertDialogAction>
                                 </AlertDialogFooter>
                               </AlertDialogContent>
                             </AlertDialog>

                             <Switch 
                              checked={isActive} 
                              onCheckedChange={() => handleUpdateChannelStatus(channel.id, channel.name, channel.group, !isActive, dbChannel?.fee || channel.fee, dbChannel?.min || channel.min, providerName, settlement, dbChannel?.logo || channel.logo)}
                             />
                           </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : view === "bank-accounts" ? (
             <table className="w-full min-w-full text-[10px] md:text-xs text-left">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">User Context</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Bank Name</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Account Number</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Account Holder</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground text-right whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usersLoading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground/30 italic">Synchronizing bank accounts...</td></tr>
                ) : filteredData.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground/30 italic">No bank accounts registered.</td></tr>
                ) : (
                  filteredData.map((user, i) => (
                    <tr key={i} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                           <span className="font-bold text-foreground/80">{user.name}</span>
                           <span className="text-[10px] text-muted-foreground">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-primary whitespace-nowrap uppercase">{user.payoutBankName}</td>
                      <td className="px-6 py-4 font-mono font-bold text-foreground whitespace-nowrap">{user.payoutAccountNumber}</td>
                      <td className="px-6 py-4 font-medium text-foreground/80 whitespace-nowrap">{user.payoutAccountName}</td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {user.payoutAccountStatus === 'VERIFIED' ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] uppercase font-bold py-0.5 px-2 rounded-sm">Verified</Badge>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-none text-[8px] uppercase font-bold py-0.5 px-2 rounded-sm">Pending</Badge>
                            <Button 
                              size="sm" 
                              className="h-7 px-3 text-[9px] font-bold uppercase rounded-md bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleConfirmBankAccount(user.id)}
                            >
                              Confirm
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : view === "withdrawals" ? (
             <table className="w-full min-w-full text-[10px] md:text-xs text-left">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">TXID / Time</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Amount</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Target Account</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap text-center">Merchant ID</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground text-right whitespace-nowrap">Action / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stsTxLoading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground/30 italic">Synchronizing withdrawals...</td></tr>
                ) : filteredData.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground/30 italic">No withdrawal requests found.</td></tr>
                ) : (
                  filteredData.map((tx, i) => (
                    <tr key={i} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                           <span className="font-mono text-foreground font-bold uppercase">{tx.id?.substring(0, 14)}</span>
                           <span className="text-[9px] text-muted-foreground">{tx.createdAt ? format(tx.createdAt.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt), "dd MMM HH:mm") : '---'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-600 whitespace-nowrap">Rp {tx.amount?.toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                           <span className="font-bold text-foreground/80">{tx.bankInfo?.name} • {tx.bankInfo?.accountNumber}</span>
                           <span className="text-[10px] text-muted-foreground uppercase">{tx.bankInfo?.accountName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap font-mono text-[9px] text-muted-foreground">
                        {tx.userId}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {tx.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              size="sm" 
                              className="h-8 px-3 text-[9px] font-bold uppercase bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                              onClick={() => handleUpdateWithdrawalStatus(tx.id, 'PAID', tx.userId, tx.amount)}
                            >
                              <Check className="w-3 h-3" /> Complete
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="h-8 px-3 text-[9px] font-bold uppercase text-red-500 hover:bg-red-50 gap-1"
                              onClick={() => handleUpdateWithdrawalStatus(tx.id, 'FAILED', tx.userId, tx.amount)}
                            >
                              <XCircle className="w-3 h-3" /> Reject
                            </Button>
                          </div>
                        ) : (
                          <Badge className={`${tx.status === 'PAID' || tx.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'} border-none uppercase text-[8px] px-2 py-0.5 rounded-sm font-bold`}>
                             {tx.status === 'PAID' ? 'Completed' : tx.status}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-full text-[10px] md:text-xs text-left">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  {view === "transactions" ? (
                    <>
                      <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">TXID</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Product</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">User Context</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Price</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-right whitespace-nowrap">Status</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Full Name</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Email Address</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">{view === 'clients' ? 'Client Key' : 'Merchant ID'}</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Role</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-right whitespace-nowrap">Balance</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(view === 'transactions' ? txLoading : usersLoading) ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground/30 italic">Synchronizing registry...</td></tr>
                ) : filteredData.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground/30 italic">No records found.</td></tr>
                ) : (
                  filteredData.map((item, i) => (
                    <tr key={i} className="hover:bg-muted/10 transition-colors group">
                      {view === 'transactions' ? (
                        <>
                          <td className="px-6 py-4 font-mono text-muted-foreground whitespace-nowrap uppercase">{item.id?.substring(0, 10)}</td>
                          <td className="px-6 py-4 font-bold text-foreground/80 whitespace-nowrap">{item.itemName}</td>
                          <td className="px-6 py-4 text-muted-foreground/60 whitespace-nowrap font-mono text-[9px]">{item.userId?.substring(0, 12)}...</td>
                          <td className="px-6 py-4 font-bold text-primary whitespace-nowrap">{item.price}</td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <Badge className={`${item.status === 'Success' ? 'bg-emerald-500/10 text-emerald-600' : item.status === 'Pending' ? 'bg-amber-500/10 text-amber-600' : 'bg-destructive/10 text-destructive'} border-none uppercase text-[8px] px-2 py-0.5 rounded-sm font-bold`}>
                              {item.status}
                            </Badge>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 font-bold text-foreground/80 whitespace-nowrap">{item.name}</td>
                          <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{item.email}</td>
                          <td className="px-6 py-4 font-mono text-[9px] text-muted-foreground/60 whitespace-nowrap uppercase">{item.merchantId || item.clientKey || "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                             <Badge variant="outline" className={`${item.dev ? 'border-primary text-primary' : item.role === 'client' ? 'border-blue-500 text-blue-600' : 'border-border text-muted-foreground'} text-[8px] uppercase font-bold px-2 py-0.5`}>
                               {item.dev ? 'Developer' : item.role === 'client' ? 'Client' : 'Merchant'}
                             </Badge>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-emerald-600 whitespace-nowrap">Rp {(item.balance || 0).toLocaleString('id-ID')}</td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function SystemManagementPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-muted-foreground italic">Accessing Management Console...</div>}>
      <ManagementContent />
    </Suspense>
  );
}
