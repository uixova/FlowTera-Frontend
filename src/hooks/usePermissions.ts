import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export type PermissionId =
    | 'view_archive'
    | 'view_analytics'
    | 'manage_requests'
    | 'member_add'
    | 'member_remove'
    | 'view_user_log'
    | 'team_settings'
    | 'trip_create'
    | 'free_exit'
    | 'create_report'
    | 'view_invoice_details'
    | string;

export interface PermissionItem {
    id: PermissionId;
    name: string;
    desc: string;
}

interface UserRoleObject {
    permissions: string[] | any;
    [key: string]: any;
}

const PERMISSION_IDS: PermissionId[] = [
    'view_archive',
    'view_analytics',
    'manage_requests',
    'member_add',
    'member_remove',
    'view_user_log',
    'team_settings',
    'trip_create',
    'free_exit',
    'create_report',
    'view_invoice_details',
];

export const usePermissions = (initialRestrictions: PermissionId[] = []) => {
    const { t } = useTranslation('teams.permissions');
    const [restrictedPerms, setRestrictedPerms] = useState<PermissionId[]>(initialRestrictions);

    const permissionsList: PermissionItem[] = PERMISSION_IDS.map(id => ({
        id,
        name: t(`${id}_name`),
        desc: t(`${id}_desc`),
    }));

    const getFilteredPermissions = (roleId: string): PermissionItem[] => {
        const restrictedForMember: PermissionId[] = [
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

    const toggleRestriction = useCallback((id: PermissionId) => {
        setRestrictedPerms(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    }, []);

    const resetRestrictions = useCallback(() => setRestrictedPerms([]), []);

    const hasPermission = (userRoleObj: UserRoleObject | null | undefined, actionId: PermissionId): boolean => {
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
