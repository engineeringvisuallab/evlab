export type GraphicsTier = 'low' | 'medium' | 'high';

export interface GraphicsSettings {
  tier: GraphicsTier;
  antialias: boolean;
  pixelRatioCap: number;
  shadowsEnabled: boolean;
  shadowMapType: 'basic' | 'soft';
  shadowMapSize: number;
}

/**
 * Cheap, synchronous heuristic to pick a graphics tier for the device -
 * no benchmarking, just cores/memory/mobile checks, so it costs nothing
 * at startup. Used to scale the renderer's most expensive settings
 * (shadows, antialias, pixel ratio) instead of always maxing them out.
 */
export function detectGraphicsTier(): GraphicsTier {
  if (typeof navigator === 'undefined') return 'high';

  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const cores = navigator.hardwareConcurrency || 4;
  // deviceMemory is a non-standard Chrome-only API; treat missing as unknown/mid.
  const memory = (navigator as any).deviceMemory as number | undefined;

  if (isMobile || cores <= 3 || (memory !== undefined && memory <= 3)) {
    return 'low';
  }
  if (cores <= 6 || (memory !== undefined && memory <= 6)) {
    return 'medium';
  }
  return 'high';
}

export function getGraphicsSettings(tier: GraphicsTier = detectGraphicsTier()): GraphicsSettings {
  switch (tier) {
    case 'low':
      return {
        tier,
        antialias: false,
        pixelRatioCap: 1,
        shadowsEnabled: false,
        shadowMapType: 'basic',
        shadowMapSize: 1024,
      };
    case 'medium':
      return {
        tier,
        antialias: false,
        pixelRatioCap: 1.5,
        shadowsEnabled: true,
        shadowMapType: 'basic',
        shadowMapSize: 1536,
      };
    case 'high':
    default:
      return {
        tier,
        antialias: true,
        pixelRatioCap: 2,
        shadowsEnabled: true,
        shadowMapType: 'soft',
        shadowMapSize: 2048,
      };
  }
}
