/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageStudio } from './components/ImageStudio';
import { VideoStudio } from './components/VideoStudio';
import { GalleryView } from './components/GalleryView';
import { SecurityGuideModal } from './components/SecurityGuideModal';
import { PromptTemplatesModal } from './components/PromptTemplatesModal';
import { MediaPreviewModal } from './components/MediaPreviewModal';
import { GeneratedItem, ServerStatusResponse } from './types';
import { PromptTemplate } from './data/promptTemplates';
import {
  clearAllHistory,
  fetchServerStatus,
  loadHistory,
  removeFromHistory,
  saveToHistory,
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'gallery' | 'security'>('image');
  const [history, setHistory] = useState<GeneratedItem[]>([]);
  const [serverStatus, setServerStatus] = useState<ServerStatusResponse | null>(null);

  // Modals
  const [previewItem, setPreviewItem] = useState<GeneratedItem | null>(null);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);

  // Cross-studio handoff (e.g. image-to-video)
  const [handoffImage, setHandoffImage] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    // Load local history
    const stored = loadHistory();
    setHistory(stored);

    // Fetch server status & key mask
    fetchServerStatus()
      .then((status) => setServerStatus(status))
      .catch((err) => {
        console.warn('Server status check note:', err);
      });
  }, []);

  const handleMediaGenerated = (item: GeneratedItem) => {
    saveToHistory(item);
    setHistory((prev) => [item, ...prev].slice(0, 40));
  };

  const handleDeleteItem = (id: string) => {
    const updated = removeFromHistory(id);
    setHistory(updated);
  };

  const handleClearHistory = () => {
    clearAllHistory();
    setHistory([]);
  };

  const handleSendToVideo = (item: GeneratedItem) => {
    setHandoffImage(item.url);
    setActiveTab('video');
  };

  const handleSelectTemplate = (template: PromptTemplate) => {
    if (template.mediaType === 'video') {
      setActiveTab('video');
    } else {
      setActiveTab('image');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        serverStatus={serverStatus}
        historyCount={history.length}
        openSecurityModal={() => setActiveTab('security')}
        openTemplatesModal={() => setIsTemplatesOpen(true)}
      />

      {/* Main Studio Content Area */}
      <main className="flex-1">
        {activeTab === 'image' && (
          <ImageStudio
            onMediaGenerated={handleMediaGenerated}
            onSendToVideo={handleSendToVideo}
            onOpenPreview={(item) => setPreviewItem(item)}
          />
        )}

        {activeTab === 'video' && (
          <VideoStudio
            initialReferenceImage={handoffImage}
            onMediaGenerated={handleMediaGenerated}
            onOpenPreview={(item) => setPreviewItem(item)}
          />
        )}

        {activeTab === 'gallery' && (
          <GalleryView
            items={history}
            onDeleteItem={handleDeleteItem}
            onClearAll={handleClearHistory}
            onOpenPreview={(item) => setPreviewItem(item)}
            onSelectForVideo={handleSendToVideo}
            onGoToStudio={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'security' && (
          <SecurityGuideModal
            serverStatus={serverStatus}
            onClose={() => setActiveTab('image')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">VisionCraft AI Studio</span>
            <span>•</span>
            <span>Doğruluk Garantili Görsel & Video Motoru</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <button
              onClick={() => setActiveTab('security')}
              className="hover:text-emerald-400 transition-colors"
            >
              API Key Koruma Mimarisi
            </button>
            <span>•</span>
            <button
              onClick={() => setIsTemplatesOpen(true)}
              className="hover:text-indigo-400 transition-colors"
            >
              Örnek Promptlar
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <MediaPreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
        onSendToVideo={handleSendToVideo}
      />

      <PromptTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}
