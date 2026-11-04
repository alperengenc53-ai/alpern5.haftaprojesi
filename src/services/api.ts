import { AspectRatio, CameraMovement, GeneratedItem, PromptOptimization, ServerStatusResponse, VisualStyle } from '../types';

const STORAGE_KEY = 'visioncraft_history_v1';
const CLIENT_KEY_STORAGE = 'visioncraft_custom_api_key';

export function getStoredClientKey(): string {
  try {
    return localStorage.getItem(CLIENT_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function setStoredClientKey(key: string): void {
  try {
    if (!key) {
      localStorage.removeItem(CLIENT_KEY_STORAGE);
    } else {
      localStorage.setItem(CLIENT_KEY_STORAGE, key.trim());
    }
  } catch (err) {
    console.error('Failed to save client key:', err);
  }
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const clientKey = getStoredClientKey();
  if (clientKey) {
    headers['x-gemini-key'] = clientKey;
  }
  return headers;
}

export async function fetchServerStatus(): Promise<ServerStatusResponse> {
  const res = await fetch('/api/status', {
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error('Sunucu durum bilgisi alınamadı.');
  }
  return res.json();
}

export async function optimizePromptApi(params: {
  prompt: string;
  mediaType: 'image' | 'video';
  style?: string;
  fidelity?: 'high' | 'ultra';
}): Promise<PromptOptimization> {
  const res = await fetch('/api/optimize-prompt', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.details || 'Prompt iyileştirilemedi.');
  }
  return data.data;
}

export async function generateImageApi(params: {
  prompt: string;
  aspectRatio: AspectRatio;
  style: VisualStyle;
  referenceImage?: { data: string; mimeType: string };
  negativePrompt?: string;
}): Promise<{ imageUrl: string; prompt: string; style: string; aspectRatio: string }> {
  const res = await fetch('/api/generate-image', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    const fullMsg = [
      data.error,
      data.details && data.details !== data.error ? data.details : '',
      data.actionTip ? `👉 ${data.actionTip}` : '',
    ].filter(Boolean).join('\n\n');
    throw new Error(fullMsg || 'Görsel üretimi başarısız oldu.');
  }
  return data;
}

export async function generateVideoApi(params: {
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  duration: '5s' | '10s';
  resolution: '720p' | '1080p';
  cameraMovement: CameraMovement;
  referenceImage?: { data: string; mimeType: string };
}): Promise<{ videoUrl: string; prompt: string; aspectRatio: string; duration: string; resolution: string }> {
  const res = await fetch('/api/generate-video', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    const fullMsg = [
      data.error,
      data.details && data.details !== data.error ? data.details : '',
      data.actionTip ? `👉 ${data.actionTip}` : '',
    ].filter(Boolean).join('\n\n');
    throw new Error(fullMsg || 'Video üretimi başarısız oldu.');
  }
  return data;
}

export function loadHistory(): GeneratedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('History load error:', e);
    return [];
  }
}

export function saveToHistory(item: GeneratedItem): void {
  try {
    const current = loadHistory();
    // Keep max 40 items to manage localStorage quota
    const updated = [item, ...current].slice(0, 40);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('History save error:', e);
  }
}

export function removeFromHistory(id: string): GeneratedItem[] {
  try {
    const current = loadHistory();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('History remove error:', e);
    return [];
  }
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('History clear error:', e);
  }
}
