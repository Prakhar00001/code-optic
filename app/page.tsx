"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileText, Code2, Sparkles, ShieldAlert, 
  Zap, Layers, Share2, Check, RefreshCw, Terminal
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface AnalysisResponse {
  detectedLanguage: string;
  issues: Array<{ title: string; description: string; fix?: string }>;
  security: Array<{ title: string; description: string }>;
  optimizedCode: string;
  performanceScore: string;
  timeComplexity: string;
}

const EXAMPLES = [
  {
    name: "React Bug (Memory Leak)",
    lang: "typescript",
    code: `import React, { useState, useEffect } from 'react';\n\nexport function UserDashboard() {\n  const [data, setData] = useState(null);\n\n  useEffect(() => {\n    // ❌ BUG: Event listener added but never cleaned up\n    window.addEventListener('resize', () => {\n      console.log(window.innerWidth);\n    });\n\n    // ❌ BUG: Uncontrolled fetch request\n    fetch('https://api.dev/user')\n      .then(res => res.json())\n      .then(data => setData(data));\n  }, []);\n\n  return <div>Dashboard for {data?.name}</div>;\n}`
  },
  {
    name: "Python Performance Issue",
    lang: "python",
    code: `def process_user_data(user_ids):\n    results = []\n    # ❌ PERFORMANCE: N+1 Database query execution inside a loop\n    for user_id in user_ids:\n        user = db.query("SELECT * FROM users WHERE id = %s", (user_id,))\n        profile = db.query("SELECT * FROM profiles WHERE user_id = %s", (user_id,))\n        results.append({**user, **profile})\n    return results`
  }
];

