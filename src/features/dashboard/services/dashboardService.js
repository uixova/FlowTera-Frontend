import { api } from '../../../api/api';

export const dashboardService = {
    getDashboardStats: async (currentUserId) => {
        try {
            const normalizedCurrentUserId = String(currentUserId);
            // Sadece ihtiyacımız olanları çekiyoruz
            const [expenses, trips, teams] = await Promise.all([
                api.expenses.getAll(),
                api.trips.getAll(),
                api.teams.getAll() // Takım isimlerini eşleştirmek için ekledik
            ]);

            if (!expenses || !trips || !teams) return null;

            // Önce kullanıcının kendi verilerini ayıralım (JSON'da createdBy var)
            const getExpenseOwnerId = (e) => e?.createdBy?.id ?? e?.userId ?? e?.submitterId ?? null;
            const getTripOwnerId = (t) => t?.createdBy?.id ?? t?.userId ?? t?.submitterId ?? null;

            const userExpenses = expenses.filter(e => String(getExpenseOwnerId(e)) === normalizedCurrentUserId);
            const userTrips = trips.filter(t => String(getTripOwnerId(t)) === normalizedCurrentUserId);

            // Takım ismini bulmak için yardımcı fonksiyon
            const getTeamName = (teamId) => {
                const team = teams.find(t => t.id === teamId);
                return team ? team.name : "Unknown Team";
            };

            // Kullanıcının harcamalarını ve seyahatlerini ayrı ayrı hesaplayarak grafik verisi oluşturuyoruz
            const typeComparison = [
                { name: 'Expenses', value: userExpenses.reduce((sum, e) => sum + e.amount, 0) },
                { name: 'Trips', value: userTrips.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) }
            ];
            
            // Özet İstatistikler (userExpenses ve userTrips üzerinden)
            const stats = {
                pendingCount: userExpenses.filter(e => e.status === 'pending').length + 
                              userTrips.filter(t => t.status.toLowerCase() === 'pending').length,
                activeTrips: userTrips.filter(t => t.status.toLowerCase() === 'on road').length,
                totalExpenses: userExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2),
                rejectedCount: userExpenses.filter(e => e.status === 'rejected').length
            };

            const userTeams = Array.from(new Set([
                ...userExpenses.map(exp => getTeamName(exp.teamId)),
                ...userTrips.map(trip => getTeamName(trip.teamId))
            ])).map(name => ({ id: name, name: name }));


            // Grafik: Harcama ve Seyahat Karşılaştırması (Kullanıcıya özel)
            const teamSpending = userExpenses.reduce((acc, exp) => {
                const tName = getTeamName(exp.teamId);
                const existing = acc.find(item => item.name === tName);
                if (existing) existing.amount += exp.amount;
                else acc.push({ name: tName, amount: exp.amount });
                return acc;
            }, []);

            // Grafik: Aylık Harcama Trendi (Kullanıcıya özel olması için userExpenses kullandık)
            const monthlyTrend = userExpenses.reduce((acc, exp) => {
                const month = exp.date.split('/')[1];
                const monthName = new Date(2026, parseInt(month) - 1).toLocaleString('en-US', { month: 'short' });
                const existing = acc.find(item => item.name === monthName);
                if (existing) existing.amount += exp.amount;
                else acc.push({ name: monthName, amount: exp.amount });
                return acc;
            }, []).sort((a, b) => new Date(a.name + " 1") - new Date(b.name + " 1"));

            // Grafik: Kategori Dağılımı (Kullanıcıya özel)
            const categoryMap = { 'Infrastructure': '#9d4edd', 'Food & Beverage': '#4361ee', 'Office Equipment': '#e63946', 'Logistics': '#0ed45a' };
            const categoryDistribution = userExpenses.reduce((acc, exp) => {
                const existing = acc.find(item => item.name === exp.category);
                if (existing) existing.value += exp.amount;
                else acc.push({ name: exp.category, value: exp.amount, color: categoryMap[exp.category] || '#555' });
                return acc;
            }, []);

            // Hibrit Aktiviteler
            const myActivities = [
                ...userExpenses.map(exp => ({
                    id: exp.id, 
                    subject: exp.title, 
                    type: "Expense", // UI'da team yerine tip olarak gösterilebilir
                    teamName: getTeamName(exp.teamId), // Takım ismini buradan çekiyoruz
                    category: exp.category,
                    amount: `${exp.currencySymbol}${exp.amount.toFixed(2)}`, 
                    date: exp.date 
                })),
                ...userTrips.map(trip => ({
                    id: trip.id, 
                    subject: trip.destination, 
                    type: "Trip", 
                    teamName: getTeamName(trip.teamId), // Takım ismini buradan çekiyoruz
                    category: trip.category,
                    amount: trip.status, 
                    date: trip.date
                }))
            ].sort((a, b) => {
                // Harcama ve seyahat aktivitelerini tarihe göre sıralayıp en son 10 tanesini alıyoruz
                const dateA = new Date(a.date.split('/').reverse().join('-'));
                const dateB = new Date(b.date.split('/').reverse().join('-'));
                return dateB - dateA;
            }).slice(0, 10); // En son 10 aktivite

            return { stats, monthlyTrend, categoryDistribution, myActivities, typeComparison, teamSpending, userTeams };
        } catch (error) {
            console.error("Dashboard Service Error:", error);
            throw error;
        }
    }
};