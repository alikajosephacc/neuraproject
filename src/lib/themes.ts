export interface MonkeyTheme {
  id: string;
  name: string;
  isDark: boolean;
  bg: string;
  cardBg: string;
  text: string;
  sub: string;
  accent: string;
  border: string;
  bannerBg: string;
}

/**
 * Curated Monkeytype theme collection based on user screenshot:
 * Features top light themes and coordinated dark themes.
 */
export const MONKEY_THEMES: MonkeyTheme[] = [
  // Lighter themes on top (Row 1-5 from Monkeytype screenshot)
  {
    id: 'serika',
    name: 'serika',
    isDark: false,
    bg: '#fbf7ee',
    cardBg: '#fffdf8',
    text: '#323437',
    sub: '#646669',
    accent: '#e2b714',
    border: '#e8dfc8',
    bannerBg: 'linear-gradient(135deg, #e2b714 0%, #b8860b 100%)',
  },
  {
    id: 'magic-girl',
    name: 'magic girl',
    isDark: false,
    bg: '#ffffff',
    cardBg: '#fbfbff',
    text: '#2b2d42',
    sub: '#8d99ae',
    accent: '#00b4d8',
    border: '#e0e7ff',
    bannerBg: 'linear-gradient(135deg, #00b4d8 0%, #ff70a6 100%)',
  },
  {
    id: 'milkshake',
    name: 'milkshake',
    isDark: false,
    bg: '#ffffff',
    cardBg: '#f8f9fa',
    text: '#212529',
    sub: '#6c757d',
    accent: '#343a40',
    border: '#dee2e6',
    bannerBg: 'linear-gradient(135deg, #343a40 0%, #121416 100%)',
  },
  {
    id: 'camping',
    name: 'camping',
    isDark: false,
    bg: '#faf3dd',
    cardBg: '#fffdf5',
    text: '#3c413c',
    sub: '#747d74',
    accent: '#47764f',
    border: '#dbe0cc',
    bannerBg: 'linear-gradient(135deg, #47764f 0%, #2d4a32 100%)',
  },
  {
    id: 'pastel',
    name: 'pastel',
    isDark: false,
    bg: '#fdeded',
    cardBg: '#fff7f7',
    text: '#4a3e3d',
    sub: '#8a7776',
    accent: '#f27d88',
    border: '#f7c5c8',
    bannerBg: 'linear-gradient(135deg, #f27d88 0%, #de5462 100%)',
  },
  {
    id: 'paper',
    name: 'paper',
    isDark: false,
    bg: '#eeeeee',
    cardBg: '#f8f8f8',
    text: '#1f1f1f',
    sub: '#666666',
    accent: '#444444',
    border: '#cccccc',
    bannerBg: 'linear-gradient(135deg, #444444 0%, #1f1f1f 100%)',
  },
  {
    id: 'taro',
    name: 'taro',
    isDark: false,
    bg: '#e8eaf6',
    cardBg: '#f5f6fc',
    text: '#2c2738',
    sub: '#6d677d',
    accent: '#673ab7',
    border: '#c5cae9',
    bannerBg: 'linear-gradient(135deg, #7e57c2 0%, #512da8 100%)',
  },
  {
    id: 'retro',
    name: 'retro',
    isDark: false,
    bg: '#ded4b9',
    cardBg: '#ebe3ce',
    text: '#3c3836',
    sub: '#7c6f64',
    accent: '#c85a17',
    border: '#c5b89a',
    bannerBg: 'linear-gradient(135deg, #c85a17 0%, #8f3f10 100%)',
  },
  {
    id: 'honey',
    name: 'honey',
    isDark: false,
    bg: '#faf0ca',
    cardBg: '#fff9e3',
    text: '#0d3b66',
    sub: '#5b738e',
    accent: '#f77f00',
    border: '#ebd388',
    bannerBg: 'linear-gradient(135deg, #f77f00 0%, #d62828 100%)',
  },

  // Dark themes with rich, coordinated color accents (bottom of screenshot)
  {
    id: 'bento',
    name: 'bento',
    isDark: true,
    bg: '#1e2430',
    cardBg: '#283142',
    text: '#d1d8e0',
    sub: '#8898aa',
    accent: '#ff6b6b',
    border: '#38465c',
    bannerBg: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)',
  },
  {
    id: 'serika-dark',
    name: 'serika dark',
    isDark: true,
    bg: '#25272a',
    cardBg: '#2f3237',
    text: '#d1d0c5',
    sub: '#7e828a',
    accent: '#e2b714',
    border: '#3e4249',
    bannerBg: 'linear-gradient(135deg, #e2b714 0%, #997300 100%)',
  },
  {
    id: 'carbon',
    name: 'carbon',
    isDark: true,
    bg: '#202124',
    cardBg: '#2b2c30',
    text: '#e8eaed',
    sub: '#9aa0a6',
    accent: '#f37021',
    border: '#3c4043',
    bannerBg: 'linear-gradient(135deg, #f37021 0%, #b84c07 100%)',
  },
  {
    id: 'nord',
    name: 'nord',
    isDark: true,
    bg: '#242933',
    cardBg: '#2e3440',
    text: '#eceff4',
    sub: '#7b889b',
    accent: '#88c0d0',
    border: '#434c5e',
    bannerBg: 'linear-gradient(135deg, #88c0d0 0%, #5e81ac 100%)',
  },
  {
    id: 'dracula',
    name: 'dracula',
    isDark: true,
    bg: '#21222c',
    cardBg: '#282a36',
    text: '#f8f8f2',
    sub: '#9598ab',
    accent: '#bd93f9',
    border: '#44475a',
    bannerBg: 'linear-gradient(135deg, #bd93f9 0%, #ff79c6 100%)',
  },
  {
    id: 'cyberpunk',
    name: 'cyberpunk',
    isDark: true,
    bg: '#18122b',
    cardBg: '#221b3e',
    text: '#e5d9f2',
    sub: '#8c7ca6',
    accent: '#00f0ff',
    border: '#3f2e5b',
    bannerBg: 'linear-gradient(135deg, #00f0ff 0%, #d946ef 100%)',
  },
  {
    id: 'matrix',
    name: 'matrix',
    isDark: true,
    bg: '#0c100d',
    cardBg: '#131a15',
    text: '#00ff66',
    sub: '#2e7d32',
    accent: '#00ff66',
    border: '#1d3323',
    bannerBg: 'linear-gradient(135deg, #00ff66 0%, #059669 100%)',
  },
];

export function getThemeById(themeId?: string): MonkeyTheme {
  const found = MONKEY_THEMES.find((t) => t.id === themeId);
  return found || MONKEY_THEMES[0]; // fallback to serika
}
