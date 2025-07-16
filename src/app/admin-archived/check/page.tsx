'use client';

import { useEffect, useState } from 'react';

export default function AdminCheckPage() {
  const [info, setInfo] = useState<any>({});
  
  useEffect(() => {
    // Prevent any redirects
    window.stop && window.stop();
    
    const gatherInfo = () => {
      const data = {
        timestamp: new Date().toISOString(),
        cookies: {
          raw: document.cookie,
          hasAdminSession: document.cookie.includes('adminSession=authenticated'),
          parsed: document.cookie.split(';').map(c => c.trim())
        },
        localStorage: {
          adminSession: localStorage.getItem('adminSession'),
          adminSessionExpiry: localStorage.getItem('adminSessionExpiry')
        },
        location: {
          href: window.location.href,
          hostname: window.location.hostname,
          pathname: window.location.pathname
        }
      };
      setInfo(data);
      console.log('Admin Check Page Info:', data);
    };
    
    gatherInfo();
    const interval = setInterval(gatherInfo, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Admin Session Check</h1>
      <pre>{JSON.stringify(info, null, 2)}</pre>
      <button onClick={() => window.location.href = '/admin/dashboard'}>
        Try Dashboard
      </button>
    </div>
  );
}