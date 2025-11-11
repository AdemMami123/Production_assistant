-- Migration: Add Team Functionality
-- This migration adds support for team collaboration while maintaining personal task privacy

-- ============================================================================
-- 1. CREATE TEAMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for teams
CREATE INDEX IF NOT EXISTS teams_created_by_idx ON teams(created_by);

-- Enable RLS on teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. CREATE TEAM MEMBERS TABLE
-- ============================================================================

-- Create enum for team member roles if it doesn't exist
DO $$ BEGIN
  CREATE TYPE team_member_role AS ENUM ('leader', 'member');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role team_member_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Create indexes for team_members
CREATE INDEX IF NOT EXISTS team_members_team_id_idx ON team_members(team_id);
CREATE INDEX IF NOT EXISTS team_members_user_id_idx ON team_members(user_id);
CREATE INDEX IF NOT EXISTS team_members_role_idx ON team_members(role);

-- Enable RLS on team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. CREATE MEETINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  meeting_url TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for meetings
CREATE INDEX IF NOT EXISTS meetings_team_id_idx ON meetings(team_id);
CREATE INDEX IF NOT EXISTS meetings_scheduled_at_idx ON meetings(scheduled_at);
CREATE INDEX IF NOT EXISTS meetings_created_by_idx ON meetings(created_by);

-- Enable RLS on meetings
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. CREATE COMMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for comments
CREATE INDEX IF NOT EXISTS comments_task_id_idx ON comments(task_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at);

-- Enable RLS on comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. CREATE TASK PROGRESS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS task_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  blocker TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for task_progress
CREATE INDEX IF NOT EXISTS task_progress_task_id_idx ON task_progress(task_id);
CREATE INDEX IF NOT EXISTS task_progress_user_id_idx ON task_progress(user_id);
CREATE INDEX IF NOT EXISTS task_progress_created_at_idx ON task_progress(created_at);

-- Enable RLS on task_progress
ALTER TABLE task_progress ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. MODIFY TASKS TABLE - ADD TEAM COLUMNS
-- ============================================================================

-- Add team_id column (nullable - null means personal task)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE tasks ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add assigned_to column (for team task assignments)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'assigned_to'
  ) THEN
    ALTER TABLE tasks ADD COLUMN assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add assigned_by column (track who assigned the task)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'assigned_by'
  ) THEN
    ALTER TABLE tasks ADD COLUMN assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for new task columns
CREATE INDEX IF NOT EXISTS tasks_team_id_idx ON tasks(team_id);
CREATE INDEX IF NOT EXISTS tasks_assigned_to_idx ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS tasks_assigned_by_idx ON tasks(assigned_by);

-- ============================================================================
-- 7. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user is a team member
CREATE OR REPLACE FUNCTION is_team_member(team_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_id = team_uuid AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is a team leader
CREATE OR REPLACE FUNCTION is_team_leader(team_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_id = team_uuid AND user_id = user_uuid AND role = 'leader'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update teams updated_at
CREATE OR REPLACE FUNCTION update_teams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update meetings updated_at
CREATE OR REPLACE FUNCTION update_meetings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update comments updated_at
CREATE OR REPLACE FUNCTION update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. CREATE TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_teams_updated_at_trigger ON teams;
CREATE TRIGGER update_teams_updated_at_trigger
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_teams_updated_at();

DROP TRIGGER IF EXISTS update_meetings_updated_at_trigger ON meetings;
CREATE TRIGGER update_meetings_updated_at_trigger
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_meetings_updated_at();

DROP TRIGGER IF EXISTS update_comments_updated_at_trigger ON comments;
CREATE TRIGGER update_comments_updated_at_trigger
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comments_updated_at();

-- ============================================================================
-- 9. DROP EXISTING TASK RLS POLICIES (to recreate with team support)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;

-- ============================================================================
-- 10. CREATE RLS POLICIES - TEAMS
-- ============================================================================

-- Users can view teams they are members of
DROP POLICY IF EXISTS "Users can view their teams" ON teams;
CREATE POLICY "Users can view their teams"
  ON teams
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = teams.id 
      AND team_members.user_id = auth.uid()
    )
  );

-- Any authenticated user can create a team (they become the leader)
DROP POLICY IF EXISTS "Authenticated users can create teams" ON teams;
CREATE POLICY "Authenticated users can create teams"
  ON teams
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Team leaders can update their team
DROP POLICY IF EXISTS "Team leaders can update teams" ON teams;
CREATE POLICY "Team leaders can update teams"
  ON teams
  FOR UPDATE
  USING (is_team_leader(id, auth.uid()));

