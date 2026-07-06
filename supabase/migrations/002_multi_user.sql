-- Remove the single-row UNIQUE constraint on type for platforms
ALTER TABLE platforms DROP CONSTRAINT IF EXISTS platforms_type_key;

-- Add user_id column with default value pointing to the authenticated user ID (auth.uid())
ALTER TABLE platforms ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL DEFAULT auth.uid();
ALTER TABLE events ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL DEFAULT auth.uid();
ALTER TABLE resources ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL DEFAULT auth.uid();
ALTER TABLE labels ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL DEFAULT auth.uid();
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL DEFAULT auth.uid();

-- Add composite unique constraint to platforms so a user can only have one connection per platform type
ALTER TABLE platforms ADD CONSTRAINT platforms_user_id_type_key UNIQUE (user_id, type);

-- Drop all default RLS restrictions to recreate them with user-level policies
DROP POLICY IF EXISTS "Users and guests can read platforms" ON platforms;
DROP POLICY IF EXISTS "Users can insert their own platforms" ON platforms;
DROP POLICY IF EXISTS "Users can update their own platforms" ON platforms;
DROP POLICY IF EXISTS "Users can delete their own platforms" ON platforms;

DROP POLICY IF EXISTS "Users and guests can read events" ON events;
DROP POLICY IF EXISTS "Users can insert their own events" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Users can delete their own events" ON events;

DROP POLICY IF EXISTS "Users and guests can read resources" ON resources;
DROP POLICY IF EXISTS "Users can insert their own resources" ON resources;
DROP POLICY IF EXISTS "Users can update their own resources" ON resources;
DROP POLICY IF EXISTS "Users can delete their own resources" ON resources;

DROP POLICY IF EXISTS "Users and guests can read labels" ON labels;
DROP POLICY IF EXISTS "Users can insert their own labels" ON labels;
DROP POLICY IF EXISTS "Users can update their own labels" ON labels;
DROP POLICY IF EXISTS "Users can delete their own labels" ON labels;

DROP POLICY IF EXISTS "Users and guests can read announcements" ON announcements;
DROP POLICY IF EXISTS "Users can insert their own announcements" ON announcements;
DROP POLICY IF EXISTS "Users can update their own announcements" ON announcements;
DROP POLICY IF EXISTS "Users can delete their own announcements" ON announcements;

DROP POLICY IF EXISTS "Users and guests can read resource_labels" ON resource_labels;
DROP POLICY IF EXISTS "Users can modify their own resource_labels" ON resource_labels;

-- Enable RLS (just in case they weren't already enabled)
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Define RLS Policies for Platforms
CREATE POLICY "Users and guests can read platforms" ON platforms 
  FOR SELECT USING (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000000');
CREATE POLICY "Users can insert their own platforms" ON platforms 
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own platforms" ON platforms 
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own platforms" ON platforms 
  FOR DELETE USING (user_id = auth.uid());

-- Define RLS Policies for Events
CREATE POLICY "Users and guests can read events" ON events 
  FOR SELECT USING (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000000');
CREATE POLICY "Users can insert their own events" ON events 
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own events" ON events 
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own events" ON events 
  FOR DELETE USING (user_id = auth.uid());

-- Define RLS Policies for Resources
CREATE POLICY "Users and guests can read resources" ON resources 
  FOR SELECT USING (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000000');
CREATE POLICY "Users can insert their own resources" ON resources 
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own resources" ON resources 
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own resources" ON resources 
  FOR DELETE USING (user_id = auth.uid());

-- Define RLS Policies for Labels
CREATE POLICY "Users and guests can read labels" ON labels 
  FOR SELECT USING (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000000');
CREATE POLICY "Users can insert their own labels" ON labels 
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own labels" ON labels 
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own labels" ON labels 
  FOR DELETE USING (user_id = auth.uid());

-- Define RLS Policies for Announcements
CREATE POLICY "Users and guests can read announcements" ON announcements 
  FOR SELECT USING (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000000');
CREATE POLICY "Users can insert their own announcements" ON announcements 
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own announcements" ON announcements 
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own announcements" ON announcements 
  FOR DELETE USING (user_id = auth.uid());

-- Define RLS Policies for Resource Labels (Join table)
CREATE POLICY "Users and guests can read resource_labels" ON resource_labels 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM resources 
      WHERE resources.id = resource_labels.resource_id 
      AND (resources.user_id = auth.uid() OR resources.user_id = '00000000-0000-0000-0000-000000000000')
    )
  );
CREATE POLICY "Users can modify their own resource_labels" ON resource_labels 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM resources 
      WHERE resources.id = resource_labels.resource_id 
      AND resources.user_id = auth.uid()
    )
  );
