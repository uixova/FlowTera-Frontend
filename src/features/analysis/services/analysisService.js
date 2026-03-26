import { api } from '../../../services/api';

export const analysisService = {
    getTeamAnalysis: async (teamId, viewMode = 'all') => {
        try {
            //  Verileri paralel olarak çekiyoruz (expenses, trips, teams)
            const [expenses, trips, teams] = await Promise.all([
                api.expenses.getAll(),
                api.trips.getAll(),
                api.teams.getAll()
            ]);

            const currentTeam = teams.find(t => String(t.id).includes(teamId));
            const currency = currentTeam?.settings?.currency || 'USD';

            // Filtreleme
            const teamExpenses = expenses.filter(e => String(e.teamId).includes(teamId));
            const teamTrips = trips.filter(t => String(t.teamId).includes(teamId));

            // ViewMode'a göre ana veri setini belirle (Kartlar ve Grafikler için)
            let targetData = [];
            if (viewMode === 'expenses') targetData = teamExpenses;
            else if (viewMode === 'trips') targetData = teamTrips;
            else targetData = [...teamExpenses, ...teamTrips];

            //  MATEMATİKSEL HESAPLAMALAR
            const now = new Date();
            const thisMonth = (now.getMonth() + 1).toString().padStart(2, '0');
            const lastMonth = now.getMonth() === 0 ? "12" : now.getMonth().toString().padStart(2, '0');

            // Toplam Harcama (Seçili moda göre)
            const totalSpendingVal = targetData.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

            // Bu Ayın Toplamı (Seçili moda göre)
            const currentMonthData = targetData.filter(item => (item.date || item.startDate)?.split('/')[1] === thisMonth);
            const currentMonthTotal = currentMonthData.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

            // Geçen Ayın Toplamı (Growth hesaplamak için)
            const lastMonthData = targetData.filter(item => (item.date || item.startDate)?.split('/')[1] === lastMonth);
            const lastMonthTotal = lastMonthData.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

            // % Büyüme Hesaplama (Formül: ((BuAy - GeçenAy) / GeçenAy) * 100)
            let growth = 0;
            if (lastMonthTotal > 0) {
                growth = ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
            } else if (currentMonthTotal > 0) {
                growth = 100; // Geçen ay veri yoksa ama bu ay varsa %100 artış sayalım
            }

            // Grafik verileri
            const categoryData = targetData.reduce((acc, item) => {
                const name = viewMode === 'trips' ? (item.destination || 'Other') : (item.category || 'General');
                const val = parseFloat(item.amount) || 0;
                const existing = acc.find(i => i.name === name);
                if (existing) existing.value += val;
                else acc.push({ name, value: val });
                return acc;
            }, []);

            // Aylık Nakit Akışı Verisi (Seçili moda göre)
            const cashFlowData = targetData.reduce((acc, item) => {
                const dateParts = (item.date || item.startDate)?.split('/');
                if (dateParts) {
                    const mName = new Date(2026, parseInt(dateParts[1]) - 1).toLocaleString('en-US', { month: 'short' });
                    const val = parseFloat(item.amount) || 0;
                    const existing = acc.find(i => i.month === mName);
                    if (existing) existing.amount += val;
                    else acc.push({ month: mName, amount: val });
                }
                return acc;
                // Sonuçları ay sırasına göre sırala
            }, []).sort((a, b) => {
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                return months.indexOf(a.month) - months.indexOf(b.month);
            });

            // Sonuçları döndür
            return {
                summary: {
                    totalSpending: totalSpendingVal.toLocaleString('en-US', { style: 'currency', currency }),
                    currentMonthSpending: currentMonthTotal.toLocaleString('en-US', { style: 'currency', currency }),
                    spendingGrowth: growth.toFixed(1),
                    pendingReports: teamExpenses.filter(e => e.status?.toLowerCase() === 'pending').length,
                    activeTrips: teamTrips.filter(t => t.status?.toLowerCase() === 'on road').length
                },
                categoryData,
                cashFlowData
            };
        } catch (error) {
            console.error("Analysis Service Error:", error);
            return null;
        }
    }
};