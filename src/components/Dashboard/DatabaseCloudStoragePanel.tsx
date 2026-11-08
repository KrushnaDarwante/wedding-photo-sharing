import React, { useState } from 'react';
import {
  isSupabaseConfigured,
  activeSupabaseUrl,
  activeSupabaseAnonKey,
  saveCustomSupabaseCredentials,
  testSupabaseConnection
} from '../../lib/supabase';
import {
  Database,
  ShieldCheck,
  Zap,
  Check,
  Copy,
  AlertTriangle,
  RefreshCw,
  Lock,
  ExternalLink,
  Server
} from 'lucide-react';

export const DatabaseCloudStoragePanel: React.FC = () => {
  const [url, setUrl] = useState(activeSupabaseUrl);
  const [key, setKey] = useState(activeSupabaseAnonKey);
  const [copied, setCopied] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    connected: boolean;
    latencyMs?: number;
    tablesVerified: boolean;
    storageVerified: boolean;
    storageCheckError?: string;
    message: string;
  } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    const res = saveCustomSupabaseCredentials(url, key);
    if (!res.success) {
      setFeedbackMsg({ type: 'error', text: res.error || 'Failed to save credentials.' });
    } else {
      setFeedbackMsg({ type: 'success', text: 'Supabase credentials saved successfully. Reloading...' });
    }
  };

  const handleClear = () => {
    setUrl('');
    setKey('');
    saveCustomSupabaseCredentials('', '');
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopySchemaNotice = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E2D8] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF5EB] border border-[#E8DFC8] flex items-center justify-center text-[#800020] shadow-sm">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-slate-900">
                  Database & Cloud Object Storage
                </h2>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Owner Area
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage backend PostgreSQL database tables, cloud storage buckets, and guest permissions.
              </p>
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-4 py-2.5 text-xs font-semibold text-slate-800 bg-[#FAF8F5] border border-[#E8DFC8] hover:bg-[#F2ECE1] rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#800020] ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Testing Link...' : 'Run Diagnostics Test'}</span>
          </button>
        </div>

        {/* Live Diagnostics Test Output */}
        {testResult && (
          <div className={`mt-6 p-4 rounded-xl border text-xs ${
            testResult.connected
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-2 font-semibold mb-1">
              {testResult.connected ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
              <span>{testResult.message}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600 mt-2 font-mono">
              <span>Database Query: {testResult.tablesVerified ? 'Verified OK' : 'Pending'}</span>
              <span>·</span>
              <span>Storage Bucket: {testResult.storageVerified ? 'Active (wedding-photos)' : testResult.storageCheckError ? 'Could not verify' : 'Missing'}</span>
              {testResult.latencyMs !== undefined && (
                <>
                  <span>·</span>
                  <span>Roundtrip Latency: {testResult.latencyMs}ms</span>
                </>
              )}
              {testResult.storageCheckError && (
                <p className="mt-2 text-[11px] text-amber-800">Storage check detail: {testResult.storageCheckError}. A permission-limited bucket listing is not proof that the bucket is missing.</p>
              )}
            </div>
          </div>
        )}

        {/* Actual Storage Engine Architecture Status */}
        <div className="mt-6 p-5 rounded-2xl border flex items-start gap-4 bg-[#FAF8F5] border-[#E8E2D8]">
          {isSupabaseConfigured ? (
            <>
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
                  <span>Remote Supabase Cloud Integration Active</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Connected to remote Supabase project at: <code className="font-mono bg-white px-2 py-0.5 rounded border text-slate-800">{activeSupabaseUrl}</code>. All wedding photographs and metadata are persisted in PostgreSQL and Cloud Object Storage.
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <span>Built-in Local Browser Engine Active (Standby Mode)</span>
                  <span className="text-[11px] font-normal text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">Local Storage Only</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The application is currently operating using browser local storage and client-side memory. All UI interactions, QR codes, and local tests work seamlessly.
                </p>
                <div className="p-3 bg-white rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium">
                  <strong>Notice on Cross-Device Access:</strong> Photos uploaded while using the local engine remain on this device. To allow wedding guests to access published photo galleries from their personal phones or different locations worldwide, enter your Supabase project credentials below.
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E2D8] shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-[#800020]" />
          <h3 className="font-serif-luxury text-lg font-bold text-slate-900">
            Supabase Project Credentials
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Provide your project URL and client-safe public Anonymous Key. <strong>Never enter your service_role secret key or database passwords in frontend code.</strong>
        </p>

        {feedbackMsg && (
          <div className={`mb-6 p-4 rounded-xl border text-xs ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {feedbackMsg.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Supabase Project URL (<code className="font-mono text-[11px]">VITE_SUPABASE_URL</code>)
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020] bg-slate-50/50 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Found in your Supabase Dashboard under <strong>Project Settings → API</strong>.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Supabase Anonymous Key (<code className="font-mono text-[11px]">VITE_SUPABASE_ANON_KEY</code>)
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020] bg-slate-50/50 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Use only the <strong>public anon key</strong>. Service role keys are blocked for security.
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClear}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-red-700 rounded-xl transition-colors cursor-pointer"
            >
              Reset to Built-in Engine
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-semibold text-white bg-[#800020] hover:bg-[#660019] rounded-xl shadow-md transition-all cursor-pointer"
            >
              Save & Connect Supabase Project
            </button>
          </div>
        </form>
      </div>

      {/* Row Level Security (RLS) & Schema Reference */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E2D8] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#800020]" />
            <h3 className="font-serif-luxury text-lg font-bold text-slate-900">
              Supabase Database Schema & RLS Policies
            </h3>
          </div>

          <button
            onClick={handleCopySchemaNotice}
            className="text-[#800020] hover:underline flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Path: /supabase/schema.sql' : 'View Schema File'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          AuraWed enforces strict business rules via PostgreSQL Row Level Security (RLS) policies. Only the studio owner can insert or delete photos, while guests have strictly scoped SELECT access.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E2D8] space-y-1.5">
            <div className="text-xs font-semibold text-slate-800">1. Table RLS Policies</div>
            <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4">
              <li><code>photographer_profiles</code>: Accessible only to authenticated owner</li>
              <li><code>wedding_events</code>: Owner full access; guests SELECT active events</li>
              <li><code>wedding_photos</code>: Owner can INSERT/DELETE; guests SELECT only ready photos</li>
              <li><code>photo_favourites</code>: Managed by anonymous guest session tokens</li>
            </ul>
          </div>

          <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E2D8] space-y-1.5">
            <div className="text-xs font-semibold text-slate-800">2. Storage Bucket Policies</div>
            <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4">
              <li>Bucket ID: <code>wedding-photos</code> (Public read access)</li>
              <li>Uploads/Deletions: Authenticated photographer only</li>
              <li>File limit: 50MB per photograph</li>
              <li>Allowed types: JPEG, PNG, WEBP, HEIC, AVIF</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
