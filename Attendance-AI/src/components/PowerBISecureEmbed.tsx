// src/components/PowerBISecureEmbed.tsx
import React, { useEffect, useState } from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';

type EmbedInfo = {
  embedUrl: string;
  embedToken: string | null;
  reportId: string;
  type?: string;
  message?: string;
};

const PowerBISecureEmbed: React.FC = () => {
  const [info, setInfo] = useState<EmbedInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmbed = async () => {
      try {
        const res = await fetch('http://localhost:8000/powerbi/student-embed');
        if (!res.ok) throw new Error('Failed to get embed info');
        const data = await res.json();
        setInfo({ embedUrl: data.embedUrl, embedToken: data.embedToken, reportId: data.reportId, type: data.type, message: data.message });
      } catch (e: any) {
        setError(e.message || 'Error fetching embed info');
      }
    };
    fetchEmbed();
  }, []);

  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!info) return <div className="p-4">Loading Power BI…</div>;

  // If no token, use simple iframe (basic URL mode)
  if (!info.embedToken) {
    return (
      <div className="w-full">
        {info.message && (
          <div className="mb-2 p-2 bg-yellow-50 text-yellow-800 text-sm rounded">
            {info.message}
          </div>
        )}
        <iframe
          src={info.embedUrl}
          className="w-full h-[70vh] rounded-lg border"
          title="Power BI Report"
          allowFullScreen
        />
      </div>
    );
  }

  // Use secure embed with token
  return (
    <PowerBIEmbed
      embedConfig={{
        type: 'report',
        id: info.reportId,
        embedUrl: info.embedUrl,
        accessToken: info.embedToken,
        tokenType: models.TokenType.Embed,
        settings: {
          panes: { filters: { expanded: false, visible: false } },
          navContentPaneEnabled: false,
        },
      }}
      cssClass="w-full h-[70vh] rounded-lg border"
    />
  );
};

export default PowerBISecureEmbed;


