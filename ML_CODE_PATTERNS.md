# ML System - Enterprise Code Patterns & Best Practices

**Purpose:** Ensure code quality and consistency as more developers join
**Audience:** All developers working on ML system
**Status:** Living document (update as patterns are tested)
**Last Updated:** June 2, 2026

---

## 🏗️ Architectural Patterns

### Pattern 1: Validation at Every Boundary

**Why:** Garbage in → Garbage out. Catch errors early where they happen.

```typescript
// ❌ BAD: No validation, trust everything
async function predictAttendance(request: any) {
  const features = request.studentFeatures;
  // If features is missing a field, error is cryptic
  return model.predict(features);
}

// ✅ GOOD: Validate at entry point
async function predictAttendance(request: PredictionRequest) {
  // TypeScript enforces structure
  const validation = validateStudentFeatures(request.studentFeatures);
  if (!validation.isValid) {
    throw new MLAPIError(400, 'predict', validation.errors.join('; '));
  }
  
  const validation2 = validateEventFeatures(request.eventFeatures);
  if (!validation2.isValid) {
    throw new MLAPIError(400, 'predict', validation2.errors.join('; '));
  }
  
  // Now we know data is good
  return model.predict(request.studentFeatures, request.eventFeatures);
}

// Usage
try {
  const prediction = await predictAttendance(userInput);
} catch (error) {
  if (error instanceof MLAPIError) {
    // User input was invalid - show helpful message
    showError(`Invalid input: ${error.message}`);
  }
}
```

---

### Pattern 2: Explicit Over Implicit

**Why:** Future developers (including you in 6 months) won't have to guess intent.

```typescript
// ❌ BAD: Implicit behavior
const results = predictions.filter(p => p.confidence > 0.6);

// ✅ GOOD: Explicit function with clear intent
function filterByConfidenceThreshold(
  predictions: SinglePrediction[],
  minConfidence: number = 0.6
): SinglePrediction[] {
  /**
   * Filter predictions that the model is confident about.
   * 
   * We only trust predictions with confidence >= minConfidence
   * because below this threshold, predictions often flip-flop
   * based on small input changes.
   * 
   * @param predictions - List of predictions to filter
   * @param minConfidence - Only include if confidence >= this (0-1)
   * @returns Confident predictions only
   * 
   * @example
   * const confident = filterByConfidenceThreshold(predictions, 0.65);
   */
  return predictions.filter(p => p.confidence >= minConfidence);
}

// Even better: Explain the threshold choice
const CONFIDENCE_THRESHOLD = 0.6;  // Chosen through cross-validation
// At threshold < 0.6: 30% of predictions are wrong even with high prob
// At threshold > 0.7: 50% of potential predictions rejected
const reliable = filterByConfidenceThreshold(predictions, CONFIDENCE_THRESHOLD);
```

---

### Pattern 3: Error Handling with Recovery

**Why:** Users see "API Error" once and stop using. Better: Graceful fallback.

```typescript
// ❌ BAD: All-or-nothing
async function getPrediction(request: PredictionRequest) {
  try {
    return await modelAPI.predict(request);
  } catch (error) {
    throw error;  // User sees error ❌
  }
}

// ✅ GOOD: Graceful degradation
async function getPrediction(
  request: PredictionRequest
): Promise<PredictionResponse> {
  try {
    // Try primary source: live model
    return await modelAPI.predict(request);
  } catch (primaryError) {
    console.warn('Primary prediction failed, trying cache');
    
    try {
      // Try secondary source: cached prediction
      return await cache.get(cacheKey);
    } catch (cacheError) {
      console.warn('Cache miss, using baseline');
      
      // Try tertiary source: baseline predictor
      const baseline = await baselinePredictor.predict(request);
      return {
        ...baseline,
        sourceType: 'baseline',
        reliability: 'low',
        warning: 'Using baseline prediction - ML service unavailable'
      };
    }
  }
}

// Result: User always gets prediction, but knows reliability status
```

---

### Pattern 4: Type-Safe Feature Handling

**Why:** Typos in feature names at runtime are expensive.

