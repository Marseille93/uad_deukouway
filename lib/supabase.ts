import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client pour le frontend (avec clé anonyme)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client pour le backend (avec clé service_role)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Types pour TypeScript
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'student' | 'landlord';
  bio?: string;
  avatar_url?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  type: 'room' | 'apartment' | 'house';
  mode: 'colocation' | 'classic';
  price: number;
  price_type: 'total' | 'per_person';
  location: string;
  available_spots?: number;
  total_spots?: number;
  contact_phone: string;
  images: string[];
  amenities: string[];
  surface?: string;
  furnished: boolean;
  deposit: number;
  charges_included: boolean;
  availability: string;
  user_id: string;
  status: 'active' | 'inactive' | 'rented';
  views: number;
  created_at: string;
  updated_at: string;
}

export interface ListingResponse {
  id: string;
  listing_id: string;
  user_id: string;
  message: string;
  contact_info: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}