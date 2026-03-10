import React from 'react';

const MonthlyReport = () => {
  return (
    <div className="monthly-report-panel">
      <div className="report-header">
        <h2>Monthly Report</h2>
      </div>
      <hr />
      <div className="charts-wrapper">
        <div className="chart-container">
          <h3>Team Spending Trend</h3>
          <canvas id="teamSpendingChart"></canvas>
        </div>
        <div className="chart-divider"></div>
        <div className="chart-container">
          <h3>Day-to-Day Expenses</h3>
          <canvas id="dailyExpensesChart"></canvas>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;