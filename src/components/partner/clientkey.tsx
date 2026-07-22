"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Ticket, 
  Plus, 
  Copy, 
  Search, 
  Loader2, 
  Key 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

export function ClientKeyManagement() {
  const db = useFirestore();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const keysQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "Client_Keys");
  }, [db]);

  const { data: licenseKeys, loading } = useCollection(keysQuery);

  const filteredKeys = useMemo(() => {
    const s = search.toLowerCase();
    return licenseKeys.filter(k => 
      k.key?.toLowerCase().includes(s) || 
      k.name?.toLowerCase().includes(s)
    ).sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [licenseKeys, search]);

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
  };

  const handleGenerateKey = async () => {
    if (!newClientName) {
      toast({ variant: "destructive", title: "Name Required", description: "Please enter the client name." });
      return;
    }

    setIsGenerating(true);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomPart = '';
    for (let i = 0; i < 8; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const key = `STS-Client_${randomPart}`;
    
    const keyData = {
      key: key,
      name: newClientName,
      status: 'unused',
      createdAt: serverTimestamp(),
    };

    if (!db) return;
    const keyRef = doc(db, "Client_Keys", key);

    setDoc(keyRef, keyData)
      .then(() => {
        setGeneratedKey(key);
        toast({ title: "Key Generated", description: "The new Client Key has been saved." });
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: keyRef.path,
          operation: 'create',
          requestResourceData: keyData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsGenerating(false);
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) { setGeneratedKey(""); setNewClientName(""); }
          }}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto h-11 bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-widest rounded-md px-6 gap-2">
                <Plus className="w-3.5 h-3.5" />
                Generate License
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[94%] sm:max-w-[425px] rounded-xl border-border p-6">
              <DialogHeader>
                <DialogTitle className="font-headline font-bold">New Client Key</DialogTitle>
                <DialogDescription className="text-xs">
                  Assign a one-time registration key for a specific partner.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Partner Business Name</Label>
                  <Input 
                    placeholder="e.g. TokoDigital Pro" 
                    value={newClientName} 
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="rounded-md h-12 focus:ring-primary/20"
                  />
                </div>
                {generatedKey && (
                  <div className="p-4 rounded-md bg-emerald-500/5 border border-emerald-500/20 space-y-2 animate-in zoom-in-95 duration-300">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Generated Key:</p>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-sm font-mono font-bold text-foreground break-all">{generatedKey}</code>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-md hover:bg-emerald-500/10 shrink-0"
                        onClick={() => copyToClipboard(generatedKey, "Client Key")}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                {!generatedKey ? (
                  <Button 
                    className="w-full h-11 rounded-md font-bold"
                    onClick={handleGenerateKey}
                    disabled={isGenerating || !newClientName}
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Create Key"}
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    className="w-full h-11 rounded-md font-bold"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Finished
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input 
              className="pl-9 rounded-md h-11 bg-card border-border focus:ring-primary/20 text-xs" 
              placeholder="Search keys..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card className="bg-card border-border rounded-md overflow-hidden shadow-sm">
        <CardHeader className="bg-muted/30 dark:bg-[#0A0A0A] px-6 py-4 border-b border-border">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Ticket className="w-4 h-4 text-purple-500" />
            License Keys Registry
          </CardTitle>
        </CardHeader>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-full text-[10px] md:text-xs text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Client Key</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Partner Name</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Status</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Generated At</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground/30 italic">Synchronizing keys...</td></tr>
              ) : filteredKeys.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground/30 italic">No records found.</td></tr>
              ) : (
                filteredKeys.map((item, i) => (
                  <tr key={i} className="hover:bg-muted/10 transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-primary whitespace-nowrap">{item.key}</td>
                    <td className="px-6 py-4 font-bold text-foreground/80 whitespace-nowrap">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${item.status === 'unused' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground/40'} border-none uppercase text-[8px] px-2 py-0.5 rounded-sm font-bold`}>
                          {item.status}
                        </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-[10px] whitespace-nowrap font-medium">
                      {item.createdAt ? format(item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt), "dd MMM yyyy HH:mm") : '---'}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-md hover:bg-muted"
                        onClick={() => copyToClipboard(item.key, "Client Key")}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
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