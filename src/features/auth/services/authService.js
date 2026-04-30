import { api } from '../../../api/api';

const PENDING_SIGNUP_KEY = 'auth_pending_signup';
export const VERIFIED_SIGNUP_KEY = 'auth_verified_signup';
const PENDING_PAYMENT_SIGNUP_KEY = 'auth_pending_payment_signup';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[\d+\s()-]{10,20}$/;
const nameRegex = /^[a-zA-ZcCgGiIoOsSuU\u00C7\u00E7\u011E\u011F\u0130\u0131\u00D6\u00F6\u015E\u015F\u00DC\u00FC\s'-]{2,60}$/;

const sanitizeText = (value) => value.trim().replace(/\s+/g, ' ');
const sanitizePhone = (value) => value.replace(/[^\d+]/g, '');
const sanitizeCode = (value) => value.replace(/\D/g, '').slice(0, 6);
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const calculateAge = (birthDate) => {
    const today = new Date();
    const born = new Date(birthDate);
    let age = today.getFullYear() - born.getFullYear();
    const monthDiff = today.getMonth() - born.getMonth();
    const dayDiff = today.getDate() - born.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age -= 1;
    return age;
};

export const authService = {
    async loginWithEmail(email, password) {
        const users = await api.users.getAll(true);
        if (!Array.isArray(users)) {
            throw new Error('Kullanici verisi alinamadi.');
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = users.find(
            (item) =>
                item?.email?.trim().toLowerCase() === normalizedEmail &&
                item?.password === password
        );

        if (!user) {
            return { success: false, message: 'E-posta veya sifre hatali.' };
        }

        return { success: true, user };
    },

    async getPlans() {
        const plans = await api.plans.getAll();
        if (!Array.isArray(plans)) return [];
        return [...plans].sort((a, b) => (a.order || 0) - (b.order || 0));
    },

    validateSignupForm(formData) {
        const errors = {};
        const fullName = sanitizeText(`${formData.firstName || ''} ${formData.lastName || ''}`);
        const email = (formData.email || '').trim().toLowerCase();
        const phone = sanitizePhone(formData.phone || '');

        if (!nameRegex.test(formData.firstName || '')) {
            errors.firstName = 'Ad en az 2 karakter olmali.';
        }

        if (!nameRegex.test(formData.lastName || '')) {
            errors.lastName = 'Soyad en az 2 karakter olmali.';
        }

        if (!emailRegex.test(email)) {
            errors.email = 'Gecerli bir e-posta adresi gir.';
        }

        if (!phoneRegex.test(phone)) {
            errors.phone = 'Telefon numarasi 10-20 karakter araliginda olmali.';
        }

        const birthDate = (formData.birthDate || '').trim();
        const age = calculateAge(birthDate);
        if (!dateRegex.test(birthDate) || Number.isNaN(age) || age < 18 || age > 100) {
            errors.birthDate = 'Dogum tarihi 18-100 yas araliginda olmali.';
        }

        if (!formData.address || sanitizeText(formData.address).length < 10) {
            errors.address = 'Adres en az 10 karakter olmali.';
        }

        const password = formData.password || '';
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasDigit = /\d/.test(password);
        if (password.length < 8 || !hasUpper || !hasLower || !hasDigit) {
            errors.password = 'Sifre en az 8 karakter, buyuk-kucuk harf ve rakam icermeli.';
        }

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
                birthDate
            }
        };
    },

    async validateSignupAgainstUsers(formData) {
        const users = await api.users.getAll(true);
        if (!Array.isArray(users)) {
            return { valid: false, message: 'Kullanici kaynagi okunamadi.' };
        }

        const duplicate = users.find(
            (item) =>
                item?.email?.trim().toLowerCase() === formData.email ||
                (item?.phone || '').replace(/[^\d+]/g, '') === formData.phone
        );

        if (duplicate) {
            return { valid: false, message: 'Bu e-posta veya telefon zaten kayitli.' };
        }

        return { valid: true };
    },

    async startEmailVerification(payload) {
        const verificationCode = '000000';
        const data = {
            ...payload,
            flow: payload.flow || 'free',
            verificationCode,
            requestedAt: new Date().toISOString()
        };
        sessionStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify(data));

        return {
            success: true,
            message: `Dogrulama kodu ${payload.email} adresine gonderildi (simulasyon).`,
            codeHint: verificationCode
        };
    },

    async requestPasswordResetLink({ email, phone, channel }) {
        const users = await api.users.getAll(true);
        if (!Array.isArray(users)) {
            return { success: false, message: 'Kullanici kaynagi okunamadi.' };
        }

        const normalizedEmail = (email || '').trim().toLowerCase();
        const normalizedPhone = sanitizePhone(phone || '');
        const method = channel === 'sms' ? 'sms' : 'email';

        let foundUser = null;
        if (method === 'email') {
            if (!emailRegex.test(normalizedEmail)) {
                return { success: false, message: 'Gecerli e-posta gir.' };
            }
            foundUser = users.find((item) => item?.email?.trim().toLowerCase() === normalizedEmail);
        } else {
            if (!phoneRegex.test(normalizedPhone)) {
                return { success: false, message: 'Gecerli telefon gir.' };
            }
            foundUser = users.find((item) => sanitizePhone(item?.phone || '') === normalizedPhone);
        }

        if (!foundUser) {
            return { success: false, message: 'Bu bilgiyle eslesen kullanici bulunamadi.' };
        }

        const token = `reset-${Date.now()}`;
        const fakeLink = `${window.location.origin}/reset-password?token=${token}`;
        const destination = method === 'sms' ? foundUser.phone : foundUser.email;

        return {
            success: true,
            message: `${method === 'sms' ? 'SMS' : 'E-posta'} ile sifre sifirlama baglantisi gonderildi (simulasyon).`,
            destination,
            link: fakeLink
        };
    },

    verifyEmailCode(code) {
        const pendingRaw = sessionStorage.getItem(PENDING_SIGNUP_KEY);
        if (!pendingRaw) {
            return { success: false, message: 'Dogrulama oturumu bulunamadi.' };
        }

        const pending = JSON.parse(pendingRaw);
        const safeCode = sanitizeCode(String(code || ''));
        if (safeCode.length !== 6) {
            return { success: false, message: 'Kod 6 haneli olmali.' };
        }

        if (safeCode !== pending.verificationCode) {
            return { success: false, message: 'Dogrulama kodu hatali.' };
        }

        const userDraft = {
            id: `temp-${Date.now()}`,
            name: pending.name,
            username: pending.email.split('@')[0],
            email: pending.email,
            phone: pending.phone,
            age: pending.age,
            address: pending.address,
            password: pending.password,
            joinedDate: new Date().toISOString().slice(0, 10),
            subscription: {
                planId: pending.plan.id,
                plan: pending.plan.name.toLowerCase(),
                maxTeams: pending.plan?.Promise?.teamLimit || '2 takim',
                maxMembersPerTeam: pending.plan?.Promise?.TeamMemberLimit || '5 uye',
                usage: { ocr: 0, aiAnaliz: 0 }
            }
        };

        sessionStorage.removeItem(PENDING_SIGNUP_KEY);

        if (pending.flow === 'paid') {
            localStorage.setItem(PENDING_PAYMENT_SIGNUP_KEY, JSON.stringify(userDraft));
            return { success: true, userDraft, requiresPayment: true };
        }

        localStorage.setItem(VERIFIED_SIGNUP_KEY, JSON.stringify(userDraft));
        return { success: true, userDraft, requiresPayment: false };
    },

    completePaidRegistration(payload) {
        localStorage.setItem(VERIFIED_SIGNUP_KEY, JSON.stringify(payload));
        return { success: true };
    },

    getPendingPaymentSignup() {
        const raw = localStorage.getItem(PENDING_PAYMENT_SIGNUP_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    },

    finalizePaidRegistrationAfterPayment() {
        const pending = this.getPendingPaymentSignup();
        if (!pending) return { success: false, message: 'Bekleyen odeme kaydi bulunamadi.' };

        localStorage.setItem(VERIFIED_SIGNUP_KEY, JSON.stringify(pending));
        localStorage.removeItem(PENDING_PAYMENT_SIGNUP_KEY);
        return { success: true, userDraft: pending };
    },

    isFreePlan(plan) {
        return Number(plan?.price) === 0 || String(plan?.badge || '').toLowerCase() === 'free';
    },

    sanitizeVerificationCodeInput(value) {
        return sanitizeCode(String(value || ''));
    }
};
