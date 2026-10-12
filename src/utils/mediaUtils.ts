/**
 * Utility functions for parsing and rendering media URLs (YouTube, Google Drive, direct links).
 */

export function getYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Pattern matching:
  // - youtube.com/watch?v=ID
  // - youtu.be/ID
  // - youtube.com/embed/ID
  // - youtube.com/shorts/ID
  // - youtube.com/v/ID
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

export function getGoogleDriveFileId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Pattern 1: /file/d/FILE_ID
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{20,})/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  // Pattern 2: id=FILE_ID
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
  if (idMatch && idMatch[1]) return idMatch[1];

  // Pattern 3: /d/FILE_ID
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  if (dMatch && dMatch[1]) return dMatch[1];

  return null;
}

export function getVimeoVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const match = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/);
  return match && match[3] ? match[3] : null;
}

export interface MediaEmbedInfo {
  provider: 'youtube' | 'google-drive' | 'vimeo' | 'direct' | 'unknown';
  embedUrl: string;
  directUrl: string;
  originalUrl: string;
  thumbnailUrl?: string;
  driveFileId?: string;
  youtubeId?: string;
  isDrive: boolean;
  isYouTube: boolean;
  driveImageUrls?: string[];
}

export function resolveMediaEmbedInfo(url: string, type?: string): MediaEmbedInfo {
  const trimmed = (url || '').trim();
  
  // 1. YouTube
  const youtubeId = getYouTubeVideoId(trimmed);
  if (youtubeId) {
    return {
      provider: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`,
      directUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
      originalUrl: trimmed,
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
      youtubeId,
      isYouTube: true,
      isDrive: false
    };
  }

  // 2. Google Drive
  const driveFileId = getGoogleDriveFileId(trimmed);
  if (driveFileId) {
    const drivePreviewUrl = `https://drive.google.com/file/d/${driveFileId}/preview`;
    const driveViewUrl = `https://drive.google.com/file/d/${driveFileId}/view`;
    
    // For images, Google Drive provides several high-res rendering endpoints
    const driveImageUrls = [
      `https://lh3.googleusercontent.com/d/${driveFileId}`,
      `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w1600`,
      `https://drive.google.com/uc?id=${driveFileId}&export=view`,
      drivePreviewUrl
    ];

    return {
      provider: 'google-drive',
      embedUrl: drivePreviewUrl,
      directUrl: driveViewUrl,
      originalUrl: trimmed,
      driveFileId,
      isDrive: true,
      isYouTube: false,
      driveImageUrls,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w800`
    };
  }

  // 3. Vimeo
  const vimeoId = getVimeoVideoId(trimmed);
  if (vimeoId) {
    return {
      provider: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
      directUrl: `https://vimeo.com/${vimeoId}`,
      originalUrl: trimmed,
      isDrive: false,
      isYouTube: false
    };
  }

  // 4. Direct URL or other
  return {
    provider: 'direct',
    embedUrl: trimmed,
    directUrl: trimmed,
    originalUrl: trimmed,
    isDrive: false,
    isYouTube: false
  };
}
