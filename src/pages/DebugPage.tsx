import React from 'react';

export default function DebugPage() {
  // This page shows what environment variables the frontend can see
  const viteApiUrl = import.meta.env.VITE_API_URL;
  const viteDemoMode = import.meta.env.VITE_DEMO_MODE;
  const isDemoMode = import.meta.env.VITE_DEMO_MODE !== 'false';
  const mode = import.meta.env.MODE;

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
      <h1>Environment Variables Debug</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h2>Vite Environment:</h2>
        <div>MODE: {mode}</div>
        <div>VITE_API_URL: {viteApiUrl}</div>
        <div>VITE_DEMO_MODE (raw): {viteDemoMode === undefined ? '(undefined)' : JSON.stringify(viteDemoMode)}</div>
        <div style={{ fontWeight: 'bold', color: isDemoMode ? 'red' : 'green' }}>
          DEMO_MODE (computed): {isDemoMode ? 'TRUE (using mock data)' : 'FALSE (using real API)'}
        </div>
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#fffacd', borderRadius: '5px' }}>
        <h2>What this means:</h2>
        {isDemoMode ? (
          <>
            <div>❌ Frontend is in DEMO MODE</div>
            <div>❌ Signup/Login will use mock data</div>
            <div>❌ No real database saves</div>
            <div style={{ marginTop: '10px', color: 'red', fontWeight: 'bold' }}>
              To fix: Make sure VITE_DEMO_MODE=false in .env file
            </div>
          </>
        ) : (
          <>
            <div>✓ Frontend is in LIVE MODE</div>
            <div>✓ Signup/Login will call real API</div>
            <div>✓ Data will be saved to database</div>
            <div>✓ API URL: {viteApiUrl}</div>
          </>
        )}
      </div>
    </div>
  );
}
