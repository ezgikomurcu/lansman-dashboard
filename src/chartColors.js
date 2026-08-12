export const THEME_COLORS = {
  dark:   { primary: '#FFD200', secondary: '#5AC8FA', amber: '#FFB020', coral: '#FF5C72' },
  light:  { primary: '#FFD200', secondary: '#5AC8FA', amber: '#FFB020', coral: '#FF5C72' },
  //custom: { primary: '#F2A6B8', secondary: '#D88AA0', amber: '#F2879E', coral: '#A85C6B' }
  //custom: { primary: '#e20538', secondary: '#6b0edb', amber: '#0dbf4e', coral: '#f0f331' }
  //custom: { primary: '#FFD200', secondary: '#5AC8FA', amber: '#FFB020', coral: '#FF5C72' }
  custom: { primary: '#ffa6b8', secondary: '#531b2b', amber: '#e34268', coral: '#c2002a' }
};

export function getColors(theme) {
  return THEME_COLORS[theme] || THEME_COLORS.dark;
}