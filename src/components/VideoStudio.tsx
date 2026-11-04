import React, { useState, useRef, useEffect } from 'react';
import {
  Video as VideoIcon,
  Sparkles,
  Wand2,
  Sliders,
  Download,
  Copy,
  Check,
  RefreshCw,
  Maximize2,
  Upload,
  X,
  AlertCircle,
  Play,
  Film,
  Camera,
  Layers,
  ArrowRight,
  ShieldCheck,
  Clock,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { CameraMovement, GeneratedItem, PromptOptimization, VideoDuration, VideoResolution } from '../types';
import { generateVideoApi, optimizePromptApi } from '../services/api';

interface VideoStudioProps {
  initialReferenceImage?: string | null;
  onMediaGenerated: (item: GeneratedItem) => void;
  onOpenPreview: (item: GeneratedItem) => void;
}

const CAMERA_MOVEMENTS: { id: CameraMovement; name: string; desc: string; icon: string }[] = [
  { id: 'cinematic', name: 'Sinematik Takip', desc: 'Akıcı gimbal ve kamera takibi', icon: '🎬' },
  { id: 'zoom', name: 'Yavaş Yakınlaşma', desc: 'Dramatik dolly zoom hareketi', icon: '🔍' },
  { id: 'pan', name: 'Panoramik Kayma', desc: 'Yatay eksende pürüzsüz kaydırma', icon: '↔️' },
  { id: 'drone', name: 'Drone Kuş Bakışı', desc: 'Geniş açılı havadan süzülüş', icon: '🛸' },
  { id: 'static', name: 'Statik Odak', desc: 'Sabit tripod ve sahne içi hareket', icon: '📐' },
];

export const VideoStudio: React.FC<VideoStudioProps> = ({
  initialReferenceImage,
  onMediaGenerated,
  onOpenPreview,
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [duration, setDuration] = useState<VideoDuration>('5s');
  const [resolution, setResolution] = useState<VideoResolution>('720p');
  const [cameraMovement, setCameraMovement] = useState<CameraMovement>('cinematic');

  // Reference Image state
  const [referenceImage, setReferenceImage] = useState<{ data: string; mimeType: string } | null>(
    initialReferenceImage ? { data: initialReferenceImage, mimeType: 'image/png' } : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial reference image if passed
  useEffect(() => {
    if (initialReferenceImage) {
      setReferenceImage({ data: initialReferenceImage, mimeType: 'image/png' });
    }
  }, [initialReferenceImage]);

  // Optimization
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimization, setOptimization] = useState<PromptOptimization | null>(null);

  // Generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<number>(1);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [latestItem, setLatestItem] = useState<GeneratedItem | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Timer effect for video generation progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setElapsedSeconds(0);
      setGenerationPhase(1);
      interval = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          if (next > 45) setGenerationPhase(4);
          else if (next > 25) setGenerationPhase(3);
          else if (next > 10) setGenerationPhase(2);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

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

  const handleOptimizePrompt = async () => {
    if (!prompt.trim()) {
      setError('Lütfen önce video için bir fikir veya hareket tarifi yazın.');
      return;
    }

    setError(null);
    setIsOptimizing(true);
    try {
      const result = await optimizePromptApi({
        prompt: prompt.trim(),
        mediaType: 'video',
        style: cameraMovement,
        fidelity: 'ultra',
      });
      setOptimization(result);
    } catch (err: any) {
      setError(`İyileştirme hatası: ${err.message || 'Lütfen tekrar deneyin.'}`);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !referenceImage) {
      setError('Lütfen bir video açıklaması yazın veya canlandırılacak bir fotoğraf yükleyin.');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const effectivePrompt = optimization?.optimizedPromptEn || prompt.trim() || 'Natural dynamic camera movement';

      const result = await generateVideoApi({
        prompt: effectivePrompt,
        aspectRatio,
        duration,
        resolution,
        cameraMovement,
        referenceImage: referenceImage || undefined,
      });

      const newItem: GeneratedItem = {
        id: `vid-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        type: 'video',
        url: result.videoUrl,
        prompt: prompt.trim() || 'Görselden Video Üretimi',
        optimizedPrompt: optimization?.optimizedPromptEn,
        aspectRatio,
        duration,
        resolution,
        cameraMovement,
        timestamp: Date.now(),
        referenceImageThumb: referenceImage?.data,
      };

      setLatestItem(newItem);
      onMediaGenerated(newItem);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Video üretimi sırasında bir sorun oluştu. Lütfen tekrar deneyin.');
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

  const downloadVideo = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-950/70 via-slate-900 to-amber-950/50 border border-violet-500/20 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30">
              <Film className="w-3.5 h-3.5 text-violet-400" />
              Gemini Omni Flash (Veo) Video Motoru
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Yüksek Çözünürlüklü Sinematik Video Üretimi
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              İster sıfırdan metin ile video oluşturun, ister yüklediğiniz bir fotoğrafa gerçekçi kamera
              dinamikleri katarak canlandırın (Image-to-Video).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-right">
              <div className="text-[11px] text-slate-400 font-medium">Video Modeli</div>
              <div className="text-xs font-mono font-semibold text-amber-300">gemini-omni-1.1-flash</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Video Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Prompt & Input Box */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="video-prompt" className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <VideoIcon className="w-4 h-4 text-violet-400" />
                <span>Video Sahnesini ve Hareketini Tarif Edin</span>
              </label>
              <button
                type="button"
                onClick={handleOptimizePrompt}
                disabled={isOptimizing || !prompt.trim()}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isOptimizing
                    ? 'bg-violet-900/50 text-violet-300 cursor-wait'
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/25 hover:brightness-110 active:scale-95'
                }`}
                title="Hareketi ve kamera dinamiğini yapay zeka ile mükemmelleştirir"
              >
                <Wand2 className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
                <span>{isOptimizing ? 'Optimize Ediliyor...' : 'Hareketi Optimize Et'}</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                id="video-prompt"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Örnek: Güneşin altın rengi battığı tropik bir adada, turkuaz okyanus dalgalarının kumsala vurması, pürüzsüz yavaş drone süzülüşü, sinematik 4K..."
                className="w-full rounded-xl bg-slate-950/80 border border-slate-800 p-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/80 transition-all resize-none font-sans"
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

            {/* AI Optimization Display */}
            {optimization && (
              <div className="rounded-xl bg-violet-950/40 border border-violet-500/30 p-4 space-y-2.5 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-violet-300">
                    Kamera ve Hareket Detaylandırıldı (%{optimization.accuracyRating} Sadakat)
                  </span>
                </div>
                <p className="text-xs text-slate-300 italic">
                  "{optimization.explanation}"
                </p>
                <div className="rounded-lg bg-slate-950/70 border border-violet-900/40 p-2.5 font-mono text-[11px] text-slate-300">
                  <div className="text-[10px] uppercase font-bold text-violet-400 mb-0.5">Model Yönergesi:</div>
                  <div className="line-clamp-3">{optimization.optimizedPromptEn}</div>
                </div>
              </div>
            )}

            {/* Reference Image / Image-to-Video Section */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  Başlangıç Karesi (Görsele Can Ver • Image-to-Video)
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
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-amber-500/30">
                  <img
                    src={referenceImage.data}
                    alt="Canlandırılacak Görsel"
                    className="w-20 h-14 object-cover rounded-lg border border-slate-700"
                  />
                  <div className="text-xs space-y-1 flex-1">
                    <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Başlangıç Karesi Aktif
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Video bu fotoğrafın ilk karesinden başlayarak belirlediğiniz kamera hareketiyle canlandırılacaktır.
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-xl p-3.5 text-center cursor-pointer transition-colors bg-slate-950/40 hover:bg-slate-950/80"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Canlandırmak istediğiniz bir fotoğraf yükleyin (İsteğe bağlı)</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Camera Movement Presets */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-3">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Compass className="w-4 h-4 text-violet-400" />
              <span>Kamera Hareketi & Dinamikler</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {CAMERA_MOVEMENTS.map((cam) => {
                const isSelected = cameraMovement === cam.id;
                return (
                  <button
                    key={cam.id}
                    type="button"
                    onClick={() => setCameraMovement(cam.id)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-violet-950/60 border-violet-500 text-white shadow-md shadow-violet-500/20 ring-1 ring-violet-500/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xl mb-1">{cam.icon}</div>
                    <div className="text-xs font-bold text-slate-200">{cam.name}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{cam.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Video Parameters (Aspect Ratio, Duration, Resolution) */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-violet-400" />
              <span>Video Çıktı Formatı & Süre</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Aspect Ratio */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">En-Boy Oranı:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      aspectRatio === '16:9'
                        ? 'bg-violet-950/70 border-violet-500 text-violet-200 ring-1 ring-violet-500/40'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    16:9 (Yatay)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('9:16')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      aspectRatio === '9:16'
                        ? 'bg-violet-950/70 border-violet-500 text-violet-200 ring-1 ring-violet-500/40'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    9:16 (Dikey)
                  </button>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Video Süresi:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDuration('5s')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      duration === '5s'
                        ? 'bg-violet-950/70 border-violet-500 text-violet-200 ring-1 ring-violet-500/40'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    5 Saniye
                  </button>
                  <button
                    type="button"
                    onClick={() => setDuration('10s')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      duration === '10s'
                        ? 'bg-violet-950/70 border-violet-500 text-violet-200 ring-1 ring-violet-500/40'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    10 Saniye
                  </button>
                </div>
              </div>

              {/* Resolution */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Çözünürlük:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setResolution('720p')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      resolution === '720p'
                        ? 'bg-violet-950/70 border-violet-500 text-violet-200 ring-1 ring-violet-500/40'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    720p HD
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolution('1080p')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      resolution === '1080p'
                        ? 'bg-violet-950/70 border-violet-500 text-violet-200 ring-1 ring-violet-500/40'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    1080p FHD
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-rose-950/50 border border-rose-500/40 p-4 text-xs text-rose-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold">Video Üretim Uyarısı</div>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || (!prompt.trim() && !referenceImage)}
            className={`w-full py-4 rounded-xl text-sm font-bold tracking-wide flex items-center justify-center gap-2 transition-all shadow-xl ${
              isGenerating
                ? 'bg-slate-800 text-slate-400 cursor-wait'
                : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-600 text-white shadow-violet-600/30 hover:shadow-violet-600/50 hover:brightness-110 active:scale-[0.99]'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Video Render Ediliyor... ({elapsedSeconds}sn)</span>
              </>
            ) : (
              <>
                <Film className="w-5 h-5" />
                <span>Videoyu Üret (Veo Omni Flash ile)</span>
              </>
            )}
          </button>
        </div>

        {/* RIGHT COLUMN: Video Player & Output (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-24 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Play className="w-4 h-4 text-violet-400" />
                <span>Video Önizleme Sahnesi</span>
              </h3>
              {latestItem && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {latestItem.duration} • {latestItem.resolution}
                </span>
              )}
            </div>

            {/* Video Canvas Container */}
            <div
              className={`relative w-full rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center ${
                aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[520px]' : 'aspect-video'
              }`}
            >
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-5">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
                    <Film className="w-8 h-8 text-violet-400 absolute inset-0 m-auto animate-pulse" />
                  </div>

                  {/* Staged Progress Indicator */}
                  <div className="w-full max-w-xs space-y-2 text-left">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="font-semibold">
                        {generationPhase === 1 && '1/4: Sahne & Prompt Analizi'}
                        {generationPhase === 2 && '2/4: Anahtar Kareler Oluşturuluyor'}
                        {generationPhase === 3 && '3/4: Fizik ve Hareket Akışı Hesaplanıyor'}
                        {generationPhase === 4 && '4/4: Video Çıktısı Kodlanıyor'}
                      </span>
                      <span className="font-mono text-violet-400">{elapsedSeconds}sn</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-amber-500 transition-all duration-500"
                        style={{
                          width: `${Math.min(95, (elapsedSeconds / 60) * 100)}%`,
                        }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-500 text-center">
                      Yapay zeka modelleri kare kare sinematik çıktı hazırlamaktadır. Ortalama 30-90 saniye sürer.
                    </p>
                  </div>
                </div>
              ) : latestItem ? (
                <video
                  src={latestItem.url}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-contain bg-slate-950"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <Film className="w-7 h-7 text-slate-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400">Henüz Video Üretilmedi</p>
                    <p className="text-[11px] text-slate-600 max-w-xs">
                      Soldaki panelden hareket tarifinizi girip 'Videoyu Üret' butonuna basın.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Controls / Download */}
            {latestItem && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => downloadVideo(latestItem.url, `visioncraft-${latestItem.id}.mp4`)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Videoyu İndir (MP4)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenPreview(latestItem)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    title="Büyük Ekranda İncele"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">Video Promptu:</span>
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      className="text-[11px] text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium"
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
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {latestItem.prompt}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-500 font-mono">
                    <span>Süre: {latestItem.duration}</span>
                    <span>•</span>
                    <span>Hareket: {latestItem.cameraMovement}</span>
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
