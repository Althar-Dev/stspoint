
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Smartphone, 
  Search, 
  ChevronRight,
  LayoutGrid,
  RefreshCcw,
  Tag,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  SmartphoneNfc
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
import React, { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import { getOrderkuotaPPOBPricelist, getMarkupRules, type OrkutPPOBProduct, type MarkupRule } from "@/service/orderkuota";

const CATEGORIES = [
  { id: "all", name: "Semua Kategori" },
  { id: "pulsa", name: "Pulsa" },
  { id: "data", name: "Paket Data" },
  { id: "pln", name: "Listrik PLN" },
  { id: "emoney", name: "E-Money" },
  { id: "game", name: "Voucher Game" },
];

const BRAND_ICONS: Record<string, string> = {
  "TELKOMSEL": "logos:telkomsel",
  "INDOSAT": "logos:indosat",
  "XL": "logos:xl",
  "AXIS": "logos:axis",
  "TRI": "logos:tri",
  "SMARTFREN": "logos:smartfren",
  "BYU": "logos:byu",
  "PLN": "logos:indonesia-pln",
  "DANA": "logos:dana",
  "GOPAY": "logos:gopay",
  "OVO": "logos:ovo",
  "SHOPEEPAY": "logos:shopeepay",
  "LINKAJA": "logos:linkaja",
  "MLBB": "simple-icons:mobilelegends",
  "FREE FIRE": "simple-icons:freefire",
  "PUBG": "simple-icons:pubg",
  "GRAB": "logos:grab",
  "GOJEK": "logos:gojek",
};

export default function PPOBConsolePage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<OrkutPPOBProduct[]>([]);
  const [markupRules, setMarkupRules] = useState<MarkupRule[]>([]);
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productRes, markupRes] = await Promise.all([
        getOrderkuotaPPOBPricelist(),
        getMarkupRules()
      ]);

      if (productRes.success) setProducts(productRes.data);
      if (markupRes.success) setMarkupRules(markupRes.data);
    } catch (error) {
      console.error("Failed to fetch PPOB data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const brands = useMemo(() => {
    const b = new Set<string>();
    products.forEach(p => { 
      const matchesCategory = selectedCategory === "all" || p.category.toLowerCase().includes(selectedCategory.toLowerCase()) || p.type.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesType = selectedType === "all" || p.type.toLowerCase() === selectedType.toLowerCase();
      if (p.brand && matchesCategory && matchesType) b.add(p.brand.toUpperCase()); 
    });
    return Array.from(b).sort();
  }, [products, selectedCategory, selectedType]);

  const getProductMarkup = (product: OrkutPPOBProduct): MarkupRule | null => {
    const specificProviderRules = markupRules.filter(r => r.targetProvider === product.provider);
    const globalRules = markupRules.filter(r => r.targetProvider === 'all');

    const checkSet = (rules: MarkupRule[]) => {
      const candidates = rules.filter(r => {
        const min = r.minPrice || 0;
        const max = r.maxPrice || 999999999;
        return product.price >= min && product.price <= max;
      });

      const skuRule = candidates.find(r => r.targetType === 'sku' && r.targetValue.toUpperCase() === product.buyer_sku_code.toUpperCase());
      if (skuRule) return skuRule;

      const brandRule = candidates.find(r => r.targetType === 'brand' && r.targetValue.toLowerCase() === product.brand.toLowerCase());
      if (brandRule) return brandRule;
      
      const typeRule = candidates.find(r => r.targetType === 'type' && r.targetValue.toLowerCase() === product.type.toLowerCase());
      if (typeRule) return typeRule;
      
      const globRule = candidates.find(r => r.targetType === 'global');
      if (globRule) return globRule;
      
      return null;
    };

    return checkSet(specificProviderRules) || checkSet(globalRules);
  };

  const getPascaMarkupInfo = (product: OrkutPPOBProduct) => {
    const relevantRules = markupRules.filter(r => 
      (r.targetProvider === 'all' || r.targetProvider === product.provider) &&
      (
        (r.targetType === 'sku' && r.targetValue.toUpperCase() === product.buyer_sku_code.toUpperCase()) ||
        (r.targetType === 'brand' && r.targetValue.toUpperCase() === product.brand.toUpperCase()) ||
        (r.targetType === 'type' && r.targetValue.toLowerCase() === product.type.toLowerCase()) ||
        (r.targetType === 'global')
      )
    );

    if (relevantRules.length === 0) return null;

    const skuRules = relevantRules.filter(r => r.targetType === 'sku');
    const brandRules = relevantRules.filter(r => r.targetType === 'brand');
    const typeRules = relevantRules.filter(r => r.targetType === 'type');
    const globalRules = relevantRules.filter(r => r.targetType === 'global');

    const priorityGroup = skuRules.length > 0 ? skuRules : 
                          brandRules.length > 0 ? brandRules : 
                          typeRules.length > 0 ? typeRules : globalRules;

    const values = priorityGroup.map(r => {
      if (r.markupType === 'nominal') return product.price + r.value;
      return Math.ceil(product.price * (1 + r.value / 100));
    });

    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    return {
      min: minVal,
      max: maxVal,
      isRange: minVal !== maxVal
    };
  };

  const calculateSellPrice = (basePrice: number, product: OrkutPPOBProduct) => {
    const rule = getProductMarkup(product);
    if (!rule) return basePrice;
    
    if (rule.markupType === 'nominal') {
      return basePrice + rule.value;
    } else {
      return Math.ceil(basePrice * (1 + rule.value / 100));
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.product_name.toLowerCase().includes(search.toLowerCase()) ||
        p.buyer_sku_code.toLowerCase().includes(search.toLowerCase());
      const matchesBrand = selectedBrand === "all" || p.brand.toUpperCase() === selectedBrand;
      const matchesCategory = selectedCategory === "all" || 
        p.category.toLowerCase().includes(selectedCategory.toLowerCase()) || 
        p.type.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesType = selectedType === "all" || p.type.toLowerCase() === selectedType.toLowerCase();
      return matchesSearch && matchesBrand && matchesCategory && matchesType;
    });
  }, [products, search, selectedBrand, selectedCategory, selectedType]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const startRange = filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endRange = Math.min(currentPage * itemsPerPage, filteredProducts.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedBrand, selectedCategory, selectedType, itemsPerPage]);

  return (
    <div className="grid grid-cols-1 w-full gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
            console 
            <ChevronRight className="w-3 h-3 text-muted-foreground/30" />
            service 
            <ChevronRight className="w-3 h-3 text-muted-foreground/30" />
            <span className="text-foreground">ppob catalog</span>
          </h1>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9 px-4 rounded-md font-bold text-[10px] uppercase tracking-widest gap-2"
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      <div className="w-full space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              className="pl-11 h-11 bg-card border-border rounded-xl shadow-sm text-sm" 
              placeholder="Cari produk atau SKU..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedType} onValueChange={(v) => {
              setSelectedType(v);
              setSelectedBrand("all");
            }}>
              <SelectTrigger className="h-11 w-full sm:w-40 bg-card border-border rounded-xl font-bold text-xs shadow-sm">
                <div className="flex items-center gap-2">
                  <SmartphoneNfc className="w-3.5 h-3.5 text-primary/50" />
                  <SelectValue placeholder="Tipe" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                <SelectItem value="all" className="text-xs rounded-lg">Semua Tipe</SelectItem>
                <SelectItem value="prepaid" className="text-xs rounded-lg">Prabayar</SelectItem>
                <SelectItem value="pasca" className="text-xs rounded-lg">Pascabayar</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={(v) => {
              setSelectedCategory(v);
              setSelectedBrand("all");
            }}>
              <SelectTrigger className="h-11 w-full sm:w-44 bg-card border-border rounded-xl font-bold text-xs shadow-sm">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-3.5 h-3.5 text-primary/50" />
                  <SelectValue placeholder="Kategori" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="text-xs rounded-lg">{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="h-11 w-full sm:w-44 bg-card border-border rounded-xl font-bold text-xs shadow-sm">
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-primary/50" />
                  <SelectValue placeholder="Semua Brand" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border max-h-[250px]">
                <SelectItem value="all" className="text-xs rounded-lg">Semua Brand</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand} className="text-xs rounded-lg">
                    <div className="flex items-center gap-2">
                      <Icon icon={BRAND_ICONS[brand] || "ph:hash-bold"} className="w-3.5 h-3.5" />
                      {brand}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="flex flex-col w-full border border-border/50 shadow-sm rounded-xl overflow-hidden bg-card min-h-[500px]">
          <CardHeader className="px-4 md:px-8 py-5 border-b border-border/50 bg-slate-50/50 dark:bg-[#0A0A0A] shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
                <Smartphone className="w-4 h-4 text-primary" />
                Daftar Produk PPOB
              </CardTitle>
              <div className="flex items-center gap-4">
                <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(parseInt(v))}>
                  <SelectTrigger className="h-8 w-24 text-[10px] font-bold rounded-md bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10" className="text-[10px]">10 Baris</SelectItem>
                    <SelectItem value="25" className="text-[10px]">25 Baris</SelectItem>
                    <SelectItem value="50" className="text-[10px]">50 Baris</SelectItem>
                    <SelectItem value="100" className="text-[10px]">100 Baris</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="outline" className="text-[10px] font-bold border-border bg-background">
                  {filteredProducts.length.toLocaleString()} Produk
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 flex-1 overflow-hidden">
            <div className="w-full h-full overflow-auto">
              <Table className="w-full min-w-[900px] border-collapse">
                <TableHeader className="bg-slate-50/50 dark:bg-white/5 sticky top-0 z-10">
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="px-4 md:px-8 font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">SKU</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">Type</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">Brand</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">Name</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap text-right">Price</TableHead>
                    <TableHead className="px-4 md:px-8 font-bold text-[10px] uppercase tracking-widest text-right whitespace-nowrap">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="px-4 md:px-8 py-4"><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                        <TableCell className="text-right px-4 md:px-8"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : paginatedProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-20 text-center text-muted-foreground italic">
                        Tidak ada produk ditemukan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedProducts.map((item) => {
                      return (
                        <TableRow key={`${item.buyer_sku_code}-${item.provider}`} className="border-border/50 hover:bg-slate-50/50 transition-colors">
                          <TableCell className="px-4 md:px-8 py-4 font-mono text-[10px] text-primary font-bold uppercase whitespace-nowrap">
                            {item.buyer_sku_code}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="outline" className={`text-[8px] font-bold uppercase h-4 px-1.5 border-border ${item.type === 'Prepaid' ? 'text-blue-500' : 'text-amber-500'}`}>
                              {item.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-bold text-xs whitespace-nowrap">
                            <Badge variant="secondary" className="bg-muted text-muted-foreground border-none font-bold text-[9px] rounded-md uppercase">
                              {item.brand}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-xs whitespace-nowrap max-w-[250px] truncate">
                            {item.product_name}
                          </TableCell>
                          <TableCell className="font-bold text-primary text-xs whitespace-nowrap text-right font-mono">
                            {item.type === 'Pasca' ? (
                              (() => {
                                const range = getPascaMarkupInfo(item);
                                return range ? (
                                  range.isRange 
                                    ? `Rp ${range.min.toLocaleString('id-ID')} - ${range.max.toLocaleString('id-ID')}` 
                                    : `Rp ${range.min.toLocaleString('id-ID')}`
                                ) : `Rp ${item.price.toLocaleString('id-ID')}`;
                              })()
                            ) : (
                              `Rp ${calculateSellPrice(item.price, item).toLocaleString('id-ID')}`
                            )}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap px-4 md:px-8">
                            <Badge className={`${
                              item.buyer_product_status ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-red-600'
                            } border-none text-[8px] font-bold px-2 py-0.5 rounded-sm uppercase`}>
                              {item.buyer_product_status ? 'Active' : 'Offline'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          
          {!loading && filteredProducts.length > 0 && (
            <div className="px-4 md:px-8 py-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 w-full">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center sm:text-left">
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
                  <span className="text-[10px] font-bold">Page {currentPage} of {totalPages || 1}</span>
                </div>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-md bg-background" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || totalPages === 0}>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-md bg-background" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0}>
                  <ChevronsRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
