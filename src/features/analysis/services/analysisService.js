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

        // Filtreleme
        const teamExpenses = expenses.filter(e => String(e.teamId).trim() === String(teamId).trim());
        const teamTrips = trips.filter(t => String(t.teamId).trim() === String(teamId).trim());

        let targetData = [];
        if (viewMode === 'expenses') targetData = teamExpenses;
        else if (viewMode === 'trips') targetData = teamTrips;
        else targetData = [...teamExpenses, ...teamTrips];

        // Tarih Hesaplamaları
        const now = new Date();
        const thisMonth = (now.getMonth() + 1).toString().padStart(2, '0');
        const lastMonth = now.getMonth() === 0 ? "12" : now.getMonth().toString().padStart(2, '0');

        // TOPLAM HESAPLAMALARI
        const totalSpendingVal = targetData.reduce((sum, item) => sum + convertFn(item, teamCurrency), 0);

        const currentMonthTotal = targetData
            .filter(item => (item.date || item.startDate)?.split('/')[1] === thisMonth)
            .reduce((sum, item) => sum + convertFn(item, teamCurrency), 0);

        const lastMonthTotal = targetData
            .filter(item => (item.date || item.startDate)?.split('/')[1] === lastMonth)
            .reduce((sum, item) => sum + convertFn(item, teamCurrency), 0);

        let growth = lastMonthTotal > 0 ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : (currentMonthTotal > 0 ? 100 : 0);

        // GRAFİK VERİLERİ
        const categoryData = targetData.reduce((acc, item) => {
            const name = viewMode === 'trips' ? (item.destination || 'Other') : (item.category || 'General');
            const val = convertFn(item, teamCurrency);
            const existing = acc.find(i => i.name === name);
            if (existing) existing.value += val;
            else acc.push({ name, value: val });
            return acc;
        }, []);

        const cashFlowData = targetData.reduce((acc, item) => {
            const dateParts = (item.date || item.startDate)?.split('/');
            if (dateParts) {
                const mName = new Date(2026, parseInt(dateParts[1]) - 1).toLocaleString('en-US', { month: 'short' });
                const val = convertFn(item, teamCurrency);
                const existing = acc.find(i => i.month === mName);
                if (existing) existing.amount += val;
                else acc.push({ month: mName, amount: val });
            }
            return acc;
        }, []).sort((a, b) => {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return months.indexOf(a.month) - months.indexOf(b.month);
        });

        const statusData = [
            { name: 'Approved', value: targetData.filter(i => i.status?.toLowerCase() === 'approved').length },
            { name: 'Pending', value: targetData.filter(i => i.status?.toLowerCase() === 'pending').length },
            { name: 'Rejected', value: targetData.filter(i => i.status?.toLowerCase() === 'rejected').length }
        ];

        return {
            summary: {
                totalSpending: totalSpendingVal, // Ham değer, formatlama UI'da yapılacak
                currentMonthSpending: currentMonthTotal,
                spendingGrowth: growth.toFixed(1),
                pendingReports: teamExpenses.filter(e => e.status?.toLowerCase() === 'pending').length,
                activeTrips: teamTrips.filter(t => t.status?.toLowerCase() === 'on road').length,
                teamCurrency
            },
            categoryData,
            cashFlowData,
            statusData
        };
    }
};