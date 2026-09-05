export interface BotProtectionResult {
  success: boolean;
  reason?: string;
}

export interface BotProtectionProvider {
  verify(token: string | null | undefined): Promise<BotProtectionResult>;
}

/**
 * Uses a visually hidden form field as a lightweight bot signal. A legitimate
 * browser leaves the field empty; any value indicates an automated submission.
 */
export class HoneypotProvider implements BotProtectionProvider {
  async verify(token: string | null | undefined): Promise<BotProtectionResult> {
    if (token?.trim()) {
      return { success: false, reason: "Automated form submission detected." };
    }

    return { success: true };
  }
}

/** Explicit development-only provider for local workflows without a bot service. */
export class DevBypassProvider implements BotProtectionProvider {
  async verify(token: string | null | undefined): Promise<BotProtectionResult> {
    void token;
    return { success: true };
  }
}
