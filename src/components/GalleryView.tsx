import React, { useState } from 'react';
import {
  History,
  Image as ImageIcon,
  Video as VideoIcon,
  Download,
  Trash2,
  Maximize2,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Film
} from 'lucide-react';
import { GeneratedItem } from '../types';

interface GalleryViewProps {
  items: GeneratedItem[];
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onOpenPreview: (item: GeneratedItem) => void;
  onSelectForVideo: (item: GeneratedItem) => void;
  onGoToStudio: (tab: 'image' | 'video') => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  items,
  onDeleteItem,
  onClearAll,
  onOpenPreview,
  onSelectForVideo,
  onGoToStudio,
}) => {
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (item: GeneratedItem) => {
    const ext = item.type === 'video' ? 'mp4' : 'png';
    const link = document.createElement('a');
    link.href = item.url;
    link.download = `visioncraft-${item.id}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <span>Stüdyo Galerisi & Üretim Geçmişi</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Ürettiğiniz tüm görsel ve videolar tarayıcınızda saklanır. İstediğiniz zaman indirebilirsiniz.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tümü ({items.length})
            </button>
            <button
              onClick={() => setFilter('image')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'image'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Görseller</span>
            </button>
            <button
              onClick={() => setFilter('video')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'video'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <VideoIcon className="w-3.5 h-3.5" />
              <span>Videolar</span>
            </button>
          </div>

          {items.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Tüm geçmişi temizlemek istediğinize emin misiniz?')) {
                  onClearAll();
                }
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-slate-800 transition-colors"
              title="Geçmişi Temizle"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
            <History className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-300">Bu kategoride henüz üretim yok</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Görsel veya video stüdyosuna geçip ilk yapay zeka eserinizi saniyeler içinde oluşturabilirsiniz.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onGoToStudio('image')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
            >
              Görsel Stüdyosuna Git
            </button>
            <button
              onClick={() => onGoToStudio('video')}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md"
            >
              Video Stüdyosuna Git
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 overflow-hidden shadow-lg transition-all hover:-translate-y-1"
            >
              {/* Media Thumbnail */}
              <div
                className="relative aspect-square w-full bg-slate-950 overflow-hidden cursor-pointer"
                onClick={() => onOpenPreview(item)}
              >
                {item.type === 'video' ? (
                  <div className="relative w-full h-full">
                    <video
                      src={item.url}
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/20 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-violet-600/80 backdrop-blur-md flex items-center justify-center text-white shadow-lg">
                        <Film className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.prompt}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}

                {/* Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 backdrop-blur-md border border-white/10 text-white">
                  {item.type === 'video' ? (
                    <>
                      <VideoIcon className="w-3 h-3 text-violet-400" />
                      <span>{item.duration || 'Video'}</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-3 h-3 text-indigo-400" />
                      <span>{item.aspectRatio}</span>
                    </>
                  )}
                </div>

                {/* Hover overlay with action buttons */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenPreview(item);
                    }}
                    className="p-2 rounded-lg bg-slate-900/90 hover:bg-indigo-600 text-white transition-colors"
                    title="Büyük Görünüm"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {item.type === 'image' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectForVideo(item);
                        }}
                        className="p-2 rounded-lg bg-amber-600/90 hover:bg-amber-500 text-white transition-colors"
                        title="Bu görselden video yap"
                      >
                        <Film className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(item);
                      }}
                      className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                      title="İndir"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteItem(item.id);
                      }}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Meta / Prompt snippet */}
              <div className="p-3 space-y-2">
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {item.prompt}
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                  <span>{new Date(item.timestamp).toLocaleDateString('tr-TR')}</span>
                  <button
                    onClick={() => handleCopyPrompt(item.id, item.optimizedPrompt || item.prompt)}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                        <span className="text-emerald-400">Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-2.5 h-2.5" />
                        <span>Prompt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
