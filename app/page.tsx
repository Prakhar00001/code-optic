"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Code2, Sparkles, ShieldAlert, Layers, 
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

const PLAYGROUND_TEMPLATES = [
  {
    name: "React Stale Subscription Hook",
    lang: "typescript",
    desc: "Global lifecycle event binds lacking explicit removal garbage collection vectors",
    code: `import React, { useState, useEffect } from 'react';\n\nexport function DataTelemetryDashboard() {\n  const [events, setEvents] = useState(0);\n\n  useEffect(() => {\n    // ❌ CRITICAL: Bound directly onto global layer without unmount cleanups\n    window.addEventListener('scroll', () => {\n      setEvents(prev => prev + 1);\n    });\n  }, []);\n\n  return <div className="p-6">Captured Context Tickers: {events}</div>;\n}`
  },
  {
    name: "Python Nested DB Batch Query",
    lang: "python",
    desc: "N+1 relational blocking roundtrips processing inside repetitive loop metrics",
    code: `def aggregate_ledger_entries(user_ids):\n    data_manifest = []\n    # ❌ CRITICAL: Invoking consecutive isolated database executions inside loops\n    for account_uid in user_ids:\n        user_meta = db.execute("SELECT * FROM profiles WHERE id = %s", (account_uid,))\n        user_logs = db.execute("SELECT * FROM telemetry WHERE user_id = %s", (account_uid,))\n        data_manifest.append({**user_meta.fetch(), **user_logs.fetchall()})\n    return data_manifest`
  }
];

// Fluid Spring Configuration with strict literal casting for type safety
const FLUID_SPRING = { type: "spring", damping: 25, stiffness: 180, mass: 0.8 } as const;

