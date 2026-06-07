/**
 * LoginForm Component
 * Handles user login
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useContext';
import { SECURITY_QUESTIONS } from '../../utils/securityQuestions';

export default function LoginForm() {
  const { login, recoverAccount } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [recoveryData, setRecoveryData] = useState({
    name: '',
    country: '',
    program: '',
    securityQuestion: '',
    securityAnswer: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRecoveryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRecoveryData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!formData.email || !formData.password) {
        throw new Error(t('auth.fillAllFields'));
      }

      if (!formData.email.includes('@')) {
        throw new Error(t('auth.validEmail'));
      }

      await login(formData.email, formData.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (
        !recoveryData.name ||
        !recoveryData.country ||
        !recoveryData.program ||
        !recoveryData.securityQuestion ||
        !recoveryData.securityAnswer ||
        !recoveryData.newPassword
      ) {
        throw new Error(t('auth.fillAllRecoveryFields'));
      }

      if (recoveryData.newPassword.length < 6) {
        throw new Error(t('auth.passwordTooShort'));
      }

      if (recoveryData.newPassword !== recoveryData.confirmPassword) {
        throw new Error(t('auth.passwordsDoNotMatch'));
      }

      const result = await recoverAccount({
        name: recoveryData.name,
        country: recoveryData.country,
        program: recoveryData.program,
        securityQuestion: recoveryData.securityQuestion,
        securityAnswer: recoveryData.securityAnswer,
        newPassword: recoveryData.newPassword,
      });

      setSuccess(`${t('auth.accountFound')} ${result.email}. ${t('auth.passwordReset')}`);
      setIsRecovering(false);
      setFormData((prev) => ({ ...prev, email: result.email, password: '' }));
      setRecoveryData({
        name: '',
        country: '',
        program: '',
        securityQuestion: '',
        securityAnswer: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.accountRecoveryFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={isRecovering ? handleRecoverySubmit : handleSubmit}>
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">
        {isRecovering ? t('auth.recoverAccount') : t('auth.login')}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      {isRecovering ? (
        <>
          <div className="mb-4">
            <label htmlFor="name" className="form-label">{t('auth.fullName')}</label>
            <input
              type="text"
              id="name"
              name="name"
              value={recoveryData.name}
              onChange={handleRecoveryChange}
              className="input-field"
              placeholder="John Doe"
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="country" className="form-label">{t('auth.country')}</label>
            <input
              type="text"
              id="country"
              name="country"
              value={recoveryData.country}
              onChange={handleRecoveryChange}
              className="input-field"
              placeholder="Ghana"
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="program" className="form-label">{t('auth.program')}</label>
            <input
              type="text"
              id="program"
              name="program"
              value={recoveryData.program}
              onChange={handleRecoveryChange}
              className="input-field"
              placeholder="Master's"
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="securityQuestion" className="form-label">{t('auth.securityQuestion')}</label>
            <select
              id="securityQuestion"
              name="securityQuestion"
              value={recoveryData.securityQuestion}
              onChange={(e) => {
                const { name, value } = e.target;
                setRecoveryData((prev) => ({ ...prev, [name]: value }));
              }}
              className="input-field"
              disabled={loading}
            >
              <option value="">{t('auth.selectSecurityQuestion')}</option>
              {SECURITY_QUESTIONS.map((question) => (
                <option key={question} value={question}>
                  {question}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="securityAnswer" className="form-label">{t('auth.securityAnswer')}</label>
            <input
              type="text"
              id="securityAnswer"
              name="securityAnswer"
              value={recoveryData.securityAnswer}
              onChange={handleRecoveryChange}
              className="input-field"
              placeholder={t('auth.yourAnswer')}
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="newPassword" className="form-label">{t('auth.newPassword')}</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={recoveryData.newPassword}
              onChange={handleRecoveryChange}
              className="input-field"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="form-label">{t('auth.confirmNewPassword')}</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={recoveryData.confirmPassword}
              onChange={handleRecoveryChange}
              className="input-field"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
        </>
      ) : (
        <>
          <div className="mb-4">
            <label htmlFor="email" className="form-label">
              {t('auth.email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="form-label">
              {t('auth.password')}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? t('auth.loading') : isRecovering ? t('auth.recoverAccount') : t('auth.loginButton')}
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => {
          setIsRecovering((prev) => !prev);
          setError('');
          setSuccess('');
        }}
        className="mt-3 w-full text-sm text-primary-700 hover:text-primary-800"
      >
        {isRecovering ? t('auth.backToSignIn') : t('auth.forgotPassword')}
      </button>
    </form>
  );
}