-- Team leaders can delete their team
DROP POLICY IF EXISTS "Team leaders can delete teams" ON teams;
CREATE POLICY "Team leaders can delete teams"
  ON teams
  FOR DELETE
  USING (is_team_leader(id, auth.uid()));

-- ============================================================================
-- 11. CREATE RLS POLICIES - TEAM MEMBERS
-- ============================================================================

-- Team members can view other members in their team
DROP POLICY IF EXISTS "Team members can view team members" ON team_members;
CREATE POLICY "Team members can view team members"
  ON team_members
  FOR SELECT
  USING (is_team_member(team_id, auth.uid()));

-- Team leaders can add members
DROP POLICY IF EXISTS "Team leaders can add members" ON team_members;
CREATE POLICY "Team leaders can add members"
  ON team_members
  FOR INSERT
  WITH CHECK (is_team_leader(team_id, auth.uid()));

-- Team leaders can update member roles
DROP POLICY IF EXISTS "Team leaders can update members" ON team_members;
CREATE POLICY "Team leaders can update members"
  ON team_members
  FOR UPDATE
  USING (is_team_leader(team_id, auth.uid()));

-- Team leaders can remove members, or members can remove themselves
DROP POLICY IF EXISTS "Team leaders can remove members" ON team_members;
CREATE POLICY "Team leaders can remove members"
  ON team_members
  FOR DELETE
  USING (
    is_team_leader(team_id, auth.uid()) OR user_id = auth.uid()
  );

-- ============================================================================
-- 12. CREATE RLS POLICIES - MEETINGS
-- ============================================================================

-- Team members can view team meetings
DROP POLICY IF EXISTS "Team members can view meetings" ON meetings;
CREATE POLICY "Team members can view meetings"
  ON meetings
  FOR SELECT
  USING (is_team_member(team_id, auth.uid()));

-- Team leaders can create meetings
DROP POLICY IF EXISTS "Team leaders can create meetings" ON meetings;
CREATE POLICY "Team leaders can create meetings"
  ON meetings
  FOR INSERT
  WITH CHECK (
    is_team_leader(team_id, auth.uid()) AND 
    auth.uid() = created_by
  );

-- Team leaders can update meetings
DROP POLICY IF EXISTS "Team leaders can update meetings" ON meetings;
CREATE POLICY "Team leaders can update meetings"
  ON meetings
  FOR UPDATE
  USING (is_team_leader(team_id, auth.uid()));

-- Team leaders can delete meetings
DROP POLICY IF EXISTS "Team leaders can delete meetings" ON meetings;
CREATE POLICY "Team leaders can delete meetings"
  ON meetings
  FOR DELETE
  USING (is_team_leader(team_id, auth.uid()));

-- ============================================================================
-- 13. CREATE RLS POLICIES - COMMENTS
-- ============================================================================

-- Team members can view comments on team tasks, users can view comments on their personal tasks
DROP POLICY IF EXISTS "Users can view comments on accessible tasks" ON comments;
CREATE POLICY "Users can view comments on accessible tasks"
  ON comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = comments.task_id 
      AND (
        -- Personal task owned by user
        (tasks.team_id IS NULL AND tasks.user_id = auth.uid())
        OR
        -- Team task where user is team member
        (tasks.team_id IS NOT NULL AND is_team_member(tasks.team_id, auth.uid()))
      )
    )
  );

-- Users can add comments on tasks they have access to
DROP POLICY IF EXISTS "Users can add comments on accessible tasks" ON comments;
CREATE POLICY "Users can add comments on accessible tasks"
  ON comments
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = comments.task_id 
      AND (
        (tasks.team_id IS NULL AND tasks.user_id = auth.uid())
        OR
        (tasks.team_id IS NOT NULL AND is_team_member(tasks.team_id, auth.uid()))
      )
    )
  );

-- Users can update their own comments
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
CREATE POLICY "Users can update their own comments"
  ON comments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own comments
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
CREATE POLICY "Users can delete their own comments"
  ON comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 14. CREATE RLS POLICIES - TASK PROGRESS
-- ============================================================================

-- Team members can view progress on team tasks
DROP POLICY IF EXISTS "Team members can view task progress" ON task_progress;
CREATE POLICY "Team members can view task progress"
  ON task_progress
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_progress.task_id 
      AND (
        (tasks.team_id IS NULL AND tasks.user_id = auth.uid())
        OR
        (tasks.team_id IS NOT NULL AND is_team_member(tasks.team_id, auth.uid()))
      )
    )
  );

