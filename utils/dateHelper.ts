export class DateHelper {
  /**
   * Returns a formatted date string for `daysAhead` from today
   * format: YYYY-MM-DD
   */
  static getFutureDateISO(daysAhead: number = 7): string {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  }

  /**
   * Returns day of the month as a string (e.g., '15' or '5')
   */
  static getFutureDay(daysAhead: number = 7): string {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.getDate().toString();
  }

  /**
   * Formats a date into Algerian / French standard (DD/MM/YYYY)
   */
  static getFormattedDate(daysAhead: number = 7): string {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