```typescript
// ❌ BAD: Stringly-typed features
function featuresToArray(features: Record<string, any>) {
  return [
    features['dist'],  // Typo risk: 'dist' vs 'distance'
    features['temp'],  // Not validated to be a number
    features['weather_cond'],  // Typo risk: inconsistent naming
  ];
}

// ✅ GOOD: Type-safe with explicit mapping
function featuresToArray(features: StudentFeatures & EventFeatures) {
  // Compiler ensures properties exist + are correct type
  return [
    features.distance,              // ✓ Exists, is number
    features.weatherTemp,           // ✓ Exists, is number
    features.weatherCondition,      // ✓ Exists, is string (validated)
  ];
}

// Even better: Centralized feature order
const FEATURE_ORDER = [
  'dayOfWeek',
  'eventStartTime',
  'distance',
  // ...
] as const;

function featuresToNumericArray(
  features: StudentFeatures & EventFeatures
): number[] {
  return FEATURE_ORDER.map(key => {
    const value = features[key];
    // Type system ensures value matches expected type
    if (typeof value === 'string') {
      // This shouldn't happen - compiler would catch in normal code
      return encodeFeature(key, value);
    }
    return value;
  });
}
```

---

### Pattern 5: Dependency Injection

**Why:** Easy to test, easy to swap implementations.

```typescript
// ❌ BAD: Hard-coded dependencies
class EventAttendancePredictor {
  private model: XGBoostModel;
  private cache: Map<string, SinglePrediction>;
  
  constructor() {
    // Can only use one model type - hard to test with mock
    this.model = new XGBoostModel();
    this.cache = new Map();
  }
}

// ✅ GOOD: Inject dependencies
interface PredictionDependencies {
  model: ModelInterface;
  cache: CacheInterface;
  logger: LoggerInterface;
}

class EventAttendancePredictor {
  constructor(private deps: PredictionDependencies) {}
  
  async predict(features: StudentFeatures & EventFeatures) {
    this.deps.logger.debug('Predicting attendance', { features });
    // Use injected dependencies
    return this.deps.model.predict(features);
  }
}

// Usage: Production
const predictor = new EventAttendancePredictor({
  model: new XGBoostModel(),
  cache: new RedisCache(),
  logger: new ProductionLogger()
});

// Usage: Testing
const mockPredictor = new EventAttendancePredictor({
  model: new MockModel({ alwaysReturn: 0.8 }),
  cache: new InMemoryCache(),
  logger: new NoOpLogger()
});

// Usage: Debugging
const debugPredictor = new EventAttendancePredictor({
  model: new XGBoostModel(),
  cache: new NoOpCache(),  // No caching to see live behavior
  logger: new VerboseLogger()
});
```

---

### Pattern 6: Separation of Concerns

**Why:** Each module has one job. Easier to test, easier to change.

```typescript
// ❌ BAD: Prediction logic mixed with data handling
async function predictAttendance(raw_json: string) {
  // Parse JSON
  const obj = JSON.parse(raw_json);
  
  // Validate
  if (!obj.studentFeatures || !obj.eventFeatures) {
    throw new Error('Invalid input');
  }
  
  // Encode categorical features
  const weatherEncoded = 
    obj.eventFeatures.weatherCondition === 'rain' ? 2 : 0;
  
  // Predict
  const prediction = model.predict([
    obj.studentFeatures.distance,
    weatherEncoded,
    // ...
  ]);
  
  // Format output
  return JSON.stringify({ probability: prediction });
}

// ✅ GOOD: Separate concerns into focused modules
// Module 1: Data validation
function validateRequest(raw_json: string): ValidationResult {
  try {
    const obj = JSON.parse(raw_json);
    const studentValid = validateStudentFeatures(obj.studentFeatures);
    const eventValid = validateEventFeatures(obj.eventFeatures);
    return {
      isValid: studentValid.isValid && eventValid.isValid,
      errors: [...studentValid.errors, ...eventValid.errors]
    };
  } catch (e) {
    return { isValid: false, errors: ['Invalid JSON'] };
  }
}

// Module 2: Feature engineering
function prepareFeatures(
  studentFeatures: StudentFeatures,
  eventFeatures: EventFeatures
): number[] {
  return [
    studentFeatures.distance,
    encodeWeatherCondition(eventFeatures.weatherCondition),
    // ... other features
  ];
}

// Module 3: Prediction
async function predictAttendance(
  studentFeatures: StudentFeatures,
  eventFeatures: EventFeatures
): Promise<SinglePrediction> {
  const features = prepareFeatures(studentFeatures, eventFeatures);
  const probability = await model.predict(features);
  return { attendanceProbability: probability, /* ... */ };
}

// Module 4: API handler
async function handlePredictionRequest(req: Request): Promise<Response> {
  const validation = validateRequest(req.body);
  if (!validation.isValid) {
    return { status: 400, body: { errors: validation.errors } };
  }
  
  const parsed = JSON.parse(req.body);
  const prediction = await predictAttendance(
    parsed.studentFeatures,
    parsed.eventFeatures
  );
  
  return { status: 200, body: prediction };
}

// Benefits:
// - Test validateRequest without touching model
// - Test prepareFeatures without network call
// - Test predictAttendance with mock model
// - Test handlePredictionRequest with mocked functions
```

