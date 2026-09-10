export const COLORS = {
  bg: {
    primary: '#0A0A0F',
    secondary: '#12121A',
    elevated: '#1A1A2E',
  },
  accent: {
    primary: '#8B5CF6',
    secondary: '#06D6A0',
    pink: '#F72585',
    blue: '#3B82F6',
  },
  text: {
    primary: '#F4F4F5',
    secondary: '#A1A1AA',
    muted: '#52525B',
  },
  surface: {
    glass: 'rgba(255,255,255,0.08)',
  }
};

export const GRADIENTS: [string, string][] = [
  ['#8B5CF6', '#3B82F6'],
  ['#F72585', '#7209B7'],
  ['#06D6A0', '#118AB2'],
  ['#FF9E00', '#FF5400'],
  ['#4361EE', '#3A0CA3'],
  ['#F72585', '#4361EE'],
  ['#06D6A0', '#8B5CF6'],
];

export function generateGradient(seed: string): [string, string] {
  if (!seed) return GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
}

export function getContrastColor(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse RGB
  let r = 0, g = 0, b = 0;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    return '#F4F4F5'; // Fallback to white text
  }

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#0A0A0F' : '#F4F4F5';
}
