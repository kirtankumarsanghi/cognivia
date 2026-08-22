-- Study Groups Tables

-- 1. Study Groups
CREATE TABLE IF NOT EXISTS public.study_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  topic TEXT NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  concept_id UUID REFERENCES public.concepts(id) ON DELETE SET NULL,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  max_participants INTEGER DEFAULT 8,
  is_active BOOLEAN DEFAULT TRUE,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Study Group Members
CREATE TABLE IF NOT EXISTS public.study_group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(group_id, student_id)
);

-- 3. Study Group Messages (for chat)
CREATE TABLE IF NOT EXISTS public.study_group_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Peer Connections (for match suggestions)
CREATE TABLE IF NOT EXISTS public.peer_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  peer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  connection_type TEXT CHECK (connection_type IN ('matched', 'requested', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, peer_id)
);

-- Enable Row Level Security
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for study_groups
CREATE POLICY "Anyone can view active study groups" ON public.study_groups
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Authenticated users can create study groups" ON public.study_groups
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own groups" ON public.study_groups
  FOR UPDATE USING (auth.uid() = creator_id);

-- RLS Policies for study_group_members
CREATE POLICY "Anyone can view group members" ON public.study_group_members
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can join groups" ON public.study_group_members
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can leave groups" ON public.study_group_members
  FOR UPDATE USING (auth.uid() = student_id);

-- RLS Policies for study_group_messages
CREATE POLICY "Group members can view messages" ON public.study_group_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.study_group_members
      WHERE group_id = study_group_messages.group_id
      AND student_id = auth.uid()
      AND is_active = TRUE
    )
  );

CREATE POLICY "Group members can send messages" ON public.study_group_messages
  FOR INSERT WITH CHECK (
    auth.uid() = student_id AND
    EXISTS (
      SELECT 1 FROM public.study_group_members
      WHERE group_id = study_group_messages.group_id
      AND student_id = auth.uid()
      AND is_active = TRUE
    )
  );

-- RLS Policies for peer_connections
CREATE POLICY "Users can view their own connections" ON public.peer_connections
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() = peer_id);

CREATE POLICY "Users can create connections" ON public.peer_connections
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_study_groups_active ON public.study_groups(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_group_members_group ON public.study_group_members(group_id, is_active);
CREATE INDEX IF NOT EXISTS idx_study_group_messages_group ON public.study_group_messages(group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_peer_connections_student ON public.peer_connections(student_id);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_group_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_group_messages;
