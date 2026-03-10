export enum ABTestNames {
  MAIN_HERO_CTA_MESSAGE = 'main_hero_cta_message',
  LANDING_FOOTER_CTA_MESSAGE = 'landing_footer_cta_message',
  LANDING_GALLERY_CTA_MESSAGE = 'landing_gallery_cta_message',
}

interface ABTestValue<T> {
  values: T[];
  expirationHours?: number;
}

type ABTestConfig = {
  [K in ABTestNames]: ABTestValue<any>;
};

export const AB_TEST_VALUES: ABTestConfig = {
  [ABTestNames.MAIN_HERO_CTA_MESSAGE]: {
    values: [],
    expirationHours: 24,
  },
  [ABTestNames.LANDING_FOOTER_CTA_MESSAGE]: {
    values: [],
    expirationHours: 24,
  },
  [ABTestNames.LANDING_GALLERY_CTA_MESSAGE]: {
    values: [],
    expirationHours: 24,
  },
};
