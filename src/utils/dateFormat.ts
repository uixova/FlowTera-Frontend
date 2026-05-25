const LOCALE = 'tr-TR';

const OPTS_DATE: Intl.DateTimeFormatOptions = {
    day: 'numeric', month: 'long', year: 'numeric',
};
const OPTS_DATETIME: Intl.DateTimeFormatOptions = {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
};
const OPTS_SHORT: Intl.DateTimeFormatOptions = {
    day: '2-digit', month: '2-digit', year: 'numeric',
};

function toDate(value: string | Date | null | undefined): Date | null {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    return isNaN(d.getTime()) ? null : d;
}

/** "25 Mayıs 2026" */
export function formatDate(value: string | Date | null | undefined): string {
    const d = toDate(value);
    return d ? d.toLocaleDateString(LOCALE, OPTS_DATE) : '—';
}

/** "25 Mayıs 2026, 22:45" */
export function formatDateTime(value: string | Date | null | undefined): string {
    const d = toDate(value);
    return d ? d.toLocaleString(LOCALE, OPTS_DATETIME) : '—';
}

/** "25.05.2026" */
export function formatDateShort(value: string | Date | null | undefined): string {
    const d = toDate(value);
    return d ? d.toLocaleDateString(LOCALE, OPTS_SHORT) : '—';
}
