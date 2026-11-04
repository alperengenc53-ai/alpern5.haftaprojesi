import React from 'react';
import { Sparkles, Image as ImageIcon, Video as VideoIcon, History, ShieldCheck, KeyRound, ExternalLink, HelpCircle } from 'lucide-react';
import { ServerStatusResponse } from '../types';

interface HeaderProps {
  activeTab: 'image' | 'video' | 'gallery' | 'security';
  setActiveTab: (tab: 'image' | 'video' | 'gallery' | 'security') => void;
  serverStatus: ServerStatusResponse | null;
  historyCount: number;
  openSecurityModal: () => void;
  openTemplatesModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  serverStatus,
  historyCount,
  openSecurityModal,
  openTemplatesModal,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('image')}>
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-fuchsia-500 shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  VisionCraft
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  AI Studio
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Yüksek Doğrulukta Görsel & Video Üretim Motoru
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800/80 shadow-inner">
            <button
              onClick={() => setActiveTab('image')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'image'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Görsel</span>
            </button>

            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'video'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <VideoIcon className="w-4 h-4" />
              <span>Video</span>
              <span className="hidden md:inline-block px-1 py-0.2 text-[9px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Veo
              </span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'gallery'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Galeri</span>
              {historyCount > 0 && (
                <span className="w-4 h-4 text-[10px] rounded-full bg-slate-800 text-indigo-300 flex items-center justify-center font-bold">
                  {historyCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'security'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Güvenlik</span>
            </button>
          </nav>

          {/* Quick Actions & Status */}
          <div className="flex items-center gap-2">
            <button
              onClick={openTemplatesModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-850 transition-colors"
              title="Örnek Yüksek Doğruluklu Promptlar"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Örnek Promptlar</span>
            </button>

            <button
              onClick={openSecurityModal}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40 transition-colors"
              title="API Key Koruması ve GitHub Pages Güvenlik Detayları"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">API Korumalı:</span>
              <span className="font-mono text-[11px] text-emerald-200">
                {serverStatus?.maskedKey || 'Güvenli'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
