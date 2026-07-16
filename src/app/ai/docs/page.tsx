
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Copy, 
  Cpu,
  Terminal,
  Zap,
  Info,
  Code2,
  Check,
  Braces,
  ArrowRightLeft,
  Activity
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

export default function AiDocsPage() {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    toast({ title: "Copied!", description: `${type} copied to clipboard.` });
    setTimeout(() => setCopiedType(null), 2000);
  };

  const snippets = {
    curl: `curl -X POST https://api.stspoint.id/ai/chat \\
  -H "Content-Type: application/json" \\
  -d '{
    "secret_key": "STS-Key-XXXXXXXX",
    "messages": [{"role": "user", "content": "Halo AI!"}],
    "model": "sts-core",
    "stream": true
  }'`,
    js: `const response = await fetch('https://api.stspoint.id/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    secret_key: 'STS-Key-XXXXXXXX',
    messages: [{ role: 'user', content: 'Halo AI!' }],
    model: 'sts-core',
    stream: true
  })
});

// Membaca respon streaming
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  process.stdout.write(chunk); // Tampilkan teks real-time
}`,
    python: `import requests

url = "https://api.stspoint.id/ai/chat"
payload = {
    "secret_key": "STS-Key-XXXXXXXX",
    "messages": [{"role": "user", "content": "Halo AI!"}],
    "model": "sts-core",
    "stream": True
}

response = requests.post(url, json=payload, stream=True)
for chunk in response.iter_content(chunk_size=None):
    if chunk:
        print(chunk.decode('utf-8'), end='', flush=True)`,
    php: `<?php
$url = "https://api.stspoint.id/ai/chat";
$payload = [
    "secret_key" => "STS-Key-XXXXXXXX",
    "messages" => [["role" => "user", "content" => "Halo AI!"]],
    "model" => "sts-core",
    "stream" => true
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($ch, $data) {
    echo $data;
    return strlen($data);
});
curl_exec($ch);
curl_close($ch);
?>`
  };

  const responseCode = `{
  "success": true,
  "data": {
    "content": "Halo! Saya asisten AI STS. Apa ada yang bisa saya bantu?",
    "model": "sts-core",
    "timestamp": "2024-10-24T08:42:11Z",
    "usage": {
       "total": 12,
       "limit": 50
    }
  }
}`;

  const CodeBlock = ({ title, code, type, icon }: { title: string, code: string, type: string, icon?: string }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Braces className="w-3 h-3" />
          {title}
        </span>
      </div>
      <div className="rounded-xl overflow-hidden border border-border shadow-sm">
        <div className="bg-zinc-50 dark:bg-zinc-900/50 px-4 h-10 flex items-center justify-between border-b border-border dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
            </div>
            <div className="flex items-center cursor-default">
              {icon && <Icon icon={icon} className="w-4 h-4 opacity-80 text-foreground" />}
            </div>
          </div>
          <button 
            onClick={() => copyToClipboard(code, type)}
            className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all active:scale-90"
          >
            {copiedType === type ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="bg-white dark:bg-[#0D0D0D] font-mono text-[11px] leading-relaxed flex overflow-x-auto overflow-y-hidden">
          <div className="py-4 px-3 text-right text-zinc-400 dark:text-white/20 select-none border-r border-zinc-100 dark:border-white/5 min-w-[40px] bg-zinc-50/50 dark:bg-black/20">
            {code.split('\n').map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <div className="p-4 flex-1 text-zinc-700 dark:text-white/80">
            <pre className="whitespace-pre">
              {code.split('\n').map((line, i) => {
                const highlightedLine = line
                  .replace(/"([^"]+)":/g, '<span class="text-amber-600 dark:text-amber-400">"$1"</span>:')
                  .replace(/: "([^"]+)"/g, ': <span class="text-emerald-600 dark:text-emerald-400">"$1"</span>')
                  .replace(/: (true|false|True|False)/g, ': <span class="text-blue-600 dark:text-blue-400">$1</span>')
                  .replace(/\/\/ (.+)/g, '<span class="text-zinc-400 dark:text-white/30 italic">// $1</span>')
                  .replace(/(const|await|fetch|import|requests|post|print|function|echo|json_encode|json_decode|while|break|decode|encode)/g, '<span class="text-purple-600 dark:text-purple-400">$1</span>');
                
                return <div key={i} dangerouslySetInnerHTML={{ __html: highlightedLine || ' ' }} />;
              })}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-32 animate-in fade-in duration-500">
      <section id="intro" className="space-y-4 pt-4 scroll-mt-24">
        <h1 className="text-3xl font-headline font-bold tracking-tight leading-tight">
          STS Artificial <span className="text-amber-500">Intelligence</span> <br />
          API Reference
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
          STSGenKit menyediakan gerbang kecerdasan buatan terpadu yang dirancang untuk performa tinggi melalui API REST yang aman. Mendukung respon **Streaming** untuk pengalaman asisten pintar yang instan.
        </p>
      </section>

      <section id="models" className="space-y-8 pt-8 border-t border-border scroll-mt-24">
        <div className="flex items-center gap-2 text-amber-500">
          <Cpu className="w-4 h-4" />
          <h2 className="text-[11px] font-bold uppercase tracking-widest">Available Models</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'STS Lite', model: 'sts-lite', desc: 'Sangat cepat untuk percakapan ringan dan klasifikasi teks sederhana.' },
            { id: 'STS Core', model: 'sts-core', desc: 'Keseimbangan logika dan kecepatan. Ideal untuk asisten virtual.' },
            { id: 'STS Prime', model: 'sts-prime', desc: 'Kemampuan penalaran kompleks dan pemahaman konteks besar.' },
          ].map((m) => (
            <div key={m.id} className="p-5 border border-border rounded-xl bg-muted/30 space-y-3 flex flex-col justify-between group hover:border-amber-500/30 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{m.id}</span>
                  <Badge variant="outline" className="text-[9px] uppercase font-bold text-emerald-600 bg-emerald-50 border-emerald-100">Live</Badge>
                </div>
                <code className="text-[10px] font-mono text-amber-600 font-bold block">{m.model}</code>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="chat-api" className="space-y-8 pt-8 border-t border-border scroll-mt-24">
        <div className="flex items-center gap-2 text-amber-500">
          <Code2 className="w-4 h-4" />
          <h2 className="text-[11px] font-bold uppercase tracking-widest">Chat API Reference</h2>
        </div>
        
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Endpoint utama untuk melakukan interaksi percakapan dengan model AI STS. Mendukung riwayat pesan untuk pemahaman konteks.
            </p>

            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 w-fit">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">POST</span>
              <div className="w-px h-3 bg-zinc-300 dark:bg-zinc-700" />
              <code className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">https://api.stspoint.id/ai/chat</code>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <Tabs defaultValue="curl" className="w-full">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Terminal className="w-3 h-3" />
                    Example Request (Streaming)
                  </span>
                  <TabsList className="bg-muted h-7 p-0.5 rounded-lg">
                    <TabsTrigger value="curl" className="text-[9px] h-6 rounded-md uppercase font-bold px-2.5">cURL</TabsTrigger>
                    <TabsTrigger value="js" className="text-[9px] h-6 rounded-md uppercase font-bold px-2.5">JS</TabsTrigger>
                    <TabsTrigger value="python" className="text-[9px] h-6 rounded-md uppercase font-bold px-2.5">Py</TabsTrigger>
                    <TabsTrigger value="php" className="text-[9px] h-6 rounded-md uppercase font-bold px-2.5">PHP</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="curl" className="mt-0">
                  <CodeBlock title="Shell" code={snippets.curl} type="curl" icon="logos:bash" />
                </TabsContent>
                <TabsContent value="js" className="mt-0">
                  <CodeBlock title="JavaScript Fetch" code={snippets.js} type="js" icon="logos:javascript" />
                </TabsContent>
                <TabsContent value="python" className="mt-0">
                  <CodeBlock title="Python Requests" code={snippets.python} type="python" icon="logos:python" />
                </TabsContent>
                <TabsContent value="php" className="mt-0">
                  <CodeBlock title="PHP cURL / Stream" code={snippets.php} type="php" icon="logos:php" />
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="space-y-6">
              <CodeBlock title="Success Response (Non-Streaming)" code={responseCode} type="response" icon="logos:json" />
              
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-4">
                <span className="text-emerald-600 shrink-0 mt-0.5">
                  <Activity className="w-4 h-4" />
                </span>
                <p className="text-[11px] leading-relaxed font-medium text-emerald-900">
                  Respon Streaming akan mengirimkan potongan teks langsung secara bertahap dengan <code className="text-emerald-700 font-bold">Content-Type: text/plain</code>.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-4">
             <div className="flex items-center gap-2 px-1">
                <Info className="w-4 h-4 text-amber-500" />
                <h4 className="font-bold text-xs uppercase tracking-wider">Parameters Detail</h4>
             </div>
             <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-left text-[11px]">
                   <thead className="bg-muted/50 border-b border-border">
                      <tr>
                         <th className="px-4 py-3 font-bold uppercase tracking-widest text-muted-foreground">Parameter</th>
                         <th className="px-4 py-3 font-bold uppercase tracking-widest text-muted-foreground">Type</th>
                         <th className="px-4 py-3 font-bold uppercase tracking-widest text-muted-foreground">Required</th>
                         <th className="px-4 py-3 font-bold uppercase tracking-widest text-muted-foreground">Description</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-border">
                      <tr>
                         <td className="px-4 py-3 font-mono font-bold text-amber-600">secret_key</td>
                         <td className="px-4 py-3 text-muted-foreground">String</td>
                         <td className="px-4 py-3"><Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none text-[9px] font-bold uppercase px-1.5 h-4">Yes</Badge></td>
                         <td className="px-4 py-3 text-muted-foreground leading-relaxed">Kunci rahasia API Anda. Dapat ditemukan di dashboard Console &gt; Developer &gt; API Keys.</td>
                      </tr>
                      <tr>
                         <td className="px-4 py-3 font-mono font-bold text-amber-600">messages</td>
                         <td className="px-4 py-3 text-muted-foreground">Array&lt;Object&gt;</td>
                         <td className="px-4 py-3"><Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none text-[9px] font-bold uppercase px-1.5 h-4">Yes</Badge></td>
                         <td className="px-4 py-3 text-muted-foreground leading-relaxed">Daftar pesan percakapan. Tiap objek harus memiliki properti "role" (user/assistant) dan "content".</td>
                      </tr>
                      <tr>
                         <td className="px-4 py-3 font-mono font-bold text-amber-600">model</td>
                         <td className="px-4 py-3 text-muted-foreground">String</td>
                         <td className="px-4 py-3"><Badge variant="outline" className="text-[9px] font-bold uppercase px-1.5 h-4 border-border text-muted-foreground">No</Badge></td>
                         <td className="px-4 py-3 text-muted-foreground leading-relaxed">ID model yang digunakan. Default ke "sts-core" jika tidak disertakan.</td>
                      </tr>
                      <tr>
                         <td className="px-4 py-3 font-mono font-bold text-amber-600">stream</td>
                         <td className="px-4 py-3 text-muted-foreground">Boolean</td>
                         <td className="px-4 py-3"><Badge variant="outline" className="text-[9px] font-bold uppercase px-1.5 h-4 border-border text-muted-foreground">No</Badge></td>
                         <td className="px-4 py-3 text-muted-foreground leading-relaxed">Aktifkan respon streaming. Default ke <code className="text-amber-600">false</code>.</td>
                      </tr>
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      </section>

      <section id="json-mode" className="space-y-8 pt-8 border-t border-border scroll-mt-24">
        <div className="flex items-center gap-2 text-amber-500">
          <Terminal className="w-4 h-4" />
          <h2 className="text-[11px] font-bold uppercase tracking-widest">Structured Output</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dapatkan respon dalam format JSON yang valid untuk mempermudah pemrosesan data otomatis di sistem Anda.
            </p>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-4">
              <span className="text-amber-600 shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </span>
              <p className="text-[11px] leading-relaxed font-medium text-amber-900">
                Tip: Sertakan instruksi "Return only JSON" atau skema objek yang diharapkan di dalam pesan sistem untuk hasil maksimal.
              </p>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border shadow-xl">
            <div className="flex items-center gap-2 mb-4">
               <ArrowRightLeft className="w-4 h-4 text-amber-500" />
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Auto-Parsing Example</span>
            </div>
            <pre className="text-[11px] font-mono leading-relaxed">
               <span className="text-muted-foreground/60">{"// System Instruction"}</span><br />
               <span className="text-emerald-600 dark:text-emerald-400">"Output as JSON with keys: category, confidence"</span><br /><br />
               <span className="text-foreground/40">{"// AI Response Data"}</span><br />
               <span className="text-foreground">{"{"}</span><br />
               <span className="text-amber-600 dark:text-amber-400 pl-4">"category"</span>: <span className="text-emerald-600 dark:text-emerald-400">"Customer Support"</span>,<br />
               <span className="text-amber-600 dark:text-amber-400 pl-4">"confidence"</span>: <span className="text-blue-600 dark:text-blue-400">0.98</span><br />
               <span className="text-foreground">{"}"}</span>
            </pre>
          </div>
        </div>
      </section>

      <div className="text-center pt-8 border-t border-border">
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.4em] opacity-30">STSPoint AI Engine • v1.0.5-stable</p>
      </div>
    </div>
  );
}
