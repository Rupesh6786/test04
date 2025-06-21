
// src/types/razorpay.d.ts

interface RazorpayOptions {
  key: string;
  amount: number; // Amount in the smallest currency unit (e.g., paise for INR)
  currency: string;
  name: string;
  description?: string;
  image?: string; // URL of your logo
  order_id?: string; // Required for server-to-server flow, optional for client-side if amount is passed
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, any>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    confirm_close?: boolean;
    animation?: boolean;
  };
  retry?: {
    enabled: boolean;
    max_count: number;
  }
  timeout?: number; // in seconds
  [key: string]: any; // For any other options
}

interface RazorpayInstance {
  open(): void;
  on(event: string, callback: (...args: any[]) => void): void;
  // Add other methods if needed, e.g., close()
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

// Export an empty object to make it a module, otherwise it's treated as a script
export {};
