/**
 * Stripe Integration Skeleton
 *
 * To activate payments:
 * 1. Create a Stripe account at https://stripe.com
 * 2. Add VITE_STRIPE_PUBLISHABLE_KEY to .env
 * 3. Add STRIPE_SECRET_KEY to Supabase secrets
 * 4. Deploy the stripe-webhook Supabase Edge Function
 */

export interface StripeConfig {
  publishableKey: string;
  priceId?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: "BRL" | "USD";
  interval: "month" | "year";
  features: string[];
  stripePriceId?: string;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Gr\u00e1tis",
    price: 0,
    currency: "BRL",
    interval: "month",
    features: [
      "Link na bio ilimitados",
      "At\u00e9 5 produtos",
      "Temas b\u00e1sicos",
      "Analytics b\u00e1sico",
      "Marca d'\u00e1gua Maview",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 19.9,
    currency: "BRL",
    interval: "month",
    features: [
      "Tudo do Gr\u00e1tis",
      "Produtos ilimitados",
      "40+ efeitos animados",
      "Dom\u00ednio personalizado",
      "Analytics avan\u00e7ado",
      "Sem marca d'\u00e1gua",
      "Suporte priorit\u00e1rio",
    ],
    stripePriceId: undefined, // Set when Stripe is configured
  },
  {
    id: "business",
    name: "Business",
    price: 49.9,
    currency: "BRL",
    interval: "month",
    features: [
      "Tudo do Pro",
      "Automa\u00e7\u00f5es ilimitadas",
      "Equipe (at\u00e9 5 membros)",
      "API access",
      "White-label",
      "Relat\u00f3rios export\u00e1veis",
    ],
    stripePriceId: undefined,
  },
];

export function isStripeConfigured(): boolean {
  return !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
}

export async function createCheckoutSession(_planId: string): Promise<string | null> {
  if (!isStripeConfigured()) {
    console.warn("[Stripe] Not configured. Set VITE_STRIPE_PUBLISHABLE_KEY in .env");
    return null;
  }

  // TODO: Call Supabase Edge Function to create Stripe checkout session
  // const { data, error } = await supabase.functions.invoke('create-checkout', {
  //   body: { planId, successUrl: window.location.origin + '/dashboard?upgraded=true', cancelUrl: window.location.href }
  // });
  // return data?.url || null;

  return null;
}
