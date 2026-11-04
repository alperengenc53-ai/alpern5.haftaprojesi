import React from 'react';
import { X, Sparkles, Image as ImageIcon, Video as VideoIcon, ArrowRight, Check } from 'lucide-react';
import { PROMPT_TEMPLATES, PromptTemplate } from '../data/promptTemplates';

interface PromptTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: PromptTemplate) => void;
}

export const PromptTemplatesModal: React.FC<PromptTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[85vh] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Yüksek Doğruluklu Şablon Kütüphanesi</h3>
              <p className="text-xs text-slate-400">
                Rastgeleliği önlemek için önceden test edilmiş, kusursuz sonuç veren prompt kalıpları
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROMPT_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => {
                  onSelectTemplate(tpl);
                  onClose();
                }}
                className="group p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/60 cursor-pointer transition-all hover:-translate-y-0.5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                    {tpl.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                    {tpl.mediaType === 'video' ? (
                      <span className="flex items-center gap-1 text-violet-400">
                        <VideoIcon className="w-3 h-3" /> Video
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-indigo-400">
                        <ImageIcon className="w-3 h-3" /> Görsel
                      </span>
                    )}
                    <span>• {tpl.aspectRatio}</span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                  {tpl.title}
                </h4>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  "{tpl.prompt}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px]">
                  <span className="text-emerald-400 font-medium">{tpl.description}</span>
                  <span className="flex items-center gap-1 text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    Kullan <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
