import React, { useState, useEffect, useRef } from 'react';
import {
    MessageCircle,
    Send,
    Bot,
    User,
    TrendingUp,
    Clock,
    Target,
    Calendar,
    Sparkles,
    MoreVertical
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import aiChatService from '../../services/aiChatService';

const AiChatPage = () => {
    // State management
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [contextDate, setContextDate] = useState(new Date().toISOString().split('T')[0]);
    const [stats, setStats] = useState({
        dailyQueryCount: 0,
        avgResponseTime: 0,
        accuracyPercentage: 0
    });
    const [loading, setLoading] = useState(true);

    // Ref for auto-scrolling
    const messagesEndRef = useRef(null);

    // Initialize with mock conversation
    useEffect(() => {
        const initialMessages = [
            {
                id: 1,
                type: 'ai',
                content: 'Xin chào! Tôi là trợ lý AI của bạn. Tôi có thể giúp gì cho việc quản lý cửa hàng hôm nay?',
                timestamp: new Date(Date.now() - 300000)
            },
            {
                id: 2,
                type: 'user',
                content: 'Cho tôi xem doanh thu 7 ngày gần nhất',
                timestamp: new Date(Date.now() - 240000)
            },
            {
                id: 3,
                type: 'ai',
                content: 'Doanh thu 7 ngày gần nhất tăng 12% so với tuần trước.\n\n📊 **Tổng doanh thu:** 45,200,000 VNĐ\n📦 **Tổng đơn hàng:** 320 đơn\n💰 **Giá trị trung bình:** 141,250 VNĐ/đơn\n\n🏆 **Top sản phẩm:**\n1. Áo thun basic - 85 sản phẩm\n2. Quần jean slim - 62 sản phẩm\n3. Giày sneaker - 48 sản phẩm',
                timestamp: new Date(Date.now() - 180000)
            }
        ];
        setMessages(initialMessages);

        // Generate session ID
        setSessionId(`session-${Date.now()}`);

        // Load statistics
        loadStatistics();
    }, []);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadStatistics = async () => {
        try {
            const statsData = await aiChatService.getStatistics();
            setStats(statsData);
        } catch (error) {
            console.error('Error loading statistics:', error);
            // Use mock data if API fails
            setStats({
                dailyQueryCount: 142,
                avgResponseTime: 1.2,
                accuracyPercentage: 98
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        // Add user message
        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputMessage,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');

        // Show typing indicator
        setIsTyping(true);

        // Simulate delay for better UX
        setTimeout(async () => {
            try {
                // Call AI service
                const response = await aiChatService.sendMessage(
                    inputMessage,
                    sessionId,
                    contextDate ? new Date(contextDate) : null
                );

                // Add AI response
                const aiMessage = {
                    id: Date.now() + 1,
                    type: 'ai',
                    content: response.reply,
                    timestamp: new Date(response.timestamp)
                };
                setMessages(prev => [...prev, aiMessage]);

                // Update session ID if provided
                if (response.sessionId) {
                    setSessionId(response.sessionId);
                }
            } catch (error) {
                console.error('Error sending message:', error);

                // Fallback to mock response
                const mockResponse = {
                    id: Date.now() + 1,
                    type: 'ai',
                    content: 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.\n\nTrong thời gian chờ, bạn có thể:\n📊 Xem báo cáo doanh thu\n📦 Kiểm tra tồn kho\n👥 Xem thông tin khách hàng',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, mockResponse]);
            } finally {
                setIsTyping(false);
            }
        }, 1000);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-slate-50 min-h-screen py-6">
            <div className="max-w-[1600px] mx-auto h-[calc(100vh-48px)] flex flex-col lg:flex-row gap-6 px-6">
                {/* Left Sidebar - Context & Stats */}
                <div className="w-full lg:w-[350px] shrink-0 flex flex-col gap-4 overflow-y-auto pb-2 h-full hide-scrollbar">
                    {/* Title Card */}
                    <Card className="border-0 shadow-sm bg-white shrink-0">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center shadow-md">
                                    <Sparkles size={20} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-slate-800">AI Assistant</h1>
                                    <p className="text-xs text-slate-500 font-medium">SmallTrend Intelligent System</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Date Context */}
                    <Card className="border-0 shadow-sm bg-white shrink-0">
                        <CardContent className="p-5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                                Dữ liệu ngày
                            </label>
                            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <Calendar size={18} className="text-slate-500" />
                                <Input
                                    type="date"
                                    className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-slate-700 font-medium"
                                    value={contextDate}
                                    onChange={(e) => setContextDate(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Statistics Grid */}
                    <div className="grid gap-3 shrink-0">
                        <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <TrendingUp size={18} className="text-white" />
                                    </div>
                                    <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">Hôm nay</span>
                                </div>
                                <div className="text-3xl font-bold mb-1">{stats.dailyQueryCount}</div>
                                <p className="text-indigo-100 text-xs">Truy vấn đã xử lý</p>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-2 gap-3">
                            <Card className="border-0 shadow-sm bg-white">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2 text-slate-500">
                                        <Clock size={16} />
                                        <span className="text-xs font-medium">Tốc độ</span>
                                    </div>
                                    <div className="text-xl font-bold text-slate-800">{stats.avgResponseTime}s</div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-sm bg-white">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2 text-slate-500">
                                        <Target size={16} />
                                        <span className="text-xs font-medium">Độ chính xác</span>
                                    </div>
                                    <div className="text-xl font-bold text-slate-800">{stats.accuracyPercentage}%</div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Quick Prompts Hint */}
                    <Card className="border-0 shadow-sm bg-white shrink-0 mt-auto">
                        <CardContent className="p-5">
                            <h3 className="text-sm font-semibold text-slate-800 mb-3">Gợi ý câu hỏi</h3>
                            <div className="flex flex-col gap-2">
                                {['Doanh thu hôm nay thế nào?', 'Sản phẩm nào bán chạy nhất?', 'Có đơn hàng nào đang chờ xử lý không?'].map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setInputMessage(prompt)}
                                        className="text-left text-xs text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-md transition-colors truncate"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Main Area - Chat Interface */}
                <div className="flex-1 min-w-0 h-full flex flex-col">
                    <Card className="border-0 shadow-lg bg-white h-full flex flex-col overflow-hidden rounded-2xl relative">
                        {/* Chat Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white z-10 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <div>
                                    <h2 className="text-base font-semibold text-slate-800">Cuộc hội thoại</h2>
                                    <p className="text-xs text-slate-500">Session ID: <span className="font-mono">{sessionId?.substring(0, 8)}...</span></p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                                <MoreVertical size={20} />
                            </Button>
                        </div>

                        {/* Chat Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 flex flex-col gap-6 scrollbar-thin">
                            {messages.length === 0 && (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-60">
                                    <Bot size={48} className="mb-4" />
                                    <p>Bắt đầu cuộc trò chuyện với AI Assistant</p>
                                </div>
                            )}

                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-4 max-w-[85%] ${message.type === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm mt-1 ${
                                        message.type === 'ai'
                                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                                            : 'bg-slate-200 text-slate-600'
                                    }`}>
                                        {message.type === 'ai' ? <Bot size={16} /> : <User size={16} />}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-semibold ${message.type === 'user' ? 'text-right w-full' : ''}`}>
                                                {message.type === 'ai' ? 'SmallTrend AI' : 'Bạn'}
                                            </span>
                                            <span className="text-[10px] text-slate-400">{formatTime(message.timestamp)}</span>
                                        </div>
                                        <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                                            message.type === 'ai'
                                                ? 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                                                : 'bg-indigo-600 text-white rounded-tr-none'
                                        }`}>
                                            {message.content}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <div className="flex gap-4 max-w-[85%] animate-fade-in">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                                        <Bot size={16} />
                                    </div>
                                    <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-1.5 h-full">
                                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                            <div className="relative flex items-end gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50/50 transition-all">
                                <Textarea
                                    className="flex-1 resize-none border-0 bg-transparent focus-visible:ring-0 min-h-[44px] py-3 max-h-[150px] text-slate-700 placeholder:text-slate-400"
                                    placeholder="Nhập câu hỏi của bạn..."
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    rows={1}
                                    disabled={isTyping}
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim() || isTyping}
                                    className={`h-[44px] w-[44px] p-0 rounded-lg shrink-0 transition-all duration-300 ${
                                        inputMessage.trim() ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                                >
                                    <Send size={18} className={inputMessage.trim() ? 'translate-x-[1px] -translate-y-[1px]' : ''} />
                                </Button>
                            </div>
                            <div className="text-center mt-2">
                                <p className="text-[10px] text-slate-400">AI có thể mắc lỗi. Vui lòng kiểm tra thông tin quan trọng.</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AiChatPage;
