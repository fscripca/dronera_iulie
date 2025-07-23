/*
# Support Tickets System

1. New Tables
  - `support_tickets`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles)
    - `email` (text, not null)
    - `subject` (text, not null)
    - `message` (text, not null)
    - `status` (text, not null)
    - `priority` (text, not null)
    - `created_at` (timestamp with time zone)
    - `updated_at` (timestamp with time zone)
  
  - `ticket_responses`
    - `id` (uuid, primary key)
    - `ticket_id` (uuid, references support_tickets)
    - `message` (text, not null)
    - `from_support` (boolean, not null)
    - `created_at` (timestamp with time zone)

2. Security
  - Enable RLS on both tables
  - Add policies for authenticated users to view their own tickets
  - Add policies for service role to manage all tickets

3. Functions
  - `create_support_ticket` - Creates a new support ticket
  - `get_user_support_tickets` - Gets all tickets for a user
  - `add_ticket_response` - Adds a response to a ticket
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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT support_tickets_status_check CHECK (status IN ('new', 'open', 'in_progress', 'closed')),
  CONSTRAINT support_tickets_priority_check CHECK (priority IN ('low', 'medium', 'high'))
);

-- Create ticket_responses table
CREATE TABLE IF NOT EXISTS ticket_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES support_tickets(id) ON DELETE CASCADE,
  message text NOT NULL,
  from_support boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for support_tickets
CREATE POLICY "Users can view their own tickets"
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING ((user_id = auth.uid()) OR (email = (auth.jwt() ->> 'email')));

CREATE POLICY "Users can insert their own tickets"
  ON support_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK ((user_id = auth.uid()) OR (email = (auth.jwt() ->> 'email')));

CREATE POLICY "Service role can manage all tickets"
  ON support_tickets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policies for ticket_responses
CREATE POLICY "Users can view responses to their tickets"
  ON ticket_responses
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM support_tickets
    WHERE support_tickets.id = ticket_responses.ticket_id
    AND ((support_tickets.user_id = auth.uid()) OR (support_tickets.email = (auth.jwt() ->> 'email')))
  ));

CREATE POLICY "Users can insert responses to their tickets"
  ON ticket_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM support_tickets
    WHERE support_tickets.id = ticket_responses.ticket_id
    AND ((support_tickets.user_id = auth.uid()) OR (support_tickets.email = (auth.jwt() ->> 'email')))
  ) AND (from_support = false));

CREATE POLICY "Service role can manage all responses"
  ON ticket_responses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create trigger to update updated_at on support_tickets
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

-- Create function to create a support ticket
CREATE OR REPLACE FUNCTION create_support_ticket(
  p_user_id uuid,
  p_email text,
  p_subject text,
  p_message text,
  p_priority text DEFAULT 'medium'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ticket_id uuid;
BEGIN
  -- Validate inputs
  IF p_email IS NULL OR p_subject IS NULL OR p_message IS NULL THEN
    RAISE EXCEPTION 'Email, subject, and message are required';
  END IF;
  
  -- Validate priority
  IF p_priority IS NULL OR p_priority NOT IN ('low', 'medium', 'high') THEN
    p_priority := 'medium';
  END IF;
  
  -- Insert the ticket
  INSERT INTO support_tickets (
    user_id,
    email,
    subject,
    message,
    status,
    priority
  ) VALUES (
    p_user_id,
    p_email,
    p_subject,
    p_message,
    'new',
    p_priority
  )
  RETURNING id INTO v_ticket_id;
  
  RETURN v_ticket_id;
END;
$$;

-- Create function to get user support tickets
CREATE OR REPLACE FUNCTION get_user_support_tickets(
  p_user_id uuid
)
RETURNS TABLE (
  id uuid,
  subject text,
  message text,
  status text,
  priority text,
  created_at timestamptz,
  updated_at timestamptz,
  latest_response_message text,
  latest_response_from_support boolean,
  latest_response_timestamp timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.subject,
    t.message,
    t.status,
    t.priority,
    t.created_at,
    t.updated_at,
    r.message AS latest_response_message,
    r.from_support AS latest_response_from_support,
    r.created_at AS latest_response_timestamp
  FROM 
    support_tickets t
  LEFT JOIN LATERAL (
    SELECT 
      message,
      from_support,
      created_at
    FROM 
      ticket_responses
    WHERE 
      ticket_id = t.id
    ORDER BY 
      created_at DESC
    LIMIT 1
  ) r ON true
  WHERE 
    t.user_id = p_user_id
  ORDER BY 
    t.updated_at DESC;
END;
$$;

-- Create function to add a ticket response
CREATE OR REPLACE FUNCTION add_ticket_response(
  p_ticket_id uuid,
  p_message text,
  p_from_support boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_response_id uuid;
BEGIN
  -- Validate inputs
  IF p_ticket_id IS NULL OR p_message IS NULL THEN
    RAISE EXCEPTION 'Ticket ID and message are required';
  END IF;
  
  -- Insert the response
  INSERT INTO ticket_responses (
    ticket_id,
    message,
    from_support
  ) VALUES (
    p_ticket_id,
    p_message,
    p_from_support
  )
  RETURNING id INTO v_response_id;
  
  -- Update the ticket's updated_at timestamp and status if needed
  UPDATE support_tickets
  SET 
    updated_at = now(),
    status = CASE
      WHEN p_from_support = true AND status = 'new' THEN 'in_progress'
      WHEN p_from_support = false AND status = 'closed' THEN 'open'
      ELSE status
    END
  WHERE id = p_ticket_id;
  
  RETURN v_response_id;
END;
$$;

-- Create function to get ticket details with all responses
CREATE OR REPLACE FUNCTION get_ticket_details(
  p_ticket_id uuid
)
RETURNS TABLE (
  ticket_id uuid,
  subject text,
  message text,
  status text,
  priority text,
  created_at timestamptz,
  updated_at timestamptz,
  response_id uuid,
  response_message text,
  response_from_support boolean,
  response_created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id AS ticket_id,
    t.subject,
    t.message,
    t.status,
    t.priority,
    t.created_at,
    t.updated_at,
    r.id AS response_id,
    r.message AS response_message,
    r.from_support AS response_from_support,
    r.created_at AS response_created_at
  FROM 
    support_tickets t
  LEFT JOIN 
    ticket_responses r ON t.id = r.ticket_id
  WHERE 
    t.id = p_ticket_id
  ORDER BY 
    r.created_at ASC;
END;
$$;

-- Create function to update ticket status
CREATE OR REPLACE FUNCTION update_ticket_status(
  p_ticket_id uuid,
  p_status text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate status
  IF p_status IS NULL OR p_status NOT IN ('new', 'open', 'in_progress', 'closed') THEN
    RAISE EXCEPTION 'Invalid status value';
  END IF;
  
  -- Update the ticket status
  UPDATE support_tickets
  SET 
    status = p_status,
    updated_at = now()
  WHERE id = p_ticket_id;
  
  RETURN FOUND;
END;
$$;