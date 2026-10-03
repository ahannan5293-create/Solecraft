export type PaymentMethod = 'card' | 'cod'
export const ENABLED_PAYMENT_METHODS: readonly PaymentMethod[] = ['cod'] as const
