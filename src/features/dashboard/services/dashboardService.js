import { api } from '../../../api/api';

export const dashboardService = {
    getDashboardStats: async (currentUserId) => {
        try {
            const normalizedCurrentUserId = String(currentUserId);
            
            // Tüm verileri paralel çekiyoruz
            const [expenses, trips, allTeams, allUsers] = await Promise.all([
                api.expenses.getAll(),
                api.trips.getAll(),
                api.teams.getAll(),
                api.users.getAll() // Kullanıcı datasına erişmek için eklendi
            ]);

            if (!expenses || !trips || !allTeams) return null;
            

            // Kullanıcının kendi verilerini filtreleme (Owner/Submitter kontrolü)
            const getOwnerId = (item) => item?.createdBy?.id ?? item?.userId ?? item?.submitterId ?? null;
            
            const userExpenses = expenses.filter(e => String(getOwnerId(e)) === normalizedCurrentUserId);
            const userTrips = trips.filter(t => String(getOwnerId(t)) === normalizedCurrentUserId);

            // Yardımcı Fonksiyon: Takım ismini ID'den bulma
            const getTeamName = (teamId) => {
                const team = allTeams.find(t => String(t.id) === String(teamId));
                return team ? team.name : "Bilinmeyen Takım";
            };

            // Kullanıcı verisinden takımları eşleştirme (u1 datasına göre düzenlendi)
            const currentUserData = allUsers.find(u => String(u.id) === normalizedCurrentUserId);
            
            // Sadece Kullanıcının Üye Olduğu Takımlar (Filtrelenmiş)
            // Kullanıcı objesindeki "teams" dizisinde bulunan ID'lere göre allTeams'den filtreleme yapıyoruz
            const userTeams = allTeams
                .filter(team => currentUserData?.teams?.includes(String(team.id)))
                .map(t => ({ id: t.id, name: t.name }));

            // Özet İstatistikler
            const stats = {
                pendingCount: userExpenses.filter(e => e.status === 'pending').length + 
                              userTrips.filter(t => t.status.toLowerCase() === 'pending').length,
                activeTrips: userTrips.filter(t => t.status.toLowerCase() === 'on road').length,
                totalExpenses: userExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2),
                rejectedCount: userExpenses.filter(e => e.status === 'rejected').length
            };

            // Harcama vs Seyahat (Type Comparison)
            const typeComparison = [
                { name: 'Expenses', value: userExpenses.reduce((sum, e) => sum + e.amount, 0) },
                { name: 'Trips', value: userTrips.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) }
            ];

            // Takımlara Göre Harcama Dağılımı
            const teamSpending = userExpenses.reduce((acc, exp) => {
                const tName = getTeamName(exp.teamId);
                const existing = acc.find(item => item.name === tName);
                if (existing) existing.amount += exp.amount;
                else acc.push({ name: tName, amount: exp.amount });
                return acc;
            }, []);

            // Aylık Harcama Trendi
            const monthlyTrend = userExpenses.reduce((acc, exp) => {
                const month = exp.date.split('/')[1];
                const monthName = new Date(2026, parseInt(month) - 1).toLocaleString('en-US', { month: 'short' });
                const existing = acc.find(item => item.name === monthName);
                if (existing) existing.amount += exp.amount;
                else acc.push({ name: monthName, amount: exp.amount });
                return acc;
            }, []).sort((a, b) => new Date(a.name + " 1") - new Date(b.name + " 1"));

            // Kategori Dağılımı
            const categoryMap = { 'Infrastructure': '#9d4edd', 'Food & Beverage': '#4361ee', 'Office Equipment': '#e63946', 'Logistics': '#0ed45a' };
            const categoryDistribution = userExpenses.reduce((acc, exp) => {
                const existing = acc.find(item => item.name === exp.category);
                if (existing) existing.value += exp.amount;
                else acc.push({ name: exp.category, value: exp.amount, color: categoryMap[exp.category] || '#555' });
                return acc;
            }, []);

            // Hibrit Aktiviteler (Son 10)
            const myActivities = [
                ...userExpenses.map(exp => ({
                    id: exp.id, 
                    subject: exp.title, 
                    type: "Expense",
                    teamName: getTeamName(exp.teamId),
                    category: exp.category,
                    amount: `${exp.currencySymbol}${exp.amount.toFixed(2)}`, 
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
                const dateA = new Date(a.date.split('/').reverse().join('-'));
                const dateB = new Date(b.date.split('/').reverse().join('-'));
                return dateB - dateA;
            }).slice(0, 10);

            return { stats, monthlyTrend, categoryDistribution, myActivities, typeComparison, teamSpending, userTeams };
        } catch (error) {
            console.error("Dashboard Service Error:", error);
            throw error;
        }
    }
};