import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';
import './dashboard.css/Dashboard.css';
import MonthlyReport from './components/Graphics';
import { dashboardService } from './services/dashboardService';
import { StatusOverview, RecentActivities } from './components/MyActivities';

// Modallar
import CreateExpense from '../expenses/modals/CreateExpense';
import CreateTrips from '../trips/modals/CreateTrip';
import CreateReport from './modals/CreateReport';
import OCRSidebar from './modals/OCR';
import { useModal } from '../../hooks/useModal';
import { usePermissions } from '../../hooks/usePermissions';
import Alert from '../../components/modals/Alert';

const Dashboard = () => {
    const { alertConfig, showAlert, closeAlert } = useModal();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ pendingCount: 0, activeTrips: 0, totalExpenses: 0, rejectedCount: 0 });
    const [myActivities, setMyActivities] = useState([]);
    const [chartData, setChartData] = useState({ trend: [], distribution: [] });
    const [loading, setLoading] = useState(true);
    const [userTeams, setUserTeams] = useState([]);
    const { currentUser, currentUserId, loading: authLoading } = useAuth();
    const { hasPermission } = usePermissions();

    const [isExpenseOpen, setIsExpenseOpen] = useState(false);
    const [isTripOpen, setIsTripOpen] = useState(false);
    const [isOCROpen, setIsOCROpen] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);

    // handleQuickAction içinde her seferinde güncel ID'yi çekeceğiz.
    const handleQuickAction = (openModalCallback, type) => {
        // Butona tıklandığı an seçili takımı al
        const currentSelectedTeamId = localStorage.getItem('tm_selected_id');
        const userPlan = currentUser?.subscription?.plan;

        if (!currentSelectedTeamId) {
            showAlert(
                "Takım Seçilmedi", 
                "İşlem yapabilmek için aktif bir takım seçmiş olmanız gerekiyor.", 
                "warning",
                () => navigate('/team')
            );
            return;
        }

        // Tıklanan andaki takıma göre kullanıcının rolünü bul
        const currentRoleInThisTeam = currentUser?.role?.find(
            r => String(r.teamId) === String(currentSelectedTeamId)
        );

        // YETKİ KONTROLLERİ (En güncel role objesine göre)
        if (type === 'trip' && !hasPermission(currentRoleInThisTeam, 'trip_create')) {
            showAlert("Yetki Kısıtlı", "Bu takımda yeni gezi oluşturma yetkiniz bulunmuyor.", "error");
            return;
        }

        if (type === 'report' && !hasPermission(currentRoleInThisTeam, 'create_report')) {
            showAlert("Yetki Kısıtlı", "Bu takımda rapor oluşturma yetkiniz bulunmuyor.", "error");
            return;
        }

        if (type === 'ocr') {
            const allowedPlans = ['professional', 'enterprise'];
            if (!allowedPlans.includes(userPlan)) {
                showAlert(
                    "Planınız Yetersiz", 
                    "Akıllı OCR Fatura Tarama özelliği üst paketlerimize özeldir.", 
                    "info",
                    () => navigate('/subscription')
                );
                return;
            }
        }

        openModalCallback(true);
    };

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
                console.error("Dashboard error:", error);
                setLoading(false);
            }
        };
        if (!authLoading) fetchDashboardData();
    }, [currentUserId, authLoading]);

    if (loading || authLoading) return <Loader type="butterfly" />;

    // Render anında ID'yi okuyalım ki modallara en güncel hali gitsin
    const latestTeamId = localStorage.getItem('tm_selected_id');

    return (
        <div className="home">
            <div className="hm-top-ct">
                <StatusOverview stats={stats} />
                <RecentActivities activities={myActivities} />
            </div>

            <div className="hm-mid-ct hm-card">
                <div className="card-header"><h2>Hızlı Erişim</h2></div>
                <hr />
                <div className="quick-access-container">
                    <div className="create-box" onClick={() => handleQuickAction(setIsExpenseOpen, 'expense')}>
                        <i className="ti ti-credit-card"></i>
                        <span>Yeni Gider</span>
                    </div>

                    <div className="create-box" onClick={() => handleQuickAction(setIsOCROpen, 'ocr')}>
                        <i className="ti ti-news"></i>
                        <span>Fatura Ekle</span>
                        {!(['professional', 'enterprise'].includes(currentUser?.subscription?.plan)) && 
                            <i className="ti ti-lock lock-badge"></i>
                        }
                    </div>

                    <div className="create-box" onClick={() => handleQuickAction(setIsReportOpen, 'report')}>
                        <i className="ti ti-file-description"></i>
                        <span>Rapor Oluştur</span>
                    </div>

                    <div className="create-box" onClick={() => handleQuickAction(setIsTripOpen, 'trip')}>
                        <i className="ti ti-globe"></i>
                        <span>Gezi Oluştur</span>
                    </div>
                </div>
            </div>

            <div className="hm-bottom-ct monthly-grid">
                <MonthlyReport 
                    trendData={chartData.trend} 
                    distributionData={chartData.distribution}
                    typeData={chartData.typeComp || []} 
                    teamData={chartData.teamSpend || []} 
                />
            </div>

            <CreateExpense 
                isOpen={isExpenseOpen} 
                onClose={() => setIsExpenseOpen(false)} 
                isDashboard={true} 
                selectedTeamId={latestTeamId} 
                teams={userTeams}
            />

            <CreateTrips 
                isOpen={isTripOpen} 
                onClose={() => setIsTripOpen(false)} 
                isDashboard={true}
                selectedTeamId={latestTeamId}
                teams={userTeams}
            />

            <OCRSidebar 
                isOpen={isOCROpen} 
                onClose={() => setIsOCROpen(false)} 
                selectedTeamId={latestTeamId}
            />
            
            <CreateReport 
                isOpen={isReportOpen} 
                onClose={() => setIsReportOpen(false)} 
                teams={userTeams} 
                selectedTeamId={latestTeamId}
            />

            <Alert {...alertConfig} onClose={closeAlert} />
        </div>
    );
};

export default Dashboard;