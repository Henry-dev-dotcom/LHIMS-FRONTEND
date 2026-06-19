export const PRICE_VISIBLE_ROLES = ['admin', 'billing', 'receptionist'];

export function canViewPrices(role) {
  return PRICE_VISIBLE_ROLES.includes(role);
}
