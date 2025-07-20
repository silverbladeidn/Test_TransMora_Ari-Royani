import { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    // Initialize with saved language or default to 'en'
    const [language, setLanguage] = useState(() => {
        const savedLanguage = localStorage.getItem('language');
        return savedLanguage || 'en';
    });

    // Save language to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'id' : 'en');
    };

    // Alternative: direct language setter for more control
    const setLanguageDirectly = (lang) => {
        if (lang === 'en' || lang === 'id') {
            setLanguage(lang);
        }
    };

    return (
        <LanguageContext.Provider value={{
            language,
            toggleLanguage,
            setLanguage: setLanguageDirectly
        }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}