/**
 * AuthPages - Authentication UI
 * Shows login/register forms
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoginForm from '../components/auth/LoginForm.tsx';
import RegisterForm from '../components/auth/RegisterForm.tsx';
import LanguageSwitcher from '../components/shared/LanguageSwitcher.tsx';
import ThemeToggle from '../components/shared/ThemeToggle';

export default function AuthPages() {
  const [isLogin, setIsLogin] = useState(true);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center p-4">
      {/* Language Switcher - Top Right */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <ThemeToggle variant="landing" />
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{t('app.title')}</h1>
          <p className="text-primary-100">{t('app.subtitle')}</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 border border-transparent dark:border-gray-700">
          {isLogin ? (
            <>
              <LoginForm />
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  {t('auth.noAccount')}{' '}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-primary-600 font-medium hover:text-primary-700"
                  >
                    {t('auth.toggleToRegister')}
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              <RegisterForm />
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  {t('auth.haveAccount')}{' '}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-primary-600 font-medium hover:text-primary-700"
                  >
                    {t('auth.toggleToLogin')}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}