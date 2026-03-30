import React from 'react';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import '../dashboard.css/CreateReport.css';

const CreateReport = ({ isOpen, onClose }) => {
    const footer = (
        <button className="st-btn-save" style={{ width: '100%' }}>
            Generate PDF Report
        </button>
    );

    return (
        <ActionSidebar
            isOpen={isOpen}
            onClose={onClose}
            title={<h2>Create Report</h2>}
            footer={footer}
            width="480px"
        >
            <div className="report-container">
                <div className="st-input-group full-width">
                    <label>Report Name</label>
                    <input type="text" placeholder="e.g. March 2026 Marketing" />
                </div>

                <div className="report-grid-2">
                    <div className="st-input-group">
                        <label>Start Date</label>
                        <input type="date" />
                    </div>
                    <div className="st-input-group">
                        <label>End Date</label>
                        <input type="date" />
                    </div>
                </div>

                <div className="st-input-group full-width">
                    <label>Select Team / Project</label>
                    <select className="st-select">
                        <option>FlowTera Frontend Team</option>
                        <option>System Architecture</option>
                        <option>Personal Expenses</option>
                    </select>
                </div>

                <div className="report-options">
                    <label className="st-checkbox-group">
                        <input type="checkbox" defaultChecked />
                        <span>Include Receipt Images</span>
                    </label>
                    <label className="st-checkbox-group">
                        <input type="checkbox" />
                        <span>Send copy to email</span>
                    </label>
                </div>
            </div>
        </ActionSidebar>
    );
};

export default CreateReport;