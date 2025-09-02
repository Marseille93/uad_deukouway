/*
  # Ajout du type de colocation par genre

  1. Nouveaux champs
    - `colocation_gender` - Type de colocation (mixte, hommes, femmes)
    
  2. Index pour les performances
    - Index sur colocation_gender pour les filtres
*/

-- Créer un type enum pour le genre de colocation
CREATE TYPE colocation_gender AS ENUM ('mixte', 'hommes', 'femmes');

-- Ajouter le champ colocation_gender à la table listings
DO $$
BEGIN
  -- Ajouter le champ colocation_gender s'il n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'colocation_gender'
  ) THEN
    ALTER TABLE listings ADD COLUMN colocation_gender colocation_gender DEFAULT 'mixte';
  END IF;
END $$;

-- Créer un index pour les performances sur colocation_gender
CREATE INDEX IF NOT EXISTS idx_listings_colocation_gender ON listings(colocation_gender);

-- Mettre à jour les annonces existantes pour qu'elles soient mixtes par défaut
UPDATE listings SET colocation_gender = 'mixte' WHERE colocation_gender IS NULL;