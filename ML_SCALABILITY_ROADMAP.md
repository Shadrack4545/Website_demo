# Scalability & Growth Roadmap for Event Attendance Predictor

**Purpose:** Ensure ML system grows with association without major rewrites
**Audience:** Technical leadership, long-term planning
**Scope:** From 50 students → 500 → 5,000+
**Updated:** June 2, 2026

---

## 📈 Growth Stages

### Stage 1: MVP Phase (Current - 50-100 Active Students)
**Timeline:** Now through September 2026
**Events per month:** 4-6
**Data points:** ~300 training records

**Architecture:**
```
Frontend (React) → Vite dev server
                ↓
Backend (TBD: Flask/FastAPI on local/shared server)
                ↓
Storage: JSON files / SQLite (src/ml/data/)
                ↓
Model: Single XGBoost model, trained monthly
```

**Scalability Characteristics:**
✓ Can handle: Single event prediction in <50ms
✓ Can handle: Batch of 100 students in <1s
✓ Cannot handle yet: 1000+ concurrent predictions
✓ Limitation: Single model, no versioning yet

**Focus:** Prove concept works, get real data, iterate quickly

---

### Stage 2: Growth Phase (Q4 2026 - 200-500 Students)
**Timeline:** October 2026 - January 2027
**Events per month:** 10-15
**Data points:** ~2,000-5,000 training records

**Architecture Changes Needed:**
```
Frontend (React) → Vite + CDN for static assets
                ↓
Load Balancer
                ↓
Backend (Containerized Flask/FastAPI)
    - 2-4 instances for redundancy
    - Shared database (PostgreSQL)
    - Model files on shared storage (S3-compatible)
                ↓
PostgreSQL Database (training data, predictions, evaluations)
    - Automated backups
    - Index optimization
                ↓
Redis Cache (prediction cache, feature cache)
    - Reduces database load
    - Sub-millisecond lookups
                ↓
Message Queue (Celery/Bull for async retraining)
    - Don't block API while retraining
    - Schedule monthly training jobs
```

**Code Changes:**
```typescript
// Move from: src/ml/data/*.json
// Move to: PostgreSQL + Redis

// Before: Synchronous prediction
const prediction = await predictor.predictAttendance(features);

// After: Fast return from cache, async update if needed
const prediction = await getCachedOrComputePrediction(features);
// If cache miss: Returns instantly with baseline, 
// updates cache in background

// Before: Single model
const predictor = getPredictorInstance();

// After: Model registry with versioning
const predictor = getPredictor('v2.1');  // Specific version
const predictor = getPredictor();        // Latest active version
const prediction = await predictor.predictAttendance(features);
```

**Performance Targets:**
✓ Single prediction: <20ms (from cache) or <100ms (new)
✓ Batch of 1000: <5s
✓ Database query: <10ms p95
✓ Availability: 99.5% uptime

**Focus:** Stabilize infrastructure, prepare for growth

---

### Stage 3: Scale Phase (Q1-Q2 2027 - 500-2,000 Students)
**Timeline:** February - June 2027
**Events per month:** 20-30
**Data points:** ~15,000-40,000 training records

**Architecture Changes:**
```
Global CDN
    ↓
Frontend (React) → Production deployment
    - Service worker for offline support
    - Skeleton screens while loading
                ↓
API Gateway (Kong, AWS API Gateway, or similar)
    - Rate limiting: 100 requests/min per student
    - Request logging for analytics
    - Version control (v1/, v2/)
                ↓
Kubernetes Cluster (orchestrate containers)
    - Auto-scale: 2-10 backend instances
    - Self-healing: Restart failed services
    - Rolling updates: Zero downtime deployments
                ↓
Microservices Split:
    - Prediction Service (inference API)
    - Training Service (scheduled retraining)
    - Analytics Service (dashboards, reports)
    - Data Service (feature engineering, validation)
                ↓
PostgreSQL (replicated for high availability)
    - Read replicas for analytics queries
    - Write-ahead logs for durability
    - Automated failover
                ↓
Redis Cluster
    - Distributed cache (not single instance)
    - Automatic replication
                ↓
Object Storage (S3, Wasabi, or similar)
    - Model versioning
    - Training data backups
    - Audit logs
```

**Code Evolution:**
```typescript
// Before (MVP): Direct function calls
import { predictAttendance } from './mlapi';
const prediction = await predictAttendance(request);

// After (Scale): Service discovery + async communication
import { predictionServiceClient } from './services/clients';
const prediction = await predictionServiceClient.predict(request);
// Service client handles: load balancing, retries, fallbacks

// Prediction Service itself:
// - Independent deployment
// - Scales separately based on load
// - Can be updated without affecting training
// - Implements circuit breaker pattern

// Before: Single model
const model = loadModel('/models/xgboost.pkl');

// After: Model registry with smart routing
const modelRouter = new ModelRouter({
  activeModel: 'v3.2',
  experimentalModels: [
    { version: 'v3.3', trafficPercentage: 10 },
    { version: 'v3.4-fairness', trafficPercentage: 5 },
  ]
});
const prediction = await modelRouter.predict(features);
```

