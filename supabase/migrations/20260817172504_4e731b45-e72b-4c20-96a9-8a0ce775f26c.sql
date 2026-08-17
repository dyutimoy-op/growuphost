
-- Create a table for media library items
CREATE TABLE public.media_library (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    url text NOT NULL,
    filename text NOT NULL,
    file_type text,
    file_size bigint,
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, DELETE ON public.media_library TO authenticated;
GRANT ALL ON public.media_library TO service_role;

-- Policies
CREATE POLICY "Admins can manage all media" ON public.media_library
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
