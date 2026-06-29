import { useAppStore } from '../store/app.store';

export const translations = {
  en: {
    // Splash
    splashSubtitle: 'Companionship and Care, Right at Home',
    // Language select
    selectLanguage: 'Please select your language',
    selectLanguageSubtitle: 'Choose your comfortable language which you can understand',
    getStarted: 'Get Started',
    // Onboarding
    skip: 'Skip',
    createAccount: 'Create an account',
    login: 'Log in',
    slide0Title: 'Caring Support for\nEvery Senior, Every Day',
    slide0Desc: 'From companionship to daily assistance, your Saathi is here to make life easier, warmer, and more connected.',
    slide1Title: 'Warm Care,\nSmart Technology',
    slide1Desc: 'Verified Saathi help with errands, visits, and conversations while the app keeps everything organized and effortless.',
    slide2Title: 'Safety You Can Trust',
    slide2Desc: 'Every Saathi is trained and background verified, and every visit is tracked giving seniors comfort and families peace of mind.',
    // Register Flow
    registerTitle: 'Create Account',
    stepProgress: 'Step {step} of {total}',
    next: 'Next',
    back: 'Back',
    submit: 'Submit',
    nameLabel: 'Full Name',
    namePlaceholder: 'Enter your full name',
    ageLabel: 'Age',
    agePlaceholder: 'Enter your age',
    roleLabel: 'I want to...',
    roleSeekerTitle: 'Find a Saathi',
    roleSeekerDesc: 'I am looking for a caregiver/companion for myself or a loved one.',
    roleGiverTitle: 'Become a Saathi',
    roleGiverDesc: 'I want to offer companionship, help, and caregiving services.',
    emailLabel: 'Email Address',
    emailPlaceholder: 'name@example.com',
    phoneLabel: 'Phone Number',
    phonePlaceholder: 'Enter 10-digit number',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Choose a strong password',
    confirmPasswordLabel: 'Confirm Password',
    confirmPasswordPlaceholder: 'Re-enter your password',
    otpTitle: 'Verify phone number',
    otpDesc: 'Enter the 4-digit verification code sent to your phone number. (Use code: 1234)',
    otpError: 'Incorrect code. Please try again or use 1234.',
    summaryTitle: 'Review Registration details',
    summaryDesc: 'Please confirm that the information below is correct before completing your registration.',
    summaryAge: 'Age: {age} years',
    summaryRole: 'Selected Role: {role}',
    summaryEmail: 'Email: {email}',
    summaryPhone: 'Phone: {phone}',
    summaryButton: 'Complete & Go to Dashboard',
    // Home Dashboard
    hello: 'Hello,',
    guestUser: 'Guest User',
    seekerRole: 'Companion Seeker',
    giverRole: 'Companion Giver',
    showcaseTitle: 'Account Showcase Mode',
    showcaseDesc: 'You are currently viewing as a guest. Try completing the Step Registration Flow to set up a full verified profile.',
    activeProfileTitle: 'Profile Active & Verified',
    activeProfileDesc: 'Your profile is successfully registered in ServeSaathi database. You are ready to book companionship visits.',
    quickActions: 'Quick Actions',
    designShowcaseTitle: 'Design Showcase',
    designShowcaseDesc: 'Go back to UI Toolkit',
    registerWizardTitle: 'Step Registration',
    registerWizardDesc: 'Try out the form wizard',
    searchPlaceholder: 'Search categories...',
    noServicesFound: 'No services match your search',
    servicesTitle: 'Explore Companionship Services',
    // Services
    service1Title: 'Elder Companionship',
    service1Desc: 'Friendly home visits, sharing stories, tea, playing board games, and supportive social interaction.',
    service2Title: 'Gentle Walk Assistant',
    service2Desc: 'Accompanying elders on light outdoor walks to neighborhood parks, ensuring safety and fresh air.',
    service3Title: 'Medical Escort',
    service3Desc: 'Accompanying care seekers to doctor appointments, pharmacy pick-ups, and clinic visits.',
    service4Title: 'Meal Sharing & Prep',
    service4Desc: 'Assisting in simple meal preparation, kitchen cleanups, and sharing meals together.',
    service5Title: 'Read Aloud & Chat',
    service5Desc: 'Reading newspapers, novels, books, or emails aloud, accompanied by friendly discussion.',
    service6Title: 'Errands & Shopping',
    service6Desc: 'Helping with groceries, picking up prescriptions, utility payments, and post office errands.',
  },
  hi: {
    // Splash
    splashSubtitle: 'घर पर ही संगति और देखभाल',
    // Language select
    selectLanguage: 'कृपया अपनी भाषा चुनें',
    selectLanguageSubtitle: 'वह भाषा चुनें जिसमें आप सहज हैं और आसानी से समझ सकते हैं',
    getStarted: 'शुरू करें',
    // Onboarding
    skip: 'छोड़ें',
    createAccount: 'खाता बनाएं',
    login: 'लॉग इन करें',
    slide0Title: 'हर वरिष्ठ नागरिक के लिए\nहर दिन स्नेहमयी सहायता',
    slide0Desc: 'साथी से लेकर दैनिक सहायता तक, आपका साथी जीवन को आसान, सुखद और अधिक जुड़ा हुआ बनाने के लिए यहाँ है।',
    slide1Title: 'स्नेहमयी देखभाल,\nस्मार्ट तकनीक',
    slide1Desc: 'सत्यापित साथी काम, मुलाकात और बातचीत में मदद करते हैं, जबकि ऐप सब कुछ व्यवस्थित और सहज रखता है।',
    slide2Title: 'सुरक्षा जिस पर आप भरोसा कर सकें',
    slide2Desc: 'हर साथी प्रशिक्षित और पृष्ठभूमि सत्यापित है, जिससे वरिष्ठ नागरिकों को आराम और परिवारों को मानसिक शांति मिलती है।',
    // Register Flow
    registerTitle: 'खाता बनाएं',
    stepProgress: 'चरण {step} का {total}',
    next: 'आगे बढ़ें',
    back: 'पीछे जाएं',
    submit: 'जमा करें',
    nameLabel: 'पूरा नाम',
    namePlaceholder: 'अपना पूरा नाम दर्ज करें',
    ageLabel: 'आयु',
    agePlaceholder: 'अपनी आयु दर्ज करें',
    roleLabel: 'मैं चाहता हूँ...',
    roleSeekerTitle: 'साथी खोजना',
    roleSeekerDesc: 'मैं अपने या अपने किसी प्रियजन के लिए एक साथी/देखभालकर्ता की तलाश कर रहा हूँ।',
    roleGiverTitle: 'साथी बनना',
    roleGiverDesc: 'मैं दूसरों को साथ, सहायता और देखभाल सेवाएं प्रदान करना चाहता हूँ।',
    emailLabel: 'ईमेल पता',
    emailPlaceholder: 'name@example.com',
    phoneLabel: 'फ़ोन नंबर',
    phonePlaceholder: '10 अंकों का नंबर दर्ज करें',
    passwordLabel: 'पासवर्ड',
    passwordPlaceholder: 'एक मजबूत पासवर्ड चुनें',
    confirmPasswordLabel: 'पासवर्ड की पुष्टि करें',
    confirmPasswordPlaceholder: 'अपना पासवर्ड दोबारा दर्ज करें',
    otpTitle: 'फ़ोन नंबर सत्यापित करें',
    otpDesc: 'आपके फ़ोन नंबर पर भेजा गया 4 अंकों का सत्यापन कोड दर्ज करें। (कोड का उपयोग करें: 1234)',
    otpError: 'गलत कोड। कृपया पुनः प्रयास करें या 1234 का उपयोग करें।',
    summaryTitle: 'पंजीकरण विवरण की समीक्षा करें',
    summaryDesc: 'पंजीकरण पूरा करने से पहले कृपया पुष्टि करें कि नीचे दी गई जानकारी सही है।',
    summaryAge: 'आयु: {age} वर्ष',
    summaryRole: 'चुनी गई भूमिका: {role}',
    summaryEmail: 'ईमेल: {email}',
    summaryPhone: 'फ़ोन: {phone}',
    summaryButton: 'पूरा करें और डैशबोर्ड पर जाएं',
    // Home Dashboard
    hello: 'नमस्ते,',
    guestUser: 'अतिथि उपयोगकर्ता',
    seekerRole: 'साथी खोजक',
    giverRole: 'साथी प्रदाता',
    showcaseTitle: 'अतिथि मोड',
    showcaseDesc: 'आप वर्तमान में एक अतिथि के रूप में देख रहे हैं। एक पूर्ण सत्यापित प्रोफ़ाइल सेट करने के लिए चरण पंजीकरण प्रक्रिया को पूरा करें।',
    activeProfileTitle: 'प्रोफ़ाइल सक्रिय और सत्यापित',
    activeProfileDesc: 'आपकी प्रोफ़ाइल सर्वसाथी डेटाबेस में सफलतापूर्वक पंजीकृत है। आप बुकिंग के लिए तैयार हैं।',
    quickActions: 'त्वरित कार्रवाई',
    designShowcaseTitle: 'डिज़ाइन शोकेस',
    designShowcaseDesc: 'यूआई टूलकिट पर वापस जाएं',
    registerWizardTitle: 'चरण पंजीकरण',
    registerWizardDesc: 'पंजीकरण फ़ॉर्म विज़ार्ड चलाएं',
    searchPlaceholder: 'श्रेणियाँ खोजें...',
    noServicesFound: 'आपकी खोज से कोई सेवा मेल नहीं खाती',
    servicesTitle: 'देखभाल और सहायता सेवाओं का अन्वेषण करें',
    // Services
    service1Title: 'वरिष्ठ नागरिक संगति',
    service1Desc: 'घर पर सुखद मुलाकात, कहानियाँ साझा करना, चाय पीना, खेल खेलना और सामाजिक संपर्क।',
    service2Title: 'टहलने में सहायता',
    service2Desc: 'सुरक्षा और ताजी हवा सुनिश्चित करने के लिए पड़ोस के पार्कों में हल्की सैर पर वरिष्ठ नागरिकों के साथ जाना।',
    service3Title: 'चिकित्सा अनुरक्षक',
    service3Desc: 'डॉक्टर के पास जाने, फार्मेसी से दवा लेने और क्लिनिक जाने के दौरान साथ रहना।',
    service4Title: 'भोजन तैयार करना और साझा करना',
    service4Desc: 'साधारण भोजन तैयार करने, रसोई की सफाई और एक साथ भोजन साझा करने में सहायता करना।',
    service5Title: 'पढ़ना और बातचीत',
    service5Desc: 'अखबार, किताबें या ईमेल पढ़कर सुनाना और उनके साथ बातचीत करना।',
    service6Title: 'खरीदारी और फुटकर काम',
    service6Desc: 'किराना सामान लाने, दवाइयाँ लेने, बिल भुगतान और डाकघर के कामों में मदद करना।',
  },
} as const;

export type TranslationKeys = keyof typeof translations['en'];

export const useTranslation = () => {
  const language = useAppStore((state) => state.language);
  
  const t = (key: TranslationKeys, params?: Record<string, string | number>) => {
    const langDict = translations[language] || translations['en'];
    let text: string = langDict[key] || translations['en'][key] || '';
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return text;
  };

  return { t, language };
};
