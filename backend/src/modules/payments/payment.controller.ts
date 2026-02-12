import type { Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "./stripe.js";
import { env } from "../../common/config/env.js";
import { bookingService } from "../bookings/booking.service.js";

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    res.status(400).send("Webhook Secret or Signature missing");
    return;
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook Error: ${message}`);
    res.status(400).send(`Webhook Error: ${message}`);
    return;
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    console.log(`Payment succeeded for PI: ${paymentIntent.id}`);

    try {
      await bookingService.fulfillPayment(paymentIntent);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`Fulfillment Error: ${message}`);
    }
  }

  res.json({ received: true });
};
