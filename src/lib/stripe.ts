"use server"

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Stripe from "stripe";

export async function getStripeClient() {
  // you could even await here if you needed to, e.g. for fetching a secret
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-05-28.basil", // make sure this is a valid version
  });
  return stripe;
}

export async function createCheckoutSession(credits: number) {
    const stripe = await getStripeClient();
    const {userId} = await auth();
    if(!userId){
        throw new Error("Unauthorized");
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: `${credits} RepoGPT Credits`,
                    },
                    unit_amount: Math.round((credits / 50) * 100),
                },
                quantity: 1,
            },
        ],
        customer_creation: "always",
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/create`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
        client_reference_id: userId.toString(),
        metadata: {
            credits
        }
    });

    return redirect(session.url!);
}