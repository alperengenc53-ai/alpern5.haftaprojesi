export type MediaType = 'image' | 'video';

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export type VideoDuration = '5s' | '10s';

export type VideoResolution = '720p' | '1080p';

export type VisualStyle =
  | 'realistic'
  | 'cinematic'
  | 'digital-art'
  | '3d-render'
  | 'anime'
  | 'vintage'
  | 'cyberpunk'
  | 'minimalist';

export type CameraMovement = 'cinematic' | 'pan' | 'zoom' | 'drone' | 'static';

export interface PromptOptimization {
  optimizedPromptEn: string;
  optimizedPromptTr: string;
  negativePrompt: string;
  keyElements: string[];
  accuracyRating: number;
  explanation: string;
}

export interface GeneratedItem {
  id: string;
  type: MediaType;
  url: string;
  prompt: string;
  optimizedPrompt?: string;
  style?: string;
  aspectRatio: string;
  duration?: string;
  resolution?: string;
  cameraMovement?: string;
  timestamp: number;
  referenceImageThumb?: string;
}

export interface ServerStatusResponse {
  status: string;
  configured: boolean;
  maskedKey: string;
  source: string;
  features: {
    imageGeneration: boolean;
    videoGeneration: boolean;
    promptOptimization: boolean;
    imageToVideo: boolean;
    imageToImage: boolean;
  };
}