---

## 🧪 Testing Patterns

### Pattern 1: Arrange-Act-Assert (AAA)

```typescript
describe('predictAttendance', () => {
  it('should return probability between 0 and 1', () => {
    // Arrange: Set up test data
    const studentFeatures: StudentFeatures = {
      studentId: 'test123',
      dayOfWeek: 5,  // Friday
      eventStartTime: 1800,
      distance: 2.5,
      previousAttendanceRate: 0.75,
      academicLoad: 3,
      weatherTemp: 22,
      weatherCondition: 'clear'
    };
    
    const eventFeatures: EventFeatures = {
      eventId: 'event456',
      eventType: 'social',
      leadTime: 7,
      hasIncentive: true,
      incentiveType: 'meal',
      eventTitle: 'Potluck Dinner',
      eventDate: '2026-06-15',
      expectedAttendees: 50
    };
    
    // Act: Call the function
    const prediction = await predictAttendance(studentFeatures, eventFeatures);
    
    // Assert: Verify expectations
    expect(prediction.attendanceProbability).toBeGreaterThanOrEqual(0);
    expect(prediction.attendanceProbability).toBeLessThanOrEqual(1);
    expect(prediction).toHaveProperty('confidence');
    expect(prediction).toHaveProperty('predictionTime');
  });
});
```

---

### Pattern 2: Test Edge Cases

```typescript
describe('validateStudentFeatures', () => {
  it('should reject negative distance', () => {
    const invalid: StudentFeatures = {
      studentId: 's1',
      dayOfWeek: 1,
      eventStartTime: 1800,
      distance: -5,  // ❌ Invalid
      previousAttendanceRate: 0.5,
      academicLoad: 3,
      weatherTemp: 25,
      weatherCondition: 'clear'
    };
    
    const result = validateStudentFeatures(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      expect.stringContaining('distance must be >= 0')
    );
  });
  
  it('should accept boundary values', () => {
    const valid: StudentFeatures = {
      studentId: 's1',
      dayOfWeek: 1,
      eventStartTime: 0,      // Midnight
      distance: 0,            // On campus
      previousAttendanceRate: 0,     // Never attended before
      academicLoad: 1,        // Minimal courses
      weatherTemp: -40,       // Extreme cold
      weatherCondition: 'clear'
    };
    
    const result = validateStudentFeatures(valid);
    expect(result.isValid).toBe(true);
  });
  
  it('should accept boundary values (upper)', () => {
    const valid: StudentFeatures = {
      studentId: 's1',
      dayOfWeek: 7,           // Sunday
      eventStartTime: 2359,   // 11:59 PM
      distance: 10000,        // Very far
      previousAttendanceRate: 1,     // Always attended
      academicLoad: 10,       // Many courses
      weatherTemp: 60,        // Hot
      weatherCondition: 'clear'
    };
    
    const result = validateStudentFeatures(valid);
    expect(result.isValid).toBe(true);
  });
});
```

---

### Pattern 3: Mock External Dependencies

```typescript
describe('predictAttendance with mocked model', () => {
  let mockModel: jest.Mocked<ModelInterface>;
  let predictor: EventAttendancePredictor;
  
  beforeEach(() => {
    // Create mock that behaves like real model
    mockModel = {
      predict: jest.fn().mockResolvedValue(0.85),
      loadMetadata: jest.fn().mockResolvedValue({ version: '1.0' }),
      isReady: jest.fn().mockReturnValue(true)
    };
    
    predictor = new EventAttendancePredictor({
      model: mockModel,
      cache: new NoOpCache(),
      logger: new NoOpLogger()
    });
  });
  
  it('should call model with correct features', async () => {
    const studentFeatures: StudentFeatures = { /* ... */ };
    const eventFeatures: EventFeatures = { /* ... */ };
    
    await predictor.predict(studentFeatures, eventFeatures);
    
    // Verify model was called with correct features
    expect(mockModel.predict).toHaveBeenCalledWith(
      expect.objectContaining({
        distance: studentFeatures.distance,
        weatherCondition: eventFeatures.weatherCondition
      })
    );
  });
  
  it('should handle model returning 0.5 (uncertain)', async () => {
    mockModel.predict.mockResolvedValue(0.5);
    
    const prediction = await predictor.predict(
      { /* ... */ },
      { /* ... */ }
    );
    
    expect(prediction.confidence).toBeLessThan(0.7);  // Low confidence
  });
});
```

