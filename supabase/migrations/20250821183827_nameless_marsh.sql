/*
  # Ajout du champ caution et du rôle admin

  1. Modifications des tables
    - Ajout du champ `caution` dans `listings`
    - Modification de l'enum `user_role` pour ajouter 'admin'
    - Mise à jour des contraintes et index
    
  2. Sécurité
    - Politiques RLS mises à jour pour les admins
    
  3. Données
    - Mise à jour des données existantes
*/

-- Ajouter 'admin' à l'enum user_role existant
ALTER TYPE user_role ADD VALUE 'admin';

-- Ajouter le champ caution à la table listings
DO $$
BEGIN
  -- Ajouter le champ caution s'il n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'caution'
  ) THEN
    ALTER TABLE listings ADD COLUMN caution integer DEFAULT 0 CHECK (caution >= 0);
  END IF;
END $$;

-- Créer un index pour les performances sur le champ caution
CREATE INDEX IF NOT EXISTS idx_listings_caution ON listings(caution);

-- Mettre à jour les politiques RLS pour permettre aux admins de voir toutes les annonces
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

-- Politique pour que les admins puissent modifier toutes les annonces
CREATE POLICY "Admins can update all listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Politique pour que les admins puissent supprimer toutes les annonces
CREATE POLICY "Admins can delete all listings"
  ON listings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Mettre à jour les données existantes pour définir une caution par défaut
UPDATE listings SET caution = 0 WHERE caution IS NULL;