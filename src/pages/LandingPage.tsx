import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEvents, useDirectory } from '../hooks/useContext';
import ThemeToggle from '../components/shared/ThemeToggle';

interface LandingPageProps {
  onLoginClick: () => void;
}

export default function LandingPage({ onLoginClick }: LandingPageProps) {
  const { i18n, t } = useTranslation();
  const { events } = useEvents();
  const { members } = useDirectory();
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'leadership'>('overview');

  // Get upcoming events only
  const upcomingEvents = events.filter((e) => e.status === 'upcoming').slice(0, 5);

  // Get leaders from directory
  const leaders = members.filter((m) => m.verificationStatus === 'verified').slice(0, 6);

  return (
    <div className="min-h-screen page-gradient transition-colors">
      {/* Navigation Bar */}
      <nav className="bg-primary-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src={new URL('../assets/icon.jpg', import.meta.url).href}
              alt="AASV Logo" 
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold">AASV</h1>
              <p className="text-sm text-primary-200">Association Of African Students In Vladivostok</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle variant="landing" />
            {/* Language Switcher */}
            <button
              onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ru' : 'en')}
              className="px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 transition-colors text-sm"
            >
              {i18n.language === 'en' ? '🇷🇺 Русский' : '🇬🇧 English'}
            </button>

            {/* Login Button */}
            <button
              onClick={onLoginClick}
              className="px-4 py-2 rounded-lg bg-white text-primary-700 font-semibold hover:bg-gray-100 transition-colors"
            >
              {t('auth.loginButton')} / {t('auth.registerButton')}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-purple-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-4">
            {i18n.language === 'en'
              ? 'Welcome to AASV'
              : 'Добро пожаловать в AASV'}
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            {i18n.language === 'en'
              ? 'Association Of African Students In Vladivostok'
              : 'Ассоциация африканских студентов во Владивостоке'}
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-12">
            <div className="bg-white bg-opacity-20 rounded-lg p-6">
              <div className="text-3xl font-bold">{members.filter(m => m.verificationStatus === 'verified').length}</div>
              <div className="text-primary-100">
                {i18n.language === 'en' ? 'Active Members' : 'Активные члены'}
              </div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-6">
              <div className="text-3xl font-bold">{upcomingEvents.length}</div>
              <div className="text-primary-100">
                {i18n.language === 'en' ? 'Upcoming Events' : 'Предстоящие события'}
              </div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-6">
              <img 
                src={new URL('../assets/icon.jpg', import.meta.url).href}
                alt="AASV Logo" 
                className="w-12 h-12 rounded-full object-cover mx-auto"
              />
              <div className="text-primary-100 mt-2">
                {i18n.language === 'en' ? 'Global Community' : 'Глобальное сообщество'}
              </div>
            </div>
          </div>

          <button
            onClick={onLoginClick}
            className="mt-10 px-8 py-3 bg-white text-primary-600 font-bold rounded-lg hover:bg-gray-100 transition-colors inline-block"
          >
            {i18n.language === 'en' ? '→ Join Us' : '→ Присоединитесь к нам'}
          </button>
        </div>
      </section>

      {/* AASV Branding Section */}
      <section className="bg-white py-12 px-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="bg-primary-50 rounded-lg p-8 shadow-md">
                <img 
                  src={new URL('../assets/icon.jpg', import.meta.url).href}
                  alt="AASV Logo" 
                  className="w-64 h-64 object-cover rounded-lg shadow-lg"
                />
              </div>
            </div>
            
            {/* About AASV */}
            <div className="space-y-6">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {i18n.language === 'en' ? 'About AASV' : 'О AASV'}
                </h3>
                <div className="w-16 h-1 bg-primary-600 rounded"></div>
              </div>
              
              <p className="text-gray-700 leading-relaxed text-lg">
                {i18n.language === 'en'
                  ? 'The Association Of African Students In Vladivostok (AASV) is a vibrant community dedicated to supporting African students across all universities in Vladivostok.'
                  : 'Ассоциация африканских студентов во Владивостоке (AASV) - это динамичное сообщество, посвящённое поддержке африканских студентов всех университетов Владивостока.'}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">🤝</div>
                  <p className="text-sm font-semibold text-gray-800 mt-2">
                    {i18n.language === 'en' ? 'Unity & Support' : 'Единство и поддержка'}
                  </p>
                </div>
                <div className="bg-primary-50 p-4 rounded-lg">
                  <img 
                    src={new URL('../assets/icon.jpg', import.meta.url).href}
                    alt="AASV Logo" 
                    className="w-8 h-8 rounded-full object-cover mx-auto"
                  />
                  <p className="text-sm font-semibold text-gray-800 mt-2">
                    {i18n.language === 'en' ? 'Cultural Exchange' : 'Культурный обмен'}
                  </p>
                </div>
                <div className="bg-primary-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">🎓</div>
                  <p className="text-sm font-semibold text-gray-800 mt-2">
                    {i18n.language === 'en' ? 'Academic Growth' : 'Академический рост'}
                  </p>
                </div>
                <div className="bg-primary-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">🎉</div>
                  <p className="text-sm font-semibold text-gray-800 mt-2">
                    {i18n.language === 'en' ? 'Community Events' : 'Общественные события'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 border-b border-gray-300 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            {i18n.language === 'en' ? 'About Us' : 'О нас'}
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'events'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            {i18n.language === 'en' ? 'Upcoming Events' : 'Предстоящие события'}
          </button>
          <button
            onClick={() => setActiveTab('leadership')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'leadership'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            {i18n.language === 'en' ? 'Leadership' : 'Руководство'}
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <section className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-8 shadow-md">
                <h3 className="text-2xl font-bold text-primary-700 mb-4">
                  {i18n.language === 'en' ? 'Our Mission' : 'Наша миссия'}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {i18n.language === 'en'
                    ? 'To create a supportive community for African students across all universities in Vladivostok, fostering academic excellence, cultural exchange, and mutual support.'
                    : 'Создание благоприятного сообщества для африканских студентов всех университетов Владивостока, способствующего академическому совершенству, культурному обмену и взаимной поддержке.'}
                </p>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-md">
                <h3 className="text-2xl font-bold text-primary-700 mb-4">
                  {i18n.language === 'en' ? 'What We Do' : 'Что мы делаем'}
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ {i18n.language === 'en' ? 'Organize social and academic events' : 'Организовываем социальные и учебные мероприятия'}</li>
                  <li>✓ {i18n.language === 'en' ? 'Share resources and information' : 'Делимся ресурсами и информацией'}</li>
                  <li>✓ {i18n.language === 'en' ? 'Connect African students globally' : 'Объединяем африканских студентов'}</li>
                  <li>✓ {i18n.language === 'en' ? 'Provide peer support' : 'Предоставляем поддержку между членами'}</li>
                </ul>
              </div>
            </div>

            <div className="bg-primary-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-primary-700 mb-4">
                {i18n.language === 'en' ? 'Why Join?' : 'Почему присоединиться?'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">👥</div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    {i18n.language === 'en' ? 'Community' : 'Сообщество'}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {i18n.language === 'en'
                      ? 'Connect with peers who understand your experience'
                      : 'Общайтесь с людьми, которые понимают ваш опыт'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">📚</div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    {i18n.language === 'en' ? 'Resources' : 'Ресурсы'}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {i18n.language === 'en'
                      ? 'Access shared materials and study resources'
                      : 'Доступ к общим материалам и учебным ресурсам'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">📅</div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    {i18n.language === 'en' ? 'Events' : 'События'}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {i18n.language === 'en'
                      ? 'Stay informed about community activities'
                      : 'Будьте в курсе деятельности сообщества'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <section className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800">
              {i18n.language === 'en' ? 'Upcoming Events' : 'Предстоящие события'}
            </h3>

            {upcomingEvents.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center text-gray-500">
                <p className="text-lg">
                  {i18n.language === 'en' ? 'No upcoming events' : 'Нет предстоящих событий'}
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="bg-white rounded-lg p-6 shadow-md border-l-4 border-primary-600">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <h4 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h4>
                        <p className="text-gray-600">{event.description}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          {i18n.language === 'en' ? 'Date' : 'Дата'}
                        </p>
                        <p className="font-semibold text-gray-800">{event.date}</p>
                        <p className="text-sm text-gray-600">{event.time}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          {i18n.language === 'en' ? 'Location' : 'Место'}
                        </p>
                        <p className="font-semibold text-gray-800">{event.location}</p>
                        <p className="text-sm text-gray-600 mt-2">
                          👥 {Object.keys(event.rsvps).length}/{event.capacity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-primary-50 rounded-lg p-6 text-center">
              <p className="text-gray-700 mb-4">
                {i18n.language === 'en'
                  ? 'Want to participate in our events?'
                  : 'Хотите участвовать в наших событиях?'}
              </p>
              <button
                onClick={onLoginClick}
                className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                {i18n.language === 'en' ? 'Login to RSVP' : 'Войдите, чтобы ответить'}
              </button>
            </div>
          </section>
        )}

        {/* Leadership Tab */}
        {activeTab === 'leadership' && (
          <section className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800">
              {t('admin.leadershipTeamTitle')}
            </h3>

            {leaders.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center text-gray-500">
                <p className="text-lg">
                  {t('admin.leadershipTeamComingSoon')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {leaders.map((member) => (
                  <div key={member.id} className="bg-white rounded-lg p-6 shadow-md text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-purple-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800">{member.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{member.program}</p>
                    <p className="text-sm text-primary-600">{member.country}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2026 AASV - Association Of African Students In Vladivostok. {i18n.language === 'en' ? 'All rights reserved.' : 'Все права защищены.'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {i18n.language === 'en'
              ? 'United Community for African Students'
              : 'Объединённое сообщество африканских студентов'}
          </p>
        </div>
      </footer>
    </div>
  );
}
