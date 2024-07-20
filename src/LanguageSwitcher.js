// src/components/LanguageSwitcher.js

import {React , useState} from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [direction, setDirection] = useState(i18n.dir()); // 'ltr' or 'rtl'

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setDirection(i18n.dir());
  };

  return (
    <div className={direction}>
      <div className='lang'>
        <button onClick={() => changeLanguage('en')}>English</button>
        <button onClick={() => changeLanguage('he')}>עברית</button>
      </div>
    </div>
  );
}

export default LanguageSwitcher;