---

## 📊 Performance Patterns

### Pattern 1: Caching with TTL

```typescript
// ❌ BAD: No cache
async function getFeatureImportance(): Promise<FeatureImportance[]> {
  // This hits the model file system every time
  const metadata = await loadModelMetadata();
  return metadata.featureImportance;
}

// ✅ GOOD: Cache with TTL
class CachedFeatureImportance {
  private cache: FeatureImportance[] | null = null;
  private cacheTime: number = 0;
  private ttlMs: number = 24 * 60 * 60 * 1000;  // 24 hours
  
  async get(): Promise<FeatureImportance[]> {
    const now = Date.now();
    
    // Return cached if fresh
    if (this.cache && (now - this.cacheTime) < this.ttlMs) {
      return this.cache;
    }
    
    // Load fresh
    const metadata = await loadModelMetadata();
    this.cache = metadata.featureImportance;
    this.cacheTime = now;
    
    return this.cache;
  }
  
  // Allow invalidation if model changes
  invalidate() {
    this.cache = null;
    this.cacheTime = 0;
  }
}
```

---

### Pattern 2: Lazy Loading for Large Objects

```typescript
// ❌ BAD: Load model immediately
class Predictor {
  private model: XGBoostModel;
  
  constructor() {
    // This might be 100MB file - blocks initialization
    this.model = loadModelSync('/models/xgboost.pkl');
  }
}

// ✅ GOOD: Lazy load on first use
class Predictor {
  private model: XGBoostModel | null = null;
  
  private async getModel(): Promise<XGBoostModel> {
    if (!this.model) {
      this.model = await loadModel('/models/xgboost.pkl');
    }
    return this.model;
  }
  
  async predict(features: Features): Promise<number> {
    const model = await this.getModel();  // Loads only if needed
    return model.predict(features);
  }
}

// Benefits:
// - App starts fast (model only loaded when needed)
// - If prediction never called, model never loaded
// - Multiple predictor instances share same loaded model (singleton)
```

---

### Pattern 3: Batch Processing for Scale

```typescript
// ❌ BAD: Sequential processing
async function predictMany(requests: PredictionRequest[]): Promise<SinglePrediction[]> {
  const results: SinglePrediction[] = [];
  
  for (const request of requests) {
    // One by one - slow for 1000s of students
    const prediction = await predictAttendance(request);
    results.push(prediction);
  }
  
  return results;  // Took 60 seconds for 1000 students
}

// ✅ GOOD: Batch processing with concurrency limit
async function predictMany(
  requests: PredictionRequest[],
  maxConcurrency: number = 10
): Promise<SinglePrediction[]> {
  const results: SinglePrediction[] = [];
  
  for (let i = 0; i < requests.length; i += maxConcurrency) {
    const batch = requests.slice(i, i + maxConcurrency);
    
    // Process up to 10 in parallel
    const batchResults = await Promise.all(
      batch.map(r => predictAttendance(r))
    );
    
    results.push(...batchResults);
    
    // Progress callback for UI
    onProgress(i + batchResults.length, requests.length);
  }
  
  return results;  // Takes ~6 seconds for 1000 students (10x faster!)
}
```

---

## 📝 Logging & Debugging Patterns

### Pattern 1: Structured Logging

```typescript
// ❌ BAD: Unstructured logs
console.log('Prediction made');
console.log('Error: ' + error);

// Output is hard to parse programmatically
// Difficult to search/filter in production logs

// ✅ GOOD: Structured logging with context
interface LogEntry {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  service: string;
  message: string;
  context: Record<string, any>;  // Additional data
  traceId?: string;  // Link related operations
}

class Logger {
  logPrediction(
    studentId: string,
    eventId: string,
    probability: number,
    cacheHit: boolean,
    durationMs: number
  ) {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level: 'info',
      service: 'prediction',
      message: 'Prediction completed',
      context: {
        studentId,
        eventId,
        probability,
        cacheHit,
        durationMs,
        traceId: this.currentTraceId  // Links related logs
      }
    };
    
    // Send to centralized logging (console, file, ELK, etc)
    this.sink.write(JSON.stringify(entry));
  }
}

// Output is machine-readable:
// {"timestamp":1717400000000,"level":"info","service":"prediction",...}
// Easy to filter: `logs where service='prediction' AND probability < 0.5`
```

