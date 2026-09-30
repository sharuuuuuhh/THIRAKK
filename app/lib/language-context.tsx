'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type Language = 'en' | 'ml'

interface Translations {
  [key: string]: {
    en: string
    ml: string
  }
}

export const TRANSLATIONS: Translations = {
  appName: {
    en: 'Thirakku',
    ml: 'തിരക്ക്',
  },
  appTagline: {
    en: 'Passenger-Powered Train Crowd Map for Kerala',
    ml: 'കേരളത്തിലെ ട്രെയിനുകളിലെ ജനറൽ കോച്ച് തിരക്ക് അറിയാനുള്ള കൂട്ടായ്മ',
  },
  seatsFree: {
    en: 'Seats free',
    ml: 'സീറ്റ് ലഭ്യമാണ്',
  },
  standing: {
    en: 'Standing',
    ml: 'നിൽക്കാൻ സ്ഥലമുണ്ട്',
  },
  packed: {
    en: 'Packed',
    ml: 'കടുത്ത തിരക്ക്',
  },
  couldNotBoard: {
    en: "Couldn't board",
    ml: 'കയറാൻ കഴിഞ്ഞില്ല',
  },
  noData: {
    en: 'No recent reports',
    ml: 'സമീപകാല റിപ്പോർട്ടുകളില്ല',
  },
  seeCrowd: {
    en: 'See crowd',
    ml: 'തിരക്ക് കാണുക',
  },
  reportCrowding: {
    en: 'Report crowding',
    ml: 'തിരക്ക് രേഖപ്പെടുത്തുക',
  },
  whereGoing: {
    en: 'Where are you going?',
    ml: 'നിങ്ങൾ എങ്ങോട്ടാണ് പോകുന്നത്?',
  },
  betterOption: {
    en: 'Better option',
    ml: 'മെച്ചപ്പെട്ട ട്രെയിൻ',
  },
  demandCoaches: {
    en: 'Demand more coaches',
    ml: 'കൂടുതൽ കോച്ചുകൾ ആവശ്യപ്പെടുക',
  },
}

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('en')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('thirakku_lang') as Language
      if (saved && (saved === 'en' || saved === 'ml')) {
        setLang(saved)
      }
    } catch (e) {}
  }, [])

  const handleSetLang = (l: Language) => {
    setLang(l)
    try {
      localStorage.setItem('thirakku_lang', l)
    } catch (e) {}
  }

  const t = (key: string): string => {
    if (TRANSLATIONS[key]) {
      return TRANSLATIONS[key][lang]
    }
    return key
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
