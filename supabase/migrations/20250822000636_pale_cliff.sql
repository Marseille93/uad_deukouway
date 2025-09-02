/*
  # Ajout du système de blocage des utilisateurs

  1. Nouveaux champs
    - `blocked` - Statut de blocage de l'utilisateur
    - `blocked_at` - Date de blocage
    - `blocked_by` - ID de l'admin qui a bloqué
    
  2. Index pour les performances
    - Index sur le champ blocked
*/

-- Ajouter les champs de blocage à la table users
DO $$
BEGIN
  -- Ajouter le champ blocked s'il n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'blocked'
  ) THEN
    ALTER TABLE users ADD COLUMN blocked boolean DEFAULT false;
  END IF;

  -- Ajouter le champ blocked_at s'il n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'blocked_at'
  ) THEN
    ALTER TABLE users ADD COLUMN blocked_at timestamptz;
  END IF;

  -- Ajouter le champ blocked_by s'il n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'blocked_by'
  ) THEN
    ALTER TABLE users ADD COLUMN blocked_by uuid REFERENCES users(id);
  END IF;
END $$;

-- Créer un index pour les performances sur le champ blocked
CREATE INDEX IF NOT EXISTS idx_users_blocked ON users(blocked);

-- Mettre à jour les utilisateurs existants pour qu'ils ne soient pas bloqués par défaut
UPDATE users SET blocked = false WHERE blocked IS NULL;