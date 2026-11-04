import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Film,
  Sparkles,
  Maximize2,
  Calendar,
  Layers,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { GeneratedItem } from '../types';

interface MediaPreviewModalProps {
  item: GeneratedItem | null;
  onClose: () => void;
  onSendToVideo?: (item: GeneratedItem) => void;
}

export const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  item,
  onClose,
  onSendToVideo,
}) => {
  if (!item) return null;

  const [copied, setCopied] = useState(false);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(item.optimizedPrompt || item.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = item.type === 'video' ? 'mp4' : 'png';
    const link = document.createElement('a');
    link.href = item.url;
    link.download = `visioncraft-${item.id}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[92vh] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-850 transition-colors border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Preview (Left / Top) */}
        <div className="lg:w-3/5 bg-slate-950 flex items-center justify-center p-4 min-h-[320px] lg:min-h-[500px]">
          {item.type === 'video' ? (
            <video
              src={item.url}
              controls
              autoPlay
              loop
              playsInline
              className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
          ) : (
            <img
              src={item.url}
              alt={item.prompt}
              className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
          )}
        </div>

        {/* Details & Controls (Right / Bottom) */}
        <div className="lg:w-2/5 p-6 flex flex-col justify-between overflow-y-auto space-y-6 border-t lg:border-t-0 lg:border-l border-slate-800">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {item.type === 'video' ? 'AI Video Çıktısı' : 'AI Görsel Çıktısı'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date(item.timestamp).toLocaleString('tr-TR')}
              </span>
            </div>

            {/* Prompt details */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Kullanıcı İstemi (Prompt):</span>
                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Kopyalandı</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Kopyala</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans max-h-36 overflow-y-auto">
                {item.prompt}
              </div>
            </div>

            {/* Model & Metadata parameters */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-slate-400">Üretim Parametreleri:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-0.5">
                  <div className="text-[10px] text-slate-500 uppercase">En-Boy Oranı</div>
                  <div className="font-mono text-slate-200 font-semibold">{item.aspectRatio}</div>
                </div>

                {item.style && (
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-0.5">
                    <div className="text-[10px] text-slate-500 uppercase">Görsel Stil</div>
                    <div className="text-slate-200 font-semibold">{item.style}</div>
                  </div>
                )}

                {item.duration && (
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-0.5">
                    <div className="text-[10px] text-slate-500 uppercase">Süre</div>
                    <div className="text-slate-200 font-semibold font-mono">{item.duration}</div>
                  </div>
                )}

                {item.cameraMovement && (
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-0.5">
                    <div className="text-[10px] text-slate-500 uppercase">Kamera Hareketi</div>
                    <div className="text-slate-200 font-semibold">{item.cameraMovement}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-4 border-t border-slate-800">
            {item.type === 'image' && onSendToVideo && (
              <button
                type="button"
                onClick={() => {
                  onSendToVideo(item);
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <Film className="w-4 h-4" />
                <span>Bu Görseli Videoya Dönüştür (Image-to-Video)</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownload}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Cihazıma İndir ({item.type === 'video' ? 'MP4' : 'PNG'})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
