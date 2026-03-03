import React, { useState, useEffect, useRef } from 'react';
import {
    Search, RotateCcw, Download, Clock, User,
    Activity, Target, CheckCircle, XCircle, Shield,
    SlidersHorizontal, X, Save, Trash2, ChevronDown
} from 'lucide-react';
import auditLogService from '../../services/auditLogService';

// ─── helpers ────────────────────────────────────────────────────────────────

const actionOptions = ['ALL', 'LOGIN', 'LOGOUT', 'UPDATE_PROFILE', 'GRANT_ROLE', 'REVOKE_ROLE', 'DELETE', 'CREATE', 'UPDATE', 'ADJUSTMENT'];
const resultOptions = ['ALL', 'OK', 'FAIL', 'DENIED'];
const sourceOptions = ['ALL', 'WEB', 'API', 'MOBILE', 'SYSTEM'];
const timezoneOptions = [
    { value: 'Asia/Bangkok', label: 'Asia/Bangkok (UTC+7)' },
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'America/New_York' },
    { value: 'Europe/London', label: 'Europe/London' },
];

const DEFAULT_FILTERS = {
    fromDateTime: '',
    toDateTime: '',
    timezone: 'Asia/Bangkok',
    result: 'ALL',
    userSearch: '',
    action: 'ALL',
    target: '',
    ipAddress: '',
    traceId: '',
    source: 'ALL',
    page: 0,
    size: 50,
    sortBy: 'createdAt',
    sortDirection: 'DESC',
};

const formatDateTime = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const ACTION_COLORS = {
    LOGIN:          { bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' },
    LOGOUT:         { bg: '#fce4ec', color: '#c62828', border: '#ef9a9a' },
    UPDATE_PROFILE:  { bg: '#e3f2fd', color: '#1565c0', border: '#90caf9' },
    GRANT_ROLE:     { bg: '#f3e5f5', color: '#6a1b9a', border: '#ce93d8' },
    REVOKE_ROLE:    { bg: '#fff3e0', color: '#e65100', border: '#ffcc80' },
    DELETE:         { bg: '#ffebee', color: '#b71c1c', border: '#ef9a9a' },
    CREATE:         { bg: '#e8f5e9', color: '#1b5e20', border: '#a5d6a7' },
    UPDATE:         { bg: '#e8eaf6', color: '#283593', border: '#9fa8da' },
    ADJUSTMENT:     { bg: '#fff8e1', color: '#f57f17', border: '#ffe082' },
};

const RESULT_STYLES = {
    OK:     { bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' },
    FAIL:   { bg: '#ffebee', color: '#b71c1c', border: '#ef9a9a' },
    DENIED: { bg: '#fff3e0', color: '#e65100', border: '#ffcc80' },
};

const getActionStyle = (action) =>
    ACTION_COLORS[action?.toUpperCase()] || { bg: '#f5f5f5', color: '#424242', border: '#e0e0e0' };

const getResultStyle = (result) =>
    RESULT_STYLES[result?.toUpperCase()] || { bg: '#f5f5f5', color: '#424242', border: '#e0e0e0' };

const ResultIcon = ({ result }) => {
    const r = result?.toUpperCase();
    if (r === 'OK')     return <CheckCircle size={12} />;
    if (r === 'FAIL')   return <XCircle size={12} />;
    if (r === 'DENIED') return <Shield size={12} />;
    return null;
};

// ─── sub-components ──────────────────────────────────────────────────────────

const FilterChip = ({ label, onRemove }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '2px 10px', borderRadius: 999,
        background: '#ede9fe', color: '#5b21b6',
        fontSize: 12, fontWeight: 500,
        border: '1px solid #c4b5fd', lineHeight: '20px',
    }}>
        {label}
        <button
            onClick={onRemove}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7c3aed', padding: 0, display: 'flex' }}
        >
            <X size={12} />
        </button>
    </span>
);

