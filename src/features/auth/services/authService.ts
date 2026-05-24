import { api } from '../../../api/api';
import { Plan } from '@/types/types';

export interface SignupFormData {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    birthDate?: string;
    address?: string;
    password?: string;
    plan?: Plan;
    flow?: string;
    [key: string]: any;
}

export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
    normalized: any;
}

export const PENDING_SIGNUP_KEY  = 'auth_pending_signup';
export const VERIFIED_SIGNUP_KEY = 'auth_verified_signup';
const PENDING_LOGIN_KEY          = 'auth_pending_login';

const AUTH_API = '/api/v1/auth';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[\d+\s()-]{10,20}$/;
const nameRegex  = /^[a-zA-ZcCgGiIoOsSuUÇçĞğİıÖöŞşÜü\s'-]{2,60}$/;
const dateRegex  = /^\d{4}-\d{2}-\d{2}$/;

const sanitizeText  = (value: string) => value.trim().replace(/\s+/g, ' ');
const sanitizePhone = (value: string) => value.replace(/[^\d+]/g, '');
const sanitizeCode  = (value: string) => value.replace(/\D/g, '').slice(0, 6);

const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const born  = new Date(birthDate);
    let age     = today.getFullYear() - born.getFullYear();
    const monthDiff = today.getMonth() - born.getMonth();
    const dayDiff   = today.getDate()  - born.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age -= 1;
    return age;
};

