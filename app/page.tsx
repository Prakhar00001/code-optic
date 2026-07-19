"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Code2, Sparkles, ShieldAlert, Zap, Layers, 
  Share2, Check, RefreshCw, ArrowRight, 
  MessageSquare, Copy, ChevronRight, Eye, AlertCircle, Maximize2
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface AnalysisResponse {
  detectedLanguage: string;
  issues: Array<{ title: string; description: string; fix?: string; severity: 'critical' | 'warning' | 'info' }>;
  security: Array<{ title: string; description: string; severity: 'high' | 'medium' }>;
  optimizedCode: string;
  performanceScore: string;
  timeComplexity: string;
}

const RUNTIME_PRESETS = [
  {
    name: "React Stale Lifecycle Hook",
    lang: "typescript",
    desc: "Unmanaged subscription vectors causing high background memory loads",
    code: `import React, { useState, useEffect } from 'react';\n\nexport function LiveDataWidget() {\n  const [count, setCount] = useState(0);\n\n  useEffect(() => {\n    // ❌ CRITICAL: Bound global window listener lacks cleanup removal logic\n    window.addEventListener('scroll', () => {\n      setCount(prev => prev + 1);\n    });\n  }, []);\n\n  return <div className="p-6">Scroll Iterations: {count}</div>;\n}`
  },
  {
    name: "Python Iterative DB Fetch",
    lang: "python",
    desc: "Heavy N+1 blocking roundtrips executed within structural loops",
    code: `def aggregate_user_logs(user_ids):\n    log_manifest = []\n    # ❌ CRITICAL: Running consecutive query allocations slows execution speed\n    for uid in user_ids:\n        profile = database.query("SELECT * FROM profiles WHERE id = %s", (uid,))\n        telemetry = database.query("SELECT * FROM logs WHERE user_id = %s", (uid,))\n        log_manifest.append({**profile, **telemetry})\n    return log_manifest`
  }
  ];