const NativeSelect = ({ value, onChange, options, style }) => (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', width: '100%' }}>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
                width: '100%', appearance: 'none', WebkitAppearance: 'none',
                padding: '8px 32px 8px 10px', fontSize: 13,
                border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff',
                color: '#1e293b', cursor: 'pointer', outline: 'none',
                ...style,
            }}
        >
            {options.map(o => (
                <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
                    {typeof o === 'string' ? o : o.label}
                </option>
            ))}
        </select>
        <ChevronDown size={14} style={{ position: 'absolute', right: 8, pointerEvents: 'none', color: '#64748b' }} />
    </div>
);

// ─── main component ──────────────────────────────────────────────────────────

const AuditLogPage = () => {
    const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
    const [auditLogs, setAuditLogs] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [activePreset, setActivePreset] = useState(null);

    // Quick search bar value (maps to userSearch + target + ipAddress + traceId combined)
    const [quickSearch, setQuickSearch] = useState('');

    // Saved filters
    const STORAGE_KEY = 'auditLog_savedFilters';
    const [savedFilters, setSavedFilters] = useState(() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
    });
    const [activeSavedFilterId, setActiveSavedFilterId] = useState(null);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedFilters));
    }, [savedFilters]);

    // ── fetch ──
    const fetchAuditLogs = async (overrideFilters) => {
        setLoading(true);
        setError(null);
        try {
            const f = overrideFilters || filters;
            const response = await auditLogService.getAuditLogs(f);
            setAuditLogs(response.logs || []);
            setTotalElements(response.totalElements || 0);
            setTotalPages(response.totalPages || 0);
            setCurrentPage(response.currentPage || 0);
        } catch (err) {
            setError(err.message || 'Failed to fetch audit logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.page, filters.size, filters.sortBy, filters.sortDirection]);

    // ── filter change ──
    const handleFilterChange = (field, value) =>
        setFilters(prev => ({ ...prev, [field]: value }));

    // ── time presets ──
    const applyPreset = (minutes, label) => {
        const now = new Date();
        const from = new Date(now.getTime() - minutes * 60000);
        setActivePreset(label);
        const updated = {
            ...filters,
            fromDateTime: formatDateTime(from),
            toDateTime: formatDateTime(now),
            page: 0,
        };
        setFilters(updated);
        setTimeout(() => fetchAuditLogs(updated), 0);
    };

    const presets = [
        { label: '15m', minutes: 15 },
        { label: '1h',  minutes: 60 },
        { label: '24h', minutes: 1440 },
        { label: '7d',  minutes: 10080 },
        { label: '30d', minutes: 43200 },
    ];

    // ── search ──
    const handleSearch = () => {
        const updated = { ...filters, page: 0 };
        setFilters(updated);
        if (filters.page === 0) {
            fetchAuditLogs(updated);
        }
    };

    // ── reset ──
    const handleReset = () => {
        setActivePreset(null);
        setQuickSearch('');
        setActiveSavedFilterId(null);
        setFilters({ ...DEFAULT_FILTERS });
        setTimeout(() => fetchAuditLogs({ ...DEFAULT_FILTERS }), 0);
    };

    // ── active filter chips ──
    const buildActiveChips = () => {
        const chips = [];
        if (activePreset) chips.push({ label: `Last ${activePreset}`, key: 'preset' });
        else if (filters.fromDateTime) chips.push({ label: `From: ${filters.fromDateTime.replace('T', ' ')}`, key: 'fromDateTime' });
        if (filters.toDateTime && !activePreset) chips.push({ label: `To: ${filters.toDateTime.replace('T', ' ')}`, key: 'toDateTime' });
        if (filters.action !== 'ALL') chips.push({ label: `Action: ${filters.action}`, key: 'action' });
        if (filters.result !== 'ALL') chips.push({ label: `Result: ${filters.result}`, key: 'result' });
        if (filters.source !== 'ALL') chips.push({ label: `Source: ${filters.source}`, key: 'source' });
        if (filters.userSearch) chips.push({ label: `User: ${filters.userSearch}`, key: 'userSearch' });
        if (filters.target) chips.push({ label: `Target: ${filters.target}`, key: 'target' });
        if (filters.ipAddress) chips.push({ label: `IP: ${filters.ipAddress}`, key: 'ipAddress' });
        if (filters.traceId) chips.push({ label: `Trace: ${filters.traceId}`, key: 'traceId' });
        if (filters.timezone !== 'Asia/Bangkok') chips.push({ label: `TZ: ${filters.timezone}`, key: 'timezone' });
        return chips;
    };

    const removeChip = (key) => {
        if (key === 'preset') {
            setActivePreset(null);
            handleFilterChange('fromDateTime', '');
            handleFilterChange('toDateTime', '');
        } else if (key === 'action') handleFilterChange('action', 'ALL');
        else if (key === 'result') handleFilterChange('result', 'ALL');
        else if (key === 'source') handleFilterChange('source', 'ALL');
        else if (key === 'timezone') handleFilterChange('timezone', 'Asia/Bangkok');
        else handleFilterChange(key, '');
    };

    const activeChips = buildActiveChips();

    // ── active filter count for badge ──
    const activeFilterCount = [
        filters.fromDateTime || filters.toDateTime || activePreset,
        filters.action !== 'ALL',
        filters.result !== 'ALL',
        filters.source !== 'ALL',
        filters.userSearch,
        filters.target,
        filters.ipAddress,
        filters.traceId,
        filters.timezone !== 'Asia/Bangkok',
    ].filter(Boolean).length;

    // ── format timestamp ──
    const formatTimestamp = (ts) => {
        if (!ts) return '—';
        return new Date(ts).toLocaleString('en-GB', {
            timeZone: filters.timezone,
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: false,
        }).replace(',', '');
    };

    // ── export ──
    const handleExport = () => {
        const csv = [
            ['Time', 'Actor', 'Action', 'Target', 'Result', 'IP', 'Trace ID'].join(','),
            ...auditLogs.map(log => [
                formatTimestamp(log.createdAt),
                `${log.userName || 'N/A'} (${log.userEmail || 'N/A'})`,
                log.action || 'N/A',
                log.target || 'N/A',
                log.result || 'N/A',
                log.ipAddress || 'N/A',
                log.traceId || 'N/A',
            ].map(c => `"${c}"`).join(','))
        ].join('\n');
        const a = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
            download: `audit_logs_${new Date().toISOString()}.csv`,
        });
        a.click();
        URL.revokeObjectURL(a.href);
    };

    // ── save/apply saved filters ──
    const handleSaveFilter = () => {
        const name = window.prompt('Name for this filter:');
        if (!name?.trim()) return;
        const { page, size, sortBy, sortDirection, ...criteria } = filters;
        setSavedFilters(prev => [...prev, { id: Date.now(), name: name.trim(), criteria }]);
    };

    const applySavedFilter = (f) => {
        setActiveSavedFilterId(f.id);
        const updated = { ...DEFAULT_FILTERS, size: filters.size, ...f.criteria };
        setFilters(updated);
        setTimeout(() => fetchAuditLogs(updated), 0);
    };

    const deleteSavedFilter = (e, id) => {
        e.stopPropagation();
        setSavedFilters(prev => prev.filter(f => f.id !== id));
        if (activeSavedFilterId === id) setActiveSavedFilterId(null);
    };

    // ─────────────────────────────────────────────────────────────────────────
    const s = styles; // alias

    return (
        <div style={s.page}>
            {/* ── Page Title ── */}
            <div style={s.pageHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Activity size={20} color="#5b21b6" />
                    <h1 style={s.pageTitle}>Audit Logs</h1>
                </div>
            </div>

            {/* ── Toolbar ── */}
            <div style={s.toolbar}>
                {/* Quick search */}
                <div style={s.searchWrap}>
                    <Search size={15} color="#94a3b8" style={{ flexShrink: 0 }} />
                    <input
                        style={s.searchInput}
                        placeholder="Search user, target, IP, trace ID…"
                        value={quickSearch}
                        onChange={e => setQuickSearch(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                // distribute quickSearch across relevant fields
                                const updated = { ...filters, userSearch: quickSearch, page: 0 };
                                setFilters(updated);
                                fetchAuditLogs(updated);
                            }
                        }}
                    />
                </div>

                {/* Time presets */}
                <div style={{ display: 'flex', gap: 4 }}>
                    {presets.map(p => (
                        <button
                            key={p.label}
                            onClick={() => applyPreset(p.minutes, p.label)}
                            style={{
                                ...s.presetBtn,
                                ...(activePreset === p.label ? s.presetBtnActive : {}),
                            }}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Filters toggle */}
                <button
                    onClick={() => setFiltersOpen(v => !v)}
                    style={{ ...s.filtersBtn, ...(filtersOpen ? s.filtersBtnActive : {}) }}
                >
                    <SlidersHorizontal size={14} />
                    Filters
                    {activeFilterCount > 0 && (
                        <span style={s.filterBadge}>{activeFilterCount}</span>
                    )}
                </button>

                {/* Export */}
                <button
                    style={s.exportBtn}
                    onClick={handleExport}
                    disabled={auditLogs.length === 0}
                >
                    <Download size={14} />
                    Export
                </button>
            </div>

            {/* ── Collapsible Filter Panel ── */}
            {filtersOpen && (
                <div style={s.filterPanel}>
                    {/* Row 1 */}
                    <div style={s.filterGrid}>
                        <div style={s.filterField}>
                            <label style={s.filterLabel}>FROM</label>
                            <input
                                type="datetime-local"
                                style={s.filterInput}
                                value={filters.fromDateTime}
                                onChange={e => { setActivePreset(null); handleFilterChange('fromDateTime', e.target.value); }}
                            />
                        </div>
                        <div style={s.filterField}>
                            <label style={s.filterLabel}>TO</label>
                            <input
                                type="datetime-local"
                                style={s.filterInput}
                                value={filters.toDateTime}
                                onChange={e => { setActivePreset(null); handleFilterChange('toDateTime', e.target.value); }}
                            />
                        </div>
                        <div style={s.filterField}>
                            <label style={s.filterLabel}>TIMEZONE</label>
                            <NativeSelect
                                value={filters.timezone}
                                onChange={v => handleFilterChange('timezone', v)}
                                options={timezoneOptions}
                            />
                        </div>
                        <div style={s.filterField}>
                            <label style={s.filterLabel}>RESULT</label>
                            <NativeSelect
                                value={filters.result}
                                onChange={v => handleFilterChange('result', v)}
                                options={resultOptions}
                            />
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div style={s.filterGrid}>
                        <div style={s.filterField}>
                            <label style={s.filterLabel}>ACTION</label>
                            <NativeSelect
                                value={filters.action}
                                onChange={v => handleFilterChange('action', v)}
                                options={actionOptions}
                            />
                        </div>
                        <div style={s.filterField}>
                            <label style={s.filterLabel}>TARGET / RESOURCE</label>
                            <input
                                style={s.filterInput}
                                placeholder="e.g., UserProfile#123"
                                value={filters.target}
                                onChange={e => handleFilterChange('target', e.target.value)}
                            />
                        </div>
                        <div style={s.filterField}>
                            <label style={s.filterLabel}>IP ADDRESS</label>
                            <input
                                style={s.filterInput}
                                placeholder="e.g., 192.168.1.1"
                                value={filters.ipAddress}
                                onChange={e => handleFilterChange('ipAddress', e.target.value)}
                            />
                        </div>
                        <div style={s.filterField}>
                            <label style={s.filterLabel}>SOURCE</label>
                            <NativeSelect
                                value={filters.source}
                                onChange={v => handleFilterChange('source', v)}
                                options={sourceOptions}
                            />
                        </div>
                    </div>

                    {/* Row 3 - extra fields */}
                    <div style={{ ...s.filterGrid, gridTemplateColumns: '1fr 1fr' }}>
                        <div style={s.filterField}>
                            <label style={s.filterLabel}>USER (email / name / ID)</label>
                            <input
                                style={s.filterInput}
                                placeholder="Search user…"
                                value={filters.userSearch}
                                onChange={e => handleFilterChange('userSearch', e.target.value)}
                            />
                        </div>
                        <div style={s.filterField}>
                            <label style={s.filterLabel}>TRACE / CORRELATION ID</label>
                            <input
                                style={s.filterInput}
                                placeholder="Trace ID…"
                                value={filters.traceId}
                                onChange={e => handleFilterChange('traceId', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <button style={s.searchBtn} onClick={handleSearch} disabled={loading}>
                            <Search size={14} /> Search
                        </button>
                        <button style={s.resetBtn} onClick={handleReset}>
                            <RotateCcw size={14} /> Reset
                        </button>
                        <button style={s.saveFilterBtn} onClick={handleSaveFilter}>
                            <Save size={14} /> Save Filter
                        </button>

                        {/* Saved filter pills */}
                        {savedFilters.length > 0 && (
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginLeft: 8 }}>
                                {savedFilters.map(f => (
                                    <div
                                        key={f.id}
                                        onClick={() => applySavedFilter(f)}
                                        style={{
                                            ...s.savedChip,
                                            ...(activeSavedFilterId === f.id ? s.savedChipActive : {}),
                                        }}
                                    >
                                        {f.name}
                                        <button
                                            onClick={e => deleteSavedFilter(e, f.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'inherit' }}
                                        >
                                            <Trash2 size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Active Filter Tags ── */}
            {activeChips.length > 0 && (
                <div style={s.chipRow}>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Active:</span>
                    {activeChips.map(chip => (
                        <FilterChip key={chip.key} label={chip.label} onRemove={() => removeChip(chip.key)} />
                    ))}
                    <button onClick={handleReset} style={s.clearAll}>Clear all</button>
                </div>
            )}

            {/* ── Error ── */}
            {error && (
                <div style={s.errorBox}>
                    <XCircle size={14} /> {error}
                </div>
            )}

            {/* ── Table ── */}
            <div style={s.tableCard}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={s.table}>
                        <thead>
                            <tr style={s.theadRow}>
                                <th style={s.th}>TIME (UTC+7)</th>
                                <th style={s.th}>ACTOR</th>
                                <th style={s.th}>ACTION</th>
                                <th style={s.th}>TARGET</th>
                                <th style={s.th}>RESULT</th>
                                <th style={s.th}>IP</th>
                                <th style={s.th}>TRACE ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={s.emptyCell}>
                                        <div style={s.spinner} />
                                        <p style={{ marginTop: 12, color: '#64748b' }}>Loading audit logs…</p>
                                    </td>
                                </tr>
                            ) : auditLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={s.emptyCell}>
                                        <Activity size={32} color="#cbd5e1" />
                                        <p style={{ marginTop: 8, color: '#94a3b8' }}>No audit logs found matching the filters.</p>
                                    </td>
                                </tr>
                            ) : (
                                auditLogs.map((log, i) => {
                                    const aStyle = getActionStyle(log.action);
                                    const rStyle = getResultStyle(log.result);
                                    return (
                                        <tr key={log.id} style={{ ...s.tbodyRow, background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                            <td style={s.td}>
                                                <span style={{ color: '#374151', fontVariantNumeric: 'tabular-nums' }}>
                                                    {formatTimestamp(log.createdAt)}
                                                </span>
                                            </td>
                                            <td style={s.td}>
                                                <div style={{ fontWeight: 600, color: '#1e293b' }}>
                                                    #{log.userId}
                                                </div>
                                                <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                                                    {log.userEmail ? (log.userEmail.length > 14 ? log.userEmail.substring(0, 14) + '…' : log.userEmail) : 'N/A'}
                                                </div>
                                            </td>
                                            <td style={s.td}>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '2px 8px', borderRadius: 4,
                                                    fontSize: 11, fontWeight: 700, letterSpacing: '0.03em',
                                                    background: aStyle.bg, color: aStyle.color,
                                                    border: `1px solid ${aStyle.border}`,
                                                }}>
                                                    {log.action || 'N/A'}
                                                </span>
                                            </td>
                                            <td style={s.td}>
                                                {log.target || '—'}
                                            </td>
                                            <td style={s.td}>
                                                {log.result ? (
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                                        padding: '2px 8px', borderRadius: 4,
                                                        fontSize: 11, fontWeight: 700,
                                                        background: rStyle.bg, color: rStyle.color,
                                                        border: `1px solid ${rStyle.border}`,
                                                    }}>
                                                        <ResultIcon result={log.result} />
                                                        {log.result}
                                                    </span>
                                                ) : '—'}
                                            </td>
                                            <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 12 }}>
                                                {log.ipAddress || '—'}
                                            </td>
                                            <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>
                                                {log.traceId ? log.traceId.substring(0, 16) + '…' : '—'}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination footer ── */}
                {!loading && auditLogs.length > 0 && (
                    <div style={s.paginationBar}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap' }}>
                            <span style={{ fontSize: 13, color: '#64748b', whiteSpace: 'nowrap' }}>Rows per page:</span>
                            <NativeSelect
                                value={String(filters.size)}
                                onChange={v => setFilters(prev => ({ ...prev, size: parseInt(v), page: 0 }))}
                                options={['10', '25', '50', '100']}
                                style={{ width: 70 }}
                            />
                            <span style={{ fontSize: 13, color: '#64748b', marginLeft: 8, whiteSpace: 'nowrap' }}>
                                Total: <strong>{totalElements.toLocaleString()}</strong>
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button
                                style={s.pageBtn}
                                onClick={() => setFilters(p => ({ ...p, page: currentPage - 1 }))}
                                disabled={currentPage === 0}
                            >
                                ‹ Prev
                            </button>
                            <span style={s.pageCurrent}>{currentPage + 1}</span>
                            <button
                                style={s.pageBtn}
                                onClick={() => setFilters(p => ({ ...p, page: currentPage + 1 }))}
                                disabled={currentPage >= totalPages - 1}
                            >
                                Next ›
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── styles object ────────────────────────────────────────────────────────────

const styles = {
    page: {
        padding: '24px 28px',
        background: '#f8fafc',
        minHeight: '100vh',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
    },
    pageHeader: {
        marginBottom: 18,
    },
    pageTitle: {
        fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0,
    },
    toolbar: {
        display: 'flex', alignItems: 'center', gap: 10,
        background: '#fff', padding: '10px 14px',
        borderRadius: 10, border: '1px solid #e2e8f0',
        marginBottom: 0, flexWrap: 'wrap',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    },
    searchWrap: {
        display: 'flex', alignItems: 'center', gap: 8,
        flex: 1, minWidth: 200,
        padding: '7px 12px', border: '1px solid #e2e8f0',
        borderRadius: 7, background: '#f8fafc',
    },
    searchInput: {
        border: 'none', outline: 'none', background: 'transparent',
        fontSize: 15, color: '#1e293b', width: '100%',
    },
    presetBtn: {
        padding: '5px 11px', borderRadius: 6, fontSize: 14, fontWeight: 500,
        border: '1px solid #e2e8f0', background: '#fff', color: '#374151',
        cursor: 'pointer', transition: 'all 0.15s',
    },
    presetBtnActive: {
        background: '#ede9fe', color: '#5b21b6', border: '1px solid #c4b5fd',
    },
    filtersBtn: {
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 14px', borderRadius: 7, fontSize: 14, fontWeight: 500,
        border: '1px solid #e2e8f0', background: '#fff', color: '#374151',
        cursor: 'pointer',
    },
    filtersBtnActive: {
        background: '#ede9fe', color: '#5b21b6', border: '1px solid #c4b5fd',
    },
    filterBadge: {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 18, height: 18, borderRadius: 999, fontSize: 12, fontWeight: 700,
        background: '#5b21b6', color: '#fff',
    },
    exportBtn: {
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 14px', borderRadius: 7, fontSize: 14, fontWeight: 500,
        border: '1px solid #e2e8f0', background: '#fff', color: '#374151',
        cursor: 'pointer',
    },
    filterPanel: {
        background: '#fff', border: '1px solid #e2e8f0',
        borderTop: 'none', borderRadius: '0 0 10px 10px',
        padding: '16px 16px 12px', display: 'flex', flexDirection: 'column', gap: 12,
        marginBottom: 16,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    },
    filterGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
    },
    filterField: {
        display: 'flex', flexDirection: 'column', gap: 4,
    },
    filterLabel: {
        fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em',
    },
    filterInput: {
        padding: '8px 10px', fontSize: 15, border: '1px solid #e2e8f0',
        borderRadius: 6, color: '#1e293b', outline: 'none', background: '#fff',
        width: '100%', boxSizing: 'border-box',
    },
    searchBtn: {
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 18px', borderRadius: 7, fontSize: 14, fontWeight: 600,
        background: '#5b21b6', color: '#fff', border: 'none', cursor: 'pointer',
    },
    resetBtn: {
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 14px', borderRadius: 7, fontSize: 14, fontWeight: 500,
        background: '#fff', color: '#374151', border: '1px solid #e2e8f0', cursor: 'pointer',
    },
    saveFilterBtn: {
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 14px', borderRadius: 7, fontSize: 14, fontWeight: 500,
        background: '#fff', color: '#374151', border: '1px solid #e2e8f0', cursor: 'pointer',
    },
    savedChip: {
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 10px', borderRadius: 999, fontSize: 13, fontWeight: 500,
        border: '1px solid #e2e8f0', background: '#f8fafc', color: '#374151',
        cursor: 'pointer',
    },
    savedChipActive: {
        background: '#ede9fe', color: '#5b21b6', border: '1px solid #c4b5fd',
    },
    chipRow: {
        display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
        padding: '6px 2px', marginBottom: 14,
    },
    clearAll: {
        fontSize: 14, color: '#5b21b6', background: 'none', border: 'none',
        cursor: 'pointer', fontWeight: 500, textDecoration: 'underline',
    },
    errorBox: {
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#fef2f2', border: '1px solid #fca5a5',
        color: '#b91c1c', borderRadius: 8, padding: '10px 14px',
        fontSize: 14, marginBottom: 12,
    },
    tableCard: {
        background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        marginTop: 8,
    },
    table: {
        width: '100%', borderCollapse: 'collapse',
    },
    theadRow: {
        background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
    },
    th: {
        padding: '10px 14px', textAlign: 'left',
        fontSize: 13, fontWeight: 700, color: '#64748b', letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
    },
    tbodyRow: {
        borderBottom: '1px solid #f1f5f9', transition: 'background 0.1s',
    },
    td: {
        padding: '12px 14px', fontSize: 15, color: '#374151', verticalAlign: 'middle',
    },
    emptyCell: {
        padding: '56px 20px', textAlign: 'center', color: '#94a3b8',
    },
    spinner: {
        width: 36, height: 36, border: '3px solid #e2e8f0',
        borderTop: '3px solid #5b21b6', borderRadius: '50%',
        animation: 'spin 0.7s linear infinite', margin: '0 auto',
    },
    paginationBar: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px', borderTop: '1px solid #f1f5f9',
        background: '#fafafa',
    },
    pageBtn: {
        padding: '5px 12px', borderRadius: 6, fontSize: 14, fontWeight: 500,
        border: '1px solid #e2e8f0', background: '#fff', color: '#374151',
        cursor: 'pointer',
    },
    pageCurrent: {
        width: 30, height: 30, borderRadius: 6,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: '#5b21b6', color: '#fff', fontSize: 14, fontWeight: 700,
    },
};

// inject spinner keyframes once
if (typeof document !== 'undefined' && !document.getElementById('audit-spin-kf')) {
    const st = document.createElement('style');
    st.id = 'audit-spin-kf';
    st.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(st);
}

export default AuditLogPage;
