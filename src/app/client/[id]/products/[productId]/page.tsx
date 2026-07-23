
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ChevronLeft, 
  Save, 
  Loader2, 
  Trash2, 
  Plus, 
  ShoppingBag, 
  Star, 
  Clock, 
  Layers, 
  CheckCircle2, 
  Image as ImageIcon,
  Info,
  Hash,
  Coins,
  Bot,
  Zap,
  Terminal,
  Database
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getMongoProductById, updateMongoProduct } from "@/service/mongodb";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [product, setProduct] = useState<any>(null);

  const appId = params.id as string;
  const productId = params.productId as string;

  const appRef = useMemoFirebase(() => {
    if (!db || !user?.uid || !appId) return null;
    return doc(db, "users", user.uid, "apps", appId);
  }, [db, user?.uid, appId]);

  const { data: app, loading: appLoading } = useDoc(appRef);

  // App Category Detection
  const isPremiumType = useMemo(() => app?.type?.includes("appprem"), [app]);
  const isTopupType = useMemo(() => app?.type?.includes("topup"), [app]);
  const isBot = useMemo(() => app?.type?.startsWith("bot"), [app]);

  useEffect(() => {
    if (user?.uid && !appLoading) {
      loadProduct();
    }
  }, [user?.uid, productId, appLoading]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const res = await getMongoProductById(user!.uid, appId, productId);
      if (res.success) {
        // Ensure packages is at least an empty array
        const data = res.data;
        if (!data.packages) data.packages = [];
        setProduct(data);
      } else {
        toast({ variant: "destructive", title: "Gagal memuat produk", description: res.message });
        router.back();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.uid || !product) return;
    setIsSaving(true);
    
    // Clean up empty stock lines before saving
    const cleanedProduct = { ...product };
    if (cleanedProduct.packages) {
      cleanedProduct.packages = cleanedProduct.packages.map((pkg: any) => ({
        ...pkg,
        stock: Array.isArray(pkg.stock) ? pkg.stock.filter((s: string) => s.trim() !== "") : [],
        accounts: Array.isArray(pkg.accounts) ? pkg.accounts.filter((a: string) => a.trim() !== "") : []
      }));
    }

    try {
      const res = await updateMongoProduct(user.uid, appId, productId, cleanedProduct);
      if (res.success) {
        toast({ title: "Berhasil!", description: "Data produk telah diperbarui di MongoDB." });
      } else {
        toast({ variant: "destructive", title: "Gagal Update", description: res.message });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setProduct((prev: any) => ({ ...prev, [field]: value }));
  };

  // --- Premium Package Helpers ---
  const updatePackage = (idx: number, field: string, value: any) => {
    setProduct((prev: any) => {
      if (!prev || !prev.packages) return prev;
      const newPackages = [...prev.packages];
      newPackages[idx] = { ...newPackages[idx], [field]: value };
      return { ...prev, packages: newPackages };
    });
  };

  const addPackage = () => {
    setProduct((prev: any) => {
      if (!prev) return prev;
      const newPackage = {
        id: `pkg-${Date.now()}`,
        name: "Paket Baru",
        price: 0,
        stock: [],
        accounts: []
      };
      return { ...prev, packages: [...(prev.packages || []), newPackage] };
    });
  };

  const removePackage = (idx: number) => {
    setProduct((prev: any) => {
      if (!prev || !prev.packages) return prev;
      return { ...prev, packages: prev.packages.filter((_: any, i: number) => i !== idx) };
    });
  };

  if (loading || appLoading) {
    return (
      <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto p-4">
         <Skeleton className="h-10 w-32 rounded-xl" />
         <div className="space-y-6">
            <Skeleton className="h-[300px] w-full rounded-3xl" />
            <Skeleton className="h-[400px] w-full rounded-3xl" />
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-20 px-1 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl hover:bg-accent shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-0.5 md:space-y-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-headline font-bold tracking-tight truncate">Edit <span className="text-primary">Produk</span></h1>
            <div className="flex items-center gap-2">
               <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase font-bold tracking-widest truncate">ID: {product.id || productId}</p>
               <Badge className="bg-primary/5 text-primary border-none text-[8px] font-bold uppercase py-0 px-2 h-4">
                 {app?.type?.replace('_', ' ')}
               </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
           <Button variant="outline" className="flex-1 md:flex-none rounded-xl h-10 md:h-12 px-4 md:px-6 font-bold text-[10px] md:text-xs" onClick={() => router.back()}>Batal</Button>
           <Button onClick={handleSave} disabled={isSaving} className="flex-1 md:flex-none rounded-xl h-10 md:h-12 px-6 md:px-10 font-bold text-[10px] md:text-xs uppercase tracking-widest gap-2 shadow-xl shadow-primary/10">
             {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
             Simpan
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:gap-8">
        
        {/* TOPUP LAYOUT: focuses on SKU and Direct Pricing */}
        {isTopupType ? (
          <Card className="border-border shadow-sm rounded-2xl md:rounded-[2.5rem] overflow-hidden bg-card">
            <CardHeader className="bg-muted/30 p-5 md:p-8 border-b border-border">
               <CardTitle className="text-xs md:text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                 <Zap className="w-4 h-4 text-primary" />
                 PPOB & SKU Configuration
               </CardTitle>
            </CardHeader>
            <CardContent className="p-5 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">SKU / Kode Produk</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      value={product.sku || product.buyer_sku_code || ""} 
                      onChange={(e) => updateField('sku', e.target.value.toUpperCase())}
                      className="pl-10 h-10 md:h-12 rounded-xl bg-muted/50 border-transparent font-mono font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Nama Layanan</Label>
                  <Input 
                    value={product.name || product.product || ""} 
                    onChange={(e) => updateField('name', e.target.value)}
                    className="h-10 md:h-12 rounded-xl bg-muted/50 border-transparent font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Kategori</Label>
                  <Input 
                    value={product.category || ""} 
                    onChange={(e) => updateField('category', e.target.value)}
                    className="h-10 rounded-xl bg-muted/30 border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Brand</Label>
                  <Input 
                    value={product.brand || ""} 
                    onChange={(e) => updateField('brand', e.target.value.toUpperCase())}
                    className="h-10 rounded-xl bg-muted/30 border-border"
                  />
                </div>
                <div className="space-y-1.5">
                   <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Provider</Label>
                   <Select value={product.provider || "Orderkuota"} onValueChange={(v) => updateField('provider', v)}>
                      <SelectTrigger className="h-10 rounded-xl bg-muted/30 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Orderkuota">Orderkuota</SelectItem>
                        <SelectItem value="DigiFlazz">DigiFlazz</SelectItem>
                        <SelectItem value="Internal">Internal (Manual)</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-dashed border-border">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Harga Modal (Base)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">Rp</span>
                    <Input 
                      type="number"
                      value={product.basePrice || product.price || 0} 
                      onChange={(e) => updateField('basePrice', parseInt(e.target.value) || 0)}
                      className="pl-10 h-10 md:h-12 rounded-xl bg-muted/30 border-border font-mono font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-primary">Harga Jual (Sell)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-primary">Rp</span>
                    <Input 
                      type="number"
                      value={product.sellPrice || product.price || 0} 
                      onChange={(e) => updateField('sellPrice', parseInt(e.target.value) || 0)}
                      className="pl-10 h-10 md:h-12 rounded-xl bg-primary/5 border-primary/20 font-mono font-bold text-primary"
                    />
                  </div>
                </div>
              </div>

              {isBot && (
                <div className="space-y-1.5 pt-4">
                  <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5" />
                    Bot Command Trigger
                  </Label>
                  <Input 
                    value={product.cmd_trigger || ""} 
                    onChange={(e) => updateField('cmd_trigger', e.target.value)}
                    placeholder="/beli_item10"
                    className="h-10 rounded-xl bg-muted/50 border-transparent font-mono text-xs"
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold uppercase">Status Layanan</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">Toggle availability for customers</p>
                </div>
                <Switch 
                  checked={product.status === "active" || product.status === true || product.is_active} 
                  onCheckedChange={(val) => {
                    updateField('status', val ? 'active' : 'maintenance');
                    updateField('is_active', val);
                  }} 
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          /* PREMIUM LAYOUT: focuses on Packages, Images, and Descriptions */
          <div className="space-y-6 md:space-y-8">
            <Card className="border-border shadow-sm rounded-2xl md:rounded-[2.5rem] overflow-hidden bg-card">
              <CardHeader className="bg-muted/30 p-5 md:p-8 border-b border-border">
                <CardTitle className="text-xs md:text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  Informasi Produk Premium
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 md:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Nama Produk</Label>
                      <Input 
                        value={product.product || product.name || ""} 
                        onChange={(e) => {
                          updateField('product', e.target.value);
                          updateField('name', e.target.value);
                        }}
                        className="h-10 md:h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Kategori</Label>
                      <Input 
                        value={product.category || ""} 
                        onChange={(e) => updateField('category', e.target.value)}
                        className="h-10 md:h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all text-sm"
                      />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Hero Image URL</Label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        value={product.imageUrl || ""} 
                        onChange={(e) => updateField('imageUrl', e.target.value)}
                        className="pl-10 h-10 md:h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all font-mono text-[10px]"
                      />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Deskripsi Layanan</Label>
                    <Textarea 
                      value={product.description || ""} 
                      onChange={(e) => updateField('description', e.target.value)}
                      className="min-h-[100px] md:min-h-[120px] rounded-xl md:rounded-2xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all text-sm leading-relaxed"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Rating</Label>
                      <div className="relative">
                        <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 fill-amber-500" />
                        <Input 
                          value={product.rating || "5.0"} 
                          onChange={(e) => updateField('rating', e.target.value)}
                          className="pl-10 h-10 md:h-11 rounded-xl bg-muted/50 border-none font-bold text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Total Terjual</Label>
                      <div className="relative">
                        <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                        <Input 
                          value={product.sold || "0"} 
                          onChange={(e) => updateField('sold', e.target.value)}
                          className="pl-10 h-10 md:h-11 rounded-xl bg-muted/50 border-none font-bold text-sm"
                        />
                      </div>
                    </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm rounded-2xl md:rounded-[2rem] bg-card overflow-hidden">
              <CardHeader className="bg-muted/30 p-5 md:p-8 border-b border-border flex flex-row items-center justify-between">
                  <CardTitle className="text-xs md:text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    Pilihan Paket & Stok Akun
                  </CardTitle>
                  <Button onClick={addPackage} variant="outline" size="sm" className="h-8 px-3 rounded-lg font-bold text-[9px] md:text-[10px] uppercase gap-1.5 border-primary/20 text-primary">
                    <Plus className="w-3 h-3" /> <span className="hidden sm:inline">Tambah Paket</span><span className="sm:hidden">Tambah</span>
                  </Button>
              </CardHeader>
              <CardContent className="p-5 md:p-8 space-y-4">
                  {product.packages?.length === 0 ? (
                    <p className="text-center text-xs text-muted-foreground py-10 italic">Belum ada paket ditambahkan.</p>
                  ) : product.packages?.map((pkg: any, idx: number) => (
                    <div key={pkg.id || idx} className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-muted/30 border border-border group relative transition-all hover:bg-muted/50">
                      <button 
                        onClick={() => removePackage(idx)}
                        className="absolute -top-2 -right-2 w-7 h-7 md:w-8 md:h-8 rounded-full bg-destructive text-white flex items-center justify-center shadow-lg sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        <div className="sm:col-span-8 space-y-1.5">
                          <Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Nama Paket</Label>
                          <Input 
                            value={pkg.name} 
                            onChange={(e) => updatePackage(idx, 'name', e.target.value)}
                            className="h-10 rounded-lg bg-background border-border font-bold text-sm"
                          />
                        </div>
                        <div className="sm:col-span-4 space-y-1.5">
                          <Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Harga (Rp)</Label>
                          <div className="relative">
                              <Coins className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                              <Input 
                                type="number"
                                value={pkg.price || ''} 
                                onChange={(e) => updatePackage(idx, 'price', parseInt(e.target.value) || 0)}
                                className="h-10 pl-8 rounded-lg bg-background border-border font-mono font-bold text-sm text-primary"
                              />
                          </div>
                        </div>
                        <div className="sm:col-span-12 space-y-1.5">
                          <Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Data Stok (Pemisah Baris)</Label>
                          <Textarea 
                            value={Array.isArray(pkg.stock) ? pkg.stock.join('\n') : (Array.isArray(pkg.accounts) ? pkg.accounts.join('\n') : '')} 
                            onChange={(e) => {
                              const val = e.target.value.split('\n');
                              updatePackage(idx, 'stock', val);
                              updatePackage(idx, 'accounts', val);
                            }}
                            placeholder="akun1@email.com pass123&#10;akun2@email.com pass456"
                            className="min-h-[80px] rounded-xl bg-background border-border text-[11px] font-mono leading-relaxed"
                          />
                          <p className="text-[8px] text-muted-foreground uppercase font-bold ml-1">Tersisa <span className="text-primary">{(pkg.stock?.filter((s: string) => s.trim() !== "")?.length || pkg.accounts?.filter((a: string) => a.trim() !== "")?.length || 0)}</span> data aktif</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
