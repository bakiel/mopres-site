// MoPres Admin Access Script
// Copy this entire code into your browser console when on any MoPres page

(function() {
  try {
    // Create admin session with necessary data
    const adminSession = {
      isAdmin: true,
      userId: '73f8df24-fc99-41b2-9f5c-1a5c74c4564e',
      email: 'admin@mopres.co.za',
      timestamp: Date.now()
    };
    
    // Store in localStorage
    localStorage.setItem('mopres_admin_session', JSON.stringify(adminSession));
    
    // Log success
    console.log('%c Admin access enabled successfully! ', 'background: #47A248; color: white; font-size: 14px; padding: 5px;');
    console.log('Session details:', adminSession);
    
    // Ask user if they want to go to admin page
    if (confirm('Admin access enabled! Go to admin dashboard now?')) {
      window.location.href = '/admin';
    }
  } catch (error) {
    console.error('Error enabling admin access:', error);
    alert('Failed to enable admin access: ' + error.message);
  }
})();