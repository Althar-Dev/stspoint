
"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Copy, 
  Search, 
  Loader2, 
  Layout,
  Globe,
  Bot,
  ShieldCheck,
  Key as KeyIcon,
  ShoppingBag,
  Zap,
  Database,
  Lock,
  Table as TableIcon,
  User as UserIcon
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

export function AppKeyManagement() {
  const db = useFirestore();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAppName, setNewAppName] = useState("");
  const [appType, setAppType] = useState<"website_topup" | "website_appprem" | "bot">("website_topup");
  const [botToken, setBotToken] = useState("");
  const [mongoUser, setMongoUser] = useState("");
  const [mongoPass, setMongoPass] = useState("");
  const [mongoDb, setMongoDb] = useState("");
  const [mongoCol, setMongoCol] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const keysQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "Application_Keys");
  }, [db]);

  const { data: appKeys, loading } = useCollection(keysQuery);

  const filteredKeys = useMemo(() => {
    const s = search.toLowerCase();
    return appKeys.filter(k => 
      k.key?.toLowerCase().includes(s) || 
      k.name?.toLowerCase().includes(s)
    ).sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [appKeys, search]);

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
  };

  const handleGenerateKey = async () => {
    if (!newAppName) {
      toast({ variant: "destructive", title: "Name Required", description: "Please enter the application name." });
      return;
    }

    if (appType === "bot" && !botToken) {
      toast({ variant: "destructive", title: "Token Required", description: "Bots must have an access token." });
      return;
    }

    if (appType === "website_appprem" && (!mongoUser || !mongoPass || !mongoDb || !mongoCol)) {
      toast({ variant: "destructive", title: "MongoDB Details Required", description: "Web App Prem requires full MongoDB connection info." });
      return;
    }

    setIsGenerating(true);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomPart = '';
    for (let i = 0; i < 12; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const key = `STS-App_${randomPart}`;
    
    const keyData = {
      key: key,
      name: newAppName,
      type: appType,
      token: appType === "bot" ? botToken.trim() : "",
      mongoUser: appType === "website_appprem" ? mongoUser.trim() : "",
      mongoPass: appType === "website_appprem" ? mongoPass.trim() : "",
      mongoDb: appType === "website_appprem" ? mongoDb.trim() : "",
      mongoCol: appType === "website_appprem" ? mongoCol.trim() : "",
      status: 'unused',
      createdAt: serverTimestamp(),
    };

    if (!db) return;
    const keyRef = doc(db, "Application_Keys", key);

    setDoc(keyRef, keyData)
      .then(() => {
        setGeneratedKey(key);
        toast({ title: "Key Generated", description: "The new Application Activation Key has been saved." });
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
            if (!open) { 
              setGeneratedKey(""); 
              setNewAppName(""); 
              setAppType("website_topup");
              setBotToken("");
              setMongoUser("");
              setMongoPass("");
              setMongoDb("");
              setMongoCol("");
            }
          }}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-widest rounded-md px-6 gap-2 border-none shadow-lg shadow-blue-600/20">
                <Plus className="w-3.5 h-3.5" />
                Generate Activation Key
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[94%] sm:max-w-[425px] rounded-[2rem] border-border p-8 max-h-[90vh] overflow-y-auto">
              <DialogHeader className="space-y-2">
                <DialogTitle className="font-headline font-bold text-2xl">New Application Key</DialogTitle>
                <DialogDescription className="text-xs">
                  Create an activation key for a partner to launch their app instance.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Application Name</Label>
                  <Input 
                    placeholder="e.g. MyStore Panel" 
                    value={newAppName} 
                    onChange={(e) => setNewAppName(e.target.value)}
                    className="rounded-xl h-12 focus:ring-primary/20 bg-muted/30 border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Application Type</Label>
                  <Select value={appType} onValueChange={(v: any) => setAppType(v)}>
                    <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-transparent">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="website_topup">Website (Topup)</SelectItem>
                      <SelectItem value="website_appprem">Website (App Prem)</SelectItem>
                      <SelectItem value="bot">Automation Bot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {appType === "bot" && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Access Token</Label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Bot Token (e.g. 7329xxxx)" 
                        value={botToken} 
                        onChange={(e) => setBotToken(e.target.value)}
                        className="rounded-xl h-12 pl-10 focus:ring-primary/20 bg-muted/30 border-transparent font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                {appType === "website_appprem" && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">MongoDB Source (Database & Col)</Label>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="relative">
                            <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                              placeholder="Database" 
                              value={mongoDb} 
                              onChange={(e) => setMongoDb(e.target.value)}
                              className="rounded-xl h-11 pl-10 focus:ring-primary/20 bg-muted/30 border-transparent font-mono text-xs"
                            />
                         </div>
                         <div className="relative">
                            <TableIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                              placeholder="Collection" 
                              value={mongoCol} 
                              onChange={(e) => setMongoCol(e.target.value)}
                              className="rounded-xl h-11 pl-10 focus:ring-primary/20 bg-muted/30 border-transparent font-mono text-xs"
                            />
                         </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Auth Credentials</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          placeholder="Mongo Username" 
                          value={mongoUser} 
                          onChange={(e) => setMongoUser(e.target.value)}
                          className="rounded-xl h-11 pl-10 focus:ring-primary/20 bg-muted/30 border-transparent font-mono text-xs"
                        />
                      </div>
                      <div className="relative mt-2">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          type="password"
                          placeholder="Mongo Password" 
                          value={mongoPass} 
                          onChange={(e) => setMongoPass(e.target.value)}
                          className="rounded-xl h-11 pl-10 focus:ring-primary/20 bg-muted/30 border-transparent font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {generatedKey && (
                  <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-3 animate-in zoom-in-95 duration-300">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-600">Generated Activation Key:</p>
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-xs font-mono font-bold text-foreground break-all">{generatedKey}</code>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-md hover:bg-blue-500/10 shrink-0"
                          onClick={() => copyToClipboard(generatedKey, "Activation Key")}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                {!generatedKey ? (
                  <Button 
                    className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-blue-600/10"
                    onClick={handleGenerateKey}
                    disabled={isGenerating || !newAppName || (appType === "bot" && !botToken) || (appType === "website_appprem" && (!mongoUser || !mongoPass || !mongoDb || !mongoCol))}
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <KeyIcon className="w-4 h-4 mr-2" />}
                    Create Activation Key
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest text-[11px] border-border"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Close Dialog
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input 
              className="pl-9 rounded-md h-11 bg-card border-border focus:ring-primary/20 text-xs shadow-sm" 
              placeholder="Search app keys..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card className="bg-card border-border rounded-md overflow-hidden shadow-sm">
        <CardHeader className="bg-muted/30 dark:bg-[#0A0A0A] px-6 py-4 border-b border-border">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Layout className="w-4 h-4 text-blue-500" />
            Application Activation Registry
          </CardTitle>
        </CardHeader>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-full text-[10px] md:text-xs text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Activation Key</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">App Name</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-center whitespace-nowrap">Type</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Status</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Issued At</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground/30 italic">Synchronizing registry...</td></tr>
              ) : filteredKeys.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground/30 italic">No records found.</td></tr>
              ) : (
                filteredKeys.map((item, i) => (
                  <tr key={i} className="hover:bg-muted/10 transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600 whitespace-nowrap">{item.key}</td>
                    <td className="px-6 py-4 font-bold text-foreground/80 whitespace-nowrap">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                       <div className="flex justify-center">
                          {item.type === "bot" ? (
                            <Badge variant="outline" className="border-purple-500/20 text-purple-600 bg-purple-500/5 gap-1.5 h-6 rounded-md">
                               <Bot className="w-3 h-3" /> Bot
                            </Badge>
                          ) : item.type === "website_topup" ? (
                            <Badge variant="outline" className="border-blue-500/20 text-blue-600 bg-blue-500/5 gap-1.5 h-6 rounded-md">
                               <ShoppingBag className="w-3 h-3" /> Topup
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-amber-500/20 text-amber-600 bg-amber-500/5 gap-1.5 h-6 rounded-md">
                               <Zap className="w-3 h-3" /> App Prem
                            </Badge>
                          )}
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${item.status === 'unused' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground/40'} border-none uppercase text-[8px] px-2 py-0.5 rounded-sm font-bold`}>
                          {item.status === 'used' ? `Active (${item.usedBy?.substring(0,6)})` : item.status}
                        </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-[10px] whitespace-nowrap font-medium">
                      {item.createdAt ? format(item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt), "dd MMM yyyy HH:mm") : '---'}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-md hover:bg-muted"
                          onClick={() => copyToClipboard(item.key, "Activation Key")}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
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
