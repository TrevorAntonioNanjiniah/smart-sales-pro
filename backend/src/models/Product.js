// src/models/Product.js
import supabase from '../config/database.js';

const Product = {
  async findBySellerId(sellerId) {
    const { data, error } = await supabase
      .from('products').select('*').eq('seller_id', sellerId);
    if (error) throw error;
    return data;
  },
  async findById(id) {
    const { data, error } = await supabase
      .from('products').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  },
  async create(productData) {
    const { data, error } = await supabase
      .from('products').insert([{
        seller_id: productData.sellerId,
        name: productData.name,
        price: productData.price,
        stock: productData.stock || 0,
        description: productData.description,
        images: productData.images || [],
        whatsapp_link: productData.whatsappLink,
        qr_code: productData.qrCode,
        is_active: productData.isActive ?? true,
      }]).select().single();
    if (error) throw error;
    return data;
  },
  async update(id, updates) {
    const { data, error } = await supabase
      .from('products').update({ ...updates, updated_at: new Date() })
      .eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async delete(id) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
};

export default Product;