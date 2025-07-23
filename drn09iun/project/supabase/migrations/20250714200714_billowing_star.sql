/*
  # Support Tickets System

  1. New Tables
    - `support_tickets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `email` (text, not null)
      - `subject` (text, not null)
      - `message` (text, not null)
      - `status` (text, enum: new, open, in_progress, closed)
      - `priority` (text, enum: low, medium, high)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
    
    - `ticket_responses`
      - `id` (uuid, primary key)
      - `ticket_id` (uuid, foreign key to support_tickets)
      - `message` (text, not null)
      - `from_support` (boolean, not null)
      - `created_at` (timestamp with time zone)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to view their own tickets
    - Add policies for service role to manage all tickets
*/

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  priority text NOT NULL DEFAULT 'medium',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT support_tickets_status_check CHECK (status = ANY (ARRAY['new'::text, 'open'::text, 'in_progress'::text, 'closed'::text])),
  CONSTRAINT support_tickets_priority_check CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))
);

-- Create ticket_responses table
CREATE TABLE IF NOT EXISTS ticket_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES support_tickets(id) ON DELETE CASCADE,
  message text NOT NULL,
  from_support boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for support_tickets
CREATE POLICY "Service role can manage all tickets" 
  ON support_tickets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can insert their own tickets" 
  ON support_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK ((user_id = uid()) OR (email = (jwt() ->> 'email'::text)));

CREATE POLICY "Users can view their own tickets" 
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING ((user_id = uid()) OR (email = (jwt() ->> 'email'::text)));

-- Create policies for ticket_responses
CREATE POLICY "Service role can manage all responses" 
  ON ticket_responses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can insert responses to their tickets" 
  ON ticket_responses
  FOR INSERT
  TO authenticated
  WITH CHECK ((EXISTS ( SELECT 1
    FROM support_tickets
    WHERE (support_tickets.id = ticket_responses.ticket_id) 
    AND ((support_tickets.user_id = uid()) OR (support_tickets.email = (jwt() ->> 'email'::text)))
  )) AND (from_support = false));

CREATE POLICY "Users can view responses to their tickets" 
  ON ticket_responses
  FOR SELECT
  TO authenticated
  USING (EXISTS ( SELECT 1
    FROM support_tickets
    WHERE (support_tickets.id = ticket_responses.ticket_id) 
    AND ((support_tickets.user_id = uid()) OR (support_tickets.email = (jwt() ->> 'email'::text)))
  ));

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_support_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON support_tickets
FOR EACH ROW
EXECUTE FUNCTION update_support_tickets_updated_at();