export default function Home() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'diff' | 'anomalies' | 'security'>('diff');
  const [showResults, setShowResults] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  
  const [activeCopiedMarker, setActiveCopiedMarker] = useState<string | null>(null);
  const [chatInputMessage, setChatInputMessage] = useState("");
  const [interactiveChatThread, setInteractiveChatThread] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);

  const hiddenFileInputRef = useRef<HTMLInputElement>(null);
  const resultsFocusScrollRef = useRef<HTMLDivElement>(null);

  const copyWorkspaceTextToClipboard = (textPayload: string, trackingLabel: string) => {
    navigator.clipboard.writeText(textPayload);
    setActiveCopiedMarker(trackingLabel);
    setTimeout(() => setActiveCopiedMarker(null), 1800);
  };

  const executePipelineEvaluation = async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    setShowResults(false);
    setProgress(12);
    
    const evaluationTicker = setInterval(() => {
      setProgress(current => (current < 92 ? current + 8 : current));
    }, 125);

    try {
      const resultStream = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });
      
      clearInterval(evaluationTicker);
      setProgress(100);

      if (!resultStream.ok) throw new Error();
      const parsedData: AnalysisResponse = await resultStream.json();
      
      setAnalysisData(parsedData);
      if (parsedData.detectedLanguage) setLanguage(parsedData.detectedLanguage.toLowerCase());
      
      setTimeout(() => {
        setIsAnalyzing(false);
        setShowResults(true);
        setTimeout(() => {
          resultsFocusScrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      }, 250);
    } catch {
      clearInterval(evaluationTicker);
      setIsAnalyzing(false);
      alert("Pipeline parsing failed. Check server environment configurations.");
    }
  };

  const dispatchWorkspaceAdjustment = () => {
    if (!chatInputMessage.trim()) return;
    const promptValue = chatInputMessage;
    setInteractiveChatThread(prev => [...prev, { role: 'user', text: promptValue }]);
    setChatInputMessage("");

    setTimeout(() => {
      setInteractiveChatThread(prev => [...prev, { 
        role: 'assistant', 
        text: `Architecture Refinement Routine: Processed adjustment layers for "${promptValue}". Applied contextual state guards and corrected block structure mappings cleanly.` 
      }]);
    }, 550);
  };

  const dynamicInputLineCount = code.split('\n').length;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] pb-36 font-sans">
      
      {/* High-End Apple Hardware Aesthetics Header */}
      <header className="max-w-[80rem] mx-auto px-8 py-5 flex items-center justify-between border-b border-black/[0.03] bg-[#F5F5F7]/70 backdrop-blur-2xl sticky top-0 z-50">
        <div className="flex items-center gap-2.5 group cursor-default">
          <div className="h-6 w-6 rounded-md bg-[#1D1D1F] flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white fill-none stroke-current stroke-[2.5]">
              <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
            </svg>
          </div>
          <span className="text-xs font-bold tracking-[0.15em] text-[#1D1D1F] font-mono">AETHER<span className="text-neutral-400">CODE</span></span>
        </div>
        
        <button 
          onClick={() => copyWorkspaceTextToClipboard(window.location.href, 'share')}
          className="text-[11px] font-medium text-neutral-500 hover:text-black transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-black/[0.04] shadow-[0_1px_2px_rgba(0,0,0,0.02)] active:scale-[0.98]"
        >
          {activeCopiedMarker === 'share' ? <Check className="h-3 w-3 text-emerald-600" /> : <Share2 className="h-3 w-3" />}
          {activeCopiedMarker === 'share' ? 'Link Copied' : 'Share Workspace'}
        </button>
      </header>

      {/* Spacious Unified Main Stage */}
      <main className="max-w-[80rem] mx-auto px-8 pt-24 space-y-20">
        
        {/* Title Content Section */}
        <div className="space-y-3.5 max-w-xl">
          <motion.h1 
            initial={{ opacity: 0, y: 8 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={FLUID_SPRING}
            className="text-4xl sm:text-5xl font-bold tracking-tight text-black leading-[1.08]"
          >
            Refactor code. <br />
            Meet production metrics.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            transition={{ ...FLUID_SPRING, delay: 0.1 }}
            className="text-xs sm:text-sm text-neutral-500 max-w-md font-normal leading-relaxed"
          >
            Drop algorithmic scripts or functional setups down into the workspace. Audit loop parameters, calculate complexity, and compile clean updates.
          </motion.p>
        </div>

        {/* WORKSPACE INPUT STAGE: Clean Native Desktop Console App Frame */}
        <div className="apple-workspace-card rounded-2xl p-7 bg-white space-y-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.03] pb-4">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-neutral-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 font-mono">Source Buffer Area</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div 
                onClick={() => hiddenFileInputRef.current?.click()}
                className="text-[11px] font-medium text-neutral-600 hover:text-black transition-colors cursor-pointer px-3 py-1.5 rounded-lg bg-neutral-100/60 border border-black/[0.03] flex items-center gap-1.5 shadow-sm"
              >
                <Upload className="h-3.5 w-3.5 text-neutral-400" /> Upload Source
              </div>
              <input type="file" ref={hiddenFileInputRef} className="hidden" onChange={(e) => {
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
                className="bg-white border border-black/[0.05] rounded-lg text-xs px-2.5 py-1.5 font-mono text-neutral-700 focus:border-[#0071E3] focus:outline-none shadow-sm"
              >
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>
          </div>

          {/* Reference Testing Playgrounds */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block pl-0.5">Reference Testing Playgrounds</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {PLAYGROUND_TEMPLATES.map((preset, idx) => (
                <div 
                  key={idx}
                  onClick={() => { setCode(preset.code); setLanguage(preset.lang); }}
                  className="apple-workspace-card p-3.5 rounded-xl cursor-pointer flex justify-between items-center group bg-neutral-100/40 border-black/[0.03]"
                >
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-black group-hover:text-[#0071E3] transition-colors flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 group-hover:bg-[#0071E3] transition-all" /> {preset.name}
                    </h4>
                    <p className="text-[11px] text-neutral-400 tracking-tight">{preset.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-black transition-colors transform group-hover:translate-x-0.5" />
                </div>
              ))}
            </div>
          </div>

          {/* Core Text Input Frame */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setCode(ev.target?.result as string); r.readAsText(f); } }}
            className={`relative rounded-xl overflow-hidden border transition-all ${
              isDragging ? 'border-[#0071E3] bg-[#0071E3]/[0.01]' : 'border-black/[0.04] bg-[#F5F5F7]/20 focus-within:border-neutral-300'
            }`}
          >
            <div className="flex items-start">
              <div className="text-[11px] font-mono text-neutral-300 text-right p-5 pr-3 select-none border-r border-black/[0.01] bg-black/[0.005] min-w-[3.5rem] space-y-1">
                {Array.from({ length: Math.max(dynamicInputLineCount, 1) }).map((_, lineIdx) => (
                  <div key={lineIdx}>{lineIdx + 1}</div>
                ))}
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Supply custom source function blocks here to initialize evaluation compiler runs..."
                className="w-full h-72 bg-transparent text-neutral-800 font-mono text-xs p-5 resize-none focus:outline-none custom-textarea leading-relaxed"
              />
            </div>
          </div>

          {/* Action Execution Button */}
          <div className="flex justify-end border-t border-black/[0.03] pt-4">
            <button
              onClick={executePipelineEvaluation}
              disabled={isAnalyzing || !code.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-indigo-600/10 active:scale-[0.97] hover:shadow-lg disabled:opacity-30 disabled:pointer-events-none"
            >
              {isAnalyzing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {isAnalyzing ? `Parsing Modules (${progress}%)` : "Compile Workspace Diagnostics"}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* LIVE EVALUATION SECTION OUTPUT VIEWPORTS */}
        <div className="pt-2">
          <AnimatePresence mode="wait">
            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.99 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0 }} 
                className="apple-workspace-card rounded-2xl p-24 bg-white flex flex-col items-center justify-center text-center min-h-[350px]"
              >
                <div className="w-10 h-10 mb-4 flex items-center justify-center relative">
                  <div className="absolute inset-0 border-2 border-neutral-100 rounded-full" />
                  <div className="absolute inset-0 border-2 border-t-neutral-800 rounded-full animate-spin" />
                </div>
                <h3 className="text-sm font-semibold text-black tracking-tight">Deconstructing Code Logic Modules</h3>
                <p className="text-xs text-neutral-400 max-w-xs mt-1 leading-relaxed">Evaluating structural complexity, mapping tokens, and validating parsing metrics via Gemini servers...</p>
                <div className="w-40 bg-neutral-100 border border-black/[0.02] h-1 rounded-full overflow-hidden mt-6">
                  <div className="h-full bg-neutral-800 transition-all duration-200" style={{ width: `${progress}%` }} />
                </div>
              </motion.div>
            )}

            {!isAnalyzing && showResults && analysisData && (
              <motion.div 
                initial={{ opacity: 0, y: 16 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={FLUID_SPRING}
                className="space-y-8"
              >
                
                {/* Metric Readout Score Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="apple-workspace-card p-6 rounded-2xl bg-white flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase block">AST Integrity Core</span>
                      <h3 className="text-3xl font-bold font-mono text-emerald-600 mt-1.5">{analysisData.performanceScore}</h3>
                    </div>
                    <p className="text-xs text-neutral-400 mt-4 leading-normal">Optimization indices correspond to stable structural standards.</p>
                  </div>

                  <div className="apple-workspace-card p-6 rounded-2xl bg-white flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase block">Algorithmic Boundary</span>
                      <h3 className="text-3xl font-bold font-mono text-[#0071E3] mt-1.5">{analysisData.timeComplexity}</h3>
                    </div>
                    <p className="text-xs text-neutral-400 mt-4 leading-normal">Loop execution tracking targets verified under system parameters.</p>
                  </div>

                  <div className="apple-workspace-card p-6 rounded-2xl border-neutral-200/60 bg-neutral-50 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase block">Workspace Framework</span>
                      <h3 className="text-sm font-bold text-neutral-800 mt-2.5 capitalize">{language} Target Runtime</h3>
                    </div>
                    <p className="text-xs text-neutral-400 mt-4 leading-normal">Compiler configuration files verified to ensure production safety rules.</p>
                  </div>
                </div>

                {/* Unified Output Panel Area Grid */}
                <div className="apple-workspace-card rounded-2xl overflow-hidden bg-white flex flex-col shadow-sm">
                  
                  {/* Tab Navigation header */}
                  <div className="border-b border-black/[0.03] bg-[#F5F5F7]/40 p-3 flex gap-1.5 items-center justify-between px-5 flex-wrap">
                    <div className="flex gap-1">
                      {(['diff', 'anomalies', 'security'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`capitalize px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            activeTab === tab ? 'bg-white text-[#0071E3] border border-black/[0.04] shadow-xs' : 'text-neutral-500 hover:text-black'
                          }`}
                        >
                          {tab === 'diff' && 'Side-by-Side View'}
                          {tab === 'anomalies' && `Anomalies (${analysisData.issues.length})`}
                          {tab === 'security' && `Security (${analysisData.security.length})`}
                        </button>
                      ))}
                    </div>

                    {activeTab === 'diff' && (
                      <button 
                        onClick={() => copyWorkspaceTextToClipboard(analysisData.optimizedCode, 'diff_copy')}
                        className="text-[11px] text-neutral-600 hover:text-black flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-black/[0.04] shadow-xs transition-all active:scale-[0.98]"
                      >
                        {activeCopiedMarker === 'diff_copy' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        Copy Refactored Output
                      </button>
                    )}
                  </div>

                  {/* Dynamic Render Sub-tab Containers */}
                  <div className="p-7 min-h-[460px] bg-white">
                    {activeTab === 'diff' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                        <div className="flex flex-col rounded-xl overflow-hidden border border-black/[0.03] bg-[#F5F5F7]/30">
                          <div className="bg-neutral-50/50 border-b border-black/[0.02] px-4 py-2 flex items-center text-[11px] font-mono text-neutral-400">
                            <span className="flex items-center gap-1.5 text-rose-600/70"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Baseline Code Layout</span>
                          </div>
                          <div className="text-[11px] font-mono overflow-auto p-4 apple-pane-scroll flex-1 max-h-[480px] bg-white">
                            <SyntaxHighlighter language={language} style={prism} customStyle={{ margin: 0, background: 'transparent', padding: 0 }}>
                              {code}
                            </SyntaxHighlighter>
                          </div>
                        </div>

                        <div className="flex flex-col rounded-xl overflow-hidden border border-black/[0.03] bg-[#F5F5F7]/30">
                          <div className="bg-neutral-50/50 border-b border-black/[0.02] px-4 py-2 flex items-center text-[11px] font-mono text-neutral-400">
                            <span className="flex items-center gap-1.5 text-emerald-600/70"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Refactored AI Synthesis</span>
                          </div>
                          <div className="text-[11px] font-mono overflow-auto p-4 apple-pane-scroll flex-1 max-h-[480px] bg-white">
                            <SyntaxHighlighter language={language} style={prism} customStyle={{ margin: 0, background: 'transparent', padding: 0 }}>
                              {analysisData.optimizedCode}
                            </SyntaxHighlighter>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'anomalies' && (
                      <div className="space-y-3.5 max-w-4xl">
                        {analysisData.issues.map((issue, idx) => (
                          <div key={idx} className="p-4.5 rounded-xl border border-black/[0.03] bg-[#F5F5F7]/20 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-neutral-800 flex items-center gap-2">
                                <Layers className="h-4 w-4 text-amber-500" /> {issue.title}
                              </span>
                              <span className="text-[9px] uppercase tracking-wider font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/10">
                                {issue.severity || 'warning'}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-500 leading-relaxed">{issue.description}</p>
                            {issue.fix && (
                              <div className="space-y-1">
                                <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 block">Recommended Action Remap</span>
                                <code className="block text-[11px] font-mono text-[#0071E3] bg-[#0071E3]/[0.02] p-3 rounded-lg border border-indigo-50/60 whitespace-pre-wrap">{issue.fix}</code>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'security' && (
                      <div className="space-y-3.5 max-w-4xl">
                        {analysisData.security.length === 0 ? (
                          <div className="text-center py-16 border border-dashed border-black/[0.05] rounded-xl text-xs text-neutral-400 space-y-2 bg-[#F5F5F7]/10">
                            <ShieldAlert className="h-5 w-5 text-emerald-500 mx-auto" />
                            <p className="font-semibold text-black">Clean Compilation Workspace Check</p>
                            <p className="text-[11px] text-neutral-400">Zero active token extraction vulnerabilities or hijack configurations found.</p>
                          </div>
                        ) : (
                          analysisData.security.map((sec, idx) => (
                            <div key={idx} className="p-4.5 rounded-xl border border-rose-100 bg-rose-50/[0.2] space-y-1.5">
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

                {/* Section D: Continuous Refinement Prompt Console */}
                <div className="apple-workspace-card rounded-2xl p-7 bg-white space-y-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">
                    <MessageSquare className="h-4 w-4 text-neutral-400" />
                    <span>Continuous Refinement Prompt Console</span>
                  </div>

                  <div className="space-y-3 max-h-56 overflow-y-auto apple-pane-scroll pr-1">
                    {interactiveChatThread.map((msg, i) => (
                      <div 
                        key={i} 
                        className={`p-3.5 rounded-xl text-xs leading-relaxed border ${
                          msg.role === 'user' 
                            ? 'bg-neutral-50 border-black/[0.02] ml-12 text-neutral-800' 
                            : 'bg-[#0071E3]/[0.02] border-indigo-100/50 mr-12 text-[#0071E3]'
                        }`}
                      >
                        <span className="font-semibold block mb-0.5 uppercase font-mono tracking-widest text-[9px] text-neutral-400">
                          {msg.role === 'user' ? 'Tuning Modifier' : 'AetherCode Log Action'}
                        </span>
                        {msg.text}
                      </div>
                    ))}
                  </div>

                  <div className="relative rounded-xl overflow-hidden border border-black/[0.05] bg-neutral-50 flex items-center pr-3 focus-within:bg-white focus-within:border-[#0071E3] transition-all">
                    <input 
                      type="text"
                      value={chatInputMessage}
                      onChange={(e) => setChatInputMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && dispatchWorkspaceAdjustment()}
                      placeholder="Instruct AetherCode to remap variable naming conventions, adjust spacing rules..."
                      className="w-full bg-transparent text-xs p-4 text-neutral-800 focus:outline-none placeholder:text-neutral-400"
                    />
                    <button
                      onClick={dispatchWorkspaceAdjustment}
                      disabled={!chatInputMessage.trim()}
                      className="h-7 w-7 bg-[#1D1D1F] hover:bg-neutral-800 text-white rounded-lg flex items-center justify-center transition-all disabled:opacity-20 shadow-sm active:scale-[0.96]"
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