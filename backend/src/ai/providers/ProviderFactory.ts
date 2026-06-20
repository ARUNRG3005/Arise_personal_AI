import { AIProvider } from './AIProvider';
import { GroqProvider } from './GroqProvider';
import { env } from '../../config/env';

export class ProviderFactory {
  private static providerInstance: AIProvider | null = null;

  static getProvider(): AIProvider {
    if (this.providerInstance) {
      return this.providerInstance;
    }

    switch (env.AI_PROVIDER) {
      case 'groq':
      default:
        this.providerInstance = new GroqProvider();
        break;
    }

    return this.providerInstance;
  }
}
