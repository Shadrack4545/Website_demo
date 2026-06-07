/**
 * RegisterForm Component
 * Handles user registration
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useContext';
import { AFRICAN_COUNTRIES } from '../../utils/africanCountries';
import { SECURITY_QUESTIONS } from '../../utils/securityQuestions';

export default function RegisterForm() {
  const { register } = useAuth();
  const { t } = useTranslation();
  // const { addMember } = useMembers(); // TODO: Implement member registration
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    program: '',
    securityQuestion: '',
    securityAnswer: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const programs = ["Bachelor's", "Master's", 'PhD', 'Diploma'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (
        !formData.name ||
        !formData.email ||
        !formData.password ||
        !formData.country ||
        !formData.program ||
        !formData.securityQuestion ||
        !formData.securityAnswer
      ) {
        throw new Error('Please fill in all fields');
      }

      if (!formData.email.includes('@')) {
        throw new Error('Please enter a valid email');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.country,
        formData.program,
        formData.securityQuestion,
        formData.securityAnswer
      );
      
      // After successful registration, create member record
      // The member record will be created with the user's ID
      // For now, we'll do this in the member context
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">{t('auth.register')}</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="name" className="form-label">
          {t('auth.name')}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="input-field"
          placeholder="John Doe"
          disabled={loading}
        />
      </div>

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

      <div className="mb-4">
        <label htmlFor="country" className="form-label">
          {t('auth.country')}
        </label>
        <select
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          className="input-field"
          disabled={loading}
        >
          <option value="">{t('auth.selectCountry')}</option>
          {AFRICAN_COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="program" className="form-label">
          {t('auth.program')}
        </label>
        <select
          id="program"
          name="program"
          value={formData.program}
          onChange={handleChange}
          className="input-field"
          disabled={loading}
        >
          <option value="">{t('auth.selectProgram')}</option>
          {programs.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="securityQuestion" className="form-label">
          {t('auth.securityQuestion')}
        </label>
        <select
          id="securityQuestion"
          name="securityQuestion"
          value={formData.securityQuestion}
          onChange={handleChange}
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
        <label htmlFor="securityAnswer" className="form-label">
          {t('auth.securityAnswer')}
        </label>
        <input
          type="text"
          id="securityAnswer"
          name="securityAnswer"
          value={formData.securityAnswer}
          onChange={handleChange}
          className="input-field"
          placeholder={t('auth.securityAnswerPlaceholder')}
          disabled={loading}
        />
      </div>

      <div className="mb-4">
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

      <div className="mb-6">
        <label htmlFor="confirmPassword" className="form-label">
          {t('auth.confirmPassword')}
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="input-field"
          placeholder="••••••••"
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? t('auth.loading') : t('auth.registerButton')}
      </button>
    </form>
  );
}