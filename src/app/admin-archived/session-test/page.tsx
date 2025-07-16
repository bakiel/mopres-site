'use client';

import { useEffect, useState } from 'react';

export default function SessionTestPage() {
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
  };
  
  const clearSession = () => {
    document.cookie = 'adminSession=; path=/; max-age=0; SameSite=Lax';
    localStorage.removeItem('adminSession');
    localStorage.removeItem('adminSessionExpiry');
    alert('Session cleared!');
  };
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Session Test</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold">Current Time:</h2>
          <p>{sessionInfo.timestamp}</p>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold">Cookies:</h2>
          <p>Has Admin Session: {sessionInfo.cookies?.adminSession ? '✅ YES' : '❌ NO'}</p>
          <p>Raw: {sessionInfo.cookies?.raw || 'None'}</p>
          <div>
            <p>Parsed:</p>
            <ul>
              {sessionInfo.cookies?.parsed?.map((c: string, i: number) => (
                <li key={i}>- {c}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold">LocalStorage:</h2>
          <p>Admin Session: {sessionInfo.localStorage?.adminSession || 'None'}</p>
          <p>Expiry Valid: {sessionInfo.localStorage?.expiryValid ? '✅ YES' : '❌ NO'}</p>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold">Location:</h2>
          <p>Hostname: {sessionInfo.location?.hostname}</p>
          <p>Protocol: {sessionInfo.location?.protocol}</p>
          <p>Is Secure: {sessionInfo.location?.isSecure ? '✅ YES' : '❌ NO'}</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={setTestCookie}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Set Test Session
          </button>
          <button 
            onClick={clearSession}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Clear Session
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}