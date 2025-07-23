import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Initialize Supabase client with service role key for admin access
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    // GET all users
    if (req.method === "GET" && path === "users") {
      // Get users with their profile data
      const { data, error } = await supabaseClient
        .from("profiles")
        .select(`
          id,
          email,
          created_at,
          updated_at,
          status,
          kyc_status,
          first_name,
          last_name,
          country,
          phone,
          wallet_address,
          token_balance,
          investment_amount,
          risk_score,
          admin_notes,
          last_activity,
          registration_ip,
          email_verified
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Log admin action
      await supabaseClient.from("admin_audit_logs").insert({
        admin_id: req.headers.get("x-admin-email") || "admin@dronera.eu",
        action: "VIEW_USERS",
        details: `Viewed ${data?.length || 0} users`,
        ip_address: req.headers.get("x-forwarded-for") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown"
      });

      return new Response(
        JSON.stringify({ success: true, data }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // GET a single user
    if (req.method === "GET" && path === "user") {
      const userId = url.searchParams.get("id");
      
      if (!userId) {
        return new Response(
          JSON.stringify({ success: false, error: "User ID is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { data, error } = await supabaseClient
        .from("profiles")
        .select(`
          id,
          email,
          created_at,
          updated_at,
          status,
          kyc_status,
          first_name,
          last_name,
          country,
          phone,
          wallet_address,
          token_balance,
          investment_amount,
          risk_score,
          admin_notes,
          last_activity,
          registration_ip,
          email_verified
        `)
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user:", error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Log admin action
      await supabaseClient.from("admin_audit_logs").insert({
        admin_id: req.headers.get("x-admin-email") || "admin@dronera.eu",
        action: "VIEW_USER",
        details: `Viewed user: ${data.email}`,
        ip_address: req.headers.get("x-forwarded-for") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown"
      });

      return new Response(
        JSON.stringify({ success: true, data }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // CREATE a new user
    if (req.method === "POST" && path === "user") {
      const { email, password, firstName, lastName, country, phone, status, notes } = await req.json();

      // Validate required fields
      if (!email || !password) {
        return new Response(
          JSON.stringify({ success: false, error: "Email and password are required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Create user in Auth
      const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

      if (authError) {
        console.error("Error creating user in Auth:", authError);
        return new Response(
          JSON.stringify({ success: false, error: authError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Update profile data
      const { data: profileData, error: profileError } = await supabaseClient
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          country,
          phone,
          status: status || "active",
          admin_notes: notes,
          email_verified: true
        })
        .eq("id", authData.user.id)
        .select()
        .single();

      if (profileError) {
        console.error("Error updating profile:", profileError);
        // Try to delete the auth user if profile update fails
        await supabaseClient.auth.admin.deleteUser(authData.user.id);
        
        return new Response(
          JSON.stringify({ success: false, error: profileError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Log admin action
      await supabaseClient.from("admin_audit_logs").insert({
        admin_id: req.headers.get("x-admin-email") || "admin@dronera.eu",
        action: "CREATE_USER",
        details: `Created new user: ${email}`,
        ip_address: req.headers.get("x-forwarded-for") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown"
      });

      return new Response(
        JSON.stringify({ success: true, data: profileData }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // UPDATE a user
    if (req.method === "PUT" && path === "user") {
      const { id, status, notes, riskScore, firstName, lastName, country, phone } = await req.json();

      if (!id) {
        return new Response(
          JSON.stringify({ success: false, error: "User ID is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Get current user data for logging
      const { data: currentUser } = await supabaseClient
        .from("profiles")
        .select("email")
        .eq("id", id)
        .single();

      // Update profile
      const { data, error } = await supabaseClient
        .from("profiles")
        .update({
          status,
          admin_notes: notes,
          risk_score: riskScore,
          first_name: firstName,
          last_name: lastName,
          country,
          phone,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating user:", error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Log admin action
      await supabaseClient.from("admin_audit_logs").insert({
        admin_id: req.headers.get("x-admin-email") || "admin@dronera.eu",
        action: "UPDATE_USER",
        details: `Updated user: ${currentUser?.email || id} - Status: ${status}`,
        ip_address: req.headers.get("x-forwarded-for") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown"
      });

      return new Response(
        JSON.stringify({ success: true, data }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // DELETE a user
    if (req.method === "DELETE" && path === "user") {
      const userId = url.searchParams.get("id");
      
      if (!userId) {
        return new Response(
          JSON.stringify({ success: false, error: "User ID is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Get user email for logging
      const { data: userData } = await supabaseClient
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();

      // Delete user from Auth
      const { error: authError } = await supabaseClient.auth.admin.deleteUser(userId);

      if (authError) {
        console.error("Error deleting user from Auth:", authError);
        return new Response(
          JSON.stringify({ success: false, error: authError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Log admin action
      await supabaseClient.from("admin_audit_logs").insert({
        admin_id: req.headers.get("x-admin-email") || "admin@dronera.eu",
        action: "DELETE_USER",
        details: `Deleted user: ${userData?.email || userId}`,
        ip_address: req.headers.get("x-forwarded-for") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown"
      });

      return new Response(
        JSON.stringify({ success: true, message: "User deleted successfully" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // If no matching route
    return new Response(
      JSON.stringify({ error: "Not found" }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Function error:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});