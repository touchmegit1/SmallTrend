import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Trash2,
    Edit3,
    Clock,
    User,
    ChevronDown,
    AlertCircle,
    Loader2,
    Tag
} from 'lucide-react';
import { Container } from 'react-bootstrap';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';

import adminNoteService from '../../services/adminNoteService';
import AdminNoteModal, { NOTE_TAGS, NOTE_STATUSES } from './AdminNoteModal';

const AdminNotesPage = () => {
    // Data State
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter/Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [tagFilter, setTagFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState(null);

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        setLoading(true);
        try {
            const data = await adminNoteService.getAllNotes();
            setNotes(data);
            setError(null);
        } catch (err) {
            setError('Không thể tải ghi chú admin. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNote = () => {
        setEditingNote(null);
        setIsModalOpen(true);
    };

    const handleEditNote = (note) => {
        setEditingNote(note);
        setIsModalOpen(true);
    };

    const handleSaveNote = async (formData) => {
        try {
            if (editingNote) {
                await adminNoteService.updateNote(editingNote.id, formData);
            } else {
                await adminNoteService.createNote(formData);
            }
            setIsModalOpen(false);
            loadNotes();
        } catch (err) {
            setError('Không thể lưu ghi chú.');
        }
    };

    const handleDeleteNote = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa ghi chú này không?')) {
            try {
                await adminNoteService.deleteNote(id);
                loadNotes();
            } catch (err) {
                setError('Không thể xóa ghi chú.');
            }
        }
    };

    // List of notes (now auto-sorted by backend)
    const filteredNotes = useMemo(() => {
        return notes.filter(note => {
            const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 note.content.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTag = tagFilter === 'ALL' || note.tag === tagFilter;
            const matchesStatus = statusFilter === 'ALL' || note.status === statusFilter;
            return matchesSearch && matchesTag && matchesStatus;
        });
    }, [notes, searchTerm, tagFilter, statusFilter]);

    const getTagDetails = (tagName) => NOTE_TAGS.find(t => t.value === tagName) || NOTE_TAGS[7];
    const getStatusDetails = (statusName) => NOTE_STATUSES.find(s => s.value === statusName) || NOTE_STATUSES[0];

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const NoteCard = ({ note }) => {
        const tag = getTagDetails(note.tag);
        const status = getStatusDetails(note.status);
        const StatusIcon = status.icon;

        return (
            <Card className="relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 border-none bg-white rounded-2xl group shadow-md shadow-slate-200">
                <CardContent className="p-5">
                    {/* Card Header: Tag & Actions */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-2">
                            <Badge
                                className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full border-none"
                                style={{ backgroundColor: tag.color + '20', color: tag.color }}
                            >
                                {tag.label}
                            </Badge>
                            <Badge variant="outline" className="w-fit text-[10px] flex items-center gap-1 border-slate-200 text-slate-500">
                                <StatusIcon size={10} />
                                {status.label}
                            </Badge>
                        </div>
                        
                        <div className="flex items-center gap-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical size={16} className="text-slate-400" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 rounded-xl border-slate-100 shadow-xl">
                                    <DropdownMenuItem onClick={() => handleEditNote(note)} className="cursor-pointer gap-2 py-2.5 rounded-lg">
                                        <Edit3 size={16} className="text-blue-500" /> Sửa ghi chú
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteNote(note.id)} className="cursor-pointer gap-2 py-2.5 rounded-lg text-red-600">
                                        <Trash2 size={16} /> Xóa
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">
                        {note.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-6 leading-relaxed whitespace-pre-wrap line-clamp-6">
                        {note.content}
                    </p>

                    {/* Footer */}
                    <div className="pt-4 border-t border-slate-50 mt-auto flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                    <User size={14} />
                                </div>
                                <span className="text-[11px] font-bold text-slate-700">{note.createdByName}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-400">
                                <Clock size={11} />
                                <span className="text-[10px]">{formatDateTime(note.createdAt)}</span>
                            </div>
                        </div>
                        {note.updatedByName && note.updatedByName !== note.createdByName && (
                            <p className="text-[9px] text-slate-400 italic text-right">
                                Chỉnh sửa bởi {note.updatedByName}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <Container fluid className="bg-slate-50 min-h-screen py-8 px-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                        Ghi chú Admin
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">Bảng tin nội bộ cho các hoạt động vận hành và quản lý cửa hàng.</p>
                </div>
                <Button
                    onClick={handleCreateNote}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-200 rounded-2xl px-6 py-6 font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus size={20} />
                    Thông báo mới
                </Button>
            </div>

            {/* Expanded Search & Filter Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
                <div className="lg:col-span-5 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                        placeholder="Tìm kiếm ghi chú, thông báo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 h-12 bg-white border-none shadow-sm rounded-2xl focus:ring-2 focus:ring-blue-400 placeholder:text-slate-300"
                    />
                </div>
                
                <div className="lg:col-span-3 flex items-center bg-white rounded-2xl shadow-sm px-4 h-12">
                    <Filter size={16} className="text-slate-400 mr-3" />
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-transparent border-none text-sm font-bold text-slate-600 focus:outline-none"
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        {NOTE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </div>

                <div className="lg:col-span-3 flex items-center bg-white rounded-2xl shadow-sm px-4 h-12">
                    <Tag size={16} className="text-slate-400 mr-3" />
                    <select 
                        value={tagFilter} 
                        onChange={(e) => setTagFilter(e.target.value)}
                        className="w-full bg-transparent border-none text-sm font-bold text-slate-600 focus:outline-none"
                    >
                        <option value="ALL">Tất cả danh mục</option>
                        {NOTE_TAGS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                </div>

                <div className="lg:col-span-1 flex justify-center">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={loadNotes} 
                        className="h-12 w-12 rounded-2xl bg-white shadow-sm hover:bg-slate-100"
                    >
                        <Loader2 className={`${loading ? 'animate-spin' : ''} text-slate-400`} size={20} />
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6 rounded-2xl border-none bg-red-50 text-red-600 shadow-sm">
                    <AlertCircle size={18} />
                    <AlertDescription className="font-medium ml-2">{error}</AlertDescription>
                </Alert>
            )}

            {/* Notes Grid */}
            {loading && notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                    <p className="text-slate-400 font-medium">Đang tải bảng tin...</p>
                </div>
            ) : filteredNotes.length === 0 ? (
                <div className="bg-slate-100 rounded-[40px] border-2 border-dashed border-slate-200 py-32 flex flex-col items-center">
                    <div className="bg-white p-6 rounded-3xl shadow-sm mb-6">
                        <Search size={48} className="text-slate-200" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-400">Không tìm thấy ghi chú nào phù hợp.</h3>
                    <p className="text-slate-300 text-sm">Thử thay đổi bộ lọc hoặc tạo ghi chú mới.</p>
                </div>
            ) : (
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Bảng tin</h2>
                        <div className="h-px bg-slate-200 flex-1 ml-4" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {filteredNotes.map(note => <NoteCard key={note.id} note={note} />)}
                    </div>
                </section>
            )}

            {/* Modal */}
            <AdminNoteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveNote}
                note={editingNote}
            />
        </Container>
    );
};

export default AdminNotesPage;
