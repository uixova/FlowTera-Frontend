import { api } from '../../../api/api';

// ─── Yardımcı: Paginated veya düz array'den veriyi güvenle çıkar ───────────
const extractList = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    return [];
};

export const dashboardService = {

    getDashboardStats: async (currentUserId) => {
        try {
            const normalizedCurrentUserId = String(currentUserId);

            const [expensesRes, tripsRes, teamsRes, usersRes] = await Promise.all([
                api.expenses.getAll({ pageSize: 2000 }),
                api.trips.getAll({ pageSize: 2000 }),
                api.teams.getAll({ pageSize: 500 }),
                api.users.getAll({ pageSize: 1000 })
            ]);

            const expenses = extractList(expensesRes);
            const trips    = extractList(tripsRes);
            const allTeams = extractList(teamsRes);
            const allUsers = extractList(usersRes);

            if (!expenses || !trips || !allTeams) return null;

            // Kullanıcının kendi verilerini filtreleme
            const getOwnerId = (item) =>
                item?.createdBy?.id ?? item?.userId ?? item?.submitterId ?? null;

            const userExpenses = expenses.filter(
                e => String(getOwnerId(e)) === normalizedCurrentUserId
            );
            const userTrips = trips.filter(
                t => String(getOwnerId(t)) === normalizedCurrentUserId
            );

            // Takım ismini ID'den bul
            const getTeamName = (teamId) => {
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
                    value: userExpenses.reduce((sum, e) => sum + (e.amount ?? 0), 0)
                },
                {
                    name: 'Trips',
                    value: userTrips.reduce(
                        (sum, t) => sum + (parseFloat(t.amount) || 0), 0
                    )
                }
            ];

            // Takımlara göre harcama dağılımı
            const teamSpending = userExpenses.reduce((acc, exp) => {
                const tName = getTeamName(exp.teamId);
                const existing = acc.find(item => item.name === tName);
                if (existing) existing.amount += exp.amount ?? 0;
                else acc.push({ name: tName, amount: exp.amount ?? 0 });
                return acc;
            }, []);

            // Aylık harcama trendi
            const monthlyTrend = userExpenses.reduce((acc, exp) => {
                if (!exp.date) return acc;
                const parts = exp.date.split('/');
                if (parts.length < 2) return acc;
                const month = parts[1];
                const monthName = new Date(2026, parseInt(month, 10) - 1)
                    .toLocaleString('en-US', { month: 'short' });
                const existing = acc.find(item => item.name === monthName);
                if (existing) existing.amount += exp.amount ?? 0;
                else acc.push({ name: monthName, amount: exp.amount ?? 0 });
                return acc;
            }, []).sort(
                (a, b) => new Date(`${a.name} 1`) - new Date(`${b.name} 1`)
            );

            // Kategori dağılımı 
            const categoryMap = {
                'Infrastructure':   '#9d4edd',
                'Food & Beverage':  '#4361ee',
                'Office Equipment': '#e63946',
                'Logistics':        '#0ed45a'
            };

            const categoryDistribution = userExpenses.reduce((acc, exp) => {
                const existing = acc.find(item => item.name === exp.category);
                if (existing) existing.value += exp.amount ?? 0;
                else acc.push({
                    name: exp.category,
                    value: exp.amount ?? 0,
                    color: categoryMap[exp.category] || '#555'
                });
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
                const toMs = (dateStr) => {
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