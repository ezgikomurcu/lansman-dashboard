export const THEME_COLORS = {
  dark: {
    primary: '#FFD200', secondary: '#5AC8FA', amber: '#FFB020', coral: '#FF5C72',
    grid: 'rgba(255,255,255,0.05)', text: '#9AA6C3', surface: '#0D1B3D',
    sequence: ['#FFEDA6', '#FFD200', '#C79A00'], neutral: '#7C88A6',
    ink: '#F2F4F8', mutedInk: '#5E6B8F'
  },
  light: {
    primary: '#FFD200', secondary: '#5AC8FA', amber: '#FFB020', coral: '#FF5C72',
    grid: 'rgba(255,255,255,0.05)', text: '#9AA6C3', surface: '#FFFFFF',
    sequence: ['#FFEDA6', '#FFD200', '#B38F00'], neutral: '#9AA3B8',
    ink: '#0B1A3A', mutedInk: '#8A93AC'
  },
  custom: {
    primary: '#ffa6b8', secondary: '#c98a6b', amber: '#e8c170', coral: '#8c4a5c',
    grid: 'rgba(255,255,255,0.08)', text: '#E3B9AE', surface: '#4E322A',
    sequence: ['#F8D3DD', '#F2A6B8', '#C97A91'], neutral: '#B98F82',
    ink: '#FBEEE9', mutedInk: '#B98F82'
  },
  vivid: {
    primary: '#E31C63', secondary: '#5B4FE0', amber: '#F2A93C', coral: '#DC2F44',
    grid: 'rgba(23,17,20,0.07)', text: '#8A8390', surface: '#FFFFFF',
    sequence: ['#F6B8CF', '#E31C63', '#8F0F3D'], neutral: '#B9B2B7',
    ink: '#18141A', mutedInk: '#A79FA6'
  }
};

export function getColors(theme) {
  return THEME_COLORS[theme] || THEME_COLORS.dark;
}
