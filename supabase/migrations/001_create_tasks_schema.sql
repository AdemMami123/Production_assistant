-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'archived')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON tasks(due_date);
CREATE INDEX IF NOT EXISTS tasks_category_idx ON tasks(category);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks table
-- Policy: Users can view their own tasks
CREATE POLICY "Users can view their own tasks"
  ON tasks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own tasks
CREATE POLICY "Users can insert their own tasks"
  ON tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own tasks
CREATE POLICY "Users can update their own tasks"
  ON tasks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own tasks
CREATE POLICY "Users can delete their own tasks"
  ON tasks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on task updates
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a view for task statistics per user
CREATE OR REPLACE VIEW user_task_stats AS
SELECT 
  user_id,
  COUNT(*) as total_tasks,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
  COUNT(*) FILTER (WHERE status = 'todo') as todo_tasks,
  COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tasks,
  COUNT(*) FILTER (WHERE due_date < NOW() AND status != 'completed') as overdue_tasks
FROM tasks
GROUP BY user_id;
