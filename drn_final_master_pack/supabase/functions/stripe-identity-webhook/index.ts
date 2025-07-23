import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@13.2.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, stripe-signature",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Get environment variables
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const stripeWebhookSecret = Deno.env.get("STRIPE_IDENTITY_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!stripeSecretKey || !stripeWebhookSecret || !supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Stripe and Supabase
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the signature from the headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing Stripe signature" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the raw request body
    const payload = await req.text();
    
    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, stripeWebhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log('Received Stripe Identity webhook event:', event.type);

    // Handle the event
    switch (event.type) {
      case 'identity.verification_session.verified':
        const verifiedSession = event.data.object;
        const userId = verifiedSession.metadata?.user_id;
        
        if (!userId) {
          console.warn('No user ID found in verification session metadata');
          break;
        }
        
        console.log(`KYC verification successful for user: ${userId}`);
        
        // Update user status to approved in Supabase
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            kyc_status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        
        if (updateError) {
          console.error('Error updating user KYC status:', updateError);
        } else {
          console.log(`Successfully updated KYC status to approved for user: ${userId}`);
        }
        
        // Log the verification event
        await supabase.from('user_activity_logs').insert({
          user_id: userId,
          action: 'KYC_VERIFIED',
          description: 'KYC verification completed successfully via Stripe Identity',
          metadata: {
            verification_session_id: verifiedSession.id,
            verification_type: verifiedSession.type
          }
        });
        
        break;
        
      case 'identity.verification_session.requires_input':
        const failedSession = event.data.object;
        const failedUserId = failedSession.metadata?.user_id;
        
        if (!failedUserId) {
          console.warn('No user ID found in failed verification session metadata');
          break;
        }
        
        console.log(`KYC verification requires input for user: ${failedUserId}`);
        
        // Update user status to declined in Supabase
        const { error: failedUpdateError } = await supabase
          .from('profiles')
          .update({ 
            kyc_status: 'declined',
            updated_at: new Date().toISOString()
          })
          .eq('id', failedUserId);
        
        if (failedUpdateError) {
          console.error('Error updating failed user KYC status:', failedUpdateError);
        } else {
          console.log(`Successfully updated KYC status to declined for user: ${failedUserId}`);
        }
        
        // Log the failed verification event
        await supabase.from('user_activity_logs').insert({
          user_id: failedUserId,
          action: 'KYC_FAILED',
          description: 'KYC verification failed or requires additional input',
          metadata: {
            verification_session_id: failedSession.id,
            verification_type: failedSession.type,
            last_error: failedSession.last_error
          }
        });
        
        break;
        
      case 'identity.verification_session.processing':
        const processingSession = event.data.object;
        const processingUserId = processingSession.metadata?.user_id;
        
        if (processingUserId) {
          console.log(`KYC verification processing for user: ${processingUserId}`);
          
          // Update user status to pending
          await supabase
            .from('profiles')
            .update({ 
              kyc_status: 'pending',
              updated_at: new Date().toISOString()
            })
            .eq('id', processingUserId);
        }
        
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing Stripe Identity webhook:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process webhook" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});