// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://isjregeqlcymemzsdbfm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzanJlZ2VxbGN5bWVtenNkYmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODQyMDYsImV4cCI6MjA2MzY2MDIwNn0.QVmlO9PpYiE4D-ZHe00EXHkaDrrVVAN_dilAY2z5bN0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);