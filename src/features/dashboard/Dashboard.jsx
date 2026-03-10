import React from 'react';
import './dashboard.css/Dashboard.css';
import MonthlyReport from './components/MontlyReport';

const Dashboard = () => {
  return (
    <div className="home">
      <div className="hm-top-ct">
        <div className="hm-pending-task">
          <div className="pending-task-title"><h2>Pending Tasks</h2></div>
          <hr />
          <div className="hm-tasks-container">
            <div className="hm-tasks-box">
                    <h3><i className="ti ti-clock"></i> Pending
                        Approvals</h3>
                    <span id="pendingApprovalCount">5</span>
                </div>
                <div className="hm-tasks-box">
                    <h3><i className="ti ti-plane-tilt"></i> New Trips
                        Registered</h3>
                    <span id="newTripRegCount">1</span>
                </div>
                <div className="hm-tasks-box">
                    <h3><i className="ti ti-article"></i> Unreported
                        Expenses</h3>
                    <span id="unreportedExpCount">4</span>
                </div>
                <div className="hm-tasks-box">
                    <h3><i className="ti ti-shopping-cart-share"></i>
                        Upcoming Expenses</h3>
                    <span id="upcomingExpCount">0</span>
                </div>
                <div className="hm-tasks-box">
                    <h3><i className="ti ti-coin"></i> Unreported
                        Advances</h3>
                    <span id="unreportedAdvancesCount">€0.00</span>
                </div>
          </div>
        </div>

        <div className="hm-recent-expenses">
          <div className="recent-expenses-title">
            <h2>Recent Expenses</h2>
          </div>
          <hr />
          <div className="recent-expenses-category-list">
                <span className="col-subject">Subject</span>
                <span className="col-employee">Employee</span>
                <span className="col-team">Team</span>
                <span className="col-amount">Amount</span>
            </div>

            <div className="hm-recent-container">
                <div className="hm-recent-box">
                    <span className="spending col-subject">Office
                        Supplies</span>
                    <span className="spending col-employee">John
                        Smith</span>
                    <span className="spending badge-marketing"
                        id="recenType">Marketing</span>
                    <span className="spending col-amount">€150.00</span>
                </div>
                <div className="hm-recent-box">
                    <span className="spending col-subject">Business
                        Lunch</span>
                    <span className="spending col-employee">Sarah
                        Jade</span>
                    <span className="spending badge-sales"
                        id="recenType">Sales</span>
                    <span className="spending col-amount">€75.50</span>
                </div>
                <div className="hm-recent-box">
                    <span className="spending col-subject">Travel
                        Expenses</span>
                    <span className="spending col-employee">Mike
                        Brown</span>
                    <span className="spending badge-ops"
                        id="recenType">Operations</span>
                    <span className="spending col-amount">€450.25</span>
                </div>
                <div className="hm-recent-box">
                    <span className="spending col-subject">Client
                        Dinner</span>
                    <span className="spending col-employee">Jennifer
                        Lee</span>
                    <span className="spending badge-marketing"
                        id="recenType">Marketing</span>
                    <span className="spending col-amount">€120.00</span>
                </div>
                <div className="hm-recent-box">
                    <span className="spending col-subject">Hotel</span>
                    <span className="spending col-employee">David
                        Wilson</span>
                    <span className="spending badge-finance"
                        id="recenType">Finance</span>
                    <span className="spending col-amount">€275.75</span>
                </div>
            </div>
        </div>
      </div>

      <div className="hm-mid-ct">
        <div className="hm-quick-access">
          <div className="quick-access-title"><h2>Quick Access</h2></div>
          <hr />
          <div className="quick-access-container">
             <div className="create-box">
                <span className="new-expense-i"><i className="ti ti-credit-card"></i></span>
                <a href="#">+ New expense</a>
             </div>
             <div class="create-box" id="add-recepit">
                <span class="add-recepit-i"><i class="ti ti-news"></i></span>
                <a href="#">+ Add recepit</a>
            </div>
            <div class="create-box" id="create-report">
                <span class="create-report-i"><i class="ti ti-file-description"></i></span>
                <a href="#">+ Create Report</a>
            </div>
            <div class="create-box" id="create-trip">
                <span class="create-trip-i"><i class="ti ti-globe"></i></span>
                <a href="#">+ Create trip</a>
            </div>
          </div>
        </div>
      </div>

      <div className="hm-bottom-ct">
        <MonthlyReport />
      </div>
    </div>
  );
};

export default Dashboard;