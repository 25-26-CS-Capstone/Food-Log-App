import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://awhdukkvlmqaxtqmfnlw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3aGR1a2t2bG1xYXh0cW1mbmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNDI3MjUsImV4cCI6MjA3NjkxODcyNX0.8UXSvMBxepsJ1NyhP62J6iCBjOvyDqPFeXF7p4YhxdQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
