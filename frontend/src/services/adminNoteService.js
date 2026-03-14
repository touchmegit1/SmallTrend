import api from '../config/axiosConfig';

const getAllNotes = async (tag = null, status = null) => {
    try {
        const params = {};
        if (tag) params.tag = tag;
        if (status) params.status = status;
        
        const response = await api.get('/admin/notes', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching admin notes:', error);
        throw error;
    }
};

const getNoteById = async (id) => {
    try {
        const response = await api.get(`/admin/notes/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching admin note ${id}:`, error);
        throw error;
    }
};

const createNote = async (noteData) => {
    try {
        const response = await api.post('/admin/notes', noteData);
        return response.data;
    } catch (error) {
        console.error('Error creating admin note:', error);
        throw error;
    }
};

const updateNote = async (id, noteData) => {
    try {
        const response = await api.put(`/admin/notes/${id}`, noteData);
        return response.data;
    } catch (error) {
        console.error(`Error updating admin note ${id}:`, error);
        throw error;
    }
};

const deleteNote = async (id) => {
    try {
        await api.delete(`/admin/notes/${id}`);
    } catch (error) {
        console.error(`Error deleting admin note ${id}:`, error);
        throw error;
    }
};

const adminNoteService = {
    getAllNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote
};

export default adminNoteService;
