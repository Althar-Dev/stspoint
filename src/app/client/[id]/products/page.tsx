
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Package, 
  RefreshCcw,
  Tag,
  Database,
  Cloud
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { getOrderkuotaPPOBPricelist, type OrkutPPOBProduct } from "@/service/orderkuota";
import { getMongoProducts } from "@/service/mongodb";
import { toast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export default function ClientProductsPage() {
  const params = useParams();
  const { user } = useUser();
  const db = useFirestore();
  const [products, setProducts] = useState<OrkutPPOBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

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
          toast({ title: "Sync MongoDB", description: res.message });
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
      const matchesSearch = p.product_name.toLowerCase().includes(search.toLowerCase()) || 
                           p.buyer_sku_code.toLowerCase().includes(search.toLowerCase()) ||
                           p.brand.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || p.category.toLowerCase().includes(category.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => cats.add(p.category));
    return Array.from(cats).sort();
  }, [products]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 w-full min-w-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-headline font-bold tracking-tight text-foreground">Katalog <span className="text-primary">Produk</span></h1>
            {app?.type === 'website_appprem' && (
              <Badge variant="outline" className="bg-blue-500/5 text-blue-600 border-blue-500/20 text-[9px] font-bold uppercase h-5 px-2">
                <Cloud className="w-3 h-3 mr-1" /> MongoDB
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
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 shrink-0">
          <Button 
            variant={category === 'all' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setCategory('all')}
            className="rounded-md h-10 px-4 text-xs font-bold shrink-0"
          >
            Semua
          </Button>
          {categories.slice(0, 8).map(cat => (
            <Button 
              key={cat}
              variant={category === cat ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setCategory(cat)}
              className="rounded-md h-10 px-4 text-xs font-bold shrink-0"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <Card className="border-border shadow-sm rounded-xl overflow-hidden bg-card w-full min-w-0">
        <CardHeader className="px-6 py-4 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
          <CardTitle className="text-[10px] font-bold flex items-center gap-2 uppercase tracking-[0.2em] text-muted-foreground">
            {app?.type === 'website_appprem' ? <Database className="w-4 h-4 text-primary" /> : <Package className="w-4 h-4 text-primary" />}
            {app?.type === 'website_appprem' ? "Master Mongo Database" : "Master Product List"}
          </CardTitle>
        </CardHeader>
        
        <div className="w-full overflow-x-auto block">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">SKU Produk</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Nama Produk & Brand</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Kategori</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Tipe</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap text-right">Harga Jual</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground text-center whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-6 py-5"><Skeleton className="h-4 w-full" /></td></tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-24 text-center text-muted-foreground italic text-xs">Produk tidak ditemukan.</td></tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr key={`${prod.buyer_sku_code}-${prod.provider}`} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-[10px] font-bold text-primary whitespace-nowrap uppercase tracking-tighter">
                      {prod.buyer_sku_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-bold text-xs truncate max-w-[250px]">{prod.product_name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" /> {prod.brand}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[8px] font-bold uppercase px-2 py-0.5 rounded-sm">
                        {prod.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[10px] font-medium text-muted-foreground">{prod.type}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-primary text-xs whitespace-nowrap text-right">
                      Rp {(prod.price || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Badge className={`rounded-md border-none text-[8px] font-bold uppercase px-2 py-0.5 h-5 shadow-sm ${
                        prod.buyer_product_status ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                      }`}>
                        {prod.buyer_product_status ? 'Active' : 'Offline'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
