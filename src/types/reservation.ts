export interface Reservation {
  id: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  expires_at: string;
  created_at: string;
  updated_at: string;
}
