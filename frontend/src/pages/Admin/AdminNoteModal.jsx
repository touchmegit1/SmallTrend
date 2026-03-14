import React, { useState, useEffect } from 'react';
import {
    X,
    Save,
    Tag,
    Info,
    CheckCircle2,
    Activity
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const NOTE_TAGS = [
    { value: 'ANNOUNCEMENT', label: 'Thông báo', color: '#ef4444' },
    { value: 'SHIFT_HANDOFF', label: 'Bàn giao ca', color: '#3b82f6' },
    { value: 'MAINTENANCE', label: 'Bảo trì', color: '#f59e0b' },
    { value: 'RESTOCK', label: 'Nhập hàng', color: '#10b981' },
    { value: 'CUSTOMER_ISSUE', label: 'Vấn đề khách hàng', color: '#8b5cf6' },
    { value: 'EVENT', label: 'Sự kiện', color: '#ec4899' },
    { value: 'POLICY_UPDATE', label: 'Cập nhật chính sách', color: '#6366f1' },
    { value: 'GENERAL', label: 'Chung', color: '#64748b' }
];

const NOTE_STATUSES = [
    { value: 'OPEN', label: 'Mở', icon: Info },
    { value: 'IN_PROGRESS', label: 'Đang xử lý', icon: Activity },
    { value: 'DONE', label: 'Hoàn thành', icon: CheckCircle2 }
];

const AdminNoteModal = ({ isOpen, onClose, onSave, note = null }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        tag: 'GENERAL',
        status: 'OPEN'
    });

    useEffect(() => {
        if (note) {
            setFormData({
                title: note.title || '',
                content: note.content || '',
                tag: note.tag || 'GENERAL',
                status: note.status || 'OPEN'
            });
        } else {
            setFormData({
                title: '',
                content: '',
                tag: 'GENERAL',
                status: 'OPEN'
            });
        }
    }, [note, isOpen]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!formData.title.trim() || !formData.content.trim()) {
            return;
        }
        onSave(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
                <DialogHeader className="p-6 pb-0">
                    <div className="flex justify-between items-center mb-4">
                        <DialogTitle className="text-2xl font-bold text-slate-800">
                            {note ? 'Sửa Ghi chú Admin' : 'Tạo Ghi chú Mới'}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="p-6 pt-0 space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-semibold text-slate-600">Tiêu đề</Label>
                        <Input
                            id="title"
                            placeholder="Nhập tiêu đề ghi chú..."
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className="border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl py-5"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-600">Danh mục</Label>
                            <Select
                                value={formData.tag}
                                onValueChange={(val) => handleChange('tag', val)}
                            >
                                <SelectTrigger className="border-slate-200 rounded-xl h-11">
                                    <SelectValue placeholder="Chọn danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    {NOTE_TAGS.map(tag => (
                                        <SelectItem key={tag.value} value={tag.value}>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: tag.color }}
                                                />
                                                {tag.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-600">Trạng thái</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(val) => handleChange('status', val)}
                            >
                                <SelectTrigger className="border-slate-200 rounded-xl h-11">
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    {NOTE_STATUSES.map(stat => (
                                        <SelectItem key={stat.value} value={stat.value}>
                                            <div className="flex items-center gap-2">
                                                <stat.icon size={14} className="text-slate-500" />
                                                {stat.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content" className="text-sm font-semibold text-slate-600">Nội dung</Label>
                        <Textarea
                            id="content"
                            placeholder="Viết nội dung ghi chú tại đây..."
                            value={formData.content}
                            onChange={(e) => handleChange('content', e.target.value)}
                            className="min-h-[150px] border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl resize-none p-4"
                        />
                    </div>
                </div>

                <DialogFooter className="p-6 bg-slate-50 flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 rounded-xl text-slate-600 hover:bg-slate-200"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!formData.title.trim() || !formData.content.trim()}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-200 rounded-xl py-6"
                    >
                        <Save size={18} className="mr-2" />
                        {note ? 'Cập nhật Ghi chú' : 'Tạo Ghi chú'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AdminNoteModal;
export { NOTE_TAGS, NOTE_STATUSES };