---

### Pattern 2: Error Context

```typescript
// ❌ BAD: Generic error messages
throw new Error('Prediction failed');

// Debugging this later: ???

// ✅ GOOD: Error with context
async function predictAttendance(request: PredictionRequest) {
  try {
    // ...prediction logic
  } catch (innerError) {
    // Capture context before throwing
    const context = {
      studentId: request.studentFeatures.studentId,
      eventId: request.eventFeatures.eventId,
      modelVersion: this.modelVersion,
      timestamp: Date.now(),
      innerError: innerError.message
    };
    
    throw new MLAPIError(
      500,
      'predictAttendance',
      `Failed to predict attendance for ${context.studentId}`,
      context  // Extra context for debugging
    );
  }
}

// When caught, error has useful info:
// error.context.studentId = 's123'
// error.context.modelVersion = 'v2.1'
// error.message shows the issue
```

---

## 🔒 Security Patterns

### Pattern 1: Input Sanitization

```typescript
// ❌ BAD: Trust user input
async function searchPredictions(userId: string) {
  const query = `SELECT * FROM predictions WHERE user_id = '${userId}'`;
  // If userId = "' OR '1'='1", SQL injection!
  return db.query(query);
}

// ✅ GOOD: Parameterized queries
async function searchPredictions(userId: string) {
  const query = `SELECT * FROM predictions WHERE user_id = ?`;
  // userId is safely escaped - no injection possible
  return db.query(query, [userId]);
}

// Even better: Use ORM
async function searchPredictions(userId: string) {
  return db.predictions.findMany({ where: { userId } });
  // ORM handles escaping automatically
}
```

---

### Pattern 2: Access Control

```typescript
// ❌ BAD: No permission check
async function getPrediction(predictionId: string) {
  return db.predictions.findOne({ id: predictionId });
  // Anyone can see anyone's predictions!
}

// ✅ GOOD: Verify authorization
async function getPrediction(
  predictionId: string,
  userId: string,
  userRole: string
) {
  const prediction = await db.predictions.findOne({ id: predictionId });
  
  if (!prediction) {
    throw new Error('Not found');  // Don't reveal existence
  }
  
  // Only owner or admin can view
  const isOwner = prediction.userId === userId;
  const isAdmin = userRole === 'admin';
  
  if (!isOwner && !isAdmin) {
    throw new Error('Unauthorized');
  }
  
  return prediction;
}
```

---

## 🧠 Decision-Making Patterns

When facing a decision about code patterns, ask:

1. **Readability:** Will someone joining the team understand this in 6 months?
2. **Testability:** Can this be tested in isolation without mocking 5 things?
3. **Reusability:** Will this code be useful in other parts of the system?
4. **Maintainability:** Can this be changed without affecting 10 other files?
5. **Performance:** Does this scale if we have 10x the data/users?

If you can't confidently answer "yes" to most, reconsider the pattern.

---

## 📚 Reference: Pattern Decision Tree

```
Problem: Need to validate user input
└── Solution: validateX() function with clear error messages
    └── Pattern: Validation at boundaries

Problem: Code is slow
├─ Is it due to repeated computation?
│  └── Solution: Add caching with TTL
├─ Is it due to inefficient query?
│  └── Solution: Add database index
└─ Is it due to network calls?
   └── Solution: Batch processing

Problem: Hard to test
├─ Does it depend on external services?
│  └── Solution: Dependency injection
├─ Does it mix concerns?
│  └── Solution: Separation of concerns
└─ No clear failure mode?
   └── Solution: Add logging for debugging

Problem: Error is cryptic
├─ Is it a user error (bad input)?
│  └── Solution: Validate earlier, show specific error
└─ Is it a system error (code bug)?
   └── Solution: Add context to error message
```

---

## 🚀 Adopting These Patterns

**Phase 1 (Now):** Study patterns, understand rationale
**Phase 2 (Week 1-2):** Apply patterns to new code
**Phase 3 (Week 3-4):** Code review to enforce patterns
**Phase 4 (Month 2+):** Refactor existing code as you touch it

**Not all at once:** That's paralyzing. One pattern per feature.

---

**Document Status:** Living guide for code quality
**Next Update:** After first code review with team
**Maintainer:** Lead ML developer
