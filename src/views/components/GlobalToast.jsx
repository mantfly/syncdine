import { useEffect } from 'react';
import { useUserStore } from '../../model/useUserStore';

export function GlobalToast() {
  const toast = useUserStore((state) => state.toast);
  const clearToast = useUserStore((state) => state.clearToast);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        clearToast();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast, clearToast]);

  if (!toast) return null;

  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';

  let toastClass = 'global-toast';
  if (isError) toastClass += ' global-toast-error';
  if (isSuccess) toastClass += ' global-toast-success';

  return (
    <div className={toastClass} role="alert">
      {isError && <span>⚠️</span>}
      {isSuccess && <span>✅</span>}
      {!isError && !isSuccess && <span>ℹ️</span>}
      <span>{toast.message}</span>
      <button className="global-toast-close" onClick={clearToast}>✕</button>
    </div>
  );
}
