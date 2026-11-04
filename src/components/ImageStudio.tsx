import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Sliders,
  Download,
  Copy,
  Check,
  RefreshCw,
  Maximize2,
  Video,
  Upload,
  X,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ArrowRight,
  Eye,
  Camera,
  Info
} from 'lucide-react';
import { AspectRatio, GeneratedItem, PromptOptimization, VisualStyle } from '../types';
import { generateImageApi, optimizePromptApi } from '../services/api';

interface ImageStudioProps {
  onMediaGenerated: (item: GeneratedItem) => void;
  onSendToVideo: (item: GeneratedItem) => void;
  onOpenPreview: (item: GeneratedItem) => void;
}

const STYLES: { id: VisualStyle; name: string; desc: string; icon: string }[] = [
  { id: 'realistic', name: 'Fotogerçekçi', desc: 'Doğal ışık, 8k doku, ultra keskinlik', icon: '📸' },
  { id: 'cinematic', name: 'Sinematik', desc: 'Dramatik film renkleri & anamorphic', icon: '🎬' },
  { id: 'digital-art', name: 'Dijital Sanat', desc: 'ArtStation tarzı usta çizim', icon: '🎨' },
  { id: '3d-render', name: '3D Render', desc: 'Octane & Unreal Engine derinliği', icon: '✨' },
  { id: 'anime', name: 'Anime & Manga', desc: 'Makoto Shinkai canlılığı', icon: '🌸' },
  { id: 'vintage', name: 'Analog Film', desc: 'Kodak Portra sıcak film greni', icon: '🏛️' },
  { id: 'cyberpunk', name: 'Siberpunk', desc: 'Neon yansımalar ve gece şehri', icon: '🌌' },
  { id: 'minimalist', name: 'Minimalist', desc: 'Sade kompozisyon ve temiz form', icon: '📐' },
];

const RATIOS: { id: AspectRatio; name: string; label: string; ratioClass: string }[] = [
  { id: '1:1', name: '1:1', label: 'Kare (Instagram)', ratioClass: 'w-6 h-6' },
  { id: '16:9', name: '16:9', label: 'Yatay (YouTube/Masaüstü)', ratioClass: 'w-8 h-4.5' },
  { id: '9:16', name: '9:16', label: 'Dikey (Reels/TikTok/Shorts)', ratioClass: 'w-4.5 h-8' },
  { id: '4:3', name: '4:3', label: 'Klasik Fotoğraf', ratioClass: 'w-7 h-5' },
  { id: '3:4', name: '3:4', label: 'Dikey Portre', ratioClass: 'w-5 h-7' },
];

