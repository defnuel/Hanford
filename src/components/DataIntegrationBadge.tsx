import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const DataIntegrationBadge: React.FC = () => {
  const [status, setStatus] = useState<{
    configured: boolean;
    source: string;
    loading: boolean;
  }>({
    configured: false,
    source: 'Checking status...',
    loading: true
  });

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        const sheetConfigured = data.integrations?.googleSheets?.configured;
        setStatus({
          configured: sheetConfigured,
          source: sheetConfigured
            ? `Google Sheets Live (${data.integrations.googleSheets.locationsTab})`
            : 'Google Sheets Ready (Mock Fallback)',
          loading: false
        });
      } else {
        setStatus({ configured: false, source: 'Development Mock Mode', loading: false });
      }
    } catch {
      setStatus({ configured: false, source: 'Development Mock Mode', loading: false });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium tracking-wide bg-[#1C1E24]/80 backdrop-blur-md text-[#EAE5DC] border border-[#C5A880]/30 shadow-sm">
      <Database className="w-3.5 h-3.5 text-[#C5A880]" />
      <span>{status.source}</span>
      {status.loading ? (
        <RefreshCw className="w-3 h-3 animate-spin text-gray-400" />
      ) : status.configured ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <AlertCircle className="w-3.5 h-3.5 text-[#C5A880]" />
      )}
    </div>
  );
};
