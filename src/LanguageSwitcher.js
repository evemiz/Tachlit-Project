// src/components/LanguageSwitcher.js

import {React} from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className='lang'>
      {currentLanguage === 'en' ? (
        <button onClick={() => changeLanguage('he')}>HE</button>
      ) : (
        <button onClick={() => changeLanguage('en')}>EN</button>
      )}
    </div>
  );
}

export default LanguageSwitcher;
