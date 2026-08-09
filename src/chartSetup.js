import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
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
  Title,
  Tooltip,
  Legend,
  Filler
);

// Ortak görsel ayarlar (tema ile uyumlu)
ChartJS.defaults.color = '#9AA6C3';
ChartJS.defaults.font.family = "'Manrope', sans-serif";
ChartJS.defaults.font.size = 11;