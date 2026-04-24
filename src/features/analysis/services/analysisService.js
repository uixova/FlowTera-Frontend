import { api } from '../../../api/api';

export const analysisService = {
    getTeamAnalysis: async (teamId, viewMode = 'all', convertFn) => {
        const [expenses, trips, teams] = await Promise.all([
            api.expenses.getAll(),
            api.trips.getAll(),
            api.teams.getAll()
        ]);

        const currentTeam = teams.find(t => String(t.id) === String(teamId));
        const teamCurrency = currentTeam?.settings?.currency || 'USD';

        // FILTER
        const teamExpenses = expenses.filter(e => String(e.teamId) === String(teamId));
        const teamTrips = trips.filter(t => String(t.teamId) === String(teamId));

        let targetData =
            viewMode === 'expenses'
                ? teamExpenses
                : viewMode === 'trips'
                    ? teamTrips
                    : [...teamExpenses, ...teamTrips];

        const getValue = (item) => convertFn(item, teamCurrency);

        // SAFE DATE PARSER
        const parseDate = (str) => {
            if (!str) return null;
            const [d, m, y] = str.split('/').map(Number);
            if (!d || !m || !y) return null;
            return { day: d, month: m - 1, year: y };
        };

        const getDate = (item) => parseDate(item.date || item.startDate);

        // MONTH KEY
        const monthKey = (d) =>
            `${d.year}-${String(d.month).padStart(2, '0')}`;

        const now = new Date();
        const currentKey = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;

        const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth()).padStart(2, '0')}`;

        // MONTHLY AGGREGATION
        const monthlyMap = {};

        targetData.forEach(item => {
            const d = getDate(item);
            if (!d) return;

            const key = monthKey(d);
            const val = getValue(item);

            monthlyMap[key] = (monthlyMap[key] || 0) + val;
        });

        const currentMonthTotal = monthlyMap[currentKey] || 0;
        const lastMonthTotal = monthlyMap[prevKey] || 0;

        // TOTAL
        const totalSpending = targetData.reduce(
            (sum, item) => sum + getValue(item),
            0
        );

        // GROWTH 
        const spendingGrowth =
            lastMonthTotal > 0
                ? Number((((totalSpending - lastMonthTotal) / lastMonthTotal) * 100).toFixed(1))
                : totalSpending > 0
                    ? 100        
                    : null;

        const currentYear = now.getFullYear();
        const yearlyTotal = targetData.reduce((sum, item) => {
            const d = getDate(item);
            if (!d || d.year !== currentYear) return sum;
            return sum + getValue(item);
        }, 0);

        // CATEGORY
        const categoryData = targetData.reduce((acc, item) => {
            const name = item.category || item.destination || 'Diğer';
            const val = getValue(item);

            const found = acc.find(i => i.name === name);
            if (found) found.value += val;
            else acc.push({ name, value: val });

            return acc;
        }, []);

        // CASH FLOW
        const cashFlowMap = {};

        targetData.forEach(item => {
            const d = getDate(item);
            if (!d) return;

            const key = monthKey(d);
            const val = getValue(item);

            if (!cashFlowMap[key]) {
                cashFlowMap[key] = {
                    month: new Date(d.year, d.month)
                        .toLocaleString('tr-TR', { month: 'short' }),
                    amount: 0,
                    order: d.year * 12 + d.month
                };
            }

            cashFlowMap[key].amount += val;
        });

        const cashFlowData = Object.values(cashFlowMap)
            .sort((a, b) => a.order - b.order)
            .map(({ month, amount }) => ({ month, amount }));

        // STATUS
        const normalize = (s) => s?.toLowerCase().replace(/\s/g, '');

        const statusCount = targetData.reduce((acc, item) => {
            const s = normalize(item.statusClass || item.status);

            if (s === 'approved') acc.approved++;
            else if (s === 'pending') acc.pending++;
            else if (s === 'rejected') acc.rejected++;

            return acc;
        }, { approved: 0, pending: 0, rejected: 0 });

        const statusData = [
            { name: 'Onaylı', value: statusCount.approved },
            { name: 'Bekleyen', value: statusCount.pending },
            { name: 'Reddedilen', value: statusCount.rejected }
        ];

        return {
            summary: {
                totalSpending,
                currentMonthSpending: currentMonthTotal,
                lastMonthSpending: lastMonthTotal,
                spendingGrowth,
                yearlyTotal,

                pendingReports: teamExpenses.filter(
                    e => normalize(e.statusClass || e.status) === 'pending'
                ).length,

                activeTrips: teamTrips.filter(
                    t => normalize(t.statusClass || t.status) === 'onroad'
                ).length,

                teamCurrency
            },

            categoryData,
            cashFlowData,
            statusData
        };
    }
};