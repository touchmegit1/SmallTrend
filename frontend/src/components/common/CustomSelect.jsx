import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const STATUS_COLORS = {
    all: { bg: '#f8fafc', color: '#334155', label: 'Tất cả trạng thái' },
    ALL: { bg: '#f8fafc', color: '#334155', label: 'Tất cả trạng thái' },
    active: { bg: '#dcfce7', color: '#166534', label: 'Hoạt động' },
    ACTIVE: { bg: '#dcfce7', color: '#166534', label: 'Hoạt động' },
    PRESENT: { bg: '#dcfce7', color: '#166534', label: 'Có mặt' },
    CONFIRMED: { bg: '#dcfce7', color: '#166534', label: 'Đã xác nhận' },
    COMPLETED: { bg: '#dcfce7', color: '#166534', label: 'Hoàn thành' },
    pending: { bg: '#fef3c7', color: '#92400e', label: 'Chờ duyệt' },
    PENDING: { bg: '#fef3c7', color: '#92400e', label: 'Chờ duyệt' },
    inactive: { bg: '#fee2e2', color: '#991b1b', label: 'Vô hiệu' },
    INACTIVE: { bg: '#fee2e2', color: '#991b1b', label: 'Vô hiệu' },
    LATE: { bg: '#fecaca', color: '#7f1d1d', label: 'Đi muộn' },
    ABSENT: { bg: '#fef2f2', color: '#b91c1c', label: 'Vắng' },
    CANCELLED: { bg: '#fee2e2', color: '#991b1b', label: 'Đã hủy' },
    ASSIGNED: { bg: '#f8fafc', color: '#334155', label: 'Đã phân công' },
};

const CustomSelect = ({ value, onChange, options, className = '', variant = 'default' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getVariantStyles = () => {
        if (variant === 'role') {
            const roleColors = {
                1: { bg: '#f3e8ff', color: '#6b21a8', label: 'Admin' }, // Purple
                2: { bg: '#dbeafe', color: '#1e40af', label: 'Manager' }, // Blue
                3: { bg: '#d1fae5', color: '#065f46', label: 'Cashier' }, // Green
                4: { bg: '#d1fae5', color: '#065f46', label: 'Inventory Staff' },
                5: { bg: '#d1fae5', color: '#065f46', label: 'Sales Staff' }
            };
            return roleColors[value] || roleColors[3];
        } else if (variant === 'status') {
            return STATUS_COLORS[value] || STATUS_COLORS['all'];
        }
        return { bg: '#ffffff', color: '#1e293b' };
    };

    const variantStyle = getVariantStyles();

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border-none outline-none transition-all cursor-pointer hover:opacity-90 hover:scale-[1.02] focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 shadow-md hover:shadow-lg flex items-center justify-between"
                style={{
                    backgroundColor: variantStyle.bg,
                    color: variantStyle.color
                }}
            >
                <span>{selectedOption?.label || 'Chọn...'}</span>
                <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div
                    className="fixed bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn"
                    style={{
                        zIndex: 9999,
                        minWidth: dropdownRef.current?.offsetWidth || 200,
                        maxWidth: 400,
                        top: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().bottom + window.scrollY + 8 : 0,
                        left: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().left + window.scrollX : 0,
                    }}
                >
                    <div className="py-1 max-h-60 overflow-y-auto custom-scrollbar">
                        {options.map((option) => {
                            const optionStyle = variant === 'role' ?
                                {
                                    1: { bg: '#f3e8ff', color: '#6b21a8' },
                                    2: { bg: '#dbeafe', color: '#1e40af' },
                                    3: { bg: '#d1fae5', color: '#065f46' },
                                    4: { bg: '#d1fae5', color: '#065f46' },
                                    5: { bg: '#d1fae5', color: '#065f46' }
                                }[option.value] || { bg: '#f8fafc', color: '#1e293b' }
                                : variant === 'status' ?
                                    STATUS_COLORS[option.value] || { bg: '#f8fafc', color: '#334155' }
                                    : { bg: '#f8fafc', color: '#1e293b' };

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-150 block ${value === option.value ? 'ring-2 ring-inset ring-indigo-500' : ''
                                        }`}
                                    style={{
                                        backgroundColor: value === option.value ? optionStyle.bg : '#ffffff',
                                        color: value === option.value ? optionStyle.color : '#475569',
                                        display: 'block',
                                        width: '100%'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (value !== option.value) {
                                            e.currentTarget.style.backgroundColor = '#f1f5f9';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (value !== option.value) {
                                            e.currentTarget.style.backgroundColor = '#ffffff';
                                        }
                                    }}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <style jsx="true">{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
};

export default CustomSelect;