**Database Evolution:**
```sql
-- MVP: Single table with basic indexes
CREATE TABLE training_data (
  id UUID PRIMARY KEY,
  student_id UUID,
  event_id UUID,
  features JSONB,
  label INT,
  created_at BIGINT,
  INDEX (student_id, event_id)
);

-- Scale: Partitioned by date for faster queries
CREATE TABLE training_data (
  id UUID PRIMARY KEY,
  student_id UUID,
  event_id UUID,
  features JSONB,
  label INT,
  created_at BIGINT,
  INDEX (student_id, event_id)
) PARTITION BY RANGE (created_at) (
  PARTITION p_2026_q1 VALUES LESS THAN ('2026-04-01'),
  PARTITION p_2026_q2 VALUES LESS THAN ('2026-07-01'),
  ...
);

-- Add materialized views for common queries
CREATE MATERIALIZED VIEW student_statistics AS
  SELECT 
    student_id,
    COUNT(*) as total_events,
    SUM(label) as attended_count,
    AVG(label) as attendance_rate,
    MAX(created_at) as last_event
  FROM training_data
  GROUP BY student_id;
-- Refresh daily, used for dashboard queries
```

**Performance Targets:**
✓ Prediction latency p95: <50ms
✓ Prediction latency p99: <200ms
✓ Batch prediction 5,000 students: <10s
✓ Availability: 99.9% uptime
✓ Data freshness: <1 hour

**Focus:** Optimize for growth, prepare for enterprise features

---

### Stage 4: Enterprise Phase (Q3 2027+ - 2,000+ Students)
**Timeline:** July 2027 and beyond
**Events per month:** 50+
**Data points:** 100,000+ training records

**Architecture Changes:**
```
Multi-region Deployment
    ↓
Global Load Balancer (routes to closest region)
    ↓
Regional Kubernetes Clusters
    - North America
    - Europe
    - Asia-Pacific
    - Each with independent services
                ↓
Real-time Data Pipeline (Apache Kafka)
    - Stream predictions for real-time dashboards
    - Feed dashboards as predictions happen
    - Enable anomaly detection
                ↓
Data Warehouse (BigQuery, Snowflake, or similar)
    - Historical analysis
    - Executive dashboards
    - Ad-hoc queries from leadership
                ↓
Advanced ML Services
    - Hyperparameter optimization (AutoML)
    - Ensemble models (combine multiple models)
    - Fairness monitoring (automated bias detection)
    - Federated learning (train on decentralized data)
```

**Advanced Capabilities:**
```typescript
// Ensemble Predictions: Combine XGBoost + LightGBM + Neural Network
const ensemblePredictor = new EnsemblePredictor({
  models: [
    new XGBoostPredictor(),
    new LightGBMPredictor(),
    new NeuralNetworkPredictor()
  ],
  weights: [0.5, 0.3, 0.2],  // XGBoost is most trusted
  confidenceThreshold: 0.65
});
const prediction = await ensemblePredictor.predict(features);
// If low agreement between models, flag for manual review

// Fairness-Aware Predictions: Ensure no demographic bias
const fairnessConstrainedModel = await trainModel(dataset, {
  constraints: {
    // Ensure accuracy within 5% across all countries
    demographicParity: {
      attribute: 'student_country',
      tolerance: 0.05
    }
  }
});

// Active Learning: Request human labels for hard cases
const prediction = await predictor.predict(features);
if (prediction.confidence < 0.55) {
  // Low confidence - ask organizer for feedback
  await requestHumanFeedback({
    studentId: features.studentId,
    eventId: eventFeatures.eventId,
    predictedProb: prediction.attendanceProbability,
    reason: "Model uncertain - help us learn"
  });
}
```

**Performance Targets:**
✓ Prediction latency p99: <100ms global
✓ Prediction throughput: 10,000+/second
✓ Availability: 99.99% uptime (52 minutes downtime/year)
✓ Real-time analytics: <1 second data freshness

**Focus:** Global scale, advanced features, complete platform

---

## 🔄 Gradual Migration Strategy

**Don't rewrite everything at once.** Migrate incrementally:

