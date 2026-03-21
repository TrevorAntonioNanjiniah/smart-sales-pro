// models/User.js
import supabase from '../config/database.js';

const User = {
  async findByClerkId(clerkId) {
    const { data, error } = await supabase
      .from('users').select('*').eq('clerk_id', clerkId).single();
    if (error) return null;
    return data;
  },

  async create(userData) {
    const { data, error } = await supabase
      .from('users').insert([{
        clerk_id:  userData.clerkId,
        email:     userData.email,
        name:      userData.name,
        image_url: userData.imageUrl,
        phone:     userData.phone || '',
        role:      userData.role || 'seller',
      }]).select().single();
    if (error) throw error;
    return data;
  },

  async update(clerkId, updates) {
    const { data, error } = await supabase
      .from('users').update(updates)
      .eq('clerk_id', clerkId).select().single();
    if (error) throw error;
    return data;
  },

  async delete(clerkId) {
    const { error } = await supabase
      .from('users').delete()
      .eq('clerk_id', clerkId);
    if (error) throw error;
    return true;
  },
};

export default User;