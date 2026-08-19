// İki tema var: açık (vivid pembe) ve koyu. Bileşenler getColors()'u argümansız
// çağırıyor — hangi paletin döneceği <html class="dark"> durumuna bakılarak
// kendiliğinden belirleniyor, böylece her grafik bileşenine ayrıca bir theme
// prop'u geçirmek gerekmiyor.
const LIGHT = {
  primary: '#E31C63', secondary: '#5B4FE0', amber: '#F2A93C', coral: '#DC2F44',
  grid: 'rgba(23,17,20,0.07)', text: '#8A8390', surface: '#FFFFFF',
  sequence: ['#F6B8CF', '#E31C63', '#8F0F3D'], neutral: '#B9B2B7',
  ink: '#18141A', mutedInk: '#A79FA6'
};

const DARK = {
  primary: '#FF3D7F', secondary: '#8A7CFF', amber: '#FFB454', coral: '#FF6B7F',
  grid: 'rgba(255,255,255,0.08)', text: '#B3A8B8', surface: '#241F2D',
  sequence: ['#5C2438', '#B31650', '#FF3D7F'], neutral: '#5C5560',
  ink: '#F3EEF2', mutedInk: '#867C8C'
};

export function getColors() {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  return isDark ? DARK : LIGHT;
}
