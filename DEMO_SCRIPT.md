DEMO SCRIPT — Event Attendance Predictor

Purpose
- Quick reproducible steps to run the demo (seed data, call ML predictor, inspect explainability).

URLs
- Frontend (deployed): https://website-frontend-demo.onrender.com
- Backend (deployed): https://website-backend-demo.onrender.com

Quick Steps (1–2 minutes)
1. Visit the deployed frontend URL.
2. Admin → Seed Data → click **Populate Test Events** (or **Demo Events Ready** if already seeded).
3. Go to **Predictions** in the left sidebar.
4. Select an event (e.g., "African Day Celebration - 6/15/2026").
5. Wait for predictions to load — view the predictions table, model explainability (Feature Importance), and analytics tab.

Commands (for local verification / backups)
- Check backend health:
  ```powershell
  Invoke-RestMethod -Uri 'https://website-backend-demo.onrender.com/api/health' -Method GET
  ```
- Get model info (copy the JSON output below into your report or appendix):
  ```powershell
  Invoke-RestMethod -Uri 'https://website-backend-demo.onrender.com/api/model_info' -Method GET | ConvertTo-Json -Depth 10
  ```

Captured `/api/model_info` (live sample)
---MODEL_INFO_START---
{
    "cross_validation_scores":  {
                                    "mean_accuracy":  0.907843137254902,
                                    "std_accuracy":  0.028668904835897145
                                },
    "hyperparameters":  {
                            "learning_rate":  0.1,
                            "max_depth":  5,
                            "n_estimators":  100,
                            "objective":  "binary:logistic"
                        },
    "model_version":  "1.0",
    "test_samples":  18,
    "trained_at":  "2026-06-06T13:37:50.700678",
    "training_samples":  87,
    "validation_metrics":  {
                               "accuracy":  0.8333333333333334,
                               "confusion_matrix":  {
                                                        "false_negatives":  1,
                                                        "false_positives":  2,
                                                        "true_negatives":  5,
                                                        "true_positives":  10
                                                    },
                               "f1_score":  0.8695652173913043,
                               "precision":  0.8333333333333334,
                               "recall":  0.9090909090909091,
                               "roc_auc":  0.961038961038961
                           }
}
---MODEL_INFO_END---

Sample `/api/batch_predict` request (used for testing)
```json
{
  "event_id": "event-1",
  "predictions": [
    { "student_id": "S001", "features": [0.85,0.83,1.0,0.0,0.0,0.2,0.0,0.0] },
    { "student_id": "S006", "features": [0.8,0.33,0.0,0.0,0.0,0.1,0.0,1.0] }
  ]
}
```

Captured `/api/batch_predict` (live sample)
---BATCH_PREDICT_START---
{
    "average_probability":  0.982,
    "event_id":  "event-1",
    "predicted_attendance_rate":  100.0,
    "predicted_attendees":  2,
    "predictions":  [
                        {
                            "attendance_probability":  0.9816505908966064,
                            "confidence":  "very_high",
                            "event_id":  "event-1",
                            "no_attendance_probability":  0.018349409103393555,
                            "predicted_attendance":  1,
                            "student_id":  "S001"
                        },
                        {
                            "attendance_probability":  0.9816505908966064,
                            "confidence":  "very_high",
                            "event_id":  "event-1",
                            "no_attendance_probability":  0.018349409103393555,
                            "predicted_attendance":  1,
                            "student_id":  "S006"
                        }
                    ],
    "total_students":  2
}
---BATCH_PREDICT_END---

Notes & Troubleshooting
- If the frontend shows old UI (offline banner / no predictions), do a hard refresh (Ctrl+F5) or open in Incognito.
- If predictions fail with CORS errors, ensure the backend is deployed with CORS enabled and `VITE_ML_API_URL` is set correctly (include `/api` if needed) in the frontend runtime environment.
- For reproducible screenshots, capture the Predictions table, Feature Importance panel, and the `/api/model_info` JSON snippet.

Saved by: automated demo script generator
