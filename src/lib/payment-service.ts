// Payment Service for Stripe integration
import { loadStripe, Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';

export interface PaymentConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  currency: string;
  country: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  client_secret: string;
  metadata?: Record<string, string>;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  billing_details: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  };
}

export interface ConsultationPayment {
  consultationId: string;
  patientId: string;
  doctorId: string;
  amount: number;
  currency: string;
  description: string;
  metadata: {
    patientName: string;
    doctorName: string;
    consultationType: 'video' | 'in-person' | 'phone';
    duration: number; // in minutes
  };
}

export interface PharmacyOrderPayment {
  orderId: string;
  patientId: string;
  pharmacyId: string;
  amount: number;
  currency: string;
  description: string;
  metadata: {
    patientName: string;
    pharmacyName: string;
    itemCount: number;
    deliveryAddress: string;
  };
}

export interface RefundRequest {
  paymentIntentId: string;
  amount?: number; // Partial refund if specified
  reason: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  metadata?: Record<string, string>;
}

class PaymentService {
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private config: PaymentConfig;
  private isInitialized: boolean = false;

  constructor() {
    this.config = {
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      currency: 'usd',
      country: 'US'
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.stripe = await loadStripe(this.config.publishableKey);
      if (!this.stripe) {
        throw new Error('Failed to load Stripe');
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      throw error;
    }
  }

  async createPaymentIntent(
    amount: number,
    currency: string = this.config.currency,
    metadata?: Record<string, string>
  ): Promise<PaymentIntent> {
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          metadata
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create payment intent: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async createConsultationPayment(payment: ConsultationPayment): Promise<PaymentIntent> {
    const metadata = {
      type: 'consultation',
      consultationId: payment.consultationId,
      patientId: payment.patientId,
      doctorId: payment.doctorId,
      patientName: payment.metadata.patientName,
      doctorName: payment.metadata.doctorName,
      consultationType: payment.metadata.consultationType,
      duration: payment.metadata.duration.toString()
    };

    return await this.createPaymentIntent(
      payment.amount,
      payment.currency,
      metadata
    );
  }

  async createPharmacyOrderPayment(payment: PharmacyOrderPayment): Promise<PaymentIntent> {
    const metadata = {
      type: 'pharmacy_order',
      orderId: payment.orderId,
      patientId: payment.patientId,
      pharmacyId: payment.pharmacyId,
      patientName: payment.metadata.patientName,
      pharmacyName: payment.metadata.pharmacyName,
      itemCount: payment.metadata.itemCount.toString(),
      deliveryAddress: payment.metadata.deliveryAddress
    };

    return await this.createPaymentIntent(
      payment.amount,
      payment.currency,
      metadata
    );
  }

  async createElements(clientSecret: string, appearance?: any): Promise<StripeElements> {
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    this.elements = this.stripe.elements({
      clientSecret,
      appearance: appearance || {
        theme: 'stripe',
        variables: {
          colorPrimary: '#3b82f6',
          colorBackground: '#ffffff',
          colorText: '#30313d',
          colorDanger: '#df1b41',
          fontFamily: 'system-ui, sans-serif',
          spacingUnit: '4px',
          borderRadius: '8px',
        }
      }
    });

    return this.elements;
  }

  async confirmPayment(
    elements: StripeElements,
    paymentElement: StripePaymentElement,
    returnUrl?: string
  ): Promise<{ error?: any; paymentIntent?: any }> {
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    try {
      const { error, paymentIntent } = await this.stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl || `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required'
      });

      return { error, paymentIntent };
    } catch (error) {
      console.error('Error confirming payment:', error);
      return { error };
    }
  }

  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(`/api/payments/methods?customerId=${customerId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get payment methods: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw error;
    }
  }

  async createCustomer(email: string, name?: string, phone?: string): Promise<string> {
    try {
      const response = await fetch('/api/payments/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          phone
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create customer: ${response.statusText}`);
      }

      const { customerId } = await response.json();
      return customerId;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  async createSetupIntent(customerId: string): Promise<string> {
    try {
      const response = await fetch('/api/payments/setup-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId })
      });

      if (!response.ok) {
        throw new Error(`Failed to create setup intent: ${response.statusText}`);
      }

      const { clientSecret } = await response.json();
      return clientSecret;
    } catch (error) {
      console.error('Error creating setup intent:', error);
      throw error;
    }
  }

  async refundPayment(refund: RefundRequest): Promise<{ id: string; status: string }> {
    try {
      const response = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(refund)
      });

      if (!response.ok) {
        throw new Error(`Failed to process refund: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  async getPaymentHistory(customerId: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await fetch(`/api/payments/history?customerId=${customerId}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get payment history: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw error;
    }
  }

  async verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
    try {
      const response = await fetch('/api/payments/verify-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload,
          signature
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  // Utility methods
  formatAmount(amount: number, currency: string = this.config.currency): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  }

  formatAmountFromCents(amountInCents: number, currency: string = this.config.currency): string {
    return this.formatAmount(amountInCents / 100, currency);
  }

  getSupportedCurrencies(): string[] {
    return ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy', 'inr'];
  }

  isCurrencySupported(currency: string): boolean {
    return this.getSupportedCurrencies().includes(currency.toLowerCase());
  }

  // Validation methods
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  validateAmount(amount: number): boolean {
    return amount > 0 && amount <= 999999.99;
  }

  // Error handling
  getErrorMessage(error: any): string {
    if (error.type === 'card_error') {
      return error.message || 'Your card was declined.';
    } else if (error.type === 'validation_error') {
      return error.message || 'Invalid payment information.';
    } else if (error.type === 'api_error') {
      return 'Payment service temporarily unavailable. Please try again.';
    } else {
      return 'An unexpected error occurred. Please try again.';
    }
  }

  // Cleanup
  destroy(): void {
    if (this.elements) {
      this.elements = null;
    }
    this.stripe = null;
    this.isInitialized = false;
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;

