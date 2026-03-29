import React from 'react';

const REQUIRED_MARK_STYLES = {
    frontendOnly: 'text-rose-500',
    frontendAndBackend: 'text-slate-900',
};

export const RequiredMark = ({ type = 'frontendOnly' }) => (
    <span className={REQUIRED_MARK_STYLES[type] || REQUIRED_MARK_STYLES.frontendOnly}>*</span>
);

export const RequiredLegend = ({ className = '' }) => (
    <p className={`text-[11px] text-slate-500 ${className}`.trim()}>
        <RequiredMark type="frontendOnly" /> FE validate, <RequiredMark type="frontendAndBackend" /> FE + BE validate
    </p>
);
