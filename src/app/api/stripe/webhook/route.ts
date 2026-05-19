import { NextResponse } from "next/server";
import Stripe from "stripe";
import { activateCreditsAfterPayment } from "@/actions/workflow";

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe non configuré" }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey);
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature Stripe manquante" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook invalide" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid" || session.mode === "subscription") {
      await activateCreditsAfterPayment(
        session.id,
        typeof session.payment_intent === "string" ? session.payment_intent : undefined,
        typeof session.subscription === "string" ? session.subscription : undefined
      );
    }
  }

  return NextResponse.json({ received: true });
}
