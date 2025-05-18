// MoPres Admin Emergency Console Command
// Copy and paste this one-liner into the browser console (F12) on any MoPres page

localStorage.setItem('mopres_admin_session', JSON.stringify({isAdmin:true,userId:'73f8df24-fc99-41b2-9f5c-1a5c74c4564e',email:'admin@mopres.co.za',timestamp:Date.now()})); window.location.href='/admin';