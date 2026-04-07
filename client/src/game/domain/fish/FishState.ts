/**
 * Fish state as a const object — replaces enum for erasableSyntaxOnly compatibility.
 * Using string union type instead of TypeScript enum (which is not erasable).
 */
export const FishState = {
  Idle: 'Idle',
  Interested: 'Interested',
  Biting: 'Biting',
  Hooked: 'Hooked',
  Escaping: 'Escaping',
} as const;
