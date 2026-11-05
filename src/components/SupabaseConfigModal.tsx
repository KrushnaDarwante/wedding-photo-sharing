import React, { useState } from 'react';
import {
  isSupabaseConfigured,
  activeSupabaseUrl,
  activeSupabaseAnonKey,
  saveCustomSupabaseCredentials
} from '../lib/supabase';
import { X, Database, Check, Copy, ExternalLink, ShieldCheck, Zap } from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState(activeSupabaseUrl);
  const [key, setKey] = useState(activeSupabaseAnonKey);
  const [copied, setCopied] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomSupabaseCredentials(url, key);
    setSaveMsg('Credentials saved! Reloading application...');
  };

  const handleClear = () => {
    setUrl('');
    setKey('');
    saveCustomSupabaseCredentials('', '');
  };

  const handleCopySchemaNotice = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full p-7 border border-[#E8E2D8] shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EB] border border-[#E8DFC8] flex items-center justify-center text-[#9A7B4F]">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif-luxury text-xl font-bold text-slate-900">
              Database & Cloud Storage Configuration
            </h2>
            <p className="text-xs text-slate-500">
              Supabase PostgreSQL & Object Storage Integration
            </p>
          </div>
        </div>

        {/* Engine status banner */}
        <div className="mb-6 p-4 rounded-xl border flex items-start gap-3 bg-[#FAF8F5] border-[#E8E2D8]">
          {isSupabaseConfigured ? (
            <>
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-emerald-800">
                  Supabase Live Connection Active
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Connected to remote Supabase project at: <span className="font-mono text-slate-800">{activeSupabaseUrl}</span>
                </p>
              </div>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 text-[#9A7B4F] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-slate-900">
                  Built-in Reactive Storage Engine Active
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Operating with local persistence + cross-tab live broadcast channels. All uploads, QR codes, bulk zips, and guest galleries function with zero external setup needed.
                </p>
              </div>
            </>
          )}
        </div>

        {saveMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
            {saveMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supabase Project URL (<code className="font-mono text-[11px]">VITE_SUPABASE_URL</code>)
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A7B4F] bg-slate-50/50 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supabase Anonymous Key (<code className="font-mono text-[11px]">VITE_SUPABASE_ANON_KEY</code>)
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A7B4F] bg-slate-50/50 font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2 text-xs text-slate-600 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
            >
              Reset to Built-in Engine
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#1E1B18] hover:bg-[#36322D] rounded-xl shadow transition-colors cursor-pointer"
            >
              Connect Supabase Project
            </button>
          </div>
        </form>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
          <div className="font-semibold text-slate-800 flex items-center justify-between">
            <span>Supabase Schema & RLS Policies</span>
            <button
              onClick={handleCopySchemaNotice}
              className="text-[#9A7B4F] hover:underline flex items-center gap-1 cursor-pointer text-[11px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Located in /supabase/schema.sql' : 'View SQL File'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            The complete PostgreSQL schema with photographer write policies and guest read-only rules is located in <code className="font-mono bg-white px-1 py-0.5 rounded border">supabase/schema.sql</code>. Run it directly in the Supabase SQL Editor.
          </p>
        </div>
      </div>
    </div>
  );
};
