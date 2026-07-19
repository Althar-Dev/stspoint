"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CodeBlockProps {
  title: string;
  code: string;
  type: string;
}

export function CodeBlock({ title, code, type }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({ title: "Copied!", description: "Code snippet copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  const highlight = (str: string) => {
    if (type.includes('json')) {
      return str
        .replace(/"([^"]+)":/g, '<span class="text-amber-400">"$1"</span>:')
        .replace(/: "([^"]+)"/g, ': <span class="text-emerald-400">"$1"</span>')
        .replace(/: (\d+)/g, ': <span class="text-blue-400">$1</span>')
        .replace(/: (true|false)/g, ': <span class="text-blue-400">$1</span>');
    }
    if (type.includes('curl') || type.includes('shell')) {
      return str
        .replace(/^(curl)/g, '<span class="text-emerald-400 font-bold">$1</span>')
        .replace(/(-X POST|-X GET|-H |-d)/g, '<span class="text-blue-400">$1</span>')
        .replace(/(https?:\/\/[^\s]+)/g, '<span class="text-amber-400 underline">$1</span>');
    }
    if (type.includes('js') || type.includes('node')) {
      return str
        .replace(/(const|await|async|let|var|import|from|require)/g, '<span class="text-purple-400 font-bold">$1</span>')
        .replace(/(fetch|console\.log|JSON\.stringify)/g, '<span class="text-blue-400">$1</span>')
        .replace(/'([^']+)'/g, '<span class="text-emerald-400">\'$1\'</span>');
    }
    if (type.includes('python')) {
      return str
        .replace(/(import|from|as|print)/g, '<span class="text-purple-400 font-bold">$1</span>')
        .replace(/(requests\.post|requests\.get)/g, '<span class="text-blue-400">$1</span>')
        .replace(/"([^"]+)"/g, '<span class="text-emerald-400">"$1"</span>');
    }
    if (type.includes('php')) {
      return str
        .replace(/(<\?php|\?>|echo|curl_init|curl_setopt|curl_exec|curl_close|json_encode)/g, '<span class="text-purple-400 font-bold">$1</span>')
        .replace(/"([^"]+)"/g, '<span class="text-emerald-400">"$1"</span>')
        .replace(/(CURLOPT_[A-Z_]+)/g, '<span class="text-blue-400">$1</span>');
    }
    return str;
  };

  return (
    <div className="space-y-3 my-6 w-full max-w-full min-w-0">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Terminal className="w-3 h-3" />
          {title}
        </span>
      </div>
      <div className="rounded-2xl overflow-hidden border border-border shadow-xl bg-[#0D0D0D] w-full max-w-full">
        <div className="bg-white/5 px-4 h-10 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/40"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/40"></div>
          </div>
          <button 
            onClick={copyToClipboard}
            className="p-1.5 rounded hover:bg-white/5 text-muted-foreground hover:text-white transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="py-4 md:py-6 font-mono text-[11px] md:text-[12px] leading-relaxed text-zinc-300 overflow-x-auto custom-scrollbar w-full">
          <pre className="w-fit max-w-full px-6 md:px-8" dangerouslySetInnerHTML={{ __html: highlight(code) }} />
        </div>
      </div>
    </div>
  );
}
