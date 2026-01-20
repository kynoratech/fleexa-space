-- Remover el constraint unique del slug en workspaces
-- Esto permite que diferentes usuarios tengan workspaces con el mismo nombre/slug

ALTER TABLE "workspaces" DROP CONSTRAINT IF EXISTS "workspaces_slug_unique";
