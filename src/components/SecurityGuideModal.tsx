import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  Server,
  Globe,
  FileCode,
  Save,
  Trash2,
  HelpCircle
} from 'lucide-react';
import { ServerStatusResponse } from '../types';
import { getStoredClientKey, setStoredClientKey } from '../services/api';

interface SecurityGuideModalProps {
  serverStatus: ServerStatusResponse | null;
  onClose: () => void;
}

export const SecurityGuideModal: React.FC<SecurityGuideModalProps> = ({
  serverStatus,
  onClose,
}) => {
  const [clientKeyInput, setClientKeyInput] = useState(getStoredClientKey());
  const [isSaved, setIsSaved] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleSaveClientKey = () => {
    setStoredClientKey(clientKeyInput);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleClearClientKey = () => {
    setStoredClientKey('');
    setClientKeyInput('');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const copyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const githubActionsYaml = `name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Build static site
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-fadeIn">
      {/* Title Card */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              API Anahtarı Koruması & Güvenlik Mimarisi
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              GitHub Pages & Güvenli Dağıtım Rehberi
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              API anahtarınızın kimse tarafından ele geçirilememesi ve GitHub Pages üzerinde güvenle çalışabilmesi
              için kurulan çift katmanlı güvenlik sistemini inceleyin.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-2 shrink-0">
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              Aktif Koruma Durumu
            </div>
            <div className="text-sm font-mono font-bold text-emerald-300">
              {serverStatus?.maskedKey || 'Güvenli Vault Aktif'}
            </div>
            <div className="text-[11px] text-slate-400">
              Kaynak: <span className="font-semibold text-slate-200">Sunucu .env (Git İçi Değil)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Security Architecture & Client Vault (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Key Protection Explanation */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-indigo-400" />
              <span>Anahtarınız Neden ve Nasıl Güvende?</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-100 block mb-0.5">1. Asla Tarayıcı Koduna Eklenmez (Zero Leakage)</strong>
                  API anahtarınız JavaScript derlemesine (bundle) veya HTML içine asla dahil edilmez. Tüm yapay zeka istekleri arka planda çalışan <code className="text-indigo-300 font-mono">server.ts</code> Express sunucusu üzerinden yönlendirilir.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-100 block mb-0.5">2. .gitignore Koruması</strong>
                  Projenizdeki <code className="text-indigo-300 font-mono">.gitignore</code> dosyası <code className="text-indigo-300 font-mono">.env*</code> girdilerini içerir. Yani kodunuzu GitHub'a gönderseniz dahi anahtarınız GitHub deposuna yüklenmez.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-100 block mb-0.5">3. GitHub Pages Özelliği Hakkında Önemli Bilgi</strong>
                  GitHub Pages <span className="text-amber-300 font-semibold">yalnızca statik dosya (HTML/JS/CSS)</span> barındırır, doğrudan Node.js backend çalıştırmaz. Bu yüzden GitHub Pages üzerinde anahtarınızı gizli tutmanın yolu, backend'i (Render, Cloud Run veya Vercel'de) çalıştırmak ya da aşağıdaki "Kişisel Tarayıcı Kasası"nı kullanmaktır.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                <KeyRound className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-indigo-200 block mb-0.5">4. Yeni Google AI Studio Anahtar Formatı (AQ.Ab8...)</strong>
                  Google AI Studio tarafından üretilen en yeni anahtarlar <code className="text-indigo-300 font-mono">AQ.Ab8...</code> ön eki ile başlar. Bu yeni yetkilendirme anahtarları doğrudan Google Cloud Servis Hesabına bağlanır ve en yüksek güvenlik protokollerini içerir.
                </div>
              </div>
            </div>
          </div>

          {/* Client-Side Vault Setting (For static deployments) */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                <span>Kişisel Tarayıcı Kasası (İsteğe Bağlı)</span>
              </span>
              <span className="text-xs text-slate-400 font-normal">Yerel & İstemci Koruması</span>
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              Eğer GitHub Pages üzerinde tamamen bağımsız bir şekilde kendi anahtarınızla çalıştırmak isterseniz,
              anahtarı buraya girebilirsiniz. Bu anahtar <strong className="text-emerald-400">asla GitHub'a gönderilmez</strong>, sadece bu tarayıcınızın güvenli yerel depolama alanında (localStorage) saklanır.
            </p>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type="password"
                  value={clientKeyInput}
                  onChange={(e) => setClientKeyInput(e.target.value)}
                  placeholder="Kişisel Gemini API Anahtarınızı girin..."
                  className="w-full rounded-xl bg-slate-950/90 border border-slate-800 p-3.5 text-xs text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveClientKey}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Kasaya Kaydet</span>
                  </button>
                  {clientKeyInput && (
                    <button
                      type="button"
                      onClick={handleClearClientKey}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-rose-300 text-xs font-semibold transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Sıfırla</span>
                    </button>
                  )}
                </div>

                {isSaved && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold animate-fadeIn">
                    <Check className="w-4 h-4" /> Başarıyla güncellendi!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Deployment Guide & Workflows (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Step by step deployment */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              <span>GitHub Pages'e Dağıtım Adımları</span>
            </h2>

            <ol className="space-y-3 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
              <li className="pl-1">
                <strong>Projeyi GitHub Deponuza Gönderin:</strong>
                <pre className="mt-1 p-2 rounded-lg bg-slate-950 text-slate-300 font-mono text-[11px] overflow-x-auto">
git init && git add .
git commit -m "feat: VisionCraft Studio"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main
                </pre>
              </li>
              <li className="pl-1">
                <strong>GitHub Deposu &gt; Settings &gt; Pages</strong> bölümüne gidin.
              </li>
              <li className="pl-1">
                Source kısmından <strong className="text-indigo-300">GitHub Actions</strong> seçeneğini seçin.
              </li>
              <li className="pl-1">
                Aşağıdaki GitHub Actions dosyasını ekleyin.
              </li>
            </ol>
          </div>

          {/* GitHub Actions YAML Snippet */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-indigo-400" />
                .github/workflows/deploy.yml
              </span>
              <button
                type="button"
                onClick={() => copyCode('workflow', githubActionsYaml)}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                {copiedSection === 'workflow' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Kodu Kopyala</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-60">
              {githubActionsYaml}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
