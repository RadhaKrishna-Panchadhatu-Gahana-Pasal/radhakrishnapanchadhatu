export function buildWhatsAppUrl(whatsappDigits: string, message: string): string {
  const cleaned = whatsappDigits.replace(/[^\d]/g, '');
  const number = cleaned.startsWith('977') ? cleaned : `977${cleaned}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function buildProductWhatsAppUrl(params: {
  whatsappDigits: string;
  productName: string;
  sku: string;
  productUrl: string;
  variantLabel?: string;
  quantity?: number;
  intent?: 'ask' | 'order';
}): string {
  const lines = [
    params.intent === 'order'
      ? `Namaste! I would like to order this jewellery piece:`
      : `Namaste! I have a question about this jewellery piece:`,
    `Product: ${params.productName}`,
    `SKU: ${params.sku}`,
    params.variantLabel ? `Variant: ${params.variantLabel}` : null,
    params.quantity ? `Quantity: ${params.quantity}` : null,
    `Link: ${params.productUrl}`,
  ].filter(Boolean);

  return buildWhatsAppUrl(params.whatsappDigits, lines.join('\n'));
}

export function buildCustomOrderWhatsAppUrl(params: {
  whatsappDigits: string;
  referenceCode: string;
  customerName: string;
  preferredMaterial: string;
  description: string;
}): string {
  const message = [
    `Namaste! I submitted a custom jewellery design request.`,
    `Reference ID: ${params.referenceCode}`,
    `Name: ${params.customerName}`,
    `Preferred Material: ${params.preferredMaterial}`,
    `Design Note: ${params.description}`,
  ].join('\n');

  return buildWhatsAppUrl(params.whatsappDigits, message);
}