-- Assigned users can add progress updates
DROP POLICY IF EXISTS "Assigned users can add progress" ON task_progress;
CREATE POLICY "Assigned users can add progress"
  ON task_progress
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_progress.task_id 
      AND (
        tasks.assigned_to = auth.uid() 
        OR tasks.user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- 15. CREATE RLS POLICIES - TASKS (UPDATED FOR TEAM SUPPORT)
-- ============================================================================

-- Users can view:
-- 1. Their own personal tasks (team_id IS NULL AND user_id = auth.uid())
-- 2. Team tasks in teams they belong to
-- 3. Tasks assigned to them
DROP POLICY IF EXISTS "Users can view accessible tasks" ON tasks;
CREATE POLICY "Users can view accessible tasks"
  ON tasks
  FOR SELECT
  USING (
    -- Personal tasks
    (team_id IS NULL AND user_id = auth.uid())
    OR
    -- Team tasks where user is a team member
    (team_id IS NOT NULL AND is_team_member(team_id, auth.uid()))
  );

-- Users can create personal tasks, team leaders can create team tasks
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
CREATE POLICY "Users can create tasks"
  ON tasks
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    (
      -- Personal task
      team_id IS NULL
      OR
      -- Team task - must be team leader
      (team_id IS NOT NULL AND is_team_leader(team_id, auth.uid()))
    )
  );

-- Users can update their personal tasks, team leaders can update team tasks, assigned users can update status
DROP POLICY IF EXISTS "Users can update accessible tasks" ON tasks;
CREATE POLICY "Users can update accessible tasks"
  ON tasks
  FOR UPDATE
  USING (
    -- Own personal task
    (team_id IS NULL AND user_id = auth.uid())
    OR
    -- Team leader can update team tasks
    (team_id IS NOT NULL AND is_team_leader(team_id, auth.uid()))
    OR
    -- Assigned user can update (limited fields - enforced in backend)
    (team_id IS NOT NULL AND assigned_to = auth.uid())
  );

-- Users can delete their personal tasks, team leaders can delete team tasks
DROP POLICY IF EXISTS "Users can delete accessible tasks" ON tasks;
CREATE POLICY "Users can delete accessible tasks"
  ON tasks
  FOR DELETE
  USING (
    (team_id IS NULL AND user_id = auth.uid())
    OR
    (team_id IS NOT NULL AND is_team_leader(team_id, auth.uid()))
  );

-- ============================================================================
-- 16. CREATE VIEWS FOR TEAM DASHBOARDS
-- ============================================================================

-- Team task statistics view
CREATE OR REPLACE VIEW team_task_stats AS
SELECT 
  t.team_id,
  COUNT(*) as total_tasks,
  COUNT(*) FILTER (WHERE t.status = 'completed') as completed_tasks,
  COUNT(*) FILTER (WHERE t.status = 'todo') as todo_tasks,
  COUNT(*) FILTER (WHERE t.status = 'in_progress') as in_progress_tasks,
  COUNT(*) FILTER (WHERE t.due_date < NOW() AND t.status != 'completed') as overdue_tasks,
  COUNT(DISTINCT t.assigned_to) as members_with_tasks
FROM tasks t
WHERE t.team_id IS NOT NULL
GROUP BY t.team_id;

-- Team member task statistics
CREATE OR REPLACE VIEW team_member_task_stats AS
SELECT 
  t.team_id,
  t.assigned_to as user_id,
  COUNT(*) as assigned_tasks,
  COUNT(*) FILTER (WHERE t.status = 'completed') as completed_tasks,
  COUNT(*) FILTER (WHERE t.status = 'in_progress') as in_progress_tasks,
  COUNT(*) FILTER (WHERE t.due_date < NOW() AND t.status != 'completed') as overdue_tasks
FROM tasks t
WHERE t.team_id IS NOT NULL AND t.assigned_to IS NOT NULL
GROUP BY t.team_id, t.assigned_to;

-- ============================================================================
-- 17. CREATE FUNCTION TO AUTO-ADD CREATOR AS TEAM LEADER
-- ============================================================================

CREATE OR REPLACE FUNCTION add_creator_as_team_leader()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically add the team creator as a leader
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'leader');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_team_created ON teams;
CREATE TRIGGER on_team_created
  AFTER INSERT ON teams
  FOR EACH ROW
  EXECUTE FUNCTION add_creator_as_team_leader();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Summary:
-- ✓ Created teams table
-- ✓ Created team_members table with roles
-- ✓ Created meetings table
-- ✓ Created comments table
-- ✓ Created task_progress table
-- ✓ Added team_id, assigned_to, assigned_by columns to tasks
-- ✓ Created helper functions for permission checks
-- ✓ Set up RLS policies for all tables
-- ✓ Created views for team dashboards
-- ✓ Set up triggers for auto-updates
-- ✓ Personal tasks (team_id IS NULL) remain completely private
-- ✓ Team tasks are visible only to team members
