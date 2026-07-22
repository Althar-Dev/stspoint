"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Coins
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getMongoProductById, updateMongoProduct } from "@/service/mongodb";
import { useUser } from "@/firebase";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [product, setProduct] = useState<any>(null);

  const appId = params.id as string;
  const productId = params.productId as string;

  useEffect(() => {
    if (user?.uid) {
      loadProduct();
    }
  }, [user?.uid, productId]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const res = await getMongoProductById(user!.uid, appId, productId);
      if (res.success) {
        setProduct(res.data);
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
    try {
      const res = await updateMongoProduct(user.uid, appId, productId, product);
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

  const updatePackage = (idx: number, field: string, value: any) => {
    const newPackages = [...product.packages];
    newPackages[idx] = { ...newPackages[idx], [field]: value };
    updateField('packages', newPackages);
  };

  const addPackage = () => {
    const newPackage = {
      id: `pkg-${Date.now()}`,
      name: "Paket Baru",
      price: 0,
      stock: []
    };
    updateField('packages', [...(product.packages || []), newPackage]);
  };

  const removePackage = (idx: number) => {
    const newPackages = product.packages.filter((_: any, i: number) => i !== idx);
    updateField('packages', newPackages);
  };

  if (loading) {
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
      {/* Header - Optimized for Mobile */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl hover:bg-accent shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-0.5 md:space-y-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-headline font-bold tracking-tight truncate">Edit <span className="text-primary">Produk</span></h1>
            <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase font-bold tracking-widest truncate">ID: {product.id || productId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
           <Button variant="outline" className="flex-1 md:flex-none rounded-xl h-10 md:h-12 px-4 md:px-6 font-bold text-[10px] md:text-xs" onClick={() => router.back()}>Batal</Button>
           <Button onClick={handleSave} disabled={isSaving} className="flex-1 md:flex-none rounded-xl h-10 md:h-12 px-6 md:px-10 font-bold text-[10px] md:text-xs uppercase tracking-widest gap-2 shadow-xl shadow-primary/10">
             {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
             <span className="hidden sm:inline">Simpan Ke Mongo</span>
             <span className="sm:hidden">Simpan</span>
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:gap-8">
        {/* Basic Info & Packages Section */}
        <div className="space-y-6 md:space-y-8">
          <Card className="border-border shadow-sm rounded-2xl md:rounded-[2.5rem] overflow-hidden bg-card">
            <CardHeader className="bg-muted/30 p-5 md:p-8 border-b border-border">
               <CardTitle className="text-xs md:text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                 <Info className="w-4 h-4 text-primary" />
                 Informasi Dasar
               </CardTitle>
            </CardHeader>
            <CardContent className="p-5 md:p-8 space-y-6">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Nama Produk</Label>
                    <Input 
                      value={product.product} 
                      onChange={(e) => updateField('product', e.target.value)}
                      className="h-10 md:h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Kategori</Label>
                    <Input 
                      value={product.category} 
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
                      value={product.imageUrl} 
                      onChange={(e) => updateField('imageUrl', e.target.value)}
                      className="pl-10 h-10 md:h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all font-mono text-[10px]"
                    />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Deskripsi Layanan</Label>
                  <Textarea 
                    value={product.description} 
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
                        value={product.rating} 
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
                        value={product.sold} 
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
                  Pilihan Paket & Stok
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
                           value={Array.isArray(pkg.stock) ? pkg.stock.join('\n') : ''} 
                           onChange={(e) => updatePackage(idx, 'stock', e.target.value.split('\n'))}
                           placeholder="akun1@email.com pass123&#10;akun2@email.com pass456"
                           className="min-h-[80px] rounded-xl bg-background border-border text-[11px] font-mono leading-relaxed"
                         />
                         <p className="text-[8px] text-muted-foreground uppercase font-bold ml-1">Tersisa <span className="text-primary">{pkg.stock?.length || 0}</span> akun aktif</p>
                      </div>
                    </div>
                  </div>
                ))}
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
