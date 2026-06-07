import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SinglePrediction } from '@/types/predictor';
import { getModelFeatureImportance } from '@/utils/mlapi';
import { ML_FEATURE_NAMES } from '@/utils/mlFeatures';
import bundledImportance from '@/data/mlFeatureImportance.json';

interface FeatureImportanceProps {
  predictions: SinglePrediction[];
  eventId: string;
}

interface Feature {
  name: string;
  importance: number;
  description: string;
  category: 'student' | 'event';
}

const FEATURE_META: Record<string, { description: string; category: 'student' | 'event' }> = {
  previous_attendance_rate: {
    description: 'How often the student attended past events',
    category: 'student',
  },
  academic_load: {
    description: 'Student course load (normalized 1–6)',
    category: 'student',
  },
  has_incentive: {
    description: 'Whether food, snacks, or prizes are offered',
    category: 'event',
  },
  event_type_encoded: {
    description: 'Category: cultural, community, entertainment, etc.',
    category: 'event',
  },
  rsvp_status_encoded: {
    description: 'Student RSVP: attending, maybe, or not attending',
    category: 'event',
  },
  lead_time_days: {
    description: 'Days between announcement and event date',
    category: 'event',
  },
  day_of_week: {
    description: 'Day the event is scheduled',
    category: 'event',
  },
  is_evening_event: {
    description: 'Whether the event starts at 18:00 or later',
    category: 'event',
  },
};

const FeatureImportance: React.FC<FeatureImportanceProps> = () => {
  const { t } = useTranslation();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'api' | 'bundled'>('bundled');

  useEffect(() => {
    loadFeatureImportance();
  }, []);

  const loadFeatureImportance = async () => {
    setLoading(true);
    try {
      const response = await getModelFeatureImportance();
      const importanceMap = response.features ?? response;
      if (importanceMap && typeof importanceMap === 'object') {
        const parsed: Feature[] = Object.entries(importanceMap as Record<string, number>)
          .map(([name, importance]) => ({
            name,
            importance,
            description: FEATURE_META[name]?.description ?? name,
            category: FEATURE_META[name]?.category ?? 'event',
          }))
          .sort((a, b) => b.importance - a.importance);
        setFeatures(parsed);
        setSource('api');
        setLoading(false);
        return;
      }
    } catch {
      // fall through to bundled data
    }

    const parsed: Feature[] = Object.entries(bundledImportance as Record<string, number>)
      .map(([name, importance]) => ({
        name,
        importance,
        description: FEATURE_META[name]?.description ?? name,
        category: FEATURE_META[name]?.category ?? 'event',
      }))
      .sort((a, b) => b.importance - a.importance);
    setFeatures(parsed);
    setSource('bundled');
    setLoading(false);
  };

  const getImportanceColor = (importance: number): string => {
    if (importance >= 0.2) return 'bg-red-500';
    if (importance >= 0.1) return 'bg-orange-500';
    if (importance >= 0.05) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getCategoryColor = (category: string): string => {
    return category === 'student' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  const maxImportance = Math.max(...features.map((f) => f.importance), 0.001);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">
          {t('eventPredictor:howItWorks', { defaultValue: 'How the XGBoost Model Works' })}
        </h4>
        <p className="text-sm text-blue-800">
          The model uses {ML_FEATURE_NAMES.length} engineered features trained on real AASV RSVP data.
          RSVP status is the strongest signal — students who say &quot;attending&quot; are far more likely to show up.
        </p>
        {source === 'bundled' && (
          <p className="text-xs text-blue-700 mt-2">
            Showing bundled feature weights (start ML server for live model data).
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            {t('eventPredictor:featureImportance', { defaultValue: 'Feature Importance' })}
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {features.map((feature) => (
              <div key={feature.name} className="p-6 hover:bg-slate-50">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {feature.name.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-sm text-slate-600 mt-1">{feature.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(feature.category)}`}>
                    {feature.category}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getImportanceColor(feature.importance)}`}
                      style={{ width: `${(feature.importance / maxImportance) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-900 w-14 text-right">
                    {(feature.importance * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h4 className="font-semibold text-slate-900 mb-2">Model Information</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-600">Algorithm</p>
            <p className="font-semibold text-slate-900">XGBoost</p>
          </div>
          <div>
            <p className="text-slate-600">Input Features</p>
            <p className="font-semibold text-slate-900">{ML_FEATURE_NAMES.length}</p>
          </div>
          <div>
            <p className="text-slate-600">Accuracy</p>
            <p className="font-semibold text-slate-900">83.3%</p>
          </div>
          <div>
            <p className="text-slate-600">ROC-AUC</p>
            <p className="font-semibold text-slate-900">96.1%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureImportance;
