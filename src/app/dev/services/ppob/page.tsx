
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Smartphone, 
  RefreshCcw, 
  Loader2, 
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  LayoutGrid,
  Database,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Settings,
  Layers,
  RotateCcw,
  Zap,
  ShieldCheck,
  Coins,
  Percent,
  ArrowRight
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useState, useEffect, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import { 
  getOrderkuotaPPOBPricelist, 
  getProduct as syncOrkut, 
  deleteProducts, 
  addProduct, 
  type OrkutPPOBProduct,
  getMarkupRules,
  addMarkupRule,
  deleteMarkupRule,
  type MarkupRule 
} from "@/service/orderkuota";
import { getProduct as syncDigi } from "@/service/digiflazz";
import { Icon } from "@iconify/react";

export default function PPOBManagementPage() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<OrkutPPOBProduct[]>([]);
  const [search, setSearch] = useState("");
  
  // Filter States
  const [filters, setFilters] = useState({
    provider: 'all',
    type: 'all',
    brand: 'all',
    status: 'all'
  });

  // Markup States
  const [markupRules, setMarkupRules] = useState<MarkupRule[]>([]);
  const [isMarkupDialogOpen, setIsMarkupDialogOpen] = useState(false);
  const [isSavingMarkup, setIsSavingMarkup] = useState(false);
  const [newRule, setNewRule] = useState<Partial<MarkupRule>>({
    targetProvider: 'all',
    targetType: 'global',
    targetValue: 'all',
    markupType: 'nominal',
    value: 0,
    minPrice: 0,
    maxPrice: 999999999
  });

  // Add Product States
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    provider: 'Orderkuota',
    type: 'Prepaid',
    sku: '',
    name: '',
    brand: '',
    price: 0
  });

  // Clear Data States
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [clearFilters, setClearFilters] = useState({
    provider: 'all',
    type: 'all',
    brand: 'all'
  });

  const availableFilterBrands = useMemo(() => {
    const brands = new Set<string>();
    const provider = filters.provider;
    products.forEach(p => {
      if (p.brand && (provider === 'all' || p.provider === provider)) {
        brands.add(p.brand);
      }
    });
    return Array.from(brands).sort();
  }, [products, filters.provider]);

  const availableMarkupBrands = useMemo(() => {
    const brands = new Set<string>();
    const provider = newRule.targetProvider || 'all';
    products.forEach(p => {
      if (p.brand && (provider === 'all' || p.provider === provider)) {
        brands.add(p.brand);
      }
    });
    return Array.from(brands).sort();
  }, [products, newRule.targetProvider]);

  const availableClearBrands = useMemo(() => {
    const brands = new Set<string>();
    const provider = clearFilters.provider;
    products.forEach(p => {
      if (p.brand && (provider === 'all' || p.provider === provider)) {
        brands.add(p.brand);
      }
    });
    return Array.from(brands).sort();
  }, [products, clearFilters.provider]);

  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    products.forEach(p => { if (p.type) types.add(p.type); });
    return Array.from(types).sort();
  }, [products]);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Sync Modal States
  const [isOrkutDialogOpen, setIsOrkutDialogOpen] = useState(false);
  const [orkutUrl, setOrkutUrl] = useState("https://okeconnect.com/harga/json?id=905ccd028329b0a&produk=pulsa,kuota_nasional,kuota_telkomsel,kuota_byu,kuota_indosat,kuota_tri,kuota_xl,kuota_axis,kuota_smartfren");
  const [orkutType, setOrkutType] = useState<"Prepaid" | "Pasca">("Prepaid");

  const loadLocalData = async () => {
    setLoading(true);
    try {
      const res = await getOrderkuotaPPOBPricelist();
      if (res.success) {
        setProducts(res.data);
      }

      const markupRes = await getMarkupRules();
      if (markupRes.success) {
        setMarkupRules(markupRes.data);
      }
    } catch (e) {
      console.error("Load local PPOB error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncFromOrkut = async () => {
    if (!orkutUrl) {
      toast({ variant: "destructive", title: "Input Required", description: "Silakan masukkan URL endpoint OkeConnect." });
      return;
    }
    setLoading(true);
    setIsOrkutDialogOpen(false);
    try {
      const syncRes = await syncOrkut(orkutUrl, orkutType);
      if (syncRes.success) {
        toast({ title: "Sync Berhasil", description: syncRes.message });
        await loadLocalData();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSyncFromDigi = async () => {
    setLoading(true);
    try {
      const syncRes = await syncDigi();
      if (syncRes.success) {
        toast({ title: "Sync Berhasil", description: syncRes.message });
        await loadLocalData();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddManualProduct = async () => {
    if (!productForm.sku || !productForm.name || !productForm.brand || !productForm.price) {
      toast({ variant: "destructive", title: "Input Required", description: "Semua kolom wajib diisi." });
      return;
    }
    setLoading(true);
    try {
      const res = await addProduct(productForm);
      if (res.success) {
        toast({ title: "Produk Ditambahkan", description: res.message });
        setIsAddProductDialogOpen(false);
        setProductForm({
          provider: 'Orderkuota',
          type: 'Prepaid',
          sku: '',
          name: '',
          brand: '',
          price: 0
        });
        await loadLocalData();
      } else {
        toast({ variant: "destructive", title: "Gagal", description: res.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    setLoading(true);
    setIsClearDialogOpen(false);
    try {
      const res = await deleteProducts({
        provider: clearFilters.provider === 'all' ? undefined : clearFilters.provider,
        tipe: clearFilters.type === 'all' ? undefined : clearFilters.type,
        brand: clearFilters.brand === 'all' ? undefined : clearFilters.brand
      });
      if (res.success) {
        toast({ title: "Data Dihapus", description: res.message });
        await loadLocalData();
      } else {
        toast({ variant: "destructive", title: "Gagal", description: res.message });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Terjadi kesalahan sistem saat menghapus data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocalData();
  }, []);

  const handleAddRule = async () => {
    if (newRule.value === undefined) return;
    if (newRule.targetType === 'brand' && !newRule.targetValue) {
      toast({ variant: "destructive", title: "Brand Required", description: "Pilih brand terlebih dahulu." });
      return;
    }
    if (newRule.targetType === 'sku' && !newRule.targetValue) {
      toast({ variant: "destructive", title: "SKU Required", description: "Masukkan Kode SKU produk." });
      return;
    }
    
    setIsSavingMarkup(true);
    try {
      const id = Math.random().toString(36).substr(2, 9);
      const ruleToSave = { ...newRule, id } as MarkupRule;
      
      const res = await addMarkupRule(ruleToSave);
      if (res.success) {
        setMarkupRules([...markupRules, ruleToSave].sort((a, b) => (a.minPrice || 0) - (b.minPrice || 0)));
        setNewRule(prev => ({ 
          ...prev, 
          targetValue: prev.targetType === 'global' ? 'all' : '', 
          value: 0,
          minPrice: 0,
          maxPrice: 999999999
        }));
        toast({ title: "Aturan Ditambahkan", description: res.message });
      } else {
        toast({ variant: "destructive", title: "Gagal", description: res.message });
      }
    } finally {
      setIsSavingMarkup(false);
    }
  };

  const removeRule = async (id: string) => {
    const res = await deleteMarkupRule(id);
    if (res.success) {
      setMarkupRules(markupRules.filter(r => r.id !== id));
      toast({ title: "Aturan Dihapus", description: res.message });
    } else {
      toast({ variant: "destructive", title: "Gagal", description: res.message });
    }
  };

  const resetFilters = () => {
    setFilters({
      provider: 'all',
      type: 'all',
      brand: 'all',
      status: 'all'
    });
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.product_name.toLowerCase().includes(search.toLowerCase()) ||
        p.buyer_sku_code.toLowerCase().includes(search.toLowerCase());
      
      const matchesProvider = filters.provider === 'all' || p.provider === filters.provider;
      const matchesType = filters.type === 'all' || p.type === filters.type;
      const matchesBrand = filters.brand === 'all' || p.brand === filters.brand;
      const matchesStatus = filters.status === 'all' || 
        (filters.status === 'active' ? p.buyer_product_status : !p.buyer_product_status);

      return matchesSearch && matchesProvider && matchesType && matchesBrand && matchesStatus;
    });
  }, [products, search, filters]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const startRange = filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endRange = Math.min(currentPage * itemsPerPage, filteredProducts.length);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-headline font-bold tracking-tight">PPOB <span className="text-primary">Management</span></h1>
          <p className="text-muted-foreground text-sm">Kelola katalog produk, sinkronisasi provider, dan kontrol harga jual.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
           
           <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-11 px-4 text-destructive hover:text-destructive hover:bg-destructive/5 font-bold text-[10px] uppercase tracking-widest gap-2">
                   <Trash2 className="w-4 h-4" />
                   Hapus Data
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[94vw] md:max-w-md rounded-2xl">
                 <DialogHeader>
                    <DialogTitle className="font-headline font-bold flex items-center gap-2">
                       <ShieldCheck className="w-5 h-5 text-destructive" />
                       Hapus Data Produk
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                       Pilih filter data yang ingin dihapus dari database lokal.
                    </DialogDescription>
                 </DialogHeader>
                 <div className="space-y-4 py-4">
                    <div className="space-y-1.5">
                       <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Provider</Label>
                       <Select value={clearFilters.provider} onValueChange={(v) => setClearFilters({...clearFilters, provider: v, brand: 'all'})}>
                          <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none font-bold text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                             <SelectItem value="all">Semua Provider</SelectItem>
                             <SelectItem value="DigiFlazz">DigiFlazz</SelectItem>
                             <SelectItem value="Orderkuota">Orderkuota</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-1.5">
                       <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Tipe</Label>
                       <Select value={clearFilters.type} onValueChange={(v) => setClearFilters({...clearFilters, type: v})}>
                          <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none font-bold text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                             <SelectItem value="all">Semua Tipe</SelectItem>
                             {availableTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-1.5">
                       <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Brand</Label>
                       <Select value={clearFilters.brand} onValueChange={(v) => setClearFilters({...clearFilters, brand: v})}>
                          <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none font-bold text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                             <SelectItem value="all">Semua Brand</SelectItem>
                             {availableClearBrands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                 </div>
                 <DialogFooter>
                    <AlertDialog>
                       <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[11px]">
                             Hapus Sekarang
                          </Button>
                       </AlertDialogTrigger>
                       <AlertDialogContent className="rounded-2xl">
                          <AlertDialogHeader>
                             <AlertDialogTitle className="font-headline font-bold">Apakah Anda yakin?</AlertDialogTitle>
                             <AlertDialogDescription className="text-sm">
                                Tindakan ini akan menghapus data produk terpilih secara permanen dari database lokal.
                             </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                             <AlertDialogCancel className="rounded-xl font-bold">Batal</AlertDialogCancel>
                             <AlertDialogAction onClick={handleClearData} className="rounded-xl bg-destructive hover:bg-destructive/90 font-bold">
                                Ya, Hapus Data
                             </AlertDialogAction>
                          </AlertDialogFooter>
                       </AlertDialogContent>
                    </AlertDialog>
                 </DialogFooter>
              </DialogContent>
           </Dialog>

           <Button 
            variant="outline" 
            size="sm" 
            className="rounded-md font-bold text-[10px] uppercase tracking-widest gap-2 h-11 px-6 border-border"
            onClick={handleSyncFromDigi}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
            Sync DigiFlazz
          </Button>

          <Dialog open={isOrkutDialogOpen} onOpenChange={setIsOrkutDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-md font-bold text-[10px] uppercase tracking-widest gap-2 h-11 px-6 border-border"
                disabled={loading}
              >
                <Database className="w-3.5 h-3.5" />
                Sync Orderkuota
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[94vw] md:max-w-md rounded-xl">
              <DialogHeader>
                <DialogTitle className="font-headline font-bold">Sinkronisasi Orderkuota</DialogTitle>
                <DialogDescription className="text-xs">Pilih tipe dan masukkan endpoint untuk menarik data produk.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tipe Produk</Label>
                  <RadioGroup value={orkutType} onValueChange={(v: any) => setOrkutType(v)} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Prepaid" id="prepaid" />
                      <Label htmlFor="prepaid" className="text-xs font-bold cursor-pointer">Prabayar</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Pasca" id="pasca" />
                      <Label htmlFor="pasca" className="text-xs font-bold cursor-pointer">Pascabayar</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Endpoint URL</Label>
                  <textarea 
                    value={orkutUrl}
                    onChange={(e) => setOrkutUrl(e.target.value)}
                    className="w-full min-h-[80px] p-3 text-[11px] font-mono rounded-lg bg-muted/50 border-transparent focus:ring-1 focus:ring-primary focus:bg-background transition-all outline-none resize-none"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSyncFromOrkut} className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[11px]">Mulai Sinkronisasi</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-md font-bold text-[10px] uppercase tracking-widest gap-2 h-11 px-6 border-border">
                <Plus className="w-3.5 h-3.5" /> Tambah Produk
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[94vw] md:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
               <DialogHeader>
                  <DialogTitle className="font-headline font-bold">Tambah Produk Manual</DialogTitle>
                  <DialogDescription className="text-xs">Input data produk baru ke dalam database lokal.</DialogDescription>
               </DialogHeader>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Provider</Label>
                     <Select value={productForm.provider} onValueChange={(v) => setProductForm({...productForm, provider: v})}>
                        <SelectTrigger className="h-10 rounded-xl bg-muted/50 border-none font-bold text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                           <SelectItem value="DigiFlazz">DigiFlazz</SelectItem>
                           <SelectItem value="Orderkuota">Orderkuota</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tipe</Label>
                     <Select value={productForm.type} onValueChange={(v) => setProductForm({...productForm, type: v})}>
                        <SelectTrigger className="h-10 rounded-xl bg-muted/50 border-none font-bold text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                           <SelectItem value="Prepaid">Prabayar</SelectItem>
                           <SelectItem value="Pasca">Pascabayar</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">SKU / Kode Produk</Label>
                     <Input 
                      placeholder="e.g. TSEL10" 
                      value={productForm.sku} 
                      onChange={(e) => setProductForm({...productForm, sku: e.target.value.toUpperCase()})}
                      className="h-10 rounded-xl bg-muted/50 border-none font-bold font-mono"
                     />
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nama Produk</Label>
                     <Input 
                      placeholder="e.g. Telkomsel 10 Ribu" 
                      value={productForm.name} 
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      className="h-10 rounded-xl bg-muted/50 border-none font-bold"
                     />
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Brand</Label>
                     <Input 
                      placeholder="e.g. TELKOMSEL" 
                      value={productForm.brand} 
                      onChange={(e) => setProductForm({...productForm, brand: e.target.value.toUpperCase()})}
                      className="h-10 rounded-xl bg-muted/50 border-none font-bold"
                     />
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Harga Dasar (Rp)</Label>
                     <Input 
                      type="number"
                      placeholder="10000" 
                      value={productForm.price || ''} 
                      onChange={(e) => setProductForm({...productForm, price: parseInt(e.target.value) || 0})}
                      className="h-10 rounded-xl bg-muted/50 border-none font-bold font-mono"
                     />
                  </div>
               </div>
               <DialogFooter>
                  <Button 
                    onClick={handleAddManualProduct}
                    disabled={loading}
                    className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-primary/10"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Simpan Produk"}
                  </Button>
               </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isMarkupDialogOpen} onOpenChange={setIsMarkupDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-md font-bold text-[10px] uppercase tracking-widest gap-2 h-11 px-6 bg-primary text-primary-foreground">
                <Settings className="w-3.5 h-3.5" /> Atur Markup
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[94vw] md:max-w-4xl rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-headline font-bold">Konfigurasi Markup Otomatis</DialogTitle>
                <DialogDescription className="text-xs">Atur keuntungan berdasarkan SKU spesifik dan rentang harga produk.</DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-6">
                <div className="md:col-span-5 space-y-6">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                      <Plus className="w-3 h-3" />
                      Tambah Aturan Baru
                    </Label>
                    <div className="space-y-4 p-5 rounded-2xl border border-border bg-muted/20">
                      
                      <div className="space-y-2">
                        <Label className="text-xs font-bold">Target Provider</Label>
                        <Select 
                          value={newRule.targetProvider} 
                          onValueChange={(v: any) => {
                            setNewRule(prev => ({
                              ...prev, 
                              targetProvider: v, 
                              targetValue: prev.targetType === 'global' ? 'all' : ''
                            }));
                          }}
                        >
                          <SelectTrigger className="h-10 rounded-lg bg-background"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Provider</SelectItem>
                            <SelectItem value="DigiFlazz">DigiFlazz Saja</SelectItem>
                            <SelectItem value="Orderkuota">Orderkuota Saja</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold">Berdasarkan</Label>
                        <Select value={newRule.targetType} onValueChange={(v: any) => setNewRule(prev => ({...prev, targetType: v, targetValue: v === 'global' ? 'all' : ''}))}>
                          <SelectTrigger className="h-10 rounded-lg bg-background"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="global">Global (Semua)</SelectItem>
                            <SelectItem value="brand">Brand Spesifik</SelectItem>
                            <SelectItem value="type">Tipe Layanan</SelectItem>
                            <SelectItem value="sku">SKU Spesifik</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {newRule.targetType !== 'global' && (
                        <div className="space-y-2 animate-in slide-in-from-top-2">
                          <Label className="text-xs font-bold">
                            {newRule.targetType === 'brand' ? 'Pilih Brand' : 
                             newRule.targetType === 'type' ? 'Pilih Tipe' : 'Masukkan SKU'}
                          </Label>
                          {newRule.targetType === 'type' ? (
                            <Select value={newRule.targetValue} onValueChange={(v) => setNewRule({...newRule, targetValue: v})}>
                              <SelectTrigger className="h-10 rounded-lg bg-background"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {availableTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          ) : newRule.targetType === 'sku' ? (
                            <Input 
                              placeholder="e.g. PLNPASCA" 
                              value={newRule.targetValue} 
                              onChange={(e) => setNewRule({...newRule, targetValue: e.target.value.toUpperCase()})}
                              className="h-10 rounded-lg font-mono bg-background"
                            />
                          ) : (
                            <Select value={newRule.targetValue} onValueChange={(v) => setNewRule({...newRule, targetValue: v})}>
                              <SelectTrigger className="h-10 rounded-lg bg-background">
                                <SelectValue placeholder="Pilih Brand..." />
                              </SelectTrigger>
                              <SelectContent className="max-h-[200px]">
                                {availableMarkupBrands.map(brand => (
                                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label className="text-xs font-bold">Min Modal (Pasca)</Label>
                           <Input 
                            type="number" 
                            placeholder="0"
                            value={newRule.minPrice || ''} 
                            onChange={(e) => setNewRule({...newRule, minPrice: parseInt(e.target.value) || 0})}
                            className="h-10 rounded-lg font-mono bg-background"
                           />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-xs font-bold">Max Modal (Pasca)</Label>
                           <Input 
                            type="number" 
                            placeholder="999.999"
                            value={newRule.maxPrice || ''} 
                            onChange={(e) => setNewRule({...newRule, maxPrice: parseInt(e.target.value) || 999999999})}
                            className="h-10 rounded-lg font-mono bg-background"
                           />
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <Label className="text-xs font-bold">Metode Markup</Label>
                        <Tabs value={newRule.markupType} onValueChange={(v: any) => setNewRule({...newRule, markupType: v})} className="w-full">
                          <TabsList className="grid grid-cols-2 w-full h-10 bg-muted/50 p-1 rounded-lg">
                            <TabsTrigger value="nominal" className="text-[10px] font-bold uppercase"><Coins className="w-3 h-3 mr-2"/> Nominal</TabsTrigger>
                            <TabsTrigger value="percent" className="text-[10px] font-bold uppercase"><Percent className="w-3 h-3 mr-2"/> Persen</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold">Nilai Markup</Label>
                        <div className="relative">
                          <Input 
                            type="number" 
                            value={newRule.value} 
                            onChange={(e) => setNewRule({...newRule, value: parseFloat(e.target.value) || 0})}
                            className="h-12 pl-4 pr-12 rounded-xl font-mono font-bold bg-background"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">{newRule.markupType === 'nominal' ? 'IDR' : '%'}</span>
                        </div>
                      </div>

                      <Button onClick={handleAddRule} disabled={isSavingMarkup} className="w-full h-11 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                        {isSavingMarkup ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Tambahkan Aturan"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-7 space-y-4">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                    <Layers className="w-3 h-3" />
                    Daftar Aturan Aktif
                  </Label>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {markupRules.length === 0 ? (
                       <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-10">
                          <Zap className="w-12 h-12 mb-2" />
                          <p className="text-xs font-bold uppercase">Tidak ada aturan aktif</p>
                       </div>
                    ) : markupRules.map((rule) => (
                      <div key={rule.id} className="p-4 rounded-xl border border-border bg-card flex items-center justify-between group hover:border-primary/30 transition-all shadow-sm">
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="text-[8px] uppercase font-bold h-4 bg-primary/5 text-primary border-none">
                              {rule.targetProvider === 'all' ? 'All Providers' : rule.targetProvider}
                            </Badge>
                            <Badge variant="outline" className="text-[8px] uppercase font-bold px-1.5 py-0 h-4 border-muted-foreground/20 text-muted-foreground">{rule.targetType}</Badge>
                            <span className="text-xs font-bold text-foreground/80 truncate">
                              {rule.targetValue === 'all' ? 'Global Default' : rule.targetValue}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                             <div className="flex items-center gap-1">
                                <span className="font-mono bg-muted px-1.5 rounded">Rp {(rule.minPrice || 0).toLocaleString()}</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                                <span className="font-mono bg-muted px-1.5 rounded">Rp {(rule.maxPrice || 999999999).toLocaleString()}</span>
                             </div>
                             <div className="h-3 w-px bg-border mx-1" />
                             <p className="text-[11px] font-bold text-primary flex items-center gap-1.5">
                                {rule.markupType === 'nominal' ? <Coins className="w-3 h-3" /> : <Percent className="w-3 h-3" />}
                                Markup: {rule.markupType === 'nominal' ? `+ Rp ${rule.value.toLocaleString()}` : `+ ${rule.value}%`}
                             </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-md shrink-0" onClick={() => removeRule(rule.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Cari SKU, Nama Produk, Brand..." 
              className="pl-10 h-12 bg-card border-border rounded-xl shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-12 px-6 rounded-xl gap-2 font-bold text-xs bg-card border-border">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 rounded-2xl border-border p-5 space-y-6" align="end">
              <div className="flex items-center justify-between">
                 <h4 className="font-headline font-bold text-sm">Advanced Filter</h4>
                 <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold text-primary gap-1" onClick={resetFilters}>
                   <RotateCcw className="w-3 h-3" /> Reset
                 </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Provider</Label>
                  <Select 
                    value={filters.provider} 
                    onValueChange={(v) => {
                      setFilters(prev => ({...prev, provider: v, brand: 'all'}));
                    }}
                  >
                    <SelectTrigger className="h-10 rounded-lg bg-muted/50 border-none font-medium text-xs">
                      <SelectValue placeholder="Semua Provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">Semua Provider</SelectItem>
                      <SelectItem value="DigiFlazz" className="text-xs">DigiFlazz</SelectItem>
                      <SelectItem value="Orderkuota" className="text-xs">Orderkuota</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Tipe Layanan</Label>
                  <Select value={filters.type} onValueChange={(v) => setFilters({...filters, type: v})}>
                    <SelectTrigger className="h-10 rounded-lg bg-muted/50 border-none font-medium text-xs">
                      <SelectValue placeholder="Semua Tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">Semua Tipe</SelectItem>
                      {availableTypes.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Brand</Label>
                  <Select value={filters.brand} onValueChange={(v) => setFilters({...filters, brand: v})}>
                    <SelectTrigger className="h-10 rounded-lg bg-muted/50 border-none font-medium text-xs">
                      <SelectValue placeholder="Semua Brand" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      <SelectItem value="all" className="text-xs">Semua Brand</SelectItem>
                      {availableFilterBrands.map(brand => (
                        <SelectItem key={brand} value={brand} className="text-xs">{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Status Produk</Label>
                  <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
                    <SelectTrigger className="h-10 rounded-lg bg-muted/50 border-none font-medium text-xs">
                      <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">Semua Status</SelectItem>
                      <SelectItem value="active" className="text-xs">Active (Ready)</SelectItem>
                      <SelectItem value="offline" className="text-xs">Offline / Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Card className="border-border shadow-sm rounded-2xl overflow-hidden bg-card flex flex-col min-h-[600px]">
          <CardHeader className="px-8 py-5 border-b border-border bg-muted/30 dark:bg-[#0A0A0A] shrink-0">
             <div className="flex items-center justify-between">
               <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                  <LayoutGrid className="w-4 h-4 text-primary" />
                  PPOB Master Catalog
               </CardTitle>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-bold text-muted-foreground uppercase">Rows:</span>
                     <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(parseInt(v))}>
                        <SelectTrigger className="h-8 w-24 text-[10px] font-bold rounded-md bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                           <SelectItem value="10" className="text-[10px]">10 Rows</SelectItem>
                           <SelectItem value="25" className="text-[10px]">25 Rows</SelectItem>
                           <SelectItem value="50" className="text-[10px]">50 Rows</SelectItem>
                           <SelectItem value="100" className="text-[10px]">100 Rows</SelectItem>
                           <SelectItem value="250" className="text-[10px]">250 Rows</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold border-border bg-background">{filteredProducts.length.toLocaleString()} Products</Badge>
               </div>
             </div>
          </CardHeader>
          <div className="overflow-x-auto flex-1">
             <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">Provider</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">Type</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">SKU</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">Product Name</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap text-center">Brand</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap text-right">Base Price</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap text-center">Status</TableHead>
                    <th className="w-[100px]"></th>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={8} className="px-8 py-4"><Skeleton className="h-4 w-full" /></TableCell>
                      </TableRow>
                    ))
                  ) : paginatedProducts.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="py-20 text-center text-muted-foreground italic font-medium">Database kosong atau produk tidak ditemukan.</TableCell></TableRow>
                  ) : (
                    paginatedProducts.map((prod) => (
                        <TableRow key={`${prod.buyer_sku_code}-${prod.provider}`} className="border-border/50 group hover:bg-muted/30 transition-colors">
                          <TableCell className="px-8 py-4 whitespace-nowrap">
                            <Badge variant="secondary" className="border-none font-bold text-[9px] rounded-md uppercase bg-primary/5 text-primary">{prod.provider}</Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="outline" className={`text-[8px] font-bold uppercase h-5 px-1.5 border-border ${prod.type === 'Prepaid' ? 'text-primary' : 'text-primary/60'}`}>{prod.type}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-[10px] font-bold text-primary whitespace-nowrap uppercase">{prod.buyer_sku_code}</TableCell>
                          <TableCell className="font-medium text-xs whitespace-nowrap">{prod.product_name}</TableCell>
                          <TableCell className="text-center whitespace-nowrap">
                             <Badge variant="outline" className="text-[9px] uppercase font-bold border-border whitespace-nowrap bg-background">{prod.brand}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono text-[11px] whitespace-nowrap font-medium">Rp {prod.price.toLocaleString('id-ID')}</TableCell>
                          <TableCell className="text-center whitespace-nowrap">
                             <Badge className={`${prod.buyer_product_status ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} border-none font-bold text-[9px] uppercase px-1.5 h-4 whitespace-nowrap`}>{prod.buyer_product_status ? 'Active' : 'Offline'}</Badge>
                          </TableCell>
                          <TableCell className="px-8 whitespace-nowrap">
                             <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent rounded-md"><Edit2 className="w-3.5 h-3.5" /></Button>
                             </div>
                          </TableCell>
                        </TableRow>
                      )
                    )
                  )}
                </TableBody>
             </Table>
          </div>
          
          {!loading && filteredProducts.length > 0 && (
            <div className="px-8 py-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                 Showing <span className="text-foreground">{startRange}</span> to <span className="text-foreground">{endRange}</span> of <span className="text-foreground">{filteredProducts.length.toLocaleString()}</span> products
              </p>
              <div className="flex items-center gap-2">
                 <Button variant="outline" size="icon" className="h-8 w-8 rounded-md bg-background" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft className="w-3.5 h-3.5" /></Button>
                 <Button variant="outline" size="icon" className="h-8 w-8 rounded-md bg-background" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}><ChevronLeft className="w-3.5 h-3.5" /></Button>
                 <div className="px-4 h-8 flex items-center justify-center bg-background border border-border rounded-md min-w-[80px]"><span className="text-[10px] font-bold">Page {currentPage} of {totalPages || 1}</span></div>
                 <Button variant="outline" size="icon" className="h-8 w-8 rounded-md bg-background" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || totalPages === 0}><ChevronRight className="w-3.5 h-3.5" /></Button>
                 <Button variant="outline" size="icon" className="h-8 w-8 rounded-md bg-background" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0}><ChevronsRight className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
