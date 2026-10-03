/**
 * RedactionService
 * Redacts direct candidate identifiers before sending data to external AI providers per SECURITY.md §11.
 */
export class RedactionService {
  private static readonly EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  private static readonly PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]*)?(?:\(?\d{2,4}\)?[-.\s]*)?\d{3,4}[-.\s]*\d{3,4}\b/g;
  private static readonly URL_REGEX = /https?:\/\/[^\s]+/g;

  /**
   * Redacts sensitive PII from text before passing to LLM.
   */
  static redact(text: string): string {
    if (!text) return '';

    return text
      .replace(this.EMAIL_REGEX, '[REDACTED_EMAIL]')
      .replace(this.PHONE_REGEX, '[REDACTED_PHONE]')
      .replace(this.URL_REGEX, '[REDACTED_URL]');
  }
}