// Auth endpoint'lerine direkt fetch (her zaman backend)
const authFetch = async (path: string, body: object): Promise<any> => {
    const res = await fetch(`${AUTH_API}${path}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
    return data;
};

export const authService = {

    // Login Adım 1 — kimlik doğrula; SKIP_OTP=true ise token direkt, OTP ise needsOtp:true
    async loginWithEmail(email: string, password: string): Promise<{
        success:   boolean;
        token?:    string;
        user?:     any;
        needsOtp?: boolean;
        email?:    string;
        userId?:   string;
        message?:  string;
    }> {
        try {
            const data = await authFetch('/login', { email, password });
            if (data.token && data.user) {
                return { success: true, token: data.token, user: data.user };
            }
            return { success: true, needsOtp: true, email: data.email, userId: data.userId, message: data.message };
        } catch (err: any) {
            return { success: false, message: err.message || 'E-posta veya şifre hatalı.' };
        }
    },

    // Login Adım 2 — OTP kodu doğrula, token al
    async verifyLoginOtp(email: string, code: string): Promise<{
        success:  boolean;
        token?:   string;
        user?:    any;
        message?: string;
    }> {
        try {
            const data = await authFetch('/verify', { email, code: sanitizeCode(String(code)) });
            return { success: true, token: data.token, user: data.user };
        } catch (err: any) {
            return { success: false, message: err.message || 'Kod hatalı.' };
        }
    },

    // Login OTP yeniden gönder
    async resendLoginOtp(email: string, password: string): Promise<{ success: boolean; message?: string }> {
        try {
            const data = await authFetch('/login', { email, password });
            if (data.token) return { success: true, message: 'Giriş başarılı.' };
            return { success: true, message: 'Yeni doğrulama kodu gönderildi.' };
        } catch (err: any) {
            return { success: false, message: err.message || 'Kod gönderilemedi.' };
        }
    },

    async getPlans(): Promise<Plan[]> {
        const result = await api.plans.getAll();
        const plans  = (result as any)?.data ?? (Array.isArray(result) ? result : []);
        return [...plans].sort((a: Plan, b: Plan) => (a.order || 0) - (b.order || 0));
    },

    validateSignupForm(formData: SignupFormData): ValidationResult {
        const errors: Record<string, string> = {};
        const fullName = sanitizeText(`${formData.firstName || ''} ${formData.lastName || ''}`);
        const email    = (formData.email || '').trim().toLowerCase();
        const phone    = sanitizePhone(formData.phone || '');

        if (!nameRegex.test(formData.firstName || ''))
            errors.firstName = 'Ad en az 2 karakter olmalı.';

        if (!nameRegex.test(formData.lastName || ''))
            errors.lastName = 'Soyad en az 2 karakter olmalı.';

        if (!emailRegex.test(email))
            errors.email = 'Geçerli bir e-posta adresi gir.';

        if (phone && !phoneRegex.test(phone))
            errors.phone = 'Telefon numarası 10-20 karakter aralığında olmalı.';

        const birthDate = (formData.birthDate || '').trim();
        const age       = calculateAge(birthDate);
        if (!dateRegex.test(birthDate) || Number.isNaN(age) || age < 18 || age > 100)
            errors.birthDate = 'Doğum tarihi 18-100 yaş aralığında olmalı.';

        if (!formData.address || sanitizeText(formData.address).length < 10)
            errors.address = 'Adres en az 10 karakter olmalı.';

        const password = formData.password || '';
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasDigit = /\d/.test(password);
        if (password.length < 8 || !hasUpper || !hasLower || !hasDigit)
            errors.password = 'Şifre en az 8 karakter, büyük-küçük harf ve rakam içermeli.';

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
            normalized: {
                ...formData,
                name: fullName,
                email,
                phone,
                address: sanitizeText(formData.address || ''),
                age,
                birthDate,
            },
        };
    },

    // Backend /auth/signup/initiate e-posta + kullanıcı adı çakışmasını kontrol eder
    async validateSignupAgainstUsers(_formData: SignupFormData): Promise<{ valid: boolean; message?: string; fields?: any }> {
        return { valid: true };
    },

    // SIGNUP — Adım 1: Backend'e gönder
    async startEmailVerification(payload: SignupFormData) {
        try {
            const result = await authFetch('/signup/initiate', {
                firstName: payload.firstName,
                lastName:  payload.lastName,
                name:      payload.name,
                email:     payload.email,
                phone:     payload.phone    || null,
                birthDate: payload.birthDate || null,
                address:   payload.address  || null,
                password:  payload.password,
                plan:      payload.plan     || null,
                flow:      payload.flow     || 'free',
            });

            sessionStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify({
                email: payload.email,
                plan:  payload.plan,
                flow:  payload.flow || 'free',
            }));

            // SKIP_EMAIL_OTP=true: backend kullanıcıyı direkt oluşturdu, token döndü
            if (result.token && result.user) {
                sessionStorage.setItem(VERIFIED_SIGNUP_KEY, JSON.stringify(result.user));
                localStorage.setItem('auth_token', result.token);
                return { success: true, message: result.message, token: result.token, user: result.user };
            }

            return { success: true, message: result.message || `Doğrulama kodu ${payload.email} adresine gönderildi.` };
        } catch (err: any) {
            return { success: false, message: err.message || 'Kayıt başlatılamadı.' };
        }
    },

    startLoginVerification(payload: any) {
        sessionStorage.setItem(PENDING_LOGIN_KEY, JSON.stringify({
            ...payload,
            requestedAt: new Date().toISOString(),
        }));
        return {
            success: true,
            message: `Giriş kodu ${payload.email} adresine gönderildi.`,
        };
    },

    verifyLoginCode(code: string | number) {
        const pendingRaw = sessionStorage.getItem(PENDING_LOGIN_KEY);
        if (!pendingRaw)
            return { success: false, message: 'Giriş doğrulama oturumu bulunamadı.' };

        const pending  = JSON.parse(pendingRaw);
        const safeCode = sanitizeCode(String(code || ''));

        if (safeCode.length !== 6)
            return { success: false, message: 'Kod 6 haneli olmalı.' };

        sessionStorage.removeItem(PENDING_LOGIN_KEY);
        return { success: true, userId: pending.userId, rememberMe: pending.rememberMe };
    },

    async requestPasswordResetLink({ email, channel }: { email: string; phone?: string; channel: string }) {
        const method           = channel === 'sms' ? 'sms' : 'email';
        const normalizedEmail  = (email || '').trim().toLowerCase();

        if (!emailRegex.test(normalizedEmail))
            return { success: false, message: 'Geçerli e-posta gir.' };

        try {
            const data = await authFetch('/forgot-password', { email: normalizedEmail, channel: method });
            return { success: true, message: data.message };
        } catch (err: any) {
            return { success: false, message: err.message || 'Şifre sıfırlama gönderilemedi.' };
        }
    },

    // SIGNUP — Adım 2: OTP doğrula
    async verifyEmailCode(code: string | number) {
        const pendingRaw = sessionStorage.getItem(PENDING_SIGNUP_KEY);
        if (!pendingRaw)
            return { success: false, message: 'Doğrulama oturumu bulunamadı.' };

        const pending  = JSON.parse(pendingRaw);
        const safeCode = sanitizeCode(String(code || ''));

        if (safeCode.length !== 6)
            return { success: false, message: 'Kod 6 haneli olmalı.' };

        try {
            const result = await authFetch('/signup/verify', {
                email: pending.email,
                code:  safeCode,
            });

            sessionStorage.removeItem(PENDING_SIGNUP_KEY);

            const userDraft = result.user || null;
            const token     = result.token || null;

            if (userDraft) sessionStorage.setItem(VERIFIED_SIGNUP_KEY, JSON.stringify(userDraft));
            if (token)     localStorage.setItem('auth_token', token);

            const requiresPayment = pending.flow === 'paid';
            return { success: true, userDraft, requiresPayment, token };
        } catch (err: any) {
            return { success: false, message: err.message || 'Doğrulama başarısız.' };
        }
    },

    getPendingPaymentSignup() {
        const raw = sessionStorage.getItem('auth_pending_payment_signup');
        if (!raw) return null;
        try { return JSON.parse(raw); }
        catch { return null; }
    },

    finalizePaidRegistrationAfterPayment() {
        const pending = this.getPendingPaymentSignup();
        if (!pending)
            return { success: false, message: 'Bekleyen ödeme kaydı bulunamadı.' };

        sessionStorage.setItem(VERIFIED_SIGNUP_KEY, JSON.stringify(pending));
        sessionStorage.removeItem('auth_pending_payment_signup');
        return { success: true, userDraft: pending };
    },

    isFreePlan(plan: Plan) {
        return Number(plan?.price) === 0 || String(plan?.badge || '').toLowerCase() === 'free';
    },

    sanitizeVerificationCodeInput(value: string | number) {
        return sanitizeCode(String(value || ''));
    },
};
