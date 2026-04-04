import React, { useState, useEffect } from 'react';
import Loader from '../../components/common/Loader';
import './dashboard.css/Dashboard.css';
import MonthlyReport from './components/Graphics';
import { dashboardService } from './services/dashboardService'; 
import { StatusOverview, RecentActivities } from './components/MyActivities'; 

// Modallar ve Sidebarlar
import CreateExpense from '../expenses/modals/CreateExpense';
import CreateTrips from '../trips/modals/CreateTrip';
import CreateReport from './modals/CreateReport';
import OCRSidebar from './modals/OCR';
import { useAuth } from '../../hooks/useAuth';

const Dashboard = () => {
    const [stats, setStats] = useState({ pendingCount: 0, activeTrips: 0, totalExpenses: 0, rejectedCount: 0 });
    const [myActivities, setMyActivities] = useState([]);
    const [chartData, setChartData] = useState({ trend: [], distribution: [] });
    const [loading, setLoading] = useState(true);
    const [userTeams, setUserTeams] = useState([]);
    const { currentUserId, loading: authLoading } = useAuth();

    // Modal Kontrolleri
    const [isExpenseOpen, setIsExpenseOpen] = useState(false);
    const [isTripOpen, setIsTripOpen] = useState(false);
    const [isOCROpen, setIsOCROpen] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (!currentUserId) return;
                const data = await dashboardService.getDashboardStats(currentUserId);
                if (data) {
                    setStats(data.stats);
                    setMyActivities(data.myActivities);
                    setChartData({ 
                        trend: data.monthlyTrend, 
                        distribution: data.categoryDistribution,
                        typeComp: data.typeComparison,
                        teamSpend: data.teamSpending
                    });
                    setUserTeams(data.userTeams);
                }
                setLoading(false);
            } catch (error) {
                console.error("Hata:", error);
                setLoading(false);
            }
        };
        if (!authLoading) fetchDashboardData();
    }, [currentUserId, authLoading]);

    if (loading || authLoading) return <Loader type="butterfly" />;

    return (
        <div className="home">
            {/* ÜST KISIM: Parçaladığımız Bileşenleri Çağırıyoruz */}
            <div className="hm-top-ct">
                <StatusOverview stats={stats} />
                <RecentActivities activities={myActivities} />
            </div>

            {/* ORTA: Quick Access */}
            <div className="hm-mid-ct hm-card">
                <div className="card-header"><h2>Hızlı Erişim</h2></div>
                <hr />
                <div className="quick-access-container">
                    <div className="create-box" onClick={() => setIsExpenseOpen(true)}>
                        <i className="ti ti-credit-card"></i>
                        <span>Yeni Gider</span>
                    </div>
                    <div className="create-box" onClick={() => setIsOCROpen(true)}>
                        <i className="ti ti-news"></i>
                        <span>Fatura Ekle</span>
                    </div>
                    <div className="create-box" onClick={() => setIsReportOpen(true)}>
                        <i className="ti ti-file-description"></i>
                        <span>Rapor Oluştur</span>
                    </div>
                    <div className="create-box" onClick={() => setIsTripOpen(true)}>
                        <i className="ti ti-globe"></i>
                        <span>Gezi Oluştur</span>
                    </div>
                </div>
            </div>

            {/* ALT: Monthly Report */}
            <div className="hm-bottom-ct monthly-grid">
                <MonthlyReport 
                    trendData={chartData.trend} 
                    distributionData={chartData.distribution}
                    typeData={chartData.typeComp || []} 
                    teamData={chartData.teamSpend || []} 
                />
            </div>

            {/* MODALLAR (Dashboard'dan açıldığı için isDashboard prop'u ekleyeceğiz) */}
            <CreateExpense 
                isOpen={isExpenseOpen} 
                onClose={() => setIsExpenseOpen(false)} 
                isDashboard={true} 
                teams={userTeams}
            />

            <CreateTrips 
                isOpen={isTripOpen} 
                onClose={() => setIsTripOpen(false)} 
                isDashboard={true}
                teams={userTeams}
            />

            <OCRSidebar isOpen={isOCROpen} onClose={() => setIsOCROpen(false)} />
            <CreateReport isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} teams={userTeams} />
        </div>
    );
};

export default Dashboard;