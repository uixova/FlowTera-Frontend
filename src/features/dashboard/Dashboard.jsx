import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';
import { isDemoUser } from '../../utils/demo';
import { useSubscription } from '../../context/SubscriptionContext';
import { useTeam } from '../../context/TeamContext'; 
import './Dashboard.css';
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
import Alert from '../../components/overlays/Alert';

const Dashboard = () => {
    const { t } = useTranslation('dashboard.overview');
    const { alertConfig, showAlert, closeAlert } = useModal();
    const navigate = useNavigate();

    // Context verileri
    const { hasFeature, loading: subLoading } = useSubscription();
    const { selectedTeamId } = useTeam();
    const { currentUser, currentUserId, teams: authTeams, loading: authLoading } = useAuth();
    const { hasPermission } = usePermissions();

    const [stats, setStats] = useState({ pendingCount: 0, activeTrips: 0, totalExpenses: 0, rejectedCount: 0 });
    const [myActivities, setMyActivities] = useState([]);
    const [chartData, setChartData] = useState({ trend: [], distribution: [] });
    const [loading, setLoading] = useState(true);
    const [userTeams, setUserTeams] = useState([]);

    const [isExpenseOpen, setIsExpenseOpen] = useState(false);
    const [isTripOpen, setIsTripOpen] = useState(false);
    const [isOCROpen, setIsOCROpen] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [ocrPrefill, setOcrPrefill] = useState(null);

    const isDemo = isDemoUser(currentUser?.email);

    // handleQuickAction için context'teki selectedTeamId'yi kullanıyoruz.
    const handleQuickAction = (openModalCallback, type) => {
        // Demo hesapta tüm yazma işlemleri engellenir
        if (isDemo) {
            showAlert(
                t('demo_mode', { ns: 'common.errors' }),
                t('demo_write_blocked', { ns: 'common.errors' }),
                "info"
            );
            return;
        }

        if (!selectedTeamId) {
            showAlert(
                t('no_team_selected', { ns: 'common.errors' }),
                t('team_required', { ns: 'common.errors' }),
                "warning",
                () => navigate('/team')
            );
            return;
        }

        const currentRoleInThisTeam = currentUser?.role?.find(
            r => String(r.teamId) === String(selectedTeamId)
        );

        // YETKİ KONTROLLERİ (Rol Bazlı)
        if (type === 'trip' && !hasPermission(currentRoleInThisTeam, 'trip_create')) {
            showAlert(t('permission_denied', { ns: 'common.errors' }), t('no_permission_trip', { ns: 'common.errors' }), "error");
            return;
        }

        if (type === 'report' && !hasPermission(currentRoleInThisTeam, 'create_report')) {
            showAlert(t('permission_denied', { ns: 'common.errors' }), t('no_permission_report', { ns: 'common.errors' }), "error");
            return;
        }

        // Artık metin aramıyoruz, JSON'daki teknik anahtara bakıyoruz.
        if (type === 'ocr') {
            if (!hasFeature('ocr_scan') && !hasFeature('bulk_ocr')) {
                showAlert(
                    t('plan_insufficient', { ns: 'common.errors' }),
                    t('ocr_plan_required', { ns: 'common.errors' }),
                    "info",
                    () => navigate('/subscription')
                );
                return;
            }
        }

        openModalCallback(true);
    };

    // Veri çekme fonksiyonu
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (!currentUserId) return;
                const data = await dashboardService.getDashboardStats(currentUserId, selectedTeamId || null, authTeams);
                if (data) {
                    setStats(data.stats);
                    setMyActivities(data.myActivities);
                    setChartData({
                        trend:      data.monthlyTrend,
                        distribution: data.categoryDistribution,
                        typeComp:   data.typeComparison,
                        teamSpend:  data.teamSpending,
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
    }, [currentUserId, selectedTeamId, authTeams, authLoading]);

    // Demo modda subscription yüklenmesi beklenmez — demo verisi anlık hazır
    const waitForSub = !isDemo && subLoading;
    if (loading || authLoading || waitForSub) return <Loader type="butterfly" />;

    // UI'da kilit simgesini göstermek için feature key kontrolü
    const isOCRLocked = !hasFeature('ocr_scan') && !hasFeature('bulk_ocr');

    return (
        <div className="home">
            <div className="hm-top-ct">
                <StatusOverview stats={stats} />
                <RecentActivities activities={myActivities} />
            </div>

            <div className="hm-mid-ct hm-card">
                <div className="card-header"><h2>{t('quick_access')}</h2></div>
                <hr />
                <div className="quick-access-container">
                    <div className="create-box" onClick={() => handleQuickAction(setIsExpenseOpen, 'expense')}>
                        <i className="ti ti-credit-card"></i>
                        <span>{t('new_expense')}</span>
                    </div>

                    <div className="create-box" onClick={() => handleQuickAction(setIsOCROpen, 'ocr')}>
                        <i className="ti ti-news"></i>
                        <span>{t('add_invoice')}</span>
                        {isOCRLocked && (
                            <i className="ti ti-lock lock-icon"></i>
                        )}
                    </div>

                    <div className="create-box" onClick={() => handleQuickAction(setIsReportOpen, 'report')}>
                        <i className="ti ti-file-description"></i>
                        <span>{t('create_report')}</span>
                    </div>

                    <div className="create-box" onClick={() => handleQuickAction(setIsTripOpen, 'trip')}>
                        <i className="ti ti-globe"></i>
                        <span>{t('create_trip')}</span>
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

            {/* Modallar */}
            <CreateExpense
                isOpen={isExpenseOpen}
                onClose={() => { setIsExpenseOpen(false); setOcrPrefill(null); }}
                isDashboard={true}
                selectedTeamId={selectedTeamId}
                teams={userTeams}
                prefill={ocrPrefill}
            />

            <CreateTrips 
                isOpen={isTripOpen} 
                onClose={() => setIsTripOpen(false)} 
                isDashboard={true}
                selectedTeamId={selectedTeamId}
                teams={userTeams}
            />

            <OCRSidebar
                isOpen={isOCROpen}
                onClose={() => setIsOCROpen(false)}
                selectedTeamId={selectedTeamId}
                onApply={(data) => {
                    setOcrPrefill(data);
                    setIsOCROpen(false);
                    setIsExpenseOpen(true);
                }}
            />
            
            <CreateReport 
                isOpen={isReportOpen} 
                onClose={() => setIsReportOpen(false)} 
                teams={userTeams} 
                selectedTeamId={selectedTeamId}
            />

            <Alert {...alertConfig} onClose={closeAlert} />
        </div>
    );
};

export default Dashboard;