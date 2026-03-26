import React, { useState, useEffect } from 'react';
import Loader from '../../components/common/Loader';
import './dashboard.css/Dashboard.css';
import MonthlyReport from './components/MontlyReport';
import { dashboardService } from './services/dashboardService'; 

const Dashboard = () => {
    const [stats, setStats] = useState({ pendingCount: 0, activeTrips: 0, totalExpenses: 0, rejectedCount: 0 });
    const [myActivities, setMyActivities] = useState([]);
    const [chartData, setChartData] = useState({ trend: [], distribution: [] });
    const [loading, setLoading] = useState(true);

    // Dashboard verilerini çekmek için useEffect kullanıyoruz
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Şimdilik kullanıcı ID'sini sabit olarak veriyoruz, gerçek uygulamada auth'dan alınabilir
                const data = await dashboardService.getDashboardStats("u2");
                if (data) {
                    setStats(data.stats);
                    setMyActivities(data.myActivities);
                    setChartData({ 
                        trend: data.monthlyTrend, 
                        distribution: data.categoryDistribution,
                        typeComp: data.typeComparison,
                        teamSpend: data.teamSpending
                    }); 
                }
                setLoading(false);
            } catch (error) {
                console.error("Veri çekilirken hata oluştu:", error);
                setLoading(false);
            }
        };

        // Dashboard verilerini çekmeye başlıyoruz
        fetchDashboardData();
    }, []);

    // Yükleniyor durumunu göstermek için basit bir loader
    if (loading) return <Loader type="butterfly" />;

    return (
        <div className="home">
            <div className="hm-top-ct">
                {/* SOL: Status Overview */}
                <div className="hm-card hm-status-grid">
                    <div className="status-item">
                        <div className="status-icon pending"><i className="ti ti-clock-pause"></i></div>
                        <div className="status-info">
                            <span className="status-label">Pending</span>
                            <span className="status-value">{String(stats.pendingCount).padStart(2, '0')}</span>
                        </div>
                    </div>
                    <div className="status-item">
                        <div className="status-icon trips"><i className="ti ti-plane-tilt"></i></div>
                        <div className="status-info">
                            <span className="status-label">Active Trips</span>
                            <span className="status-value">{String(stats.activeTrips).padStart(2, '0')}</span>
                        </div>
                    </div>
                    <div className="status-item">
                        <div className="status-icon total"><i className="ti ti-receipt-2"></i></div>
                        <div className="status-info">
                            <span className="status-label">Total Exp.</span>
                            <span className="status-value">${stats.totalExpenses}</span>
                        </div>
                    </div>
                    <div className="status-item rejected">
                        <div className="status-icon reject"><i className="ti ti-circle-x"></i></div>
                        <div className="status-info">
                            <span className="status-label">Rejected</span>
                            <span className="status-value">{String(stats.rejectedCount).padStart(2, '0')}</span>
                        </div>
                    </div>
                </div>

                {/* SAĞ: My Recent Activities */}
                <div className="hm-card hm-recent-expenses">
                    <div className="card-header">
                        <h2>My Recent Activities</h2>
                    </div>
                    <hr />
                    <div className="recent-grid-header">
                        <span>Subject</span>
                        <span>Team</span> 
                        <span>Type</span>
                        <span>Category</span>
                        <span className="text-right">Info</span>
                    </div>

                    <div className="hm-recent-container custom-scroll">
                        {myActivities.length > 0 ? myActivities.map((item) => (
                            <div key={item.id} className="hm-recent-box">
                                <span className="col-subject" title={item.subject}>{item.subject}</span>
                
                                <span className="col-team-name">{item.teamName}</span>
                
                                <span className="col-type">{item.type}</span>
                
                                <span className={`badge badge-${item.category.replace(/\s+/g, '-').toLowerCase()}`}>
                                    {item.category}
                                </span>
                
                                <span className="col-amount">{item.amount}</span>
                            </div>
                        )) : <p className="no-data">Henüz bir aktiviteniz yok.</p>}
                    </div>
                </div>
            </div>

            {/* ORTA: Quick Access */}
            <div className="hm-mid-ct hm-card">
                <div className="card-header"><h2>Quick Access</h2></div>
                <hr />
                <div className="quick-access-container">
                    <div className="create-box"><i className="ti ti-credit-card"></i><span>New Expense</span></div>
                    <div className="create-box"><i className="ti ti-news"></i><span>Add Receipt</span></div>
                    <div className="create-box"><i className="ti ti-file-description"></i><span>Create Report</span></div>
                    <div className="create-box"><i className="ti ti-globe"></i><span>Create Trip</span></div>
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
        </div>
    );
};

export default Dashboard;