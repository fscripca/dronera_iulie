import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'npm:stripe@13.2.0';

// Get environment variables
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const frontendUrl = Deno.env.get("FRONTEND_URL") || "http://localhost:5173";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
    // Get Stripe secret key from environment variables
    if (!stripeSecretKey) {
      console.error("Missing STRIPE_SECRET_KEY environment variable");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });

    console.log("Creating checkout session with frontend URL:", frontendUrl);

    // Parse request body
    const { user_id, price_id, quantity = 1 } = await req.json();

    // Validate required fields
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // For testing, create a price if none is provided
    let priceId = price_id;
    if (!priceId) {
      console.log("No price_id provided, creating a test price");
      // Create a test price (75,000 EUR = 7,500,000 cents)
      const price = await stripe.prices.create({
        unit_amount: 7500000,
        currency: 'eur',
        product_data: {
          name: 'DRONE Token Investment',
        },
      });
      priceId = price.id;
      console.log(`Created test price: ${priceId}`);
    }

    // Create checkout session
    console.log("Creating Stripe checkout session for user:", user_id);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      mode: 'payment',
      success_url: `${frontendUrl}/dashboard?success=true`,
      cancel_url: `${frontendUrl}/dashboard?canceled=true`,
      metadata: {
        user_id: user_id,
      },
    });

    console.log("Checkout session created successfully:", {
      sessionId: session.id,
      url: session.url
    });

    // Return checkout URL
    return new Response(
      JSON.stringify({ 
        success: true, 
        checkoutUrl: session.url,
        sessionId: session.id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error.message, error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to create checkout session",
        details: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});