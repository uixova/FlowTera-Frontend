import React, { useState, useEffect } from 'react';
import Loader from '../../components/common/Loader';
import './dashboard.css/Dashboard.css';
import MonthlyReport from './components/MontlyReport';

const Dashboard = () => {
    // Stateleri tanımlıyoruz
    const [teamActivities, setTeamActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Veri çekme simülasyonu (Gerçek API geldiğinde fetch/axios buraya yazılacak)
        const fetchData = async () => {
            try {
                // setLoading(true); // Gerekirse tekrar true çekebilirsin
                
                await new Promise(resolve => setTimeout(resolve, 500));

                const mockData = [
                    { id: 1, subject: "AWS Infrastructure", team: "Engineering", category: "Operations", amount: "€450.00" },
                    { id: 2, subject: "Google Ads Q1", team: "Marketing", category: "Marketing", amount: "€1,200.50" },
                    { id: 3, subject: "LinkedIn Premium", team: "Sales", category: "Sales", amount: "€85.20" },
                    { id: 4, subject: "Hardware Purchase", team: "Engineering", category: "Finance", amount: "€1,200.00" },
                    { id: 5, subject: "Office Catering", team: "HR", category: "Operations", amount: "€320.00" },
                    { id: 6, subject: "Software License", team: "Engineering", category: "Operations", amount: "€150.00" },
                ];

                // Gerçek API'den gelen veri burada setTeamActivities ile state'e atanacak
                setTeamActivities(mockData);
                setLoading(false);
            } catch (error) {
                console.error("Veri çekilirken hata oluştu:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []); // Boş array: Sadece sayfa ilk açıldığında çalışır


    // Yükleniyor durumunu kontrol ediyoruz
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
                            <span className="status-value">05</span>
                        </div>
                    </div>
                    <div className="status-item">
                        <div className="status-icon trips"><i className="ti ti-plane-tilt"></i></div>
                        <div className="status-info">
                            <span className="status-label">Active Trips</span>
                            <span className="status-value">01</span>
                        </div>
                    </div>
                    <div className="status-item">
                        <div className="status-icon total"><i className="ti ti-receipt-2"></i></div>
                        <div className="status-info">
                            <span className="status-label">Total Exp.</span>
                            <span className="status-value">12</span>
                        </div>
                    </div>
                    <div className="status-item rejected">
                        <div className="status-icon reject"><i className="ti ti-circle-x"></i></div>
                        <div className="status-info">
                            <span className="status-label">Rejected</span>
                            <span className="status-value">02</span>
                        </div>
                    </div>
                </div>

                {/* SAĞ: Your Team Activities */}
                <div className="hm-card hm-recent-expenses">
                    <div className="card-header">
                        <h2>Your Team Activities</h2>
                        <i className="ti ti-arrows-sort" style={{color: '#555'}}></i>
                    </div>
                    <hr />
                    <div className="recent-grid-header">
                        <span>Subject</span>
                        <span>Team</span>
                        <span>Category</span>
                        <span className="text-right">Amount</span>
                    </div>

                    <div className="hm-recent-container custom-scroll">
                        {teamActivities.map((item) => (
                            <div key={item.id} className="hm-recent-box">
                                <span className="col-subject">{item.subject}</span>
                                <span className="col-team">{item.team}</span>
                                <span className={`badge badge-${item.category.toLowerCase()}`}>
                                    {item.category}
                                </span>
                                <span className="col-amount">{item.amount}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ORTA: Quick Access */}
            <div className="hm-mid-ct hm-card">
                <div className="card-header"><h2>Quick Access</h2></div>
                <hr />
                <div className="quick-access-container">
                    <div className="create-box">
                        <i className="ti ti-credit-card"></i>
                        <span>New Expense</span>
                    </div>
                    <div className="create-box">
                        <i className="ti ti-news"></i>
                        <span>Add Receipt</span>
                    </div>
                    <div className="create-box">
                        <i className="ti ti-file-description"></i>
                        <span>Create Report</span>
                    </div>
                    <div className="create-box">
                        <i className="ti ti-globe"></i>
                        <span>Create Trip</span>
                    </div>
                </div>
            </div>

            {/* ALT: Monthly Report */}
            <div className="hm-bottom-ct monthly-grid">
                <MonthlyReport /> 
            </div>
        </div>
    );
};

export default Dashboard;