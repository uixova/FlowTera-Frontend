import React from 'react';
import './Features.css';
import { featuresData } from '@/data/featuresData';

const Features = () => {
  const features = featuresData;

  return (
    <div className="features-bento">
      {features.map((item, idx) => (
        <div
          key={idx}
          className={`bento-card ${item.size}`}
          style={{ '--accent': item.accentColor }}
        >
          <div className="bento-glow"></div>

          <div className="bento-top">
            <div className="bento-icon-wrap">
              <i className={`ti ${item.icon}`} style={{ fontSize: item.iconSize, color: item.accentColor }}></i>
            </div>
            {item.badge && <span className="bento-badge">{item.badge}</span>}
          </div>

          <div className="bento-body">
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>

          <div className="bento-footer">
            {item.metric && (
              <div className="bento-metric">
                <span className="bento-metric-val" style={{ color: item.accentColor }}>{item.metric.val}</span>
                <span className="bento-metric-label">{item.metric.label}</span>
              </div>
            )}
            <div className="bento-tags">
              {item.tags.map((tag, t) => (
                <span key={t} className="bento-tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Features;