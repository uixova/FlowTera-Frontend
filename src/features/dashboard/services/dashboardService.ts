import { api } from '../../../api/api';
import { Expense, Trip, Team, User } from '@/types/types';

// Dashboard'un geri döndüğü karmaşık veri yapısı için arayüz
export interface DashboardData {
    stats: {
        pendingCount: number;
        activeTrips: number;
        totalExpenses: string;
        rejectedCount: number;
    };
    monthlyTrend: Array<{ name: string; amount: number }>;
    categoryDistribution: Array<{ name: string; value: number; color: string }>;
    myActivities: Array<{ id: string; subject: string; type: string; teamName: string; category: string; amount: string; date: string }>;
    typeComparison: Array<{ name: string; value: number }>;
    teamSpending: Array<{ name: string; amount: number }>;
    userTeams: Array<{ id: string; name: string }>;
}

const extractList = <T>(response: any): T[] => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    return [];
};

export const dashboardService = {

    getDashboardStats: async (currentUserId: string | number): Promise<DashboardData | null> => {
        try {
            const normalizedCurrentUserId = String(currentUserId);

            const [expensesRes, tripsRes, teamsRes, usersRes] = await Promise.all([
                api.expenses.getAll({ pageSize: 2000 }),
                api.trips.getAll({ pageSize: 2000 }),
                api.teams.getAll({ pageSize: 500 }),
                api.users.getAll({ pageSize: 1000 })
            ]);

            const expenses = extractList<Expense>(expensesRes);
            const trips    = extractList<Trip>(tripsRes);
            const allTeams = extractList<Team>(teamsRes);
            const allUsers = extractList<User>(usersRes);

            if (!expenses || !trips || !allTeams) return null;

            // Kullanıcının kendi verilerini filtreleme
            const getOwnerId = (item: Expense | Trip) =>
                item.createdBy?.id ?? (item as any).userId ?? (item as any).submitterId ?? null;

            const userExpenses = expenses.filter(
                e => String(getOwnerId(e)) === normalizedCurrentUserId
            );
            const userTrips = trips.filter(
                t => String(getOwnerId(t)) === normalizedCurrentUserId
            );

            // Takım ismini ID'den bul
            const getTeamName = (teamId: string | number) => {
                const team = allTeams.find(t => String(t.id) === String(teamId));
                return team ? team.name : "Bilinmeyen Takım";
            };

            // Kullanıcının üye olduğu takımlar
            const currentUserData = allUsers.find(
                u => String(u.id) === normalizedCurrentUserId
            );

            const userTeams = allTeams
                .filter(team =>
                    currentUserData?.teams?.includes(String(team.id))
                )
                .map(t => ({ id: t.id, name: t.name }));

            // Özet istatistikler 
            const stats = {
                pendingCount:
                    userExpenses.filter(e => e.status === 'pending').length +
                    userTrips.filter(t => t.status?.toLowerCase() === 'pending').length,
                activeTrips: userTrips.filter(
                    t => t.status?.toLowerCase() === 'on road'
                ).length,
                totalExpenses: userExpenses
                    .reduce((sum, e) => sum + (e.amount ?? 0), 0)
                    .toFixed(2),
                rejectedCount: userExpenses.filter(e => e.status === 'rejected').length
            };

            // Harcama vs Seyahat karşılaştırması 
            const typeComparison = [
                {
                    name: 'Expenses',
                    value: parseFloat(userExpenses.reduce((sum, e) => sum + (e.amount ?? 0), 0).toFixed(2))
                },
                {
                    name: 'Trips',
                    value: parseFloat(userTrips.reduce(
                        (sum, t) => sum + (parseFloat(String(t.amount)) || 0), 0
                    ).toFixed(2))
                }
            ];

            // Takımlara göre harcama dağılımı
            const teamSpending = userExpenses.reduce((acc: any[], exp) => {
                const tName = getTeamName(exp.teamId);
                const existing = acc.find(item => item.name === tName);
                if (existing) {
                    existing.amount = parseFloat((existing.amount + (exp.amount ?? 0)).toFixed(2));
                } else {
                    acc.push({ name: tName, amount: parseFloat((exp.amount ?? 0).toFixed(2)) });
                }
                return acc;
            }, []);

            // Aylık harcama trendi
            const monthlyTrend = userExpenses.reduce((acc: any[], exp) => {
                if (!exp.date) return acc;
                const parts = exp.date.split('/');
                if (parts.length < 2) return acc;
                const month = parts[1];
                const monthName = new Date(2026, parseInt(month, 10) - 1)
                    .toLocaleString('en-US', { month: 'short' });
                const existing = acc.find(item => item.name === monthName);
                if (existing) {
                    existing.amount = parseFloat((existing.amount + (exp.amount ?? 0)).toFixed(2));
                } else {
                    acc.push({ name: monthName, amount: parseFloat((exp.amount ?? 0).toFixed(2)) });
                }
                return acc;
            }, []).sort(
                (a: any, b: any) => new Date(`${a.name} 1`).getTime() - new Date(`${b.name} 1`).getTime()
            );

            // Kategori dağılımı 
            const categoryMap: Record<string, string> = {
                'Infrastructure':   '#9d4edd',
                'Food & Beverage':  '#4361ee',
                'Office Equipment': '#e63946',
                'Logistics':        '#0ed45a',
                'Software':         '#f72585',
                'Marketing':        '#4cc9f0',
                'Food':             '#4361ee'
            };

            const categoryDistribution = userExpenses.reduce((acc: any[], exp) => {
                const existing = acc.find(item => item.name === exp.category);
                if (existing) {
                    existing.value = parseFloat((existing.value + (exp.amount ?? 0)).toFixed(2));
                } else {
                    acc.push({
                        name: exp.category,
                        value: parseFloat((exp.amount ?? 0).toFixed(2)),
                        color: categoryMap[exp.category] || '#555'
                    });
                }
                return acc;
            }, []);

            // Son 10 hibrit aktivite 
            const myActivities = [
                ...userExpenses.map(exp => ({
                    id: exp.id,
                    subject: exp.title,
                    type: "Expense",
                    teamName: getTeamName(exp.teamId),
                    category: exp.category,
                    amount: `${exp.currencySymbol ?? ''}${(exp.amount ?? 0).toFixed(2)}`,
                    date: exp.date
                })),
                ...userTrips.map(trip => ({
                    id: trip.id,
                    subject: trip.destination,
                    type: "Trip",
                    teamName: getTeamName(trip.teamId),
                    category: trip.category,
                    amount: trip.status,
                    date: trip.date
                }))
            ].sort((a, b) => {
                const toMs = (dateStr: string) => {
                    if (!dateStr) return 0;
                    const parts = dateStr.split('/');
                    if (parts.length !== 3) return 0;
                    return new Date(
                        `${parts[2]}-${parts[1]}-${parts[0]}`
                    ).getTime() || 0;
                };
                return toMs(b.date) - toMs(a.date);
            }).slice(0, 10);

            return {
                stats,
                monthlyTrend,
                categoryDistribution,
                myActivities,
                typeComparison,
                teamSpending,
                userTeams
            };
        } catch (error) {
            console.error("Dashboard Service Error:", error);
            throw error;
        }
    }
};