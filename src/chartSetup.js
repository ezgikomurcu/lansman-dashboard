import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

ChartJS.defaults.color = '#9AA6C3';
ChartJS.defaults.font.family = "'Manrope', sans-serif";
ChartJS.defaults.font.size = 11;

if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  ChartJS.defaults.animation = false;
  ChartJS.defaults.transitions.active.animation.duration = 0;
}