export function generateUserId(role: string): string {
  const prefix = role.toLowerCase().replace('_', '-');
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `usr-${prefix}-${timestamp}-${random}`;
}

export function generatePetId(): string {
  return `pet-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function generateBookingId(): string {
  return `bk-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function generateBookingRef(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `ZB-${randomNum}`;
}

export function generatePaymentId(): string {
  return `pay-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function generateTransactionId(): string {
  return `txn-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function generateInvoiceNumber(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `INV-ZB-${randomNum}`;
}

export function generateEventId(): string {
  return `event-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function generateVanJobId(): string {
  return `vjob-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function generateAdoptionAnimalId(): string {
  return `adopt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function generateApplicationId(): string {
  return `app-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function generateNotificationId(): string {
  return `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function generateProviderId(): string {
  return `prov-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
