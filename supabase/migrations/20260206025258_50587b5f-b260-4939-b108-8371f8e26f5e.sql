-- Remove the UNIQUE constraint on user_id to allow multiple projects per user
ALTER TABLE public.user_projects DROP CONSTRAINT IF EXISTS user_projects_user_id_key;

-- Add an index on user_id for query performance
CREATE INDEX IF NOT EXISTS idx_user_projects_user_id ON public.user_projects(user_id);
