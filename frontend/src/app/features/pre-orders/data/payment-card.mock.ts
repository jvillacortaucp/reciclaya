export interface MockPaymentCard {
  readonly id: string;
  readonly holderName: string;
  readonly cardNumber: string;
  readonly expiryDate: string;
  readonly cvv: string;
  readonly brand: 'visa' | 'mastercard' | 'amex' | 'generic';
  readonly lastFour: string;
}

export const MOCK_PAYMENT_CARD: MockPaymentCard = {
  id: 'mock-card-001',
  holderName: 'Juan Villacorta',
  cardNumber: '4242 4242 4242 4242',
  expiryDate: '12/28',
  cvv: '123',
  brand: 'visa',
  lastFour: '4242'
};