### MVP → Growth (Within current codebase):
```typescript
// Step 1: Add database abstraction layer without changing API
interface DataStore {
  save(data: TrainingData): Promise<void>;
  query(filter: QueryFilter): Promise<TrainingData[]>;
}

// Step 2: Implement both JSON and SQL backends
class JSONDataStore implements DataStore { ... }
class PostgreSQLDataStore implements DataStore { ... }

// Step 3: Application doesn't care which is used
const dataStore: DataStore = 
  process.env.USE_DATABASE === 'true' 
    ? new PostgreSQLDataStore() 
    : new JSONDataStore();

const dataset = await dataStore.query({ ...filters });

// Step 4: Deploy with JSON → Run parallel with SQL → Switch over
// Validation: Compare results from both until confident
```

### Growth → Scale (Containerization):
```dockerfile
# Dockerfile for backend (new)
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0"]

# Deploy to Kubernetes
kubectl apply -f deployment.yaml
# Gradually roll out: 1 replica → 3 replicas → 5 replicas
```

### Scale → Enterprise (Microservices):
```typescript
// Keep existing prediction service API-compatible
// Extract training into separate service
// Extract analytics into separate service
// Services communicate via message queue

// Frontend doesn't change - uses same API endpoints
// Backend can evolve independently
```

---

## 🗂️ Code Organization for Growth

**Start flat (MVP):**
```
src/ml/
├── data/
├── prediction/
└── utils/
```

**Grow modular (Growth phase):**
```
src/ml/
├── core/              # Shared: types, validation, constants
├── prediction/        # Prediction service code
├── training/          # Training scripts (can be separate service)
├── evaluation/        # Model evaluation logic
├── cache/             # Caching strategies
└── monitoring/        # Observability code
```

**Scale to microservices (Scale phase):**
```
services/
├── prediction-service/     # Standalone Python app
│   ├── models/
│   ├── handlers/
│   └── main.py
├── training-service/       # Standalone Python app
│   ├── models/
│   ├── pipelines/
│   └── main.py
├── analytics-service/      # Standalone Node.js app
│   ├── queries/
│   ├── routes/
│   └── server.js
└── shared/
    └── contracts/          # Shared type definitions (OpenAPI)
```

---

## 💾 Data Management as You Grow

### MVP: JSON files
```json
{
  "trainingData": [
    { "studentId": "s1", "eventId": "e1", "attended": 1 }
  ],
  "modelMetadata": {
    "version": "1.0",
    "metrics": { "auc": 0.72 }
  }
}
```
**Storage:** src/ml/data/
**Backup:** Manual zip, commit to git

### Growth: PostgreSQL
```sql
-- Automated daily backups to object storage
BACKUP DATABASE ml_data TO 's3://backup-bucket/2026-06-02.sql';

-- Continuous replication for disaster recovery
-- Standby database in different region, ready to take over
```

### Scale: Data Warehouse
```sql
-- Daily snapshots for analytics
CREATE TABLE predictions_daily_snapshot AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_predictions,
  SUM(CASE WHEN predicted = actual THEN 1 ELSE 0 END) as correct,
  AVG(confidence) as avg_confidence
FROM predictions
WHERE created_at >= NOW() - INTERVAL 1 DAY
GROUP BY DATE(created_at);

-- Executive dashboards query this, not production data
```

---

## 🚨 Growth Pitfalls to Avoid

❌ **Pitfall 1: "We'll optimize later"**
- Start with logging/monitoring in MVP
- Add indexes before data becomes huge
- Design for performance upfront, not after slowness

✅ **Solution:** Use perf budgets - single prediction must stay <50ms

---

❌ **Pitfall 2: "We'll handle security in Phase 3"**
- Attackers will test your system regardless of phase
- SQL injection vulnerabilities exist from day 1
- Data breaches destroy trust irreversibly

✅ **Solution:** Security reviews in every PR, penetration testing before public launch

---

❌ **Pitfall 3: "One model is enough"**
- As data changes, original model becomes stale
- No ability to test improvements
- Fixing bugs requires retraining everything

✅ **Solution:** Multi-model versioning from day 1 (light overhead, huge benefit)

---

❌ **Pitfall 4: "We'll document later"**
- 6 months later: "Why does this code do this weird thing?"
- New team members lost for weeks
- Knowledge trapped in one person's head

✅ **Solution:** ADRs + code comments from start + runbook templates

---

❌ **Pitfall 5: "Just add more servers"**
- Doesn't work for poor database schema
- Throws money at problems that need better design
- Becomes very expensive as scale grows

✅ **Solution:** Performance profiles before scaling, optimize slow queries

---

## 📋 Scalability Checklist by Phase

### MVP Checklist ✅
- [x] Core prediction logic working
- [x] Type safety (TypeScript)
- [x] Basic validation
- [ ] Unit tests (do this soon)
- [ ] Performance benchmark baseline (do this soon)

