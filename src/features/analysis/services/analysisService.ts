import { api } from '../../../api/api';
import { Expense, Trip, Team } from '@/types/types';
import { isDemoMode } from '../../../utils/demo';
import i18n from '../../../locales/i18n';
import demoExpensesStatic from '../../../data/demo-expenses.json';
import demoTripsStatic from '../../../data/demo-trips.json';

type ConvertFn = (item: Expense | Trip, currency: string) => number;

const extractList = <T>(response: any): T[] => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    return [];
};

// Handles ISO 8601 (backend) and any other valid date string
const parseDate = (str?: string | Date | null) => {
    if (!str) return null;
    const d = new Date(str as string);
    if (isNaN(d.getTime())) return null;
    return { day: d.getDate(), month: d.getMonth(), year: d.getFullYear() }; // month: 0-indexed
};

export const analysisService = {

    getTeamAnalysis: async (teamId: string | number, viewMode: 'all' | 'expenses' | 'trips' = 'all', convertFn: ConvertFn) => {

        let expenses: Expense[];
        let trips: Trip[];
        let teamCurrency: string;

        if (isDemoMode()) {
            expenses     = demoExpensesStatic as unknown as Expense[];
            trips        = demoTripsStatic    as unknown as Trip[];
            teamCurrency = 'USD';
        } else {
            const [expensesRes, tripsRes, teamsRes] = await Promise.all([
                api.expenses.getAll({ teamId: String(teamId), pageSize: 2000 }),
                api.trips.getAll({ teamId: String(teamId), pageSize: 2000 }),
                api.teams.getAll({ pageSize: 500 }),
            ]);

            expenses = extractList<Expense>(expensesRes);
            trips    = extractList<Trip>(tripsRes);
            const teams       = extractList<Team>(teamsRes);
            const currentTeam = teams.find(t => String(t.id) === String(teamId));
            teamCurrency      = currentTeam?.settings?.currency || 'USD';
        }

        const targetData: (Expense | Trip)[] =
            viewMode === 'expenses' ? expenses :
            viewMode === 'trips'    ? trips    :
                                     [...expenses, ...trips];

        const getValue = (item: Expense | Trip) => convertFn(item, teamCurrency);

        const getDate = (item: Expense | Trip) =>
            parseDate(item.date ?? (item as Trip).startDate);

        // "YYYY-NN" month key (NN = 0-indexed month, padded)
        const monthKey = (d: { year: number; month: number }) =>
            `${d.year}-${String(d.month).padStart(2, '0')}`;

        const now        = new Date();
        const currentKey = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;
        const prevDate   = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevKey    = `${prevDate.getFullYear()}-${String(prevDate.getMonth()).padStart(2, '0')}`;

        // Monthly totals
        const monthlyMap: Record<string, number> = {};
        targetData.forEach(item => {
            const d = getDate(item);
            if (!d) return;
            const key = monthKey(d);
            const val = getValue(item);
            monthlyMap[key] = parseFloat(((monthlyMap[key] || 0) + val).toFixed(2));
        });

        const currentMonthTotal = monthlyMap[currentKey] || 0;
        const lastMonthTotal    = monthlyMap[prevKey]    || 0;

        const totalSpending = parseFloat(targetData.reduce(
            (sum, item) => sum + getValue(item), 0
        ).toFixed(2));

        const spendingGrowth =
            lastMonthTotal > 0
                ? Number((((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100).toFixed(1))
                : totalSpending > 0 ? 100 : null;

        const currentYear = now.getFullYear();
        const yearlyTotal = parseFloat(targetData.reduce((sum, item) => {
            const d = getDate(item);
            if (!d || d.year !== currentYear) return sum;
            return sum + getValue(item);
        }, 0).toFixed(2));

        // Category distribution
        const categoryData: Array<{ name: string; value: number }> = targetData.reduce((acc: any[], item) => {
            const name  = (item as Expense).category || (item as Trip).destination || 'Diğer';
            const val   = getValue(item);
            const found = acc.find(i => i.name === name);
            if (found) {
                found.value = parseFloat((found.value + val).toFixed(2));
            } else {
                acc.push({ name, value: parseFloat(val.toFixed(2)) });
            }
            return acc;
        }, []);

        // Cash flow (monthly)
        const cashFlowMap: Record<string, { month: string; amount: number; order: number }> = {};
        targetData.forEach(item => {
            const d = getDate(item);
            if (!d) return;
            const key = monthKey(d);
            const val = getValue(item);
            if (!cashFlowMap[key]) {
                cashFlowMap[key] = {
                    month:  new Date(d.year, d.month).toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { month: 'short' }),
                    amount: 0,
                    order:  d.year * 12 + d.month,
                };
            }
            cashFlowMap[key].amount = parseFloat((cashFlowMap[key].amount + val).toFixed(2));
        });

        const cashFlowData = Object.values(cashFlowMap)
            .sort((a, b) => a.order - b.order)
            .map(({ month, amount }) => ({ month, amount }));

        // Status distribution — backend returns lowercase status (no statusClass)
        const normalize = (s?: string) => s?.toLowerCase().trim();

        const statusCount = targetData.reduce(
            (acc, item) => {
                const s = normalize(item.status);
                if (s === 'approved') acc.approved++;
                else if (s === 'pending') acc.pending++;
                else if (s === 'rejected') acc.rejected++;
                return acc;
            },
            { approved: 0, pending: 0, rejected: 0 }
        );

        const statusData = [
            { name: 'approved', value: statusCount.approved },
            { name: 'pending',  value: statusCount.pending  },
            { name: 'rejected', value: statusCount.rejected },
        ];

        return {
            summary: {
                totalSpending,
                currentMonthSpending: currentMonthTotal,
                lastMonthSpending:    lastMonthTotal,
                spendingGrowth,
                yearlyTotal,
                pendingReports: expenses.filter(e => normalize(e.status) === 'pending').length,
                activeTrips:    trips.filter(t => normalize(t.status) === 'onroad').length,
                teamCurrency,
            },
            categoryData,
            cashFlowData,
            statusData,
        };
    },
};
