const ICONS = { success: '✓', reject: '✕', error: '⚠' };

export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`toast ${toast.type}`}>
      {ICONS[toast.type] || '⚠'} {toast.message}
    </div>
  );
}