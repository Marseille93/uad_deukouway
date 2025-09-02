/*
  # Schéma initial pour UAD Deukouway

  1. Nouvelles tables
    - `users` - Profils utilisateurs
    - `listings` - Annonces de logements
    - `listing_responses` - Réponses aux annonces
    
  2. Sécurité
    - Activation RLS sur toutes les tables
    - Politiques pour l'accès aux données
    
  3. Types et contraintes
    - Types enum pour les rôles et statuts
    - Contraintes de validation
    - Index pour les performances
*/

-- Types enum
CREATE TYPE user_role AS ENUM ('student', 'landlord');
CREATE TYPE listing_type AS ENUM ('room', 'apartment', 'house');
CREATE TYPE listing_mode AS ENUM ('colocation', 'classic');
CREATE TYPE listing_status AS ENUM ('active', 'inactive', 'rented');
CREATE TYPE response_status AS ENUM ('pending', 'accepted', 'rejected');

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  bio text DEFAULT '',
  avatar_url text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des annonces
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  type listing_type NOT NULL,
  mode listing_mode NOT NULL,
  price integer NOT NULL CHECK (price > 0),
  price_type text NOT NULL DEFAULT 'total' CHECK (price_type IN ('total', 'per_person')),
  location text NOT NULL,
  available_spots integer CHECK (available_spots > 0),
  total_spots integer CHECK (total_spots > 0),
  contact_phone text NOT NULL,
  images text[] DEFAULT '{}',
  amenities text[] DEFAULT '{}',
  surface text,
  furnished boolean DEFAULT true,
  deposit integer DEFAULT 0 CHECK (deposit >= 0),
  charges_included boolean DEFAULT true,
  availability text DEFAULT 'Immédiate',
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status listing_status DEFAULT 'active',
  views integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des réponses aux annonces
CREATE TABLE IF NOT EXISTS listing_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message text NOT NULL,
  contact_info text NOT NULL,
  status response_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(listing_id, user_id)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_type ON listings(type);
CREATE INDEX IF NOT EXISTS idx_listings_mode ON listings(mode);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(location);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listing_responses_listing_id ON listing_responses(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_responses_user_id ON listing_responses(user_id);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activation RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_responses ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour users
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (true); -- Tous peuvent lire les profils publics

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Politiques RLS pour listings
CREATE POLICY "Anyone can read active listings"
  ON listings FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can create listings"
  ON listings FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own listings"
  ON listings FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- Politiques RLS pour listing_responses
CREATE POLICY "Users can read responses to their listings"
  ON listing_responses FOR SELECT
  USING (
    auth.uid()::text IN (
      SELECT user_id::text FROM listings WHERE id = listing_id
    ) OR auth.uid()::text = user_id::text
  );

CREATE POLICY "Users can create responses"
  ON listing_responses FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Listing owners can update responses"
  ON listing_responses FOR UPDATE
  USING (
    auth.uid()::text IN (
      SELECT user_id::text FROM listings WHERE id = listing_id
    )
  );

-- Données de test
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, bio, verified) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'aminata.diallo@student.uadb.edu.sn', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Aminata', 'Diallo', '+221701234567', 'student', 'Étudiante en Master 2 Informatique, recherche logement calme pour études.', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'moussa.ba@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Moussa', 'Ba', '+221703456789', 'landlord', 'Propriétaire de plusieurs logements étudiants à Bambey.', true),
  ('550e8400-e29b-41d4-a716-446655440003', 'fatou.seck@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Fatou', 'Seck', '+221705678901', 'landlord', 'Propriétaire expérimentée, spécialisée dans les colocations étudiantes.', true);

INSERT INTO listings (id, title, description, type, mode, price, price_type, location, available_spots, total_spots, contact_phone, images, amenities, surface, furnished, deposit, user_id, views) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'Chambre en colocation - Centre ville', 'Belle chambre spacieuse dans une maison partagée située au cœur de Bambey. La maison dispose d''une cuisine équipée, d''un salon commun, de 2 salles de bain et d''une cour.', 'room', 'colocation', 45000, 'per_person', 'Centre ville, Bambey', 2, 4, '+221701234567', '{"https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg","https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg"}', '{"Internet inclus","Cuisine équipée","Salon commun","Parking"}', '15 m²', true, 45000, '550e8400-e29b-41d4-a716-446655440001', 156),
  ('660e8400-e29b-41d4-a716-446655440002', 'Appartement T2 - Quartier Thialy', 'Appartement de 2 pièces meublé, cuisine équipée, proche de l''université et des commerces.', 'apartment', 'classic', 75000, 'total', 'Thialy, Bambey', null, null, '+221703456789', '{"https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg","https://images.pexels.com/photos/2029667/pexels-photo-2029667.jpeg"}', '{"Internet inclus","Cuisine équipée","Salle de bain","Meublé"}', '45 m²', true, 75000, '550e8400-e29b-41d4-a716-446655440002', 89),
  ('660e8400-e29b-41d4-a716-446655440003', 'Maison 4 chambres - Campus', 'Grande maison avec 4 chambres, parfaite pour étudiants. Environnement calme et studieux.', 'house', 'colocation', 25000, 'per_person', 'Campus universitaire, Bambey', 3, 4, '+221705678901', '{"https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg","https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg"}', '{"Internet inclus","Cuisine équipée","Salon commun","Parking","Cour"}', '120 m²', true, 25000, '550e8400-e29b-41d4-a716-446655440003', 234);