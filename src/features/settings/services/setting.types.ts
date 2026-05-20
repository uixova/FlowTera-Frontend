import type { UserLog, UserNotificationSettings } from '../../../types/types';

// Servis Dönüş Tipleri

export interface SettingsUserResult {
    id:           string;
    name:         string;
    username:     string;
    email:        string;
    avatar:       string;
    phone:        string;
    address:      string;
    age:          number;
    joinedDate:   string;
    lastLogin:    string;
    status:       'active' | 'inactive';
    isDeleted:    boolean;
    subscription: {
        planId:            string;
        plan:              string;
        maxTeams:          number;
        maxMembersPerTeam: number;
        usage: {
            ocr:      number;
            aiAnaliz: number;
        };
        feature_keys?: string[];
    };
    role: {
        teamId:      string;
        roleName:    string;
        permissions: string[];
    }[];
    settings: {
        theme:         string;
        language:      string;
        notifications: UserNotificationSettings;
    };
    teams: string[];
}

export interface SettingsUserLog extends UserLog {
    // api.types'daki UserLog'u genişletiyoruz; gerekirse ek alanlar buraya eklenir
}

export type SettingsNotifications = UserNotificationSettings;

// Güncelleme Payload Tipleri

export interface UpdateProfilePayload {
    name?:     string;
    username?: string;
    email?:    string;
    phone?:    string;
    address?:  string;
    avatar?:   string;
}

export interface UpdatePasswordPayload {
    currentPassword: string;
    newPassword:     string;
}

// Partial kullandık — her bildirim kanalı bağımsız güncellenebilsin
export type UpdateNotificationsPayload = Partial<UserNotificationSettings>;

// Hesap Silme Kontrol Tipleri

export interface AdminConstraintResult {
    canDelete:  boolean;
    teams?:     string[];
    error?:     boolean;
}

// Servis Return Tipleri — her metod için net tip

export type GetCurrentUserResult        = SettingsUserResult | null;
export type GetUserNotificationsResult  = SettingsNotifications | null;
export type GetUserLogsResult           = SettingsUserLog[];