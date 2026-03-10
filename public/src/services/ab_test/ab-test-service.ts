import { LocalStorageService } from '../local-storage-service';
import { ABTestNames, AB_TEST_VALUES } from './ab-test-values';

export class AbTestService {
  private static DEFAULT_EXPIRATION_HOURS = 24;

  public static get<T>(testName: ABTestNames): T {
    const config = AB_TEST_VALUES[testName];
    const storedValue = LocalStorageService.get(testName);

    if (storedValue !== null) {
      return storedValue as T;
    }

    const randomValue =
      config.values[Math.floor(Math.random() * config.values.length)];
    const expirationHours =
      config.expirationHours ?? this.DEFAULT_EXPIRATION_HOURS;

    LocalStorageService.set(testName, randomValue, expirationHours);
    return randomValue;
  }

  // Convenience method for string-based tests
  public static getString(testName: ABTestNames): string {
    return this.get<string>(testName);
  }
}
