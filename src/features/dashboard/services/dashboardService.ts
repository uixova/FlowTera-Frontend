import { api } from '../../../api/api';
import { Expense, Trip, Team } from '@/types/types';

export interface DashboardData {
    stats: {
        pendingCount:  number;
        activeTrips:   number;
        totalExpenses: string;
        rejectedCount: number;
    };
    monthlyTrend:          Array<{ name: string; amount: number }>;
    categoryDistribution:  Array<{ name: string; value: number; color: string }>;
    myActivities:          Array<{ id: string; subject: string; type: string; teamName: string; category: string; amount: string; date: string }>;
    typeComparison:        Array<{ name: string; value: number }>;
    teamSpending:          Array<{ name: string; amount: number }>;
    userTeams:             Array<{ id: string; name: string }>;
}

const CATEGORY_COLORS: Record<string, string> = {
    'Infrastructure':   '#9d4edd',
    'Food & Beverage':  '#4361ee',
    'Office Equipment': '#e63946',
    'Logistics':        '#0ed45a',
    'Software':         '#f72585',
    'Marketing':        '#4cc9f0',
    'Food':             '#4361ee',
};

const extractList = <T>(response: any): T[] => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    return [];
};

const toMs = (dateStr: string): number => {
    if (!dateStr) return 0;
    return new Date(dateStr).getTime() || 0;
};

const EMPTY_RESULT = (userTeams: DashboardData['userTeams']): DashboardData => ({
    stats:                { pendingCount: 0, activeTrips: 0, totalExpenses: '0.00', rejectedCount: 0 },
    monthlyTrend:         [],
    categoryDistribution: [],
    myActivities:         [],
    typeComparison:       [{ name: 'Expenses', value: 0 }, { name: 'Trips', value: 0 }],
    teamSpending:         [],
    userTeams,
});

export const dashboardService = {

    getDashboardStats: async (
        currentUserId: string | number,
        selectedTeamId: string | null,
        teams: Team[]
    ): Promise<DashboardData | null> => {
        try {
            const userTeams = teams.map(t => ({ id: String(t.id), name: t.name }));

            if (!selectedTeamId) return EMPTY_RESULT(userTeams);

            const normalizedUserId = String(currentUserId);

            const [expensesRes, tripsRes] = await Promise.all([
                api.expenses.getAll({ teamId: selectedTeamId, pageSize: 200 }),
                api.trips.getAll({ teamId: selectedTeamId, pageSize: 200 }),
            ]);

            const expenses = extractList<Expense>(expensesRes);
            const trips    = extractList<Trip>(tripsRes);

            const getOwnerId = (item: any): string | null =>
                item.createdBy?.id ?? item.userId ?? item.submitterId ?? null;

            const userExpenses = expenses.filter(e => String(getOwnerId(e)) === normalizedUserId);
            const userTrips    = trips.filter(t => String(getOwnerId(t)) === normalizedUserId);

            const getTeamName = (teamId: string | number) =>
                teams.find(t => String(t.id) === String(teamId))?.name ?? 'Bilinmeyen Takım';

            const stats = {
                pendingCount:
                    userExpenses.filter(e => e.status === 'pending').length +
                    userTrips.filter(t => t.status?.toLowerCase() === 'pending').length,
                activeTrips:   userTrips.filter(t => t.status?.toLowerCase() === 'on road').length,
                totalExpenses: userExpenses.reduce((s, e) => s + (e.amount ?? 0), 0).toFixed(2),
                rejectedCount: userExpenses.filter(e => e.status === 'rejected').length,
            };

            const typeComparison = [
                { name: 'Expenses', value: parseFloat(userExpenses.reduce((s, e) => s + (e.amount ?? 0), 0).toFixed(2)) },
                { name: 'Trips',    value: parseFloat(userTrips.reduce((s, t) => s + (parseFloat(String(t.amount)) || 0), 0).toFixed(2)) },
            ];

            const teamSpending = userExpenses.reduce((acc: any[], exp) => {
                const tName = getTeamName(exp.teamId);
                const item  = acc.find(i => i.name === tName);
                if (item) item.amount = parseFloat((item.amount + (exp.amount ?? 0)).toFixed(2));
                else      acc.push({ name: tName, amount: parseFloat((exp.amount ?? 0).toFixed(2)) });
                return acc;
            }, []);

            const monthlyTrend = userExpenses.reduce((acc: any[], exp) => {
                if (!exp.date) return acc;
                const d = new Date(exp.date);
                if (isNaN(d.getTime())) return acc;
                const monthName = d.toLocaleString('en-US', { month: 'short' });
                const item = acc.find(i => i.name === monthName);
                if (item) item.amount = parseFloat((item.amount + (exp.amount ?? 0)).toFixed(2));
                else      acc.push({ name: monthName, amount: parseFloat((exp.amount ?? 0).toFixed(2)) });
                return acc;
            }, []).sort((a, b) =>
                new Date(`${a.name} 1, 2000`).getTime() - new Date(`${b.name} 1, 2000`).getTime()
            );

            const categoryDistribution = userExpenses.reduce((acc: any[], exp) => {
                const item = acc.find(i => i.name === exp.category);
                if (item) item.value = parseFloat((item.value + (exp.amount ?? 0)).toFixed(2));
                else      acc.push({
                    name:  exp.category,
                    value: parseFloat((exp.amount ?? 0).toFixed(2)),
                    color: CATEGORY_COLORS[exp.category] || '#555',
                });
                return acc;
            }, []);

            const myActivities = [
                ...userExpenses.map(exp => ({
                    id:       String(exp.id),
                    subject:  exp.title,
                    type:     'Expense',
                    teamName: getTeamName(exp.teamId),
                    category: exp.category,
                    amount:   `${exp.currencySymbol ?? ''}${(exp.amount ?? 0).toFixed(2)}`,
                    date:     exp.date,
                })),
                ...userTrips.map(trip => ({
                    id:       String(trip.id),
                    subject:  trip.destination,
                    type:     'Trip',
                    teamName: getTeamName(trip.teamId),
                    category: trip.category,
                    amount:   trip.status,
                    date:     trip.date,
                })),
            ]
            .sort((a, b) => toMs(b.date) - toMs(a.date))
            .slice(0, 10);

            return { stats, monthlyTrend, categoryDistribution, myActivities, typeComparison, teamSpending, userTeams };
        } catch (error) {
            console.error('[dashboardService] getDashboardStats error:', error);
            throw error;
        }
    },
};
