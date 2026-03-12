import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import authService from '../../services/authService';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const clearNotices = () => {
        setError('');
        setMessage('');
    };

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        clearNotices();
        setLoading(true);

        try {
            await authService.requestPasswordOtp(email.trim());
            setMessage('OTP ─æ├ú ─æ╞░ß╗úc gß╗¡i ─æß║┐n email cß╗ºa bß║ín. Vui l├▓ng kiß╗âm tra hß╗Öp th╞░.');
            setStep(2);
        } catch (err) {
            setError(err.message || 'Kh├┤ng thß╗â gß╗¡i OTP, vui l├▓ng thß╗¡ lß║íi.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        clearNotices();
        setLoading(true);

        try {
            await authService.resetPasswordWithOtp({
                email: email.trim(),
                otp: otp.trim(),
                newPassword,
                confirmPassword,
            });
            setMessage('─Éß║╖t lß║íi mß║¡t khß║⌐u th├ánh c├┤ng. Hß╗ç thß╗æng sß║╜ chuyß╗ân bß║ín vß╗ü trang ─æ─âng nhß║¡p.');
            setTimeout(() => navigate('/login'), 1200);
        } catch (err) {
            setError(err.message || '─Éß║╖t lß║íi mß║¡t khß║⌐u thß║Ñt bß║íi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-8">
                <div className="flex items-center justify-between mb-5">
                    <h1 className="text-xl font-bold text-slate-800">Qu├¬n mß║¡t khß║⌐u</h1>
                    <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" />
                        Quay lß║íi
                    </Link>
                </div>

                <p className="text-sm text-slate-600 mb-5">
                    {step === 1
                        ? 'Nhß║¡p email t├ái khoß║ún ─æß╗â nhß║¡n m├ú OTP ─æß║╖t lß║íi mß║¡t khß║⌐u.'
                        : 'Nhß║¡p m├ú OTP ─æ├ú nhß║¡n qua email v├á tß║ío mß║¡t khß║⌐u mß╗¢i.'}
                </p>

                {message && (
                    <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleRequestOtp} className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700" htmlFor="forgot-email">
                            Email t├ái khoß║ún
                        </label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 left-3" />
                            <input
                                id="forgot-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="vd: nhanvien@smalltrend.vn"
                                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-sm font-semibold disabled:opacity-60"
                        >
                            {loading ? '─Éang gß╗¡i OTP...' : 'Gß╗¡i OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="otp-code">
                                M├ú OTP
                            </label>
                            <div className="relative">
                                <ShieldCheck className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 left-3" />
                                <input
                                    id="otp-code"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Nhß║¡p 6 sß╗æ OTP"
                                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="new-password">
                                Mß║¡t khß║⌐u mß╗¢i
                            </label>
                            <div className="relative">
                                <KeyRound className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 left-3" />
                                <input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="├ìt nhß║Ñt 6 k├╜ tß╗▒"
                                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="confirm-password">
                                X├íc nhß║¡n mß║¡t khß║⌐u mß╗¢i
                            </label>
                            <div className="relative">
                                <KeyRound className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 left-3" />
                                <input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Nhß║¡p lß║íi mß║¡t khß║⌐u mß╗¢i"
                                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    clearNotices();
                                    setStep(1);
                                    setOtp('');
                                    setNewPassword('');
                                    setConfirmPassword('');
                                }}
                                className="rounded-lg border border-slate-300 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Gß╗¡i lß║íi OTP
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-lg bg-blue-600 hover:bg-blue-700 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                            >
                                {loading ? '─Éang cß║¡p nhß║¡t...' : '─Éß║╖t lß║íi mß║¡t khß║⌐u'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
