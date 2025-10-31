// src/components/PowerBIEmbed.jsx
import React from 'react';

const PowerBIEmbed = ({ embedUrl, title = 'Power BI Report', className = '' }) => {
  if (!embedUrl) return null;
  return (
    <div className={`w-full aspect-video rounded-lg overflow-hidden border ${className}`}>
      <iframe
        title={title}
        src={embedUrl}
        className="w-full h-full"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
};

export default PowerBIEmbed;


