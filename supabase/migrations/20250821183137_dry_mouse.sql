/*
  # Ajout de la caution et système de validation

  1. Modifications des tables
    - Ajout du champ `caution_amount` dans `listings`
    - Ajout du champ `admin_validated` pour la validation admin
    - Ajout du champ `validation_date` pour tracer la validation
    
  2. Mise à jour des politiques RLS
    - Seules les annonces validées sont visibles publiquement
    - Les utilisateurs peuvent voir leurs propres annonces non validées
    
  3. Index pour les performances
    - Index sur le statut de validation
*/

-- Ajouter les nouveaux champs à la table listings
DO $$
BEGIN
  -- Ajouter le champ caution_amount s'il n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'caution_amount'
  ) THEN
    ALTER TABLE listings ADD COLUMN caution_amount integer DEFAULT 0 CHECK (caution_amount >= 0);
  END IF;

  -- Ajouter le champ admin_validated s'il n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'admin_validated'
  ) THEN
    ALTER TABLE listings ADD COLUMN admin_validated boolean DEFAULT false;
  END IF;

  -- Ajouter le champ validation_date s'il n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'validation_date'
  ) THEN
    ALTER TABLE listings ADD COLUMN validation_date timestamptz;
  END IF;

  -- Ajouter le champ validated_by s'il n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'validated_by'
  ) THEN
    ALTER TABLE listings ADD COLUMN validated_by uuid REFERENCES users(id);
  END IF;
END $$;

-- Créer un index pour les performances sur admin_validated
CREATE INDEX IF NOT EXISTS idx_listings_admin_validated ON listings(admin_validated);

-- Mettre à jour les politiques RLS pour les listings
DROP POLICY IF EXISTS "Anyone can read active listings" ON listings;

-- Nouvelle politique : seules les annonces validées par l'admin sont visibles publiquement
CREATE POLICY "Anyone can read validated active listings"
  ON listings FOR SELECT
  USING (status = 'active' AND admin_validated = true);

-- Politique pour que les utilisateurs puissent voir leurs propres annonces (même non validées)
CREATE POLICY "Users can read own listings"
  ON listings FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Mettre à jour les annonces existantes pour qu'elles soient validées par défaut
UPDATE listings SET admin_validated = true, validation_date = now() WHERE admin_validated IS NULL;

-- Créer un type enum pour les rôles admin
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
    CREATE TYPE admin_role AS ENUM ('admin', 'super_admin');
  END IF;
END $$;

-- Ajouter un champ admin_role à la table users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'admin_role'
  ) THEN
    ALTER TABLE users ADD COLUMN admin_role admin_role;
  END IF;
END $$;