export const useActionPermissions = (item) => {
    if (!item) return { canEdit: false, canDelete: false };

    // Sadece 'Pending' durumundaysa izin verilir
    const isPending = item.status?.toLowerCase() === 'pending';

    return {
        canEdit: isPending,
        canDelete: isPending
    };
};