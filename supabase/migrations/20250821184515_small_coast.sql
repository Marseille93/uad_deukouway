/*
  # Système de validation admin pour les annonces

  1. Nouveaux champs
    - `admin_validated` - Statut de validation par l'admin
    - `validation_date` - Date de validation
    - `validated_by` - ID de l'admin qui a validé
    
  2. Sécurité
    - Mise à jour des politiques RLS
    - Seules les annonces validées sont visibles publiquement
    
  3. Index pour les performances
    - Index sur admin_validated
*/

-- Ajouter les champs de validation admin
DO $$
BEGIN
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

-- Supprimer l'ancienne politique pour les annonces actives
DROP POLICY IF EXISTS "Anyone can read active listings" ON listings;

-- Nouvelle politique : seules les annonces validées par l'admin sont visibles publiquement
CREATE POLICY "Anyone can read validated active listings"
  ON listings FOR SELECT
  USING (status = 'active' AND admin_validated = true);

-- Politique pour que les utilisateurs puissent voir leurs propres annonces (même non validées)
CREATE POLICY "Users can read own listings"
  ON listings FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Politique pour que les admins puissent voir toutes les annonces
CREATE POLICY "Admins can read all listings"
  ON listings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Politique pour que les admins puissent valider les annonces
CREATE POLICY "Admins can validate listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Mettre à jour les annonces existantes pour qu'elles soient validées par défaut
UPDATE listings SET admin_validated = true, validation_date = now() WHERE admin_validated IS NULL;