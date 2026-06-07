import React from 'react';
import featureImportance from '../../data/mlFeatureImportance.json';
import modelMeta from '../../../ml_backend/model_metadata.json';

export default function ModelInfoPanel() {
  const features = Object.entries(featureImportance).sort((a: any, b: any) => b[1] - a[1]);
  const metrics = modelMeta.validation_metrics;

  return (
    <aside className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h3 className="text-lg font-semibold mb-2">Model & Explainability</h3>
      <p className="text-sm text-slate-600 mb-3">Model version: <strong>{modelMeta.model_version}</strong> — trained on <strong>{modelMeta.training_samples}</strong> samples</p>

      <div className="mb-3">
        <h4 className="text-sm font-medium">Validation Metrics</h4>
        <div className="text-sm text-slate-700">
          <div>Accuracy: <strong>{(metrics.accuracy * 100).toFixed(1)}%</strong></div>
          <div>Precision: <strong>{(metrics.precision * 100).toFixed(1)}%</strong></div>
          <div>Recall: <strong>{(metrics.recall * 100).toFixed(1)}%</strong></div>
          <div>F1: <strong>{(metrics.f1_score * 100).toFixed(1)}%</strong></div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Top Features</h4>
        <div className="space-y-2">
          {features.slice(0, 6).map(([name, weight]: any) => (
            <div key={name} className="flex items-center gap-3">
              <div className="w-36 text-xs text-slate-600">{name.replace(/_/g, ' ')}</div>
              <div className="flex-1 h-3 bg-slate-100 rounded overflow-hidden">
                <div style={{ width: `${Math.round((weight as number) * 100)}%` }} className="h-3 bg-primary-600" />
              </div>
              <div className="w-12 text-right text-xs text-slate-700">{(weight as number).toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
