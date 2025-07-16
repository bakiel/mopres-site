'use client';

import { useEffect, useState } from 'react';

export default function TestSessionPage() {
  const [sessionInfo, setSessionInfo] = useState<any>({});
  
  useEffect(() => {
    const checkSession = () => {
      const info = {
        timestamp: new Date().toISOString(),
        cookies: {
          raw: document.cookie,
          parsed: document.cookie.split(';').map(c => c.trim()),
          adminSession: document.cookie.includes('adminSession=authenticated')
        },
        localStorage: {
          adminSession: localStorage.getItem('adminSession'),
          adminSessionExpiry: localStorage.getItem('adminSessionExpiry'),
          expiryValid: localStorage.getItem('adminSessionExpiry') ? 
            parseInt(localStorage.getItem('adminSessionExpiry')!) > Date.now() : false
        },
        location: {
          href: window.location.href,
          hostname: window.location.hostname,
          protocol: window.location.protocol,
          isSecure: window.location.protocol === 'https:'
        }
      };
      setSessionInfo(info);
      console.log('Session Test Info:', info);
    };
    
    // Check immediately
    checkSession();
    
    // Check every second
    const interval = setInterval(checkSession, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const setTestCookie = () => {
    const isProduction = window.location.hostname !== 'localhost';
    const cookieString = `adminSession=authenticated; path=/; max-age=86400; SameSite=Lax${isProduction ? '; Secure' : ''}`;
    document.cookie = cookieString;
    localStorage.setItem('adminSession', 'authenticated');
    localStorage.setItem('adminSessionExpiry', String(Date.now() + 86400000));
    alert('Session set! Check the display.');
    window.location.reload();
  };
  
  const clearSession = () => {
    document.cookie = 'adminSession=; path=/; max-age=0; SameSite=Lax';
    localStorage.removeItem('adminSession');
    localStorage.removeItem('adminSessionExpiry');
    alert('Session cleared!');
    window.location.reload();
  };
  
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Session Test Page</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ background: '#f0f0f0', padding: '1rem', marginBottom: '1rem', borderRadius: '0.5rem' }}>
          <h2 style={{ fontWeight: 'bold' }}>Current Time:</h2>
          <p>{sessionInfo.timestamp}</p>
        </div>
        
        <div style={{ background: sessionInfo.cookies?.adminSession ? '#d4edda' : '#f8d7da', padding: '1rem', marginBottom: '1rem', borderRadius: '0.5rem' }}>
          <h2 style={{ fontWeight: 'bold' }}>Admin Session Status:</h2>
          <p style={{ fontSize: '1.5rem' }}>{sessionInfo.cookies?.adminSession ? '✅ ACTIVE' : '❌ NOT ACTIVE'}</p>
        </div>
        
        <div style={{ background: '#f0f0f0', padding: '1rem', marginBottom: '1rem', borderRadius: '0.5rem' }}>
          <h2 style={{ fontWeight: 'bold' }}>Cookies:</h2>
          <p><strong>Raw:</strong> {sessionInfo.cookies?.raw || 'None'}</p>
          <div>
            <p><strong>Parsed:</strong></p>
            <ul>
              {sessionInfo.cookies?.parsed?.map((c: string, i: number) => (
                <li key={i}>- {c}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div style={{ background: '#f0f0f0', padding: '1rem', marginBottom: '1rem', borderRadius: '0.5rem' }}>
          <h2 style={{ fontWeight: 'bold' }}>LocalStorage:</h2>
          <p><strong>Admin Session:</strong> {sessionInfo.localStorage?.adminSession || 'None'}</p>
          <p><strong>Expiry Valid:</strong> {sessionInfo.localStorage?.expiryValid ? '✅ YES' : '❌ NO'}</p>
        </div>
        
        <div style={{ background: '#f0f0f0', padding: '1rem', marginBottom: '1rem', borderRadius: '0.5rem' }}>
          <h2 style={{ fontWeight: 'bold' }}>Location:</h2>
          <p><strong>Hostname:</strong> {sessionInfo.location?.hostname}</p>
          <p><strong>Protocol:</strong> {sessionInfo.location?.protocol}</p>
          <p><strong>Is Secure:</strong> {sessionInfo.location?.isSecure ? '✅ YES' : '❌ NO'}</p>
          <p><strong>Full URL:</strong> {sessionInfo.location?.href}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={setTestCookie}
            style={{ background: '#28a745', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
          >
            Set Admin Session
          </button>
          <button 
            onClick={clearSession}
            style={{ background: '#dc3545', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
          >
            Clear Session
          </button>
          <button 
            onClick={() => window.location.href = '/admin'}
            style={{ background: '#007bff', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
          >
            Go to Admin
          </button>
        </div>
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#fff3cd', borderRadius: '0.5rem' }}>
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Click "Set Admin Session" to create the session</li>
          <li>Watch the status - it should show "✅ ACTIVE"</li>
          <li>Click "Go to Admin" to test if you stay logged in</li>
          <li>If you get kicked out, come back here to see if the session is still active</li>
        </ol>
      </div>
    </div>
  );
}