'use client';

import { useState, useRef } from 'react';
import {
  Upload, FileText, CheckCircle2, AlertTriangle, XCircle,
  Sparkles, Clock, Building2, ShieldCheck, ArrowRight, Lock,
} from 'lucide-react';

type ValidationStatus = 'passed' | 'review' | 'failed';

type ValidationCheck = {
  label: string;
  status: ValidationStatus;
  detail: string;
};

const VALIDATION_RESULTS: ValidationCheck[] = [
  { label: 'Document Readable',        status: 'passed', detail: 'Document is clear and all text is legible.' },
  { label: 'Correct Document Type',    status: 'passed', detail: 'File matches the required Commercial Registration format.' },
  { label: 'Expiry Date',              status: 'review', detail: 'Expiry date could not be confirmed automatically. Manual review required.' },
  { label: 'Document Completeness',    status: 'passed', detail: 'All required fields and sections are present.' },
  { label: 'Policy Compliance',        status: 'passed', detail: 'Document corresponds to the requested Commercial Registration update.' },
];

const statusConfig: Record<ValidationStatus, {
  icon: typeof CheckCircle2;
  color: string; bg: string; border: string; label: string; badgeBg: string;
}> = {
  passed: {
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg:    'bg-emerald-50/80 dark:bg-emerald-950/15',
    border:'border-emerald-200/60 dark:border-emerald-900/40',
    label: 'Passed',
    badgeBg: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50',
  },
  review: {
    icon: AlertTriangle,
    color: 'text-amber-600 dark:text-amber-400',
    bg:    'bg-amber-50/80 dark:bg-amber-950/15',
    border:'border-amber-200/60 dark:border-amber-900/40',
    label: 'Needs Review',
    badgeBg: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50',
  },
  failed: {
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bg:    'bg-red-50/80 dark:bg-red-950/15',
    border:'border-red-200/60 dark:border-red-900/40',
    label: 'Failed',
    badgeBg: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50',
  },
};

export default function CustomerPortal() {
  const [dragOver, setDragOver] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'validating' | 'done'>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [validationStep, setValidationStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    setUploadState('uploading');
    setTimeout(() => {
      setUploadState('validating');
      let step = 0;
      const interval = setInterval(() => {
        step += 1;
        setValidationStep(step);
        if (step >= VALIDATION_RESULTS.length) {
          clearInterval(interval);
          setTimeout(() => setUploadState('done'), 400);
        }
      }, 550);
    }, 1400);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const hasIssue = VALIDATION_RESULTS.some(c => c.status === 'review' || c.status === 'failed');
  const reviewCount = VALIDATION_RESULTS.filter(c => c.status === 'review').length;
  const failCount = VALIDATION_RESULTS.filter(c => c.status === 'failed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-lg mx-auto px-4 sm:px-5 py-8 sm:py-10 space-y-5">

        {/* ── PORTAL HEADER ── */}
        <div className="text-center space-y-3 pb-1">
          <div className="relative inline-flex">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)' }}>
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
              <span className="text-[10px] font-extrabold text-white">!</span>
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Action Required</h1>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Corporate Banking — Secure Document Portal</p>
          </div>
        </div>

        {/* ── COMPANY + REQUEST CARD ── */}
        <div className="glass-card rounded-3xl overflow-hidden shadow-sm">
          {/* Top accent bar */}
          <div className="h-1" style={{ background: 'linear-gradient(90deg, #1d4ed8, #7c3aed)' }} />
          <div className="p-5 space-y-5">
            {/* Company row */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ background: 'linear-gradient(135deg, #1e40af, #4f46e5)' }}>
                AC
              </div>
              <div>
                <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">AlMadar Construction Group</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Active Customer
                </span>
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-white/[0.06]" />

            {/* Request details */}
            <div className="space-y-3.5">
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Requested Document</p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Update Commercial Registration</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Reason</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  The Commercial Registration expires within 30 days. Renewal is required to maintain all corporate banking services.
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Deadline</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/25 dark:text-amber-300 dark:border-amber-900/40">
                    <Clock className="w-3.5 h-3.5" />
                    30 days remaining
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Priority</p>
                  <span className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200/60 dark:bg-red-950/25 dark:text-red-400 dark:border-red-900/40">
                    High
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── UPLOAD AREA ── */}
        {uploadState === 'idle' && (
          <div className="glass-card rounded-3xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                <Upload className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Upload Document</p>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                dragOver
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20 scale-[1.01]'
                  : 'border-slate-200 dark:border-white/[0.08] hover:border-blue-300 hover:bg-blue-50/30 dark:hover:bg-white/[0.04]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              <div className="flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  dragOver ? 'bg-blue-100 dark:bg-blue-900/30 scale-110' : 'bg-slate-100 dark:bg-white/[0.06]'
                }`}>
                  <Upload className={`w-7 h-7 transition-colors ${dragOver ? 'text-blue-600' : 'text-slate-400'}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {dragOver ? 'Drop to upload' : 'Drag & drop your document here'}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">or click to browse — PDF, JPG, PNG accepted</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-press w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-extrabold text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)' }}
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </div>
        )}

        {/* ── UPLOADING ── */}
        {uploadState === 'uploading' && (
          <div className="glass-card rounded-3xl p-8 text-center space-y-4 animate-fade-in">
            <div className="relative w-14 h-14 mx-auto">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                <Upload className="w-7 h-7 text-white" />
              </div>
              <div className="absolute inset-0 rounded-2xl animate-ping opacity-20"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }} />
            </div>
            <div>
              <p className="text-base font-extrabold text-slate-800 dark:text-slate-200">Uploading document...</p>
              <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />{fileName}
              </p>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              {[0,1,2].map(i => (
                <span key={i} className="w-2 h-2 rounded-full bg-blue-500"
                  style={{ animation: `typing-dot 1.2s ease-in-out infinite ${i * 200}ms` }} />
              ))}
            </div>
          </div>
        )}

        {/* ── VALIDATION ── */}
        {(uploadState === 'validating' || uploadState === 'done') && (
          <div className="glass-card rounded-3xl overflow-hidden shadow-sm animate-scale-in">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-white/[0.06] flex items-center gap-3">
              {uploadState === 'validating'
                ? <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
                : <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />}
              <div>
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                  {uploadState === 'validating' ? 'AI Validation in Progress...' : 'AI Validation Complete'}
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <FileText className="w-3 h-3" />{fileName}
                </p>
              </div>
            </div>

            {/* Check list */}
            <div className="divide-y divide-slate-100/80 dark:divide-white/[0.05]">
              {VALIDATION_RESULTS.map((check, i) => {
                const visible = i < validationStep || uploadState === 'done';
                const cfg = statusConfig[check.status];
                const Icon = cfg.icon;
                return (
                  <div
                    key={check.label}
                    className={`flex items-start gap-4 px-5 py-4 transition-all duration-500 ${
                      visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3'
                    } ${visible ? cfg.bg : ''}`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-0.5">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{check.label}</p>
                        {visible && (
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${cfg.badgeBg}`}>
                            {cfg.label}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{check.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Result footer */}
            {uploadState === 'done' && (
              <div className="px-5 py-4 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02] space-y-3">
                {hasIssue ? (
                  <div className="flex items-start gap-3 p-4 rounded-2xl border bg-amber-50 border-amber-200/60 dark:bg-amber-950/15 dark:border-amber-900/30">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-extrabold text-amber-700 dark:text-amber-300 mb-0.5">Manual Review Required</p>
                      <p className="text-xs text-amber-600/80 dark:text-amber-400/70 leading-relaxed">
                        {failCount > 0
                          ? 'The uploaded document appears expired. Please upload a renewed Commercial Registration.'
                          : `${reviewCount} check${reviewCount > 1 ? 's' : ''} require${reviewCount === 1 ? 's' : ''} manual review. Your Relationship Manager has been notified.`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 rounded-2xl border bg-emerald-50 border-emerald-200/60 dark:bg-emerald-950/15 dark:border-emerald-900/30">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300 mb-0.5">Document Approved</p>
                      <p className="text-xs text-emerald-600/80 dark:text-emerald-400/70 leading-relaxed">
                        Document validated successfully. Your Relationship Manager can now continue processing.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => { setUploadState('idle'); setFileName(null); setValidationStep(0); }}
                  className="btn-press w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-slate-400 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
                >
                  Upload Another Document
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── SECURE FOOTER ── */}
        <div className="text-center space-y-1 pt-3 pb-6">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Secured by Corporate Banking AI Platform</span>
          </div>
          <p className="text-xs text-slate-300 dark:text-slate-600">All uploads are encrypted and securely stored.</p>
        </div>
      </div>
    </div>
  );
}