export default function Home() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'issues' | 'security' | 'optimized'>('issues');
  const [showResults, setShowResults] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCodeChange = (val: string) => {
    setCode(val);
    if (val.includes('def ') || val.includes('import os')) {
      setLanguage('python');
    } else if (val.includes('import React') || val.includes('const ')) {
      setLanguage('typescript');
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      handleCodeChange(text);
      if (file.name.endsWith('.py')) setLanguage('python');
      if (file.name.endsWith('.js') || file.name.endsWith('.jsx')) setLanguage('javascript');
      if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) setLanguage('typescript');
    };
    reader.readAsText(file);
  };

  const runAnalysis = async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    setProgress(15);
    
    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev < 85 ? prev + 12 : prev));
    }, 250);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });

      clearInterval(progressTimer);
      setProgress(100);

      if (!response.ok) throw new Error('Analysis pipeline failed');
      
      const data: AnalysisResponse = await response.json();
      
      if (data.detectedLanguage) {
        setLanguage(data.detectedLanguage.toLowerCase());
      }
      
      setAnalysisData(data);
      setTimeout(() => {
        setIsAnalyzing(false);
        setShowResults(true);
      }, 300);

    } catch (err) {
      clearInterval(progressTimer);
      setIsAnalyzing(false);
      alert("Pipeline failure. Confirm your environment API key environment setup.");
    }
  };

  return (
    <div className="min-h-screen text-slate-100 selection:bg-indigo-500/30 glow-glow">
      <header className="border-b border-white/5 bg-[#060913]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Terminal className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-white text-lg">CODE<span className="text-indigo-400">OPTIC</span></span>
            <span className="ml-2 text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono">AI Engine</span>
          </div>
        </div>
        <button 
          onClick={() => { setCopied(true); navigator.clipboard.writeText(window.location.href); setTimeout(() => setCopied(false), 2000); }}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors glass-panel px-3 py-1.5 rounded-lg"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
          {copied ? "Link Copied!" : "Share Architecture"}
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-indigo-400" />
                <h2 className="font-semibold text-sm text-white">Source Workspace</h2>
              </div>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-lg text-xs px-2.5 py-1.5 font-mono text-indigo-300 focus:outline-none"
              >
                <option value="typescript">TypeScript / React</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCodeChange(ex.code)}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-white/5 border border-white/5 hover:border-indigo-500/40 hover:bg-white/10 transition-all text-slate-300"
                >
                  ⚡ {ex.name}
                </button>
              ))}
            </div>

            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 hover:border-white/10 bg-slate-950/20'
              }`}
            >
              <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
              <Upload className="h-6 w-6 mb-2 text-slate-500" />
              <p className="text-xs text-slate-300">Drag & Drop file or <span className="text-indigo-400 underline">browse</span></p>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-white/5">
              <textarea
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="// Paste production code here or use a judge sandbox preset above..."
                className="w-full h-72 bg-transparent text-slate-300 font-mono text-xs p-4 resize-none focus:outline-none leading-relaxed"
              />
            </div>

            <button
              onClick={runAnalysis}
              disabled={isAnalyzing || !code.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAnalyzing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {isAnalyzing ? `Deconstructing AST Vectors (${progress}%)` : "Run Diagnostic Analysis"}
            </button>
          </div>
        </div>

        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {isAnalyzing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-panel rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[480px]">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
                <h3 className="text-base font-semibold text-white">Generating Multi-Language Diagnostics</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1">Parsing compiler token layouts and mapping optimization targets...</p>
              </motion.div>
            )}

            {!isAnalyzing && !showResults && (
              <div className="border border-white/5 bg-slate-950/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center border-dashed min-h-[480px]">
                <FileText className="h-10 w-10 text-slate-600 mb-2" />
                <h3 className="text-sm font-medium text-slate-400">Diagnostics Idle</h3>
                <p className="text-xs text-slate-500 mt-1">Submit a code snippet to view the interactive analysis tree.</p>
              </div>
            )}

            {!isAnalyzing && showResults && (
              <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[480px]">
                <div className="border-b border-white/5 bg-slate-950/40 p-2 flex gap-1">
                  {(['issues', 'security', 'optimized'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`capitalize px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                        activeTab === tab ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab === 'issues' && `Anomalies (${analysisData?.issues.length || 0})`}
                      {tab === 'security' && `Security (${analysisData?.security.length || 0})`}
                      {tab === 'optimized' && 'Refactored Pipeline'}
                    </button>
                  ))}
                </div>

                <div className="p-6 flex-1 space-y-4">
                  {activeTab === 'issues' && analysisData?.issues.map((issue, i) => (
                    <div key={i} className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 flex gap-3">
                      <Layers className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-semibold text-amber-300">{issue.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{issue.description}</p>
                        {issue.fix && <code className="block mt-2 text-[10px] font-mono text-amber-400 bg-amber-950/40 p-1.5 rounded">{issue.fix}</code>}
                      </div>
                    </div>
                  ))}

                  {activeTab === 'security' && (
                    analysisData?.security.length === 0 ? (
                      <div className="text-center py-12 text-xs text-slate-400"><ShieldAlert className="h-6 w-6 mx-auto text-emerald-400 mb-2"/>Perfect structural profile. Zero threats detected.</div>
                    ) : (
                      analysisData?.security.map((sec, i) => (
                        <div key={i} className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/15 flex gap-3">
                          <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-xs font-semibold text-rose-300">{sec.title}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">{sec.description}</p>
                          </div>
                        </div>
                      ))
                    )
                  )}

                  {activeTab === 'optimized' && (
                    <div className="rounded-xl overflow-hidden border border-white/5 text-[11px]">
                      <SyntaxHighlighter language={language} style={coldarkDark} customStyle={{ margin: 0, padding: '1rem', background: '#03050a' }}>
                        {analysisData?.optimizedCode || ''}
                      </SyntaxHighlighter>
                    </div>
                  )}
                </div>

                <div className="bg-slate-950/40 border-t border-white/5 p-4 flex justify-between items-center text-xs text-slate-400 font-mono">
                  <div>Score: <span className="text-emerald-400">{analysisData?.performanceScore}</span></div>
                  <div>Complexity: <span className="text-indigo-400">{analysisData?.timeComplexity}</span></div>
                  <div className="text-[10px] uppercase bg-slate-900 px-2 py-0.5 rounded text-slate-500">{language}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}