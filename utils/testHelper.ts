export class TestHelper {
  /**
   * Generates a random alphanumeric string
   */
  static getRandomString(length: number = 6): string {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  /**
   * Generates a unique test email
   */
  static getRandomEmail(): string {
    const timestamp = Date.now();
    return `qa.user.${timestamp}@billetix-qa.com`;
  }

  /**
   * Generates a fake Algerian phone number
   */
  static getRandomAlgerianPhone(): string {
    const suffix = Math.floor(1000000 + Math.random() * 9000000);
    return `+2135${suffix}`;
  }

  /**
   * Generates a random passport number
   */
  static getRandomPassportNumber(): string {
    const num = Math.floor(100000000 + Math.random() * 900000000);
    return `${num}`;
  }
}
