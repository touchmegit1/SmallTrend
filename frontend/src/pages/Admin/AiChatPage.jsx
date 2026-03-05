import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    Send,
    Bot,
    User,
    TrendingUp,
    Clock,
    Target,
} from "lucide-react";
import aiChatService from "../../services/aiChatService";

const AiChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [contextDate] = useState(new Date().toISOString().split("T")[0]);
    const [stats, setStats] = useState({
        dailyQueryCount: 0,
        avgResponseTime: null,
        accuracyPercentage: null,
    });

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        loadStatistics();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const loadStatistics = async () => {
        try {
            const statsData = await aiChatService.getStatistics();
            setStats(statsData);
        } catch (error) {
            console.error("Error loading statistics:", error);
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = {
            id: Date.now(),
            type: "user",
            content: inputMessage,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInputMessage("");
        setIsTyping(true);

        setTimeout(async () => {
            try {
                const response = await aiChatService.sendMessage(
                    inputMessage,
                    sessionId,
                    contextDate ? new Date(contextDate) : null,
                );

                const aiMessage = {
                    id: Date.now() + 1,
                    type: "ai",
                    content:
                        response.reply ||
                        response.response ||
                        response.answer ||
                        "Không có nội dung phản hồi từ AI.",
                    timestamp: new Date(response.timestamp || Date.now()),
                };
                setMessages((prev) => [...prev, aiMessage]);

                if (response.sessionId) setSessionId(response.sessionId);
            } catch (error) {
                console.error("Error sending message:", error);
                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now() + 1,
                        type: "ai",
                        content:
                            "Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.\n\nTrong thời gian chờ, bạn có thể:\n📊 Xem báo cáo doanh thu\n📦 Kiểm tra tồn kho\n👥 Xem thông tin khách hàng",
                        timestamp: new Date(),
                    },
                ]);
            } finally {
                setIsTyping(false);
            }
        }, 1000);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const quickPrompts = [
        "Doanh thu hôm nay thế nào?",
        "Sản phẩm nào bán chạy nhất?",
        "Có đơn hàng nào đang chờ xử lý không?",
    ];

    return (
        <div className="bg-slate-50 min-h-screen py-4 px-4">
            <div className="w-full">
                {/* Main Chat Card */}
                <div
                    className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col"
                    style={{ minHeight: "calc(100vh - 48px)" }}
                >
                    {/* Card Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center shadow-sm">
                                <Bot size={20} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-slate-800 leading-tight">
                                    AI Assistant
                                </h1>
                                <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
                                    SmallTrend Intelligent System
                                </p>
                            </div>
                        </div>
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                            LocalStore AI
                        </span>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-3 border-b border-slate-100">
                        <div className="flex items-center gap-3 px-5 py-3 border-r border-slate-100">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                <TrendingUp size={15} className="text-indigo-500" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-medium leading-none mb-0.5">
                                    Truy vấn hôm nay
                                </p>
                                <p className="text-base font-bold text-slate-800 leading-none">
                                    {stats.dailyQueryCount}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-5 py-3 border-r border-slate-100">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                <Clock size={15} className="text-amber-500" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-medium leading-none mb-0.5">
                                    Tốc độ phản hồi
                                </p>
                                <p className="text-base font-bold text-slate-800 leading-none">
                                    {stats.avgResponseTime != null && stats.avgResponseTime !== 0
                                        ? `${stats.avgResponseTime}s`
                                        : "—"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-5 py-3">
                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                                <Target size={15} className="text-green-500" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-medium leading-none mb-0.5">
                                    Độ chính xác
                                </p>
                                <p className="text-base font-bold text-slate-800 leading-none">
                                    {stats.accuracyPercentage != null && stats.accuracyPercentage !== 0
                                        ? `${stats.accuracyPercentage}%`
                                        : "—"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Chat Messages Area */}
                    <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
                        {messages.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                                <div className="w-16 h-16 rounded-2xl gradient-purple flex items-center justify-center shadow-md mb-5">
                                    <Bot size={32} className="text-white" />
                                </div>
                                <h2 className="text-base font-bold text-slate-800 mb-2">
                                    Bắt đầu cuộc trò chuyện
                                </h2>
                                <p className="text-sm text-slate-400 mb-6 max-w-xs leading-relaxed">
                                    Hỏi tôi về{" "}
                                    <span className="text-indigo-500">doanh thu</span>,{" "}
                                    <span className="text-red-400">kho hàng</span>,{" "}
                                    <span className="text-green-500">khách hàng</span>{" "}
                                    hoặc bất kỳ điều gì.
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {quickPrompts.map((prompt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setInputMessage(prompt)}
                                            className="text-xs text-indigo-600 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex gap-3 ${message.type === "user" ? "flex-row-reverse" : ""}`}
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm mt-1 ${
                                                message.type === "ai"
                                                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                                                    : "bg-slate-200 text-slate-600"
                                            }`}
                                        >
                                            {message.type === "ai" ? (
                                                <Bot size={15} />
                                            ) : (
                                                <User size={15} />
                                            )}
                                        </div>
                                        <div
                                            className={`flex flex-col gap-1 max-w-[80%] ${
                                                message.type === "user" ? "items-end" : ""
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-semibold text-slate-500">
                                                    {message.type === "ai" ? "SmallTrend AI" : "Bạn"}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {formatTime(message.timestamp)}
                                                </span>
                                            </div>
                                            <div
                                                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                                    message.type === "ai"
                                                        ? "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                                                        : "bg-indigo-600 text-white rounded-tr-none whitespace-pre-wrap"
                                                }`}
                                            >
                                                {message.type === "ai" ? (
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            h1: ({ children }) => <p className="text-base font-bold text-slate-800 mb-1">{children}</p>,
                                                            h2: ({ children }) => <p className="text-sm font-bold text-slate-800 mb-1">{children}</p>,
                                                            h3: ({ children }) => <p className="text-sm font-semibold text-slate-700 mb-1">{children}</p>,
                                                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
                                                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
                                                            li: ({ children }) => <li className="text-slate-700">{children}</li>,
                                                            strong: ({ children }) => <strong className="font-semibold text-slate-800">{children}</strong>,
                                                            em: ({ children }) => <em className="italic text-slate-600">{children}</em>,
                                                            code: ({ inline, children }) =>
                                                                inline ? (
                                                                    <code className="bg-slate-100 text-indigo-600 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                                                                ) : (
                                                                    <pre className="bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-x-auto my-2">
                                                                        <code className="text-xs font-mono text-slate-700">{children}</code>
                                                                    </pre>
                                                                ),
                                                            table: ({ children }) => (
                                                                <div className="overflow-x-auto my-2">
                                                                    <table className="min-w-full text-xs border-collapse">{children}</table>
                                                                </div>
                                                            ),
                                                            thead: ({ children }) => <thead className="bg-indigo-50">{children}</thead>,
                                                            th: ({ children }) => <th className="px-3 py-1.5 text-left font-semibold text-indigo-700 border border-slate-200">{children}</th>,
                                                            td: ({ children }) => <td className="px-3 py-1.5 text-slate-700 border border-slate-200">{children}</td>,
                                                            tr: ({ children }) => <tr className="even:bg-slate-50">{children}</tr>,
                                                            hr: () => <hr className="border-slate-200 my-2" />,
                                                            blockquote: ({ children }) => (
                                                                <blockquote className="border-l-4 border-indigo-300 pl-3 text-slate-500 italic my-2">{children}</blockquote>
                                                            ),
                                                        }}
                                                    >
                                                        {message.content}
                                                    </ReactMarkdown>
                                                ) : (
                                                    message.content
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Typing Indicator */}
                                {isTyping && (
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                                            <Bot size={15} />
                                        </div>
                                        <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="px-5 py-4 border-t border-slate-100 bg-white">
                        <div className="flex items-center gap-2 border border-indigo-300 rounded-xl px-4 py-2.5 bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                            <input
                                ref={inputRef}
                                type="text"
                                className="flex-1 border-0 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
                                placeholder="Nhập câu hỏi của bạn..."
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isTyping}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() || isTyping}
                                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                                    inputMessage.trim() && !isTyping
                                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                                        : "bg-slate-100 text-slate-300 cursor-not-allowed"
                                }`}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                        <p className="text-center text-[10px] text-slate-400 mt-2">
                            AI có thể mắc lỗi. Vui lòng kiểm tra thông tin quan trọng.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiChatPage;
