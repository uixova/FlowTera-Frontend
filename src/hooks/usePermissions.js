import { useState, useCallback } from 'react';

export const usePermissions = (initialRestrictions = []) => {
    const [restrictedPerms, setRestrictedPerms] = useState(initialRestrictions);

    const permissionsList = [
        { id: 'view_archive', name: 'Arşiv Erişimi', desc: 'Takım geçmişindeki tüm fatura ve kayıtlara erişim sağlar.' },
        { id: 'view_analytics', name: 'Analiz Sayfası', desc: 'Takım harcamalarını ve verileri grafiklerle inceleme yetkisi.' },
        { id: 'manage_requests', name: 'Talepleri Yönet', desc: 'Gelen katılım veya işlem taleplerini onaylama/reddetme yetkisi.' },
        { id: 'member_add', name: 'Üye Ekleme', desc: 'Takıma yeni çalışma arkadaşları davet etme yetkisi.' },
        { id: 'member_remove', name: 'Üye Sileme', desc: 'Mevcut üyeleri takımdan uzaklaştırma yetkisi.' },
        { id: 'view_user_log', name: 'Log Görme', desc: 'Üyelerin loglarını görüntüleme yetkisi'},
        { id: 'team_settings', name: 'Takım Ayarları', desc: 'Takım profilini, limitlerini ve temel bilgilerini düzenleme yetkisi.' },
        { id: 'trip_create', name: 'Gezi Oluşturma', desc: 'Yeni takım gezileri ve etkinlik rotaları başlatma yetkisi.' },
        { id: 'free_exit', name: 'Serbest Çıkış', desc: 'Onay beklemeksizin takımdan kendi isteğiyle ayrılabilme yetkisi.' },
        { id: 'create_report', name: 'Rapor Oluşturma', desc: 'Takım verilerini PDF veya Excel formatında raporlama yetkisi.' },
        { id: 'view_invoice_details', name: 'Fatura Detayları', desc: 'Faturaların içeriklerini ve dijital kopyalarını görüntüleme yetkisi.' }
    ];
    
    const getFilteredPermissions = (roleId) => {
        const restrictedForMember = [
            'view_archive', 
            'view_analytics', 
            'member_remove', 
            'manage_requests', 
            'team_settings', 
            'free_exit',
            'view_user_log'
        ];

        if (roleId === 'member') {
            return permissionsList.filter(perm => !restrictedForMember.includes(perm.id));
        }
        return permissionsList;
    };

    const toggleRestriction = useCallback((id) => {
        setRestrictedPerms(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    }, []);

    const resetRestrictions = useCallback(() => setRestrictedPerms([]), []);

    const hasPermission = (userRoleObj, actionId) => {
        if (!userRoleObj) return false;
        const isDenied = Array.isArray(userRoleObj.permissions) 
            ? userRoleObj.permissions.includes(actionId) 
            : false;
        return !isDenied;
    };

    return {
        permissionsList, 
        getFilteredPermissions, 
        restrictedPerms,
        setRestrictedPerms,
        toggleRestriction,
        resetRestrictions,
        hasPermission
    };
};