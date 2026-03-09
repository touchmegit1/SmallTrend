import React, { useState, useEffect } from "react";
import {
    Settings,
    Bot,
    Sliders,
    MessageSquare,
    Zap,
    Save,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
    Info,
} from "lucide-react";
import aiChatService from "../../services/aiChatService";

const GEMINI_MODELS = [
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash (Recommended)" },
    { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite (Faster)" },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash (Legacy)" },
];

const LANGUAGES = [
    { value: "vi", label: "Tiếng Việt" },
    { value: "en", label: "English" },
];

const AiSettingsPage = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await aiChatService.getSettings();
            setSettings(data);
            setHasChanges(false);
        } catch (error) {
            showToast("Không thể tải cấu hình AI", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const data = await aiChatService.updateSettings(settings);
            setSettings(data);
            setHasChanges(false);
            showToast("Đã lưu cấu hình AI thành công!", "success");
        } catch (error) {
            showToast("Lỗi khi lưu cấu hình", "error");
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field, value) => {
        setSettings((prev) => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    if (loading) {
        return (
            <div className="bg-slate-50 min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="text-sm text-slate-500">Đang tải cấu hình AI...</p>
                </div>
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="bg-slate-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                    <p className="text-slate-600">Không thể tải cấu hình AI</p>
                    <button
                        onClick={loadSettings}
                        className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen py-4 px-4">
            {/* Toast */}
            {toast && (
                <div
                    className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all animate-in slide-in-from-right ${
                        toast.type === "success"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                >
                    {toast.type === "success" ? (
                        <CheckCircle size={16} />
                    ) : (
                        <AlertTriangle size={16} />
                    )}
                    {toast.message}
                </div>
            )}

            <div className="w-full max-w-5xl mx-auto">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                            <Settings size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800">Cài đặt AI</h1>
                            <p className="text-xs text-slate-400">
                                Quản lý cấu hình trợ lý AI SmallTrend
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {settings.updatedAt && (
                            <span className="text-xs text-slate-400">
                                Cập nhật: {new Date(settings.updatedAt).toLocaleString("vi-VN")}
                            </span>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving || !hasChanges}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                hasChanges && !saving
                                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200"
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            }`}
                        >
                            {saving ? (
                                <RefreshCw size={16} className="animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            {saving ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Section 1: Model Configuration */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                <Sliders size={16} className="text-indigo-500" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-800">Cấu hình Model</h2>
                                <p className="text-[10px] text-slate-400">Chọn model AI và các thông số</p>
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* AI Enabled Toggle */}
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">Bật/Tắt AI</p>
                                    <p className="text-[10px] text-slate-400">Kill-switch để tắt toàn bộ AI</p>
                                </div>
                                <button
                                    onClick={() => updateField("aiEnabled", !settings.aiEnabled)}
                                    className={`relative w-12 h-7 rounded-full transition-colors ${
                                        settings.aiEnabled ? "bg-indigo-600" : "bg-slate-300"
                                    }`}
                                >
                                    <div
                                        className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                                            settings.aiEnabled ? "translate-x-6" : "translate-x-1"
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Gemini Model */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    Gemini Model
                                </label>
                                <select
                                    value={settings.geminiModel || "gemini-2.0-flash"}
                                    onChange={(e) => updateField("geminiModel", e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                                >
                                    {GEMINI_MODELS.map((m) => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Temperature */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-semibold text-slate-600">
                                        Temperature
                                    </label>
                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                        {(settings.temperature ?? 1.0).toFixed(1)}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="2"
                                    step="0.1"
                                    value={settings.temperature ?? 1.0}
                                    onChange={(e) => updateField("temperature", parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                    <span>Chính xác</span>
                                    <span>Cân bằng</span>
                                    <span>Sáng tạo</span>
                                </div>
                            </div>

                            {/* Max Output Tokens */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    Giới hạn output (tokens)
                                </label>
                                <input
                                    type="number"
                                    value={settings.maxOutputTokens ?? 1024}
                                    onChange={(e) => updateField("maxOutputTokens", parseInt(e.target.value) || 1024)}
                                    min="256"
                                    max="8192"
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Context Control */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                <Zap size={16} className="text-amber-500" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-800">Dữ liệu ngữ cảnh</h2>
                                <p className="text-[10px] text-slate-400">Chọn dữ liệu AI được phép truy cập</p>
                            </div>
                        </div>
                        <div className="p-5 space-y-3">
                            {[
                                { key: "includeSalesData", label: "Doanh thu & Đơn hàng", desc: "Dữ liệu bán hàng, top sản phẩm" },
                                { key: "includeInventoryData", label: "Kho hàng", desc: "Tồn kho, cảnh báo hết hàng" },
                                { key: "includeCustomerData", label: "Khách hàng", desc: "Thông tin, điểm tích lũy" },
                                { key: "includeCouponData", label: "Mã giảm giá", desc: "Coupon đang hoạt động" },
                            ].map((item) => (
                                <div
                                    key={item.key}
                                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">{item.label}</p>
                                        <p className="text-[10px] text-slate-400">{item.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => updateField(item.key, !settings[item.key])}
                                        className={`relative w-10 h-6 rounded-full transition-colors ${
                                            settings[item.key] ? "bg-indigo-600" : "bg-slate-300"
                                        }`}
                                    >
                                        <div
                                            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                                                settings[item.key] ? "translate-x-[18px]" : "translate-x-0.5"
                                            }`}
                                        />
                                    </button>
                                </div>
                            ))}

                            {/* Low Stock Threshold */}
                            <div className="pt-2">
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    Ngưỡng tồn kho thấp
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={settings.lowStockThreshold ?? 5}
                                        onChange={(e) => updateField("lowStockThreshold", parseInt(e.target.value) || 5)}
                                        min="1"
                                        max="100"
                                        className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 text-center focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                                    />
                                    <span className="text-xs text-slate-400">sản phẩm (≤ giá trị này = cảnh báo)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: System Prompt & Behavior */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden lg:col-span-2">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                                <Bot size={16} className="text-purple-500" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-800">Hành vi & Tính cách AI</h2>
                                <p className="text-[10px] text-slate-400">Tùy chỉnh cách AI trả lời</p>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                                {/* AI Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                        Tên hiển thị AI
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.aiName || ""}
                                        onChange={(e) => updateField("aiName", e.target.value)}
                                        placeholder="SmallTrend AI"
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                                    />
                                </div>

                                {/* Response Language */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                        Ngôn ngữ phản hồi
                                    </label>
                                    <select
                                        value={settings.responseLanguage || "vi"}
                                        onChange={(e) => updateField("responseLanguage", e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                                    >
                                        {LANGUAGES.map((l) => (
                                            <option key={l.value} value={l.value}>{l.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Info */}
                                <div className="flex items-end">
                                    <div className="flex items-center gap-2 px-3 py-2.5 bg-indigo-50 rounded-xl text-xs text-indigo-600 w-full">
                                        <Info size={14} className="flex-shrink-0" />
                                        <span>Thay đổi có hiệu lực ngay lập tức cho tin nhắn mới</span>
                                    </div>
                                </div>
                            </div>

                            {/* Welcome Message */}
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    Tin nhắn chào mừng
                                </label>
                                <textarea
                                    value={settings.welcomeMessage || ""}
                                    onChange={(e) => updateField("welcomeMessage", e.target.value)}
                                    rows={2}
                                    placeholder="Xin chào! Tôi là trợ lý AI..."
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 resize-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                                />
                            </div>

                            {/* System Prompt */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    System Prompt (Hướng dẫn cho AI)
                                </label>
                                <textarea
                                    value={settings.systemPrompt || ""}
                                    onChange={(e) => updateField("systemPrompt", e.target.value)}
                                    rows={8}
                                    placeholder="Bạn là trợ lý AI nội bộ..."
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 font-mono resize-y focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Đây là lệnh hệ thống gửi kèm mọi câu hỏi. Thay đổi cẩn thận.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Quick Prompts */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden lg:col-span-2">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                                <MessageSquare size={16} className="text-green-500" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-800">Gợi ý nhanh</h2>
                                <p className="text-[10px] text-slate-400">
                                    Các nút gợi ý hiển thị trên giao diện chat
                                </p>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <div key={num}>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                            Gợi ý {num}
                                        </label>
                                        <input
                                            type="text"
                                            value={settings[`quickPrompt${num}`] || ""}
                                            onChange={(e) =>
                                                updateField(`quickPrompt${num}`, e.target.value)
                                            }
                                            placeholder={`VD: Doanh thu hôm nay thế nào?`}
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-3">
                                Để trống để ẩn gợi ý. Tối đa 5 gợi ý.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiSettingsPage;