export const ImageStudio: React.FC<ImageStudioProps> = ({
  onMediaGenerated,
  onSendToVideo,
  onOpenPreview,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<VisualStyle>('realistic');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [negativePrompt, setNegativePrompt] = useState('blurry, deformed, low quality, distortion, extra limbs, bad anatomy, watermark');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Reference image state (for Image-to-Image / Editing)
  const [referenceImage, setReferenceImage] = useState<{ data: string; mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Optimization state
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimization, setOptimization] = useState<PromptOptimization | null>(null);
  const [useOptimizedPrompt, setUseOptimizedPrompt] = useState(true);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestItem, setLatestItem] = useState<GeneratedItem | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Handle image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Lütfen geçerli bir görsel dosyası (PNG, JPG, WebP) seçin.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('Görsel boyutu 15 MB\'tan küçük olmalıdır.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReferenceImage({
        data: reader.result as string,
        mimeType: file.type,
      });
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  // Optimize prompt with Gemini to prevent random outputs
  const handleOptimizePrompt = async () => {
    if (!prompt.trim()) {
      setError('Lütfen önce ne üretmek istediğinizi yazın.');
      return;
    }

    setError(null);
    setIsOptimizing(true);
    try {
      const result = await optimizePromptApi({
        prompt: prompt.trim(),
        mediaType: 'image',
        style: selectedStyle,
        fidelity: 'high',
      });
      setOptimization(result);
      if (result.negativePrompt) {
        setNegativePrompt(result.negativePrompt);
      }
    } catch (err: any) {
      setError(`İyileştirme hatası: ${err.message || 'Lütfen tekrar deneyin.'}`);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Generate image
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Lütfen görsel için bir açıklama girin.');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      // Determine final prompt (use optimized English prompt if available for maximum model accuracy)
      const effectivePrompt =
        useOptimizedPrompt && optimization?.optimizedPromptEn
          ? optimization.optimizedPromptEn
          : prompt.trim();

      const result = await generateImageApi({
        prompt: effectivePrompt,
        aspectRatio,
        style: selectedStyle,
        referenceImage: referenceImage || undefined,
        negativePrompt: negativePrompt.trim() || undefined,
      });

      const newItem: GeneratedItem = {
        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        type: 'image',
        url: result.imageUrl,
        prompt: prompt.trim(),
        optimizedPrompt: optimization?.optimizedPromptEn,
        style: selectedStyle,
        aspectRatio,
        timestamp: Date.now(),
        referenceImageThumb: referenceImage?.data,
      };

      setLatestItem(newItem);
      onMediaGenerated(newItem);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Görsel üretilirken bir hata oluştu. Lütfen bağlantınızı kontrol edin.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = () => {
    const textToCopy = optimization?.optimizedPromptEn || prompt;
    navigator.clipboard.writeText(textToCopy);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Top Banner / Explanation */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-violet-950/60 border border-indigo-500/20 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              Sıfır Rastgelelik • %100 Prompt Sadakati
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Yapay Zeka ile Kusursuz Görsel Üretimi
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Yazdığınız şey asla rastgele veya bozuk bir sonuca dönüşmez. Akıllı kompozisyon motoru,
              ışık, açı ve doku parametrelerini optimize ederek tam istediğiniz sahneyi üretir.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-right">
              <div className="text-[11px] text-slate-400 font-medium">Model</div>
              <div className="text-xs font-mono font-semibold text-emerald-400">Gemini 3.1 Flash Image</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Controls & Prompting (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Prompt Card */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="prompt-input" className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Görselinizi Tarif Edin</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOptimizePrompt}
                  disabled={isOptimizing || !prompt.trim()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isOptimizing
                      ? 'bg-indigo-900/50 text-indigo-300 cursor-wait'
                      : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25 hover:brightness-110 active:scale-95'
                  }`}
                  title="Yazdığınızı profesyonel görsel promptuna dönüştürür ve rastgeleliği engeller"
                >
                  <Wand2 className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
                  <span>{isOptimizing ? 'Optimize Ediliyor...' : 'Sihirli Optimize Et'}</span>
                </button>
              </div>
            </div>

            {/* Prompt Textarea */}
            <div className="relative">
              <textarea
                id="prompt-input"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Örnek: Yağmurlu bir gecede neon tabelaların yansıdığı ıslak sokakta duran kırmızı retro bir spor araba, sinematik ışık, ultra net detaylar..."
                className="w-full rounded-xl bg-slate-950/80 border border-slate-800 p-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 transition-all resize-none font-sans"
              />
              {prompt && (
                <button
                  type="button"
                  onClick={() => {
                    setPrompt('');
                    setOptimization(null);
                  }}
                  className="absolute top-2.5 right-2.5 p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  title="Temizle"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* AI Optimization Insight Box */}
            {optimization && (
              <div className="rounded-xl bg-indigo-950/40 border border-indigo-500/30 p-4 space-y-3 animate-fadeIn">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-indigo-300">
                      Doğruluk Artırıldı: %{optimization.accuracyRating} Sadakat Skoru
                    </span>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={useOptimizedPrompt}
                      onChange={(e) => setUseOptimizedPrompt(e.target.checked)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                    />
                    <span>İngilizce Optimize Çıktıyı Kullan</span>
                  </label>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{optimization.explanation}"
                </p>

                {useOptimizedPrompt && (
                  <div className="rounded-lg bg-slate-950/70 border border-indigo-900/40 p-2.5 font-mono text-[11px] text-slate-300 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-indigo-400">Model Komutu (Eng):</div>
                    <div className="line-clamp-3">{optimization.optimizedPromptEn}</div>
                  </div>
                )}

                {optimization.keyElements && optimization.keyElements.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-medium">Hedef Unsurlar:</span>
                    {optimization.keyElements.map((el, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-indigo-900/40 text-indigo-200 border border-indigo-500/20"
                      >
                        {el}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reference Image / Image-to-Image */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-indigo-400" />
                  Referans Görsel (İsteğe Bağlı • Image-to-Image)
                </span>
                {referenceImage && (
                  <button
                    type="button"
                    onClick={() => setReferenceImage(null)}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Görseli Kaldır
                  </button>
                )}
              </div>

              {referenceImage ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-indigo-500/30">
                  <img
                    src={referenceImage.data}
                    alt="Referans"
                    className="w-16 h-16 object-cover rounded-lg border border-slate-700"
                  />
                  <div className="text-xs space-y-1 flex-1">
                    <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Referans Görsel Yüklendi
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Yeni görsel bu fotoğrafın stilini, ana karakterini veya nesne pozisyonunu baz alarak üretilecektir.
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-3.5 text-center cursor-pointer transition-colors bg-slate-950/40 hover:bg-slate-950/80"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <Upload className="w-4 h-4 text-indigo-400" />
                    <span>Bir fotoğraf yükleyin veya sürükleyin (Stil / Karakter transferi)</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Style Selector */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-3">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Görsel Stili Seçin</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {STYLES.map((style) => {
                const isSelected = selectedStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyle(style.id)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-gradient-to-b from-indigo-950/70 to-slate-900 border-indigo-500 text-white shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500/40'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xl mb-1">{style.icon}</div>
                    <div className="text-xs font-bold text-slate-200">{style.name}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{style.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-3">
            <label className="text-sm font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>En-Boy Oranı (Aspect Ratio)</span>
              </span>
              <span className="text-xs font-mono text-indigo-400 font-semibold">{aspectRatio}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {RATIOS.map((r) => {
                const isSelected = aspectRatio === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setAspectRatio(r.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-center h-8 mb-2">
                      <div
                        className={`border-2 rounded-sm ${
                          isSelected ? 'border-indigo-400 bg-indigo-500/20' : 'border-slate-600'
                        } ${r.ratioClass}`}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-200">{r.name}</span>
                    <span className="text-[9px] text-slate-400 text-center">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Advanced Settings (Negative Prompt) */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Gelişmiş Filtreler & Negatif Prompt (Hata Önleme)
              </span>
              <span className="text-indigo-400">{showAdvanced ? 'Gizle' : 'Göster'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-4 pt-3 border-t border-slate-800 space-y-3 animate-fadeIn">
                <div>
                  <label htmlFor="negative-prompt" className="text-xs text-slate-400 block mb-1">
                    İstenmeyen Öğeler (Negative Prompt - Çıktıda ASLA yer almasın):
                  </label>
                  <input
                    id="negative-prompt"
                    type="text"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="blurry, distorted, bad anatomy, watermark..."
                    className="w-full rounded-lg bg-slate-950/80 border border-slate-800 p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Bozuk parmaklar, garip gözler, bulanıklık gibi hataları engellemek için filtreler aktiftir.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-rose-950/50 border border-rose-500/40 p-4 text-xs text-rose-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold">Görsel Üretim Uyarısı</div>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className={`w-full py-4 rounded-xl text-sm font-bold tracking-wide flex items-center justify-center gap-2 transition-all shadow-xl ${
              isGenerating
                ? 'bg-slate-800 text-slate-400 cursor-wait'
                : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:brightness-110 active:scale-[0.99]'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Yüksek Doğrulukta İşleniyor... (Lütfen bekleyin)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Görseli Üret (Hatasız & Kesin Doğrulukla)</span>
              </>
            )}
          </button>
        </div>

        {/* RIGHT COLUMN: Live Viewport & Results (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-24 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span>Stüdyo Önizleme & Sonuç</span>
              </h3>
              {latestItem && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Tamamlandı
                </span>
              )}
            </div>

            {/* Viewport Area */}
            <div className="relative w-full aspect-square rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center group">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                    <Sparkles className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-200">Görsel İşleniyor</p>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Kompozisyon geometrisi taranıyor ve yüksek çözünürlüklü doku uygulanıyor...
                    </p>
                  </div>
                </div>
              ) : latestItem ? (
                <>
                  <img
                    src={latestItem.url}
                    alt={latestItem.prompt}
                    className="w-full h-full object-contain bg-slate-950 transition-transform duration-300 group-hover:scale-[1.01]"
                  />
                  {/* Hover Overlay Controls */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                    <button
                      type="button"
                      onClick={() => onOpenPreview(latestItem)}
                      className="p-2 rounded-lg bg-slate-900/90 text-white hover:bg-indigo-600 transition-colors shadow-lg"
                      title="Tam Ekran Önizleme"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadImage(latestItem.url, `visioncraft-${latestItem.id}.png`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors shadow-lg"
                      title="PNG İndir"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>İndir</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <ImageIcon className="w-7 h-7 text-slate-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400">Henüz Görsel Üretilmedi</p>
                    <p className="text-[11px] text-slate-600 max-w-xs">
                      Soldaki kutuya bir açıklama yazıp 'Görseli Üret' butonuna basın.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions after Generation */}
            {latestItem && (
              <div className="space-y-3 pt-2">
                {/* Send to Video Studio Button */}
                <button
                  type="button"
                  onClick={() => onSendToVideo(latestItem)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600/30 to-violet-600/30 border border-amber-500/40 hover:border-amber-400 text-amber-200 text-xs font-bold flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-95"
                >
                  <Video className="w-4 h-4 text-amber-400" />
                  <span>Bu Görseli Videoya Dönüştür (Image-to-Video)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Prompt Details Card */}
                <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">Üretilen Prompt:</span>
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                    >
                      {copiedPrompt ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Kopyala</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-sans">
                    {latestItem.prompt}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-500 font-mono">
                    <span>Oran: {latestItem.aspectRatio}</span>
                    <span>•</span>
                    <span>Stil: {latestItem.style}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
