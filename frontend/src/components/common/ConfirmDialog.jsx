import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * ConfirmDialog — a beautiful in-app replacement for window.confirm().
 *
 * Props:
 *  - open         {boolean}   whether the dialog is visible
 *  - title        {string}    bold heading text
 *  - message      {string}    body message / description
 *  - confirmText  {string}    label for the confirm button (default "Xác nhận")
 *  - cancelText   {string}    label for the cancel button  (default "Hủy")
 *  - variant      {string}    "danger" | "warning" | "info"  (default "danger")
 *  - onConfirm    {function}  called when user clicks confirm
 *  - onCancel     {function}  called when user clicks cancel or the X button
 */
export default function ConfirmDialog({
    open,
    title = 'Xác nhận',
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    variant = 'danger',
    onConfirm,
    onCancel,
}) {
    if (!open) return null;

    const variantConfig = {
        danger: {
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            confirmBtn: 'bg-red-600 hover:bg-red-700 shadow-red-600/30',
        },
        warning: {
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            confirmBtn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30',
        },
        info: {
            iconBg: 'bg-indigo-100',
            iconColor: 'text-indigo-600',
            confirmBtn: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30',
        },
    };

    const cfg = variantConfig[variant] || variantConfig.danger;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
            onClick={onCancel}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in"
                style={{ animation: 'confirmDialogIn 0.18s ease-out' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-5 pb-3">
                    <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${cfg.iconBg}`}>
                            <AlertTriangle size={20} className={cfg.iconColor} />
                        </div>
                        <h3 className="text-base font-bold text-slate-800 leading-5">{title}</h3>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 flex-shrink-0 ml-2"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                {message && (
                    <div className="px-5 pb-4">
                        <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
                    </div>
                )}

                {/* Footer */}
                <div className="flex gap-2.5 px-5 pb-5">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all ${cfg.confirmBtn}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes confirmDialogIn {
          from { opacity: 0; transform: scale(0.93) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
        </div>
    );
}
