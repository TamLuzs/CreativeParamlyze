export const PLATFORM_DOCS = {
  flashtalking: "https://support.flashtalking.com/hc/en-us/articles/360050098933-Limitations-and-Allowed-Values#VideoAssetGuidelines",
  dv360: "https://support.google.com/displayvideo/answer/7160689?hl=en", // exemplo
  cm360: "https://support.google.com/campaignmanager/answer/6095317?hl=en", // exemplo
  amazon: "https://advertising.amazon.com/en/help/GYV2F5U3BVDTEW2V", // exemplo
  iab: "https://www.iab.com/guidelines/digital-video-ad-serving-template-vast/", // exemplo
  programmatic: "https://www.iab.com/guidelines/digital-audio-ad-serving-template-daaST/", // exemplo
};

export function getPlatformLink(platform) {
  return PLATFORM_DOCS[platform] || "#";
}