### Growth Checklist (Before reaching 200 students)
- [ ] Database schema designed
- [ ] Automated backups tested
- [ ] Cache layer added (Redis or in-process)
- [ ] Performance tests passing
- [ ] Monitoring dashboard set up
- [ ] Runbooks written for common issues
- [ ] Load testing (simulate 10x current load)
- [ ] Model versioning implemented

### Scale Checklist (Before reaching 2,000 students)
- [ ] Kubernetes ready (containers + orchestration)
- [ ] Multi-region plan documented
- [ ] Data warehouse set up for analytics
- [ ] Real-time streaming pipeline ready
- [ ] Auto-scaling policies tested
- [ ] Disaster recovery tested (full failover)
- [ ] Security audit completed
- [ ] Compliance checklist verified

### Enterprise Checklist (For long-term sustainability)
- [ ] Federated learning (decentralized training)
- [ ] Fairness constraints built-in
- [ ] Explainability at scale
- [ ] Advanced ensemble methods
- [ ] Global deployment in place
- [ ] Executive dashboards operational
- [ ] Vendor lock-in minimized (open standards)
- [ ] Long-term roadmap documented

---

## 📊 Investment vs. Benefit Timeline

```
Cost/Effort
   |
   |     ████ Architecture Planning
   |     ████ Infrastructure Setup
   |  ████████ Database Optimization
   |     ████ Microservices Split
   |_________________________________________________________ Time
   
Benefit
   |
   |                                      ████
   |                              ████████
   |                      ████████
   |              ████████
   |      ████████
   |______████_________________________________________________________
        MVP      Growth      Scale      Enterprise


Key insight: Invest heavily early (MVP) in type safety, testing, monitoring.
This prevents exponential costs later. Small investment upfront = 10x savings
in Scale phase.
```

---

## 🎯 Your Decision Points

### Right Now (MVP Phase)
**Decision:** Should we use database now or stay with JSON?
- **If:** Association has <150 active students and 1 organizer → **Stay JSON**
- **If:** Association has >150 students or multiple organizers → **Migrate to database**

**Action:** Monitor when to transition (not too early, not too late)

---

### In 3 Months (Growth Phase)
**Decision:** Is server slow? Is user experience degraded?
- **Metric:** Single prediction takes >100ms → Time to add cache
- **Metric:** Monthly predictions exceed 10,000 → Time for database
- **Metric:** API errors > 1% → Time for monitoring

**Action:** Trigger growth phase infrastructure work

---

### In 6 Months (Scale Phase)
**Decision:** Can one server handle the load?
- **Load test:** Simulate peak usage (all events in one week)
- **If:** Server drops below 90% availability → Containerize + load balance
- **If:** Database queries slow → Add read replicas + caching
- **If:** Student base tripled → Plan multi-region

**Action:** Begin Scale phase planning while still in Growth phase

---

## 🔗 Reference: Technologies by Phase

| Layer | MVP | Growth | Scale | Enterprise |
|-------|-----|--------|-------|-----------|
| **Frontend** | React + Vite | React + CDN | React + Service Workers | React + MFE |
| **Backend** | Python Flask | Containerized Flask | Kubernetes + microservices | Kubernetes multi-region |
| **Database** | SQLite/JSON | PostgreSQL | PostgreSQL replicated | Data warehouse + OLTP |
| **Cache** | In-memory Map | Redis | Redis Cluster | Distributed cache |
| **Storage** | File system | Local disk | Object storage (S3) | Multi-region object storage |
| **Monitoring** | Logging to console | Prometheus + Grafana | Datadog/New Relic | Enterprise APM |
| **CI/CD** | Manual deployment | GitHub Actions | GitOps (Argo CD) | Multi-pipeline |
| **Secrets** | .env file | HashiCorp Vault | AWS Secrets Manager | HSM + compliance |

---

## 🎓 When to Hire for Each Phase

**MVP (Now):** Your team + 1 ML engineer (part-time)
- Goal: Prove concept works

**Growth:** + 1 Backend engineer + 1 DevOps
- Goal: Stabilize infrastructure

**Scale:** + 2-3 More backend engineers + Senior DevOps + Data engineer
- Goal: Handle 100x more load

**Enterprise:** + ML engineering team + Data science team + Platform team
- Goal: Advanced features, multiple products

---

## 💡 Final Principle for Sustainable Growth

**"Make the simple thing work first, then optimize."**

- ✅ MVP: Simple single model → Works
- ✅ Growth: Database + caching → Handles more load
- ✅ Scale: Microservices + load balancing → Distributed system
- ✅ Enterprise: Advanced features → Competitive advantage

**Not:**
- ❌ MVP: Kubernetes + data warehouse + ensemble models → Overkill, unmaintainable
- ❌ Years 2-3: Rewrites because original design didn't scale

---

**Document Status:** Strategic Roadmap
**Next Review:** Every 3 months as actual growth happens
**Approval:** Share with technical leadership before committing resources
