import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import './dashboard.css/Dashboard.css';
import MonthlyReport from './components/Graphics';
import { dashboardService } from './services/dashboardService'; 
import { StatusOverview, RecentActivities } from './components/MyActivities'; 

// Modallar
import CreateExpense from '../expenses/modals/CreateExpense';
import CreateTrips from '../trips/modals/CreateTrip';
import CreateReport from './modals/CreateReport';
import OCRSidebar from './modals/OCR';
import { useAuth } from '../../hooks/useAuth';

const Dashboard = () => {
    const navigate = useNavigate(); 
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

    // Takım Kontrol Fonksiyonu
    const handleQuickAction = (openModalCallback, type) => {
        // Eğer tip 'report' ise kontrol etmeden aç
        if (type === 'report') {
            openModalCallback(true);
            return;
        }

        const selectedTeamId = localStorage.getItem('tm_selected_id');
    
        if (!selectedTeamId) {
            alert("Lütfen önce bir takım seçin! Takım seçmeden işlem yapamazsınız.");
            navigate('/team');
            return;
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
                console.error("Hata:", error);
                setLoading(false);
            }
        };
        if (!authLoading) fetchDashboardData();
    }, [currentUserId, authLoading]);

    if (loading || authLoading) return <Loader type="butterfly" />;

    return (
        <div className="home">
            {/* ÜST KISIM (Tüm verileri gösterir, etkilenmez) */}
            <div className="hm-top-ct">
                <StatusOverview stats={stats} />
                <RecentActivities activities={myActivities} />
            </div>

            {/* ORTA: Quick Access - Kontrol eklendi */}
            <div className="hm-mid-ct hm-card">
                <div className="card-header"><h2>Hızlı Erişim</h2></div>
                <hr />
                <div className="quick-access-container">
                    {/* onClick kısımları handleQuickAction ile sarmalandı */}
                    <div className="create-box" onClick={() => handleQuickAction(setIsExpenseOpen, 'expense')}>
                        <i className="ti ti-credit-card"></i>
                        <span>Yeni Gider</span>
                    </div>
                    <div className="create-box" onClick={() => handleQuickAction(setIsOCROpen, 'ocr')}>
                        <i className="ti ti-news"></i>
                        <span>Fatura Ekle</span>
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

            {/* ALT: Monthly Report (Etkilenmez) */}
            <div className="hm-bottom-ct monthly-grid">
                <MonthlyReport 
                    trendData={chartData.trend} 
                    distributionData={chartData.distribution}
                    typeData={chartData.typeComp || []} 
                    teamData={chartData.teamSpend || []} 
                />
            </div>

            {/* MODALLAR */}
            <CreateExpense 
                isOpen={isExpenseOpen} 
                onClose={() => setIsExpenseOpen(false)} 
                isDashboard={true} 
                selectedTeamId={localStorage.getItem('tm_selected_id')} // ID'yi gönderiyoruz
                teams={userTeams}
            />

            <CreateTrips 
                isOpen={isTripOpen} 
                onClose={() => setIsTripOpen(false)} 
                isDashboard={true}
                selectedTeamId={localStorage.getItem('tm_selected_id')}
                teams={userTeams}
            />

            <OCRSidebar 
                isOpen={isOCROpen} 
                onClose={() => setIsOCROpen(false)} 
                selectedTeamId={localStorage.getItem('tm_selected_id')}
            />
            
            <CreateReport 
                isOpen={isReportOpen} 
                onClose={() => setIsReportOpen(false)} 
                teams={userTeams} 
                selectedTeamId={localStorage.getItem('tm_selected_id')}
            />
        </div>
    );
};

export default Dashboard;