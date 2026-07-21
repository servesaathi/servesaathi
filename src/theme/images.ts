// Only assets actually referenced in the app — unlisted assets are not bundled.
// (leaf_background*.png are watermarked Unsplash+ previews: never re-add them.)
export const images = {
  cloudBlob: require('../../assets/cloudblob.png'),
  onboarding1: require('../../assets/onboarding_1.png'),
  onboarding2: require('../../assets/onboarding_2.png'),
  onboarding3: require('../../assets/onboarding_3.png'),
  languageSelectIllustrator: require('../../assets/language_selector_illustrator.png'),
  permissionBlob: require('../../assets/illustrations/permission_blob.png'),
  settingUpScribble: require('../../assets/illustrations/settingup_scribble.png'),
  homeInfoBg: require('../../assets/home-info-bg.png'),
};

export type Images = typeof images;
