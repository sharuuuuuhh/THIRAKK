'use client'

import React, { createContext, useContext, useEffect, useSyncExternalStore } from 'react'

export type Language = 'en' | 'ml'

const translations = {
  appName: { en: 'Thirakku', ml: 'തിരക്ക്' },
  appTagline: { en: 'Passenger-powered train crowd map for Kerala', ml: 'കേരളത്തിലെ ട്രെയിനുകളിലെ തിരക്ക് യാത്രക്കാർക്ക് അറിയാം' },
  liveMap: { en: 'Live map', ml: 'തത്സമയ മാപ്പ്' },
  betterOption: { en: 'Find a train', ml: 'ട്രെയിൻ കണ്ടെത്തുക' },
  impact: { en: 'Impact', ml: 'സ്വാധീനം' },
  signIn: { en: 'Sign in', ml: 'സൈൻ ഇൻ' },
  forgotPassword: { en: 'Forgot password?', ml: 'പാസ്‌വേഡ് മറന്നോ?' },
  resetPassword: { en: 'Reset your password', ml: 'പാസ്‌വേഡ് പുനഃസജ്ജമാക്കുക' },
  resetLinkExpired: { en: 'This reset link is invalid or has expired.', ml: 'ഈ റീസെറ്റ് ലിങ്ക് അസാധുവാണ് അല്ലെങ്കിൽ കാലഹരണപ്പെട്ടു.' },
  requestAnotherResetLink: { en: 'Request another reset link', ml: 'പുതിയ റീസെറ്റ് ലിങ്ക് ആവശ്യപ്പെടുക' },
  resetPasswordHelp: { en: 'Enter your account email and we’ll send a secure reset link.', ml: 'അക്കൗണ്ട് ഇമെയിൽ നൽകുക. സുരക്ഷിതമായ പുനഃസജ്ജീകരണ ലിങ്ക് അയയ്ക്കും.' },
  emailAddress: { en: 'Email address', ml: 'ഇമെയിൽ വിലാസം' },
  sendResetLink: { en: 'Send reset link', ml: 'റീസെറ്റ് ലിങ്ക് അയയ്ക്കുക' },
  sendingLink: { en: 'Sending link…', ml: 'ലിങ്ക് അയയ്ക്കുന്നു…' },
  resetLinkSent: { en: 'If an account exists for that email, a password reset link is on its way.', ml: 'ഈ ഇമെയിലിൽ അക്കൗണ്ട് ഉണ്ടെങ്കിൽ പാസ്‌വേഡ് പുനഃസജ്ജീകരണ ലിങ്ക് അയച്ചിട്ടുണ്ട്.' },
  backToSignIn: { en: 'Back to sign in', ml: 'സൈൻ ഇൻ പേജിലേക്ക് മടങ്ങുക' },
  chooseNewPassword: { en: 'Choose a new password', ml: 'പുതിയ പാസ്‌വേഡ് തിരഞ്ഞെടുക്കുക' },
  newPasswordHelp: { en: 'Use at least 8 characters. You’ll sign in again after the password is changed.', ml: 'കുറഞ്ഞത് 8 അക്ഷരങ്ങൾ ഉപയോഗിക്കുക. പാസ്‌വേഡ് മാറ്റിയ ശേഷം വീണ്ടും സൈൻ ഇൻ ചെയ്യണം.' },
  newPassword: { en: 'New password', ml: 'പുതിയ പാസ്‌വേഡ്' },
  confirmNewPassword: { en: 'Confirm new password', ml: 'പുതിയ പാസ്‌വേഡ് സ്ഥിരീകരിക്കുക' },
  updatePassword: { en: 'Update password', ml: 'പാസ്‌വേഡ് പുതുക്കുക' },
  updatingPassword: { en: 'Updating password…', ml: 'പാസ്‌വേഡ് പുതുക്കുന്നു…' },
  passwordsDoNotMatch: { en: 'Passwords do not match.', ml: 'പാസ്‌വേഡുകൾ പൊരുത്തപ്പെടുന്നില്ല.' },
  passwordResetComplete: { en: 'Password updated. Sign in with your new password.', ml: 'പാസ്‌വേഡ് പുതുക്കി. പുതിയ പാസ്‌വേഡ് ഉപയോഗിച്ച് സൈൻ ഇൻ ചെയ്യുക.' },
  signOut: { en: 'Sign out', ml: 'സൈൻ ഔട്ട്' },
  language: { en: 'മലയാളം', ml: 'English' },
  routeEyebrow: { en: 'Kerala commuter routes', ml: 'കേരളത്തിലെ യാത്രാ റൂട്ടുകൾ' },
  homeTitle: { en: 'Check the crowd before you travel', ml: 'യാത്രയ്ക്ക് മുമ്പ് തിരക്ക് അറിയൂ' },
  homeDescription: { en: 'Choose your stations to see passenger reports along the route.', ml: 'റൂട്ടിലെ യാത്രക്കാരുടെ റിപ്പോർട്ടുകൾ കാണാൻ സ്റ്റേഷനുകൾ തിരഞ്ഞെടുക്കുക.' },
  from: { en: 'From', ml: 'എവിടെ നിന്ന്' },
  to: { en: 'To', ml: 'എവിടേക്ക്' },
  searchStation: { en: 'Search station', ml: 'സ്റ്റേഷൻ തിരയുക' },
  swapStations: { en: 'Swap stations', ml: 'സ്റ്റേഷനുകൾ മാറ്റുക' },
  popularRoutes: { en: 'Popular routes', ml: 'ജനപ്രിയ റൂട്ടുകൾ' },
  routeKannurCalicut: { en: 'Kannur to Kozhikode', ml: 'കണ്ണൂർ മുതൽ കോഴിക്കോട് വരെ' },
  routeThrissurErnakulam: { en: 'Thrissur to Ernakulam', ml: 'തൃശൂർ മുതൽ എറണാകുളം വരെ' },
  routeTrivandrumKollam: { en: 'Thiruvananthapuram to Kollam', ml: 'തിരുവനന്തപുരം മുതൽ കൊല്ലം വരെ' },
  routeShoranurPalakkad: { en: 'Shoranur to Palakkad', ml: 'ഷൊർണൂർ മുതൽ പാലക്കാട് വരെ' },
  train: { en: 'Train', ml: 'ട്രെയിൻ' },
  crowdByStretch: { en: 'Crowd level by stretch', ml: 'ഓരോ ഭാഗത്തെയും തിരക്ക്' },
  chooseTime: { en: 'Choose report time', ml: 'സമയം തിരഞ്ഞെടുക്കുക' },
  now: { en: 'Now', ml: 'ഇപ്പോൾ' },
  inTwoHours: { en: 'In 2 hours', ml: '2 മണിക്കൂറിനകം' },
  tomorrow: { en: 'Tomorrow', ml: 'നാളെ' },
  loadingMap: { en: 'Loading route map', ml: 'റൂട്ട് മാപ്പ് ലോഡ് ചെയ്യുന്നു' },
  mapAria: { en: 'Map showing crowd levels between stations', ml: 'സ്റ്റേഷനുകൾക്കിടയിലെ തിരക്ക് കാണിക്കുന്ന മാപ്പ്' },
  selectRouteHint: { en: 'Select two stations on a seeded corridor to see its route.', ml: 'റൂട്ട് കാണാൻ സാമ്പിൾ പാതയിലെ രണ്ട് സ്റ്റേഷനുകൾ തിരഞ്ഞെടുക്കുക.' },
  seatsFree: { en: 'Seats free', ml: 'സീറ്റ് ലഭ്യമാണ്' },
  standing: { en: 'Standing', ml: 'നിൽക്കാൻ സ്ഥലമുണ്ട്' },
  packed: { en: 'Packed', ml: 'കടുത്ത തിരക്ക്' },
  couldNotBoard: { en: 'Could not board', ml: 'കയറാൻ കഴിഞ്ഞില്ല' },
  noData: { en: 'No data', ml: 'വിവരങ്ങളില്ല' },
  mapLegend: { en: 'Crowd map legend', ml: 'തിരക്ക് മാപ്പിന്റെ സൂചിക' },
  routeSegments: { en: 'Route stretches', ml: 'റൂട്ട് ഭാഗങ്ങൾ' },
  selectStretch: { en: 'Select a line on the map to see its details.', ml: 'വിവരങ്ങൾ കാണാൻ മാപ്പിലെ ഒരു ഭാഗം തിരഞ്ഞെടുക്കുക.' },
  noForecast: { en: 'No forecast data', ml: 'പ്രവചന വിവരങ്ങളില്ല' },
  noForecastStretch: { en: 'There is no forecast for this stretch yet.', ml: 'ഈ ഭാഗത്തിന് പ്രവചനം ലഭ്യമല്ല.' },
  sampleReports: { en: 'sample reports', ml: 'സാമ്പിൾ റിപ്പോർട്ടുകൾ' },
  passengerReports: { en: 'passenger reports', ml: 'യാത്രക്കാരുടെ റിപ്പോർട്ടുകൾ' },
  confidence: { en: 'confidence', ml: 'വിശ്വാസനില' },
  high: { en: 'high confidence', ml: 'ഉയർന്ന വിശ്വാസനില' },
  medium: { en: 'medium confidence', ml: 'ഇടത്തരം വിശ്വാസനില' },
  low: { en: 'low confidence', ml: 'കുറഞ്ഞ വിശ്വാസനില' },
  none: { en: 'not rated', ml: 'വിലയിരുത്തിയിട്ടില്ല' },
  mostCrowdedStretch: { en: 'Most crowded reported stretch', ml: 'ഏറ്റവും തിരക്കേറിയതായി റിപ്പോർട്ട് ചെയ്ത ഭാഗം' },
  noRecentReports: { en: 'No recent reports', ml: 'സമീപകാല റിപ്പോർട്ടുകളില്ല' },
  forecastUnavailable: { en: 'Forecasts are not available in this prototype yet.', ml: 'ഈ മാതൃകയിൽ പ്രവചനങ്ങൾ ഇപ്പോൾ ലഭ്യമല്ല.' },
  reportCount: { en: 'stretches', ml: 'ഭാഗങ്ങൾ' },
  reportCrowding: { en: 'Report crowding', ml: 'തിരക്ക് രേഖപ്പെടുത്തുക' },
  noSampleTrain: { en: 'No sample train on this route', ml: 'ഈ റൂട്ടിൽ സാമ്പിൾ ട്രെയിൻ ഇല്ല' },
  sampleDataNotice: { en: 'This map may include illustrative sample reports. Live passenger reports are unverified and may not reflect conditions across the whole train.', ml: 'ഈ മാപ്പിൽ മാതൃകയ്ക്കായുള്ള സാമ്പിൾ റിപ്പോർട്ടുകൾ ഉണ്ടായേക്കാം. തത്സമയ യാത്രക്കാരുടെ റിപ്പോർട്ടുകൾ സ്ഥിരീകരിച്ചിട്ടില്ല; മുഴുവൻ ട്രെയിനിലെ അവസ്ഥ അവ പ്രതിനിധീകരിക്കണമെന്നില്ല.' },
  findLessCrowded: { en: 'Find a less crowded train', ml: 'തിരക്ക് കുറഞ്ഞ ട്രെയിൻ കണ്ടെത്തുക' },
  askMoreCoaches: { en: 'Ask for more coaches', ml: 'കൂടുതൽ കോച്ചുകൾ ആവശ്യപ്പെടുക' },
  privacy: { en: 'Privacy', ml: 'സ്വകാര്യത' },
  terms: { en: 'Terms', ml: 'നിബന്ധനകൾ' },
  volunteer: { en: 'Volunteer', ml: 'സന്നദ്ധസേവനം' },
  footerCopy: { en: 'Passenger-powered crowd reports for Kerala trains.', ml: 'കേരളത്തിലെ ട്രെയിൻ തിരക്ക് യാത്രക്കാർ രേഖപ്പെടുത്തുന്നു.' },
  petition: { en: 'Petitions', ml: 'നിവേദനങ്ങൾ' },
  signInRequired: { en: 'Sign in required', ml: 'സൈൻ ഇൻ ആവശ്യമാണ്' },
  signInDescription: { en: 'Sign in to submit crowd reports and volunteer logs.', ml: 'തിരക്ക് റിപ്പോർട്ടുകളും സന്നദ്ധസേവന രേഖകളും സമർപ്പിക്കാൻ സൈൻ ഇൻ ചെയ്യുക.' },
  backToMap: { en: 'Back to live map', ml: 'മാപ്പിലേക്ക് മടങ്ങുക' },
  checkingSession: { en: 'Checking your session', ml: 'നിങ്ങളുടെ സെഷൻ പരിശോധിക്കുന്നു' },
  openNavigation: { en: 'Open navigation', ml: 'നാവിഗേഷൻ തുറക്കുക' },
  closeNavigation: { en: 'Close navigation', ml: 'നാവിഗേഷൻ അടയ്ക്കുക' },
  loadingAccount: { en: 'Loading account', ml: 'അക്കൗണ്ട് ലോഡ് ചെയ്യുന്നു' },
} as const

type TranslationKey = keyof typeof translations

function readLanguage(): Language {
  try {
    return localStorage.getItem('thirakku_lang') === 'ml' ? 'ml' : 'en'
  } catch {
    return 'en'
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener('thirakku-language-change', onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener('thirakku-language-change', onChange)
    window.removeEventListener('storage', onChange)
  }
}

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => translations[key].en,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore<Language>(subscribe, readLanguage, () => 'en')

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = (nextLanguage: Language) => {
    try {
      localStorage.setItem('thirakku_lang', nextLanguage)
    } catch {
      // Keep the current session language even when storage is unavailable.
    }
    window.dispatchEvent(new Event('thirakku-language-change'))
  }

  const t = (key: TranslationKey) => translations[key][lang]

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  return useContext(LanguageContext)
}
