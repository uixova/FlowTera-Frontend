import { api } from '../../../api/api';
import { User, Plan } from '@/types/types';

// Form validasyonu ve kayıt işlemleri için arayüzler
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

const PENDING_SIGNUP_KEY         = 'auth_pending_signup';
export const VERIFIED_SIGNUP_KEY = 'auth_verified_signup';
const PENDING_PAYMENT_SIGNUP_KEY = 'auth_pending_payment_signup';
const PENDING_LOGIN_KEY          = 'auth_pending_login';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[\d+\s()-]{10,20}$/;
const nameRegex  = /^[a-zA-ZcCgGiIoOsSuU\u00C7\u00E7\u011E\u011F\u0130\u0131\u00D6\u00F6\u015E\u015F\u00DC\u00FC\s'-]{2,60}$/;
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

const toArray = <T>(result: any): T[] =>
    Array.isArray(result) ? result : (result?.data ?? []);

export const authService = {

    async loginWithEmail(email: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> {
        const result = await api.users.getAll();
        const users  = toArray<User>(result);

        const normalizedEmail = email.trim().toLowerCase();
        const user = users.find(
            (item) =>
                item?.email?.trim().toLowerCase() === normalizedEmail &&
                item?.password === password
        );

        if (!user) {
            return { success: false, message: 'E-posta veya şifre hatalı.' };
        }

        return { success: true, user };
    },

    async getPlans(): Promise<Plan[]> {
        const result = await api.plans.getAll();
        const plans  = toArray<Plan>(result);
        return [...plans].sort((a, b) => (a.order || 0) - (b.order || 0));
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

        if (!phoneRegex.test(phone))
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

    async validateSignupAgainstUsers(formData: SignupFormData): Promise<{ valid: boolean; message?: string; fields?: any }> {
        const result = await api.users.getAll();
        const users  = toArray<User>(result);

        const duplicate = users.find(
            (item) =>
                item?.email?.trim().toLowerCase() === formData.email ||
                (item?.phone || '').replace(/[^\d+]/g, '') === formData.phone
        );

        if (duplicate) {
            return {
                valid: false,
                message: 'Bu e-posta veya telefon zaten kayıtlı.',
                fields: {
                    email: duplicate?.email?.trim().toLowerCase() === formData.email
                        ? 'Bu e-posta zaten kayıtlı.' : '',
                    phone: (duplicate?.phone || '').replace(/[^\d+]/g, '') === formData.phone
                        ? 'Bu telefon zaten kayıtlı.' : '',
                },
            };
        }

        return { valid: true };
    },

    async startEmailVerification(payload: SignupFormData) {
        const verificationCode = '000000';
        const data = {
            ...payload,
            flow: payload.flow || 'free',
            verificationCode,
            requestedAt: new Date().toISOString(),
        };
        sessionStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify(data));

        return {
            success:  true,
            message:  `Doğrulama kodu ${payload.email} adresine gönderildi (simulasyon).`,
            codeHint: verificationCode,
        };
    },

    startLoginVerification(payload: any) {
        const verificationCode = '000000';
        const data = {
            ...payload,
            verificationCode,
            requestedAt: new Date().toISOString(),
        };
        sessionStorage.setItem(PENDING_LOGIN_KEY, JSON.stringify(data));

        return {
            success:  true,
            message:  `Giriş kodu ${payload.email} adresine gönderildi (simulasyon).`,
            codeHint: verificationCode,
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

        if (safeCode !== pending.verificationCode)
            return { success: false, message: 'Doğrulama kodu hatalı.' };

        sessionStorage.removeItem(PENDING_LOGIN_KEY);
        return { success: true, userId: pending.userId, rememberMe: pending.rememberMe };
    },

    async requestPasswordResetLink({ email, phone, channel }: { email: string; phone: string; channel: string }) {
        const result = await api.users.getAll();
        const users  = toArray<User>(result);

        const normalizedEmail = (email || '').trim().toLowerCase();
        const normalizedPhone = sanitizePhone(phone || '');
        const method          = channel === 'sms' ? 'sms' : 'email';

        let foundUser: User | undefined;
        if (method === 'email') {
            if (!emailRegex.test(normalizedEmail))
                return { success: false, message: 'Geçerli e-posta gir.' };
            foundUser = users.find((item) => item?.email?.trim().toLowerCase() === normalizedEmail);
        } else {
            if (!phoneRegex.test(normalizedPhone))
                return { success: false, message: 'Geçerli telefon gir.' };
            foundUser = users.find((item) => sanitizePhone(item?.phone || '') === normalizedPhone);
        }

        if (!foundUser)
            return { success: false, message: 'Bu bilgiyle eşleşen kullanıcı bulunamadı.' };

        const token    = `reset-${Date.now()}`;
        const fakeLink = `${window.location.origin}/reset-password?token=${token}`;
        const destination = method === 'sms' ? foundUser.phone : foundUser.email;

        return {
            success:     true,
            message:     `${method === 'sms' ? 'SMS' : 'E-posta'} ile şifre sıfırlama bağlantısı gönderildi (simülasyon).`,
            destination,
            link:        fakeLink,
        };
    },

    verifyEmailCode(code: string | number) {
        const pendingRaw = sessionStorage.getItem(PENDING_SIGNUP_KEY);
        if (!pendingRaw)
            return { success: false, message: 'Doğrulama oturumu bulunamadı.' };

        const pending  = JSON.parse(pendingRaw);
        const safeCode = sanitizeCode(String(code || ''));

        if (safeCode.length !== 6)
            return { success: false, message: 'Kod 6 haneli olmalı.' };

        if (safeCode !== pending.verificationCode)
            return { success: false, message: 'Doğrulama kodu hatalı.' };

        const userDraft = {
            id:       `temp-${Date.now()}`,
            name:     pending.name,
            username: pending.email.split('@')[0],
            email:    pending.email,
            phone:    pending.phone,
            age:      pending.age,
            address:  pending.address,
            password: pending.password,
            joinedDate: new Date().toISOString().slice(0, 10),
            subscription: {
                planId:             pending.plan.id,
                plan:               pending.plan.name.toLowerCase(),
                maxTeams:           pending.plan?.Promise?.teamLimit          || '2 takım',
                maxMembersPerTeam:  pending.plan?.Promise?.TeamMemberLimit    || '5 üye',
                usage: { ocr: 0, aiAnaliz: 0 },
            },
        };

        sessionStorage.removeItem(PENDING_SIGNUP_KEY);

        if (pending.flow === 'paid') {
            sessionStorage.setItem(PENDING_PAYMENT_SIGNUP_KEY, JSON.stringify(userDraft));
            return { success: true, userDraft, requiresPayment: true };
        }

        sessionStorage.setItem(VERIFIED_SIGNUP_KEY, JSON.stringify(userDraft));
        return { success: true, userDraft, requiresPayment: false };
    },

    getPendingPaymentSignup() {
        const raw = sessionStorage.getItem(PENDING_PAYMENT_SIGNUP_KEY);
        if (!raw) return null;
        try { return JSON.parse(raw); }
        catch { return null; }
    },

    finalizePaidRegistrationAfterPayment() {
        const pending = this.getPendingPaymentSignup();
        if (!pending)
            return { success: false, message: 'Bekleyen ödeme kaydı bulunamadı.' };

        sessionStorage.setItem(VERIFIED_SIGNUP_KEY, JSON.stringify(pending));
        sessionStorage.removeItem(PENDING_PAYMENT_SIGNUP_KEY);
        return { success: true, userDraft: pending };
    },

    isFreePlan(plan: Plan) {
        return Number(plan?.price) === 0 || String(plan?.badge || '').toLowerCase() === 'free';
    },

    sanitizeVerificationCodeInput(value: string | number) {
        return sanitizeCode(String(value || ''));
    },
};