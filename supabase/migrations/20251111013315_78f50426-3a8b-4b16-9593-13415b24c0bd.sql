-- Create table for learning sessions
CREATE TABLE public.learning_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mode TEXT NOT NULL CHECK (mode IN ('teacher', 'friend')),
  topic TEXT NOT NULL,
  score DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for friend mode conversations
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.learning_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_learning_sessions_mode ON public.learning_sessions(mode);
CREATE INDEX idx_learning_sessions_created_at ON public.learning_sessions(created_at);
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Enable Row Level Security (public app, no auth required)
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public access to learning_sessions"
  ON public.learning_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to chat_messages"
  ON public.chat_messages
  FOR ALL
  USING (true)
  WITH CHECK (true);