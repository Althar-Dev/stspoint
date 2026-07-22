
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  RefreshCcw,
  Tag,
  Database,
  Cloud,
  Star,
  ShoppingBag,
  CheckCircle2,
  Clock,
  ChevronRight,
  Package,
  Layers,
  ArrowRight,
  Info,
  ExternalLink,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import React, { useState, useEffect, useMemo } from "react";
import { getOrderkuotaPPOBPricelist, type OrkutPPOBProduct } from "@/service/orderkuota";
import { getMongoProducts } from "@/service/mongodb";
import { toast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function ClientProductsPage() {
  const params = useParams();
  const { user } = useUser();
  const db = useFirestore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  // Pagination for large datasets (PPOB)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const appId = params.id as string;

  const appRef = useMemoFirebase(() => {
    if (!db || !user?.uid || !appId) return null;
    return doc(db, "users", user.uid, "apps", appId);
  }, [db, user?.uid, appId]);

  const { data: app, loading: appLoading } = useDoc(appRef);

  const fetchProducts = async () => {
    if (appLoading || !app) return;
    
    setLoading(true);
    try {
      if (app.type === 'website_appprem') {
        const res = await getMongoProducts(user!.uid, appId);
        if (res.success) {
          setProducts(res.data);
        } else {
          toast({ variant: "destructive", title: "MongoDB Error", description: res.message });
        }
      } else {
        const res = await getOrderkuotaPPOBPricelist();
        if (res.success) {
          setProducts(res.data);
        }
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Gagal memuat katalog produk." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!appLoading && app) {
      fetchProducts();
    }
  }, [app, appLoading]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const name = (p.product_name || p.product || "").toLowerCase();
      const sku = (p.buyer_sku_code || p.id || "").toLowerCase();
      const brand = (p.brand || "").toLowerCase();
      const s = search.toLowerCase();
      
      const matchesSearch = name.includes(s) || sku.includes(s) || brand.includes(s);
      const matchesCategory = category === "all" || (p.category || "").toLowerCase().includes(category.toLowerCase());
      
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const startRange = filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endRange = Math.min(currentPage * itemsPerPage, filteredProducts.length);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => { if (p.category) cats.add(p.category); });
    return Array.from(cats).sort();
  }, [products]);

  // UI Helper: Web App Prem Card with Detail Dialog
  const MongoProductCard = ({ product }: { product: any }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="group border-border shadow-sm rounded-3xl overflow-hidden bg-card hover:border-primary/20 transition-all flex flex-col h-full cursor-pointer ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <div className="relative aspect-video w-full overflow-hidden bg-muted">
             {product.imageUrl ? (
               <img src={product.imageUrl} alt={product.product} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                  <Package className="w-12 h-12" />
               </div>
             )}
             <div className="absolute top-4 left-4 flex gap-2">
                <Badge className="bg-black/60 backdrop-blur-md border-none text-[8px] font-bold uppercase tracking-widest text-white">{product.category}</Badge>
             </div>
          </div>
          <CardContent className="p-5">
             <h3 className="font-headline font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">{product.product}</h3>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl rounded-3xl p-0 overflow-hidden border-border shadow-2xl max-h-[92vh] overflow-y-auto outline-none">
         <div className="relative aspect-[21/9] w-full overflow-hidden bg-muted border-b border-border">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.product} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                 <Package className="w-16 h-16" />
              </div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
               <Badge className="bg-black/60 backdrop-blur-md border-none text-[9px] font-bold uppercase tracking-widest text-white">{product.category}</Badge>
            </div>
         </div>
         
         <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="space-y-1">
                  <DialogTitle className="text-2xl font-headline font-bold text-foreground leading-tight">{product.product}</DialogTitle>
                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-bold uppercase tracking-tighter">
                     <span className="flex items-center gap-1.5"><ShoppingBag className="w-3.5 h-3.5" /> {product.sold || 0} Terjual</span>
                     <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Updated {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('id-ID') : 'N/A'}</span>
                  </div>
               </div>
               {product.rating && (
                  <div className="bg-amber-500/10 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-amber-500/20 w-fit">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-bold text-amber-600">{product.rating} / 5.0</span>
                  </div>
               )}
            </div>

            <DialogDescription className="space-y-3 block">
               <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-2">
                  <Info className="w-3.5 h-3.5" /> Deskripsi Layanan
               </span>
               <span className="text-sm text-muted-foreground leading-relaxed block bg-muted/30 p-4 rounded-2xl border border-border/50">
                  {product.description}
               </span>
            </DialogDescription>

            {product.featured && product.featured.length > 0 && (
               <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Fitur Utama</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                     {product.featured.map((f: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-foreground/80">
                           <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                           {f}
                        </div>
                     ))}
                  </div>
               </div>
            )}

            <div className="space-y-4">
               <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" /> Paket Tersedia
               </h4>
               <div className="grid grid-cols-1 gap-3">
                  {product.packages?.map((pkg: any) => (
                    <div key={pkg.id} className="p-4 rounded-2xl bg-muted/30 border border-border flex items-center justify-between hover:bg-muted/50 transition-colors group">
                       <div className="min-w-0">
                          <p className="text-sm font-bold truncate">{pkg.name}</p>
                          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter flex items-center gap-1.5 mt-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Stok Ready: {pkg.stock?.length || 0}
                          </p>
                       </div>
                       <div className="text-right shrink-0 ml-4">
                          <p className="text-sm font-bold text-primary">Rp {pkg.price?.toLocaleString('id-ID')}</p>
                          <Badge variant="outline" className="text-[8px] font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity">ID: {pkg.id}</Badge>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            
            <div className="pt-4 border-t border-border flex justify-between items-center opacity-40">
               <span className="text-[9px] font-mono uppercase">Internal ID: {product.id}</span>
               <span className="text-[9px] font-bold uppercase tracking-widest">STSPoint Partner Node</span>
            </div>
         </div>
      </DialogContent>
    </Dialog>
  );

  // UI Helper: Flat PPOB Card
  const FlatProductCard = ({ p }: { p: any }) => (
    <Card className="group border-border shadow-sm rounded-2xl overflow-hidden bg-card hover:border-primary/20 transition-all shadow-none">
      <CardContent className="p-5 space-y-3">
         <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
               <Layers className="w-4.5 h-4.5" />
            </div>
            <Badge className={cn(
              "border-none text-[8px] font-bold uppercase px-2 h-5 rounded-md",
              p.buyer_product_status ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
            )}>
              {p.buyer_product_status ? 'Active' : 'Offline'}
            </Badge>
         </div>

         <div className="space-y-0.5">
            <h4 className="font-bold text-xs truncate leading-snug">{p.product_name}</h4>
            <p className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
               <Tag className="w-2.5 h-2.5" /> {p.brand}
            </p>
         </div>

         <div className="pt-2 border-t border-border flex items-center justify-between">
            <div className="space-y-0.5">
               <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Harga Jual</p>
               <p className="text-xs font-bold text-primary">Rp {(p.price || 0).toLocaleString('id-ID')}</p>
            </div>
            <div className="text-right">
               <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">SKU</p>
               <p className="text-[9px] font-mono font-bold text-foreground/40">{p.buyer_sku_code}</p>
            </div>
         </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 w-full min-w-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-headline font-bold tracking-tight text-foreground">Katalog <span className="text-primary">Produk</span></h1>
            {app?.type === 'website_appprem' && (
              <Badge variant="outline" className="bg-blue-500/5 text-blue-600 border-blue-500/20 text-[9px] font-bold uppercase h-5 px-2">
                <Cloud className="w-3 h-3 mr-1" /> MongoDB Live
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-xs md:text-sm">Pantau daftar layanan dan harga produk yang tersedia di website Anda.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchProducts} disabled={loading} className="h-9 px-4 rounded-md font-bold text-[10px] uppercase tracking-widest gap-2">
          <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Sinkronisasi
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Cari SKU, Nama Produk, atau Brand..." 
            className="pl-10 rounded-md border-border bg-card h-10 text-sm shadow-sm w-full"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 shrink-0">
          <Button 
            variant={category === 'all' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => { setCategory('all'); setCurrentPage(1); }}
            className="rounded-md h-10 px-4 text-xs font-bold shrink-0"
          >
            Semua
          </Button>
          {categories.slice(0, 8).map(cat => (
            <Button 
              key={cat}
              variant={category === cat ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => { setCategory(cat); setCurrentPage(1); }}
              className="rounded-md h-10 px-4 text-xs font-bold shrink-0"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-3xl" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
           <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center opacity-20">
              <Package className="w-8 h-8" />
           </div>
           <p className="text-sm font-medium text-muted-foreground italic">Produk tidak ditemukan atau katalog masih kosong.</p>
        </div>
      ) : app?.type === 'website_appprem' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
           {filteredProducts.map((product) => (
             <MongoProductCard key={product.id || product._id} product={product} />
           ))}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
             {paginatedProducts.map((p) => (
               <FlatProductCard key={`${p.buyer_sku_code}-${p.provider}`} p={p} />
             ))}
          </div>

          {/* Pagination for PPOB */}
          {totalPages > 1 && (
            <div className="px-4 py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Showing <span className="text-foreground">{startRange}</span> to <span className="text-foreground">{endRange}</span> of <span className="text-foreground">{filteredProducts.length.toLocaleString()}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-md bg-background" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-md bg-background" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <div className="px-4 h-8 flex items-center justify-center bg-background border border-border rounded-md min-w-[80px]">
                  <span className="text-[10px] font-bold">Page {currentPage} of {totalPages}</span>
                </div>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-md bg-background" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-md bg-background" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                  <ChevronsRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
