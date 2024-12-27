import Stripe from 'stripe';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any,
});

async function createProducts() {
  try {
    // Create Pro Product
    const proProduct = await stripe.products.create({
      name: "Pro Plan",
      description: "For growing families - Up to 15 family members, advanced features, and priority support",
      default_price_data: {
        currency: "usd",
        unit_amount: 999, // $9.99
        recurring: {
          interval: "month",
        },
      },
      metadata: {
        features: JSON.stringify([
          "Up to 15 family members",
          "Advanced event planning",
          "Unlimited photo storage",
          "Recipe collections",
          "Family games & activities",
          "Priority support",
        ]),
      },
    });

    // Create Enterprise Product
    const enterpriseProduct = await stripe.products.create({
      name: "Enterprise Plan",
      description: "For large family networks - Unlimited members, multiple groups, and dedicated support",
      default_price_data: {
        currency: "usd",
        unit_amount: 1999, // $19.99
        recurring: {
          interval: "month",
        },
      },
      metadata: {
        features: JSON.stringify([
          "Unlimited family members",
          "Multiple family groups",
          "Advanced analytics",
          "Custom branding",
          "API access",
          "24/7 dedicated support",
        ]),
      },
    });

    console.log("Products and prices created successfully!");
    console.log("Pro Plan Price ID:", (proProduct.default_price as string));
    console.log("Enterprise Plan Price ID:", (enterpriseProduct.default_price as string));
  } catch (error) {
    console.error("Error creating products:", error);
  }
}

createProducts(); 