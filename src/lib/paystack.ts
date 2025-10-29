export interface PaystackConfig {
  email: string;
  amount: number;
  ref: string;
  currency: string;
  metadata: {
    membership_type: string;
    full_name: string;
    phone: string;
    custom_fields: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
}

export const generatePaymentReference = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `GCA-${timestamp}-${random}`;
};

export const initializePaystack = (
  config: PaystackConfig,
  onSuccess: (reference: string) => void,
  onClose: () => void
) => {
  const metaTagKey = (document.querySelector('meta[name="paystack-public-key"]') as HTMLMetaElement)?.content;
  const runtimeKey = (window as any).PAYSTACK_PUBLIC_KEY as string | undefined;
  const envKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined;
  const key = envKey || metaTagKey || runtimeKey || '';

  if (!key) {
    throw new Error('Paystack public key is missing. Set VITE_PAYSTACK_PUBLIC_KEY at build time or provide <meta name="paystack-public-key" content="pk_live_..."> in index.html.');
  }

  const handler = (window as any).PaystackPop.setup({
    key,
    email: config.email,
    amount: config.amount * 100,
    currency: config.currency,
    ref: config.ref,
    metadata: config.metadata,
    callback: (response: any) => {
      onSuccess(response.reference);
    },
    onClose: () => {
      onClose();
    },
  });

  handler.openIframe();
};
