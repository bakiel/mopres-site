import { supabase } from '@/lib/supabase-client';

export default async function handler(req, res) {
  // Force create admin user
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@mopres.co.za',
    password: 'secureAdminPassword123',
    email_confirm: true,
    app_metadata: {
      role: 'admin'
    },
    user_metadata: {
      role: 'admin'
    }
  });

  if (error) {
    // Try update instead
    const updateResult = await supabase.auth.admin.updateUserById(
      '73f8df24-fc99-41b2-9f5c-1a5c74c4564e',
      {
        app_metadata: { role: 'admin' },
        user_metadata: { role: 'admin' }
      }
    );
    
    return res.status(200).json({ 
      message: 'Attempted admin update', 
      result: updateResult 
    });
  }

  return res.status(200).json({ 
    message: 'Admin created', 
    user: data.user 
  });
}
