// Temel Alt Tipler
export interface CreatedBy {
    id:   string;
    name: string;
}

export interface ExchangeRates {
    USD: number;
    TRY: number;
    EUR: number;
    GBP: number;
    [key: string]: number;
}

// Harcama (Expense)
export interface Expense {
    id:              string;
    createdBy:       CreatedBy;
    teamId:          string;
    title:           string;
    category:        string;
    merchant:        string;
    date:            string;
    report:          string;
    amount:          number;
    currency:        string;
    currencySymbol:  string;
    localAmount:     number;
    localCurrency:   string;
    localSymbol:     string;
    exchangeRates:   ExchangeRates;
    paymentMethod:   string;
    status:          'approved' | 'pending' | 'rejected';
    statusClass?:    string;
    user:            string;
    desc:            string;
    icon:            string;
    image?:          string;
    receipt?:        string | null;
    isReported?:     boolean;
    rejectionReason?: string;
}

// Seyahat (Trip)
export interface Trip {
    id:             string;
    createdBy:      CreatedBy;
    teamId:         string;
    title:          string;
    category:       string;
    destination:    string;
    vehicle:        string;
    amount:         number;
    currency:       string;
    currencySymbol: string;
    localAmount:    number;
    localCurrency:  string;
    localSymbol:    string;
    exchangeRates:  ExchangeRates;
    duration:       string;
    date:           string;
    startDate:      string;
    endDate:        string;
    status:         string;
    statusClass:    string;
    icon:           string;
    report:         string;
    desc:           string;
}

// Kullanıcı (User)
export interface UserSubscriptionUsage {
    ocr:      number;
    aiAnaliz: number;
}

export interface UserSubscription {
    planId:            string;
    plan:              string;
    maxTeams:          number;
    maxMembersPerTeam: number;
    usage:             UserSubscriptionUsage;
    feature_keys?:     string[];
}

export interface UserRole {
    teamId:      string;
    roleName:    string;
    permissions: string[];
}

export interface UserNotificationSettings {
    email: boolean;
    sms:   boolean;
    push:  boolean;
}

export interface UserSettings {
    theme:         string;
    language:      string;
    notifications: UserNotificationSettings;
}

export interface User {
    id:           string;
    name:         string;
    username:     string;
    email:        string;
    avatar:       string;
    phone:        string;
    address:      string;
    age:          number;
    password?:    string;
    joinedDate:   string;
    lastLogin:    string;
    subscription: UserSubscription;
    role:         UserRole[];
    status:       'active' | 'inactive';
    isDeleted:    boolean;
    settings:     UserSettings;
    teams:        string[];
}

// Takım (Team)
export interface TeamMember {
    id:           string;
    name:         string;
    avatar:       string;
    email:        string;
    isDeleted?:   boolean;
    lastLogin?:   string;
    roleName?:    string;
    permissions?: string[];
}

export interface PlanContext {
    planId:            string;
    planName:          string;
    maxMembersAllowed: number;
    isPlanFixed:       boolean;
}

export interface TeamSettings {
    currency:           string;
    workspaceType:      string;
    privacy:            string;
    maxExpenseLimit:    number;
    memberLimit:        number;
    status:             string;
    autoApproved:       boolean;
    autoApprovedLimit:  number;
    planContext:        PlanContext;
}

export interface Team {
    id:           string;
    ownerId:      string;
    name:         string;
    category:     string;
    membersCount: number;
    members:      TeamMember[];
    isDeleted:    boolean;
    createdAt:    string;
    image:        string;
    settings:     TeamSettings;
    plan?:        string;
}

// Bildirimler (Notifications)
export interface NotificationRequest {
    id:               string;
    type:             string;
    teamId:           string;
    category:         string;
    user:             string;
    title:            string;
    detail:           string;
    date:             string;
    targetId?:        string;
    path:             string;
    status:           'pending' | 'approved' | 'rejected';
    userId?:          string;
    rejectionReason?: string;
}

export interface NotificationInfo {
    id:        string;
    type:      'info' | 'invite';
    userId:    string;
    category?: string;
    text:      string;
    date:      string;
    teamId?:   string;
    teamName?: string;
    sender?:   string;
}

export interface NotificationData {
    requests:      NotificationRequest[];
    notifications: NotificationInfo[];
}

// Loglar
export interface UserLog {
    id:        number;
    userId:    string;
    action:    string;
    timestamp: string;
}

export interface TeamLog {
    id:         string;
    teamId:     string;
    type:       string;
    role:       string;
    icon:       string;
    iconClass:  string;
    user:       string;
    badge:      string;
    action:     string;
    target:     string;
    createdAt:  string;
    amount?:    string;
    tag?:       string;
    tagClass?:  string;
    details:    Record<string, string>;
}

export interface TeamMemberLog {
    id:          string;
    userId:      string;
    teamId:      string;
    action:      string;
    date:        string;
    time:        string;
    type:        string;
    details?:    string;
    createdBy?:  CreatedBy;
}

export interface LogData {
    UserLogs?:       UserLog[];
    TeamLogs?:       TeamLog[];
    TeamMemberLogs?: TeamMemberLog[];
}

// Planlar (Plans)
export interface PlanFeature {
    text:     string;
    included: boolean;
}

export interface PlanPromise {
    teamLimit:       string;
    TeamMemberLimit: string;
}

export interface Plan {
    id:            string;
    name:          string;
    price:         number;
    currency:      string;
    features:      PlanFeature[];
    feature_keys:  string[];
    Promise:       PlanPromise;
    description:   string;
    cta:           string;
    icon:          string;
    badge:         string;
    popular:       boolean;
    order:         number;
    clickedNumber: number;
    ocrLimit?:     number;
}

// API Yanıt Yapısı (Pagination)
export interface PaginatedResponse<T> {
    data:       T[];
    total:      number;
    page:       number;
    pageSize:   number;
    totalPages: number;
    hasMore:    boolean;
}