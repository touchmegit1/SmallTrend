import { useState, useCallback, useEffect, useRef, createContext, useContext } from 'react';

// ─── INJECT STYLES ONCE ───────────────────────────────────────────────────────
const STYLE_ID = 'crm-toast-styles-v2';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
    @keyframes _crmIn  { from { transform: translateX(120%); opacity: 0; } to { transform: none; opacity: 1; } }
    @keyframes _crmOut { from { transform: none; opacity: 1; } to { transform: translateX(120%); opacity: 0; } }
    @keyframes _crmBar { from { transform: scaleX(1); } to { transform: scaleX(0); } }

    [data-crm-toast] { animation: _crmIn 0.38s cubic-bezier(.21,1.02,.73,1) forwards; }
    [data-crm-toast].out { animation: _crmOut 0.32s ease forwards; }
    [data-crm-toast] .bar { animation: _crmBar 4s linear forwards; transform-origin: left; }
    [data-crm-toast] .cls { transition: background .15s; }
    [data-crm-toast] .cls:hover { background: #f1f5f9 !important; }
  `;
    document.head.appendChild(el);
}

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const CFG = {
    success: {
        border: '#10b981', iconBg: '#d1fae5', iconColor: '#059669', title: 'Thành công',
        svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    },
    error: {
        border: '#ef4444', iconBg: '#fee2e2', iconColor: '#dc2626', title: 'Có lỗi xảy ra',
        svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    },
    warning: {
        border: '#f59e0b', iconBg: '#fef3c7', iconColor: '#d97706', title: 'Cảnh báo',
        svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    },
    info: {
        border: '#6366f1', iconBg: '#e0e7ff', iconColor: '#4f46e5', title: 'Thông báo',
        svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>,
    },
};

// ─── SINGLE ITEM ──────────────────────────────────────────────────────────────
function ToastItem({ id, message, type, onDone }) {
    const cfg = CFG[type] || CFG.info;
    const domRef = useRef(null);

    const dismiss = useCallback(() => {
        const el = domRef.current;
        if (!el || el.dataset.dismissing) return;
        el.dataset.dismissing = '1';
        el.classList.add('out');
        setTimeout(() => onDone(id), 320);
    }, [id, onDone]);

    useEffect(() => {
        const t = setTimeout(dismiss, 4000);
        return () => clearTimeout(t);
    }, [dismiss]);

    return (
        <div
            ref={domRef}
            data-crm-toast=""
            style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '11px',
                padding: '13px 13px 17px 13px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderLeft: `4px solid ${cfg.border}`,
                boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
                minWidth: '290px',
                maxWidth: '380px',
                overflow: 'hidden',
                fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
            }}
        >
            {/* Icon */}
            <div style={{
                flexShrink: 0, width: 30, height: 30, borderRadius: '50%',
                background: cfg.iconBg, color: cfg.iconColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {cfg.svg}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0, paddingTop: '1px' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                    {cfg.title}
                </p>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', lineHeight: 1.5, wordBreak: 'break-word' }}>
                    {message}
                </p>
            </div>

            {/* Close */}
            <button
                className="cls"
                onClick={dismiss}
                style={{
                    flexShrink: 0, border: 'none', background: 'transparent',
                    borderRadius: '6px', cursor: 'pointer', padding: '3px',
                    color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>

            {/* Progress bar */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
                background: '#f1f5f9',
            }}>
                <div className="bar" style={{
                    height: '100%', background: cfg.border, opacity: 0.7,
                    borderRadius: '0 0 0 8px',
                }} />
            </div>
        </div>
    );
}

// ─── CONTAINER COMPONENT (standalone, export riêng) ───────────────────────────
export function ToastContainer({ toasts, onRemove }) {
    if (!toasts || toasts.length === 0) return null;
    return (
        <div style={{
            position: 'fixed', top: 22, right: 22,
            zIndex: 99999,
            display: 'flex', flexDirection: 'column', gap: 10,
            pointerEvents: 'none',
        }}>
            {toasts.map(t => (
                <div key={t.id} style={{ pointerEvents: 'all' }}>
                    <ToastItem id={t.id} message={t.message} type={t.type} onDone={onRemove} />
                </div>
            ))}
        </div>
    );
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────
/**
 * useToast – hook hiển thị toast notification đẹp, thay thế alert().
 *
 * Cách dùng:
 *   const { showToast, toasts, removeToast } = useToast();
 *   showToast('Thành công!');               // type mặc định: 'success'
 *   showToast('Có lỗi', 'error');
 *   showToast('Cảnh báo', 'warning');
 *   showToast('Thông tin', 'info');
 *
 *   // Trong JSX:
 *   <ToastContainer toasts={toasts} onRemove={removeToast} />
 */
export function useToast() {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return { toasts, showToast, removeToast };
}
