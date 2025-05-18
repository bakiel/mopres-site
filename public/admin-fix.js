// MoPres Admin Login Fix
// Copy and paste this entire file into your browser console when you're on any page of your MoPres site

(function() {
  // Create the admin session object
  const adminSession = {
    isAdmin: true,
    userId: '73f8df24-fc99-41b2-9f5c-1a5c74c4564e',
    email: 'admin@mopres.co.za',
    timestamp: Date.now()
  };
  
  // Store it in localStorage
  localStorage.setItem('mopres_admin_session', JSON.stringify(adminSession));
  
  // Log success
  console.log('MoPres admin session created successfully!');
  console.log('Session details:', adminSession);
  
  // Ask user where to go
  if (confirm('Admin access enabled successfully! Do you want to go to the admin dashboard now?')) {
    window.location.href = '/admin';
  }
})();
