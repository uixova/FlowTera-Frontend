// Hook'un kabul edeceği minimum obje yapısı
interface StatusObject {
    status?: string;
}

export const useActionPermissions = (item: StatusObject | null | undefined) => {
    if (!item) return { canEdit: false, canDelete: false };

    // Sadece 'pending' durumundaysa izin verilir
    const isPending = item.status?.toLowerCase() === 'pending';

    return {
        canEdit: isPending,
        canDelete: isPending
    };
};