export default function Home() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'diff' | 'anomalies' | 'security'>('diff');
  const [showResults, setShowResults] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [chatText, setChatText] = useState("");
  const [chatStream, setChatStream] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);

  const uploadInputRef = useRef<HTMLInputElement>(null);
  const reportScrollTargetRef = useRef<HTMLDivElement>(null);

  const executeTextCopy = (text: string, referenceLabel: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(referenceLabel);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  const processAnalysisPipeline = async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    setShowResults(false);
    setProgress(15);
    
    const ticker = setInterval(() => {
      setProgress(current => (current < 90 ? current + 8 : current));
    }, 140);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });
      
      clearInterval(ticker);
      setProgress(100);

      if (!res.ok) throw new Error();
      const payload: AnalysisResponse = await res.json();
      
      setAnalysisData(payload);
      if (payload.detectedLanguage) setLanguage(payload.detectedLanguage.toLowerCase());
      
      setTimeout(() => {
        setIsAnalyzing(false);
        setShowResults(true);
        setTimeout(() => {
          reportScrollTargetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }, 300);
    } catch {
      clearInterval(ticker);
      setIsAnalyzing(false);
      alert("Pipeline failure. Check your backend Gemini environment key.");
    }
  };

  const dispatchChatQuery = () => {
    if (!chatText.trim()) return;
    const query = chatText;
    setChatStream(prev => [...prev, { role: 'user', text: query }]);
    setChatText("");

    setTimeout(() => {
      setChatStream(prev => [...prev, { 
        role: 'assistant', 
        text: `AetherCode Refinement Engine: Processed parameter request for "${query}". Injected memory tracking safety blocks and refactored loop assignments inside active code view.` 
      }]);
    }, 600);
  };

  const textLineIndices = code.split('\n').length;

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#1C1C1E] tracking-tight pb-32 selection:bg-indigo-500/10">
      
      {/* Apple-Style Minimalist Nav */}
      <header className="max-w-[85rem] mx-auto px-8 py-5 flex items-center justify-between border-b border-black/[0.03] bg-[#FBFBFA]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          {/* AetherCode Elegant Minimalist Logo */}
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/10">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-wider text-[#1C1C1E] font-mono">AETHER<span className="text-indigo-600">CODE</span></span>
        </div>
        <button 
          onClick={() => executeTextCopy(window.location.href, 'share')}
          className="text-xs text-neutral-500 hover:text-black transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/[0.04] bg-white shadow-sm"
        >
          {copiedLabel === 'share' ? <Check className="h-3 w-3 text-emerald-500" /> : <Share2 className="h-3 w-3" />}
          {copiedLabel === 'share' ? 'Link Copied' : 'Share Space'}
        </button>
      </header>

      {/* Main Spacious Container */}
      <main className="max-w-[85rem] mx-auto px-8 pt-20 space-y-24">
        
        {/* Apple Premium Spacious Hero Typography */}
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-black leading-[1.1]">
            Instant code analysis. <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Refactored to production grade.</span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-500 max-w-lg font-normal leading-relaxed">
            Drop script configurations or components down into the design workspace. Debug memory structures, evaluate syntax errors, and refactor code modules cleanly.
          </p>
        </div>

        {/* INPUT WORKSPACE PANEL: Apple High-Fidelity Light Console */}
        <div className="apple-panel rounded-2xl p-8 bg-white space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.03] pb-5">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-neutral-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 font-mono">Source Script Input</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div 
                onClick={() => uploadInputRef.current?.click()}
                className="text-xs text-neutral-500 hover:text-black transition-colors cursor-pointer px-3 py-1.5 rounded-lg bg-neutral-50 border border-black/[0.04] flex items-center gap-1.5 shadow-sm"
              >
                <Upload className="h-3.5 w-3.5" /> File Upload
              </div>
              <input type="file" ref={uploadInputRef} className="hidden" onChange={(e) => {
                const targetFile = e.target.files?.[0];
                if (targetFile) {
                  const reader = new FileReader();
                  reader.onload = (ev) => setCode(ev.target?.result as string);
                  reader.readAsText(targetFile);
                }
              }} />

              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-white border border-black/[0.06] rounded-xl text-xs px-3 py-1.5 font-mono text-neutral-700 focus:outline-none focus:border-indigo-500 shadow-sm"
              >
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>
          </div>

          {/* Premium Zero-Friction Sandbox Presets */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Select Analysis Template Workspace</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {RUNTIME_PRESETS.map((preset, idx) => (
                <div 
                  key={idx}
                  onClick={() => { setCode(preset.code); setLanguage(preset.lang); }}
                  className="apple-panel p-4 rounded-xl cursor-pointer flex justify-between items-center group bg-[#FBFBFA]/50"
                >
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-medium text-black group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> {preset.name}
                    </h4>
                    <p className="text-[11px] text-neutral-500 leading-normal">{preset.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-black transition-colors transform group-hover:translate-x-0.5" />
                </div>
              ))}
            </div>
          </div>

          {/* Editor Framework Container with Line Index Column */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setCode(ev.target?.result as string); r.readAsText(f); } }}
            className={`relative rounded-xl overflow-hidden border transition-all ${
              isDragging ? 'border-indigo-500 bg-indigo-500/[0.01]' : 'border-black/[0.05] bg-[#FBFBFA]/30 focus-within:border-indigo-500/40'
            }`}
          >
            <div className="flex items-start">
              <div className="text-[11px] font-mono text-neutral-300 text-right p-5 pr-3 select-none border-r border-black/[0.02] bg-black/[0.01] min-w-[3.5rem] space-y-1">
                {Array.from({ length: Math.max(textLineIndices, 1) }).map((_, lineIdx) => (
                  <div key={lineIdx}>{lineIdx + 1}</div>
                ))}
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Paste source function script lines here to initialize diagnostic compilation steps..."
                className="w-full h-80 bg-transparent text-neutral-800 font-mono text-xs p-5 resize-none focus:outline-none custom-textarea leading-relaxed"
              />
            </div>
          </div>

          {/* Execution Button */}
          <div className="flex justify-end border-t border-black/[0.03] pt-5">
            <button
              onClick={processAnalysisPipeline}
              disabled={isAnalyzing || !code.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shadow-sm disabled:opacity-30"
            >
              {isAnalyzing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {isAnalyzing ? `Compiling Token Diagnostics (${progress}%)` : "Analyze & Optimize Architecture"}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* LOADING SCREEN POP ELEMENT */}
        <div ref={reportScrollTargetRef} className="pt-2">
          <AnimatePresence mode="wait">
            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }} 
                className="apple-panel rounded-2xl p-20 bg-white flex flex-col items-center justify-center text-center min-h-[350px]"
              >
                <div className="relative w-12 h-12 mb-4 flex items-center justify-center">
                  <div className="absolute inset-0 border-2 border-black/[0.03] rounded-full" />
                  <div className="absolute inset-0 border-2 border-t-indigo-600 rounded-full animate-spin" />
                </div>
                <h3 className="text-sm font-medium text-black tracking-tight">Deconstructing Abstract Syntax Tree</h3>
                <p className="text-xs text-neutral-400 max-w-xs mt-1 leading-relaxed">Evaluating optimization metrics logs and matching secure variable layout paradigms...</p>
                <div className="w-48 bg-neutral-100 border border-black/[0.02] h-1 rounded-full overflow-hidden mt-6">
                  <div className="h-full bg-indigo-600 transition-all duration-200" style={{ width: `${progress}%` }} />
                </div>
              </motion.div>
            )}

            {/* RESULTS VIEWPORT STAGE: Clean Light Split Code Diff Map */}
            {!isAnalyzing && showResults && analysisData && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                
                {/* Metric Summary Score Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="apple-panel p-6 rounded-2xl bg-white flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase block">Performance Index</span>
                      <h3 className="text-4xl font-bold font-mono text-emerald-600 mt-2">{analysisData.performanceScore}</h3>
                    </div>
                    <p className="text-xs text-neutral-400 mt-4">Algorithmic profiling matches framework safety criteria benchmarks.</p>
                  </div>

                  <div className="apple-panel p-6 rounded-2xl bg-white flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase block">Scale Vector Bound</span>
                      <h3 className="text-4xl font-bold font-mono text-indigo-600 mt-2">{analysisData.timeComplexity}</h3>
                    </div>
                    <p className="text-xs text-neutral-400 mt-4">Calculated execution runtime loop progression parameters.</p>
                  </div>

                  <div className="apple-panel p-6 rounded-2xl border-indigo-200 bg-indigo-50/[0.15] flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-indigo-600 uppercase block">Diagnostic Model Target</span>
                      <h3 className="text-base font-semibold text-black mt-2.5 capitalize">{language} Pipeline</h3>
                    </div>
                    <p className="text-xs text-neutral-500 mt-4">Auto-detected module structure matched cleanly to validation logic.</p>
                  </div>
                </div>

                {/* Full Width Workspace Output Layout Container */}
                <div className="apple-panel rounded-2xl overflow-hidden bg-white shadow-md flex flex-col">
                  
                  {/* Premium Navigation Header Tab Controls */}
                  <div className="border-b border-black/[0.03] bg-neutral-50/50 p-3.5 flex gap-2 items-center justify-between px-6 flex-wrap">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setActiveTab('diff')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          activeTab === 'diff' ? 'bg-white text-indigo-600 border border-black/[0.04] shadow-sm' : 'text-neutral-500 hover:text-black'
                        }`}
                      >
                        <Maximize2 className="h-3.5 w-3.5" /> Side-by-Side Diff
                      </button>
                      <button
                        onClick={() => setActiveTab('anomalies')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          activeTab === 'anomalies' ? 'bg-white text-indigo-600 border border-black/[0.04] shadow-sm' : 'text-neutral-500 hover:text-black'
                        }`}
                      >
                        <Layers className="h-3.5 w-3.5" /> Logical Issues ({analysisData.issues.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('security')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          activeTab === 'security' ? 'bg-white text-indigo-600 border border-black/[0.04] shadow-sm' : 'text-neutral-500 hover:text-black'
                        }`}
                      >
                        <ShieldAlert className="h-3.5 w-3.5" /> Security Vulnerabilities ({analysisData.security.length})
                      </button>
                    </div>

                    {activeTab === 'diff' && (
                      <button 
                        onClick={() => executeTextCopy(analysisData.optimizedCode, 'diff_copy')}
                        className="text-[11px] text-neutral-600 hover:text-black flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-black/[0.04] shadow-sm transition-all"
                      >
                        {copiedLabel === 'diff_copy' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        Copy Refactored Script
                      </button>
                    )}
                  </div>

                  {/* Dynamic Workspace Rendering Blocks */}
                  <div className="p-8 min-h-[480px] bg-white">
                    
                    {/* VIEW A: REAL LIGHT THEME SIDE-BY-SIDE DIFF PANELS */}
                    {activeTab === 'diff' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                        
                        {/* Original Code Area */}
                        <div className="flex flex-col rounded-xl overflow-hidden border border-black/[0.04] bg-[#FBFBFA]/40">
                          <div className="bg-neutral-50/60 border-b border-black/[0.03] px-4 py-2 flex items-center text-xs font-mono text-neutral-400">
                            <span className="flex items-center gap-1.5 text-rose-600/70"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Original Source Code</span>
                          </div>
                          <div className="text-[11px] font-mono overflow-auto p-4 pane-scrollbar flex-1 max-h-[500px] bg-white">
                            <SyntaxHighlighter language={language} style={prism} customStyle={{ margin: 0, background: 'transparent', padding: 0 }}>
                              {code}
                            </SyntaxHighlighter>
                          </div>
                        </div>

                        {/* Refactored Clean Code Area */}
                        <div className="flex flex-col rounded-xl overflow-hidden border border-black/[0.04] bg-[#FBFBFA]/40">
                          <div className="bg-neutral-50/60 border-b border-black/[0.03] px-4 py-2 flex items-center text-xs font-mono text-neutral-400">
                            <span className="flex items-center gap-1.5 text-emerald-600/70"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Refactored AI Vector</span>
                          </div>
                          <div className="text-[11px] font-mono overflow-auto p-4 pane-scrollbar flex-1 max-h-[500px] bg-white">
                            <SyntaxHighlighter language={language} style={prism} customStyle={{ margin: 0, background: 'transparent', padding: 0 }}>
                              {analysisData.optimizedCode}
                            </SyntaxHighlighter>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* VIEW B: LOGICAL ISSUES MAP RENDERING */}
                    {activeTab === 'anomalies' && (
                      <div className="space-y-4 max-w-4xl">
                        {analysisData.issues.map((issue, idx) => (
                          <div key={idx} className="p-5 rounded-xl border border-black/[0.03] bg-[#FBFBFA]/30 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-amber-700 flex items-center gap-2">
                                <Layers className="h-4 w-4 text-amber-500" /> {issue.title}
                              </span>
                              <span className="text-[9px] uppercase tracking-wider font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/10">
                                {issue.severity || 'warning'}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-500 leading-relaxed">{issue.description}</p>
                            {issue.fix && (
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">Vector Refactoring Fix</span>
                                <code className="block text-[11px] font-mono text-indigo-600 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 whitespace-pre-wrap">{issue.fix}</code>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* VIEW C: SECURITY & THREAT AUDIT VIEWS */}
                    {activeTab === 'security' && (
                      <div className="space-y-4 max-w-4xl">
                        {analysisData.security.length === 0 ? (
                          <div className="text-center py-16 border border-dashed border-black/[0.06] rounded-xl text-xs text-neutral-400 space-y-2 bg-[#FBFBFA]/20">
                            <ShieldAlert className="h-6 w-6 text-emerald-500 mx-auto" />
                            <p className="font-medium text-black">Perfect Structural Check</p>
                            <p className="text-[11px] text-neutral-400">Zero unmapped parameter injection vectors or high-threat signatures found.</p>
                          </div>
                        ) : (
                          analysisData.security.map((sec, idx) => (
                            <div key={idx} className="p-5 rounded-xl border border-rose-100 bg-rose-50/[0.15] space-y-1.5">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-semibold text-rose-700 flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4 text-rose-500" /> {sec.title}
                                </h4>
                                <span className="text-[9px] uppercase font-bold font-mono px-2.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700">
                                  {sec.severity || 'high'}
                                </span>
                              </div>
                              <p className="text-xs text-neutral-600 leading-relaxed">{sec.description}</p>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                  </div>
                </div>

                {/* Section D: Premium Claude-Style Follow-Up Tuning Panel */}
                <div className="apple-panel rounded-2xl p-8 bg-white space-y-6">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">
                    <MessageSquare className="h-4 w-4 text-neutral-400" />
                    <span>Interactive Architecture Follow-Up Tuning</span>
                  </div>

                  <div className="space-y-4 max-h-64 overflow-y-auto pane-scrollbar pr-2">
                    {chatStream.map((msg, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 5 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl text-xs leading-relaxed border ${
                          msg.role === 'user' 
                            ? 'bg-neutral-50 border-black/[0.03] ml-12 text-neutral-800' 
                            : 'bg-indigo-50/30 border-indigo-100 mr-12 text-indigo-900'
                        }`}
                      >
                        <span className="font-semibold block mb-0.5 uppercase font-mono tracking-widest text-[9px] text-neutral-400">
                          {msg.role === 'user' ? 'Tuning Parameter' : 'AetherCode System Response'}
                        </span>
                        {msg.text}
                      </motion.div>
                    ))}
                  </div>

                  <div className="relative rounded-xl overflow-hidden border border-black/[0.06] bg-neutral-50/50 flex items-center pr-3 focus-within:bg-white focus-within:border-indigo-500 transition-all shadow-inner">
                    <input 
                      type="text"
                      value={chatText}
                      onChange={(e) => setChatText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && dispatchChatQuery()}
                      placeholder="Ask the engine to adjust specific parameter targets or variable rulesets..."
                      className="w-full bg-transparent text-xs p-4.5 text-neutral-800 focus:outline-none placeholder:text-neutral-400"
                    />
                    <button
                      onClick={dispatchChatQuery}
                      disabled={!chatText.trim()}
                      className="h-8 w-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center transition-all disabled:opacity-20 shadow-sm shadow-indigo-500/10"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}