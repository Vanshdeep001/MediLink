import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_testing', {
  apiVersion: '2025-08-27.basil',
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Get payment intents for customer
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customerId,
      limit: Math.min(limit, 100), // Max 100
    });

    const formattedHistory = paymentIntents.data.map(intent => ({
      id: intent.id,
      amount: intent.amount,
      currency: intent.currency,
      status: intent.status,
      created: intent.created,
      description: intent.description,
      metadata: intent.metadata,
    }));

    return NextResponse.json(formattedHistory);

  } catch (error) {
    console.error('Error getting payment history:', error);
    return NextResponse.json(
      { error: 'Failed to get payment history' },
      { status: 500 }
    );
  }
}

