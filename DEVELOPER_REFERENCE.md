# Developer Reference Guide - Banker's Algorithm Simulator

## 🚀 Quick Start

### Setup
```bash
# Clone repository
git clone https://github.com/DhruvPatel6429/Bankers-algorithm-visual-simulator.git
cd Bankers-algorithm-visual-simulator

# Install frontend dependencies
cd frontend
yarn install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt

# Set up environment variables
# frontend/.env
REACT_APP_BACKEND_URL=http://localhost:8001

# backend/.env
MONGO_URL=mongodb://localhost:27017/banker_db
DB_NAME=banker_db

# Start services (with supervisor)
sudo supervisorctl start all

# OR manually
# Terminal 1: MongoDB
mongod --dbpath /data/db

# Terminal 2: Backend
cd backend && uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Terminal 3: Frontend
cd frontend && yarn start
```

### Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001/docs (Swagger UI)
- MongoDB: localhost:27017

---

## 📁 Project Structure

```
/app/
├── backend/
│   ├── server.py              # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Backend config
│
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ui/           # Radix UI primitives
│   │   │   ├── MatrixDisplay.js
│   │   │   ├── StepByStepSafetyDisplay.js
│   │   │   ├── InteractiveResourceRequest.js
│   │   │   ├── MistakeDetectionPanel.js
│   │   │   ├── StepJustificationPanel.js
│   │   │   ├── ScenarioComparisonEnhanced.js
│   │   │   └── ... (20+ more)
│   │   │
│   │   ├── contexts/         # State management
│   │   │   ├── BankerContext.js
│   │   │   ├── TutorialContext.js
│   │   │   └── ComparisonContext.js
│   │   │
│   │   ├── pages/
│   │   │   └── BankerDashboard.js
│   │   │
│   │   ├── utils/
│   │   │   ├── stateValidation.js
│   │   │   └── stateExport.js
│   │   │
│   │   ├── config/
│   │   │   └── features.js
│   │   │
│   │   ├── App.js            # Root component
│   │   └── index.js          # Entry point
│   │
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env                   # Frontend config
│
├── tests/                     # Test files
├── PROJECT_DOCUMENTATION.md   # Comprehensive docs
├── EXECUTIVE_OVERVIEW.md      # High-level overview
└── test_result.md            # Testing history
```

---

## 🎯 Key Concepts

### The Banker's Algorithm

**Data Structures**:
```javascript
// State maintained in BankerContext
{
  numProcesses: 5,        // Number of processes (P0-P4)
  numResources: 3,        // Number of resource types (R0-R2)
  
  allocation: [           // Currently allocated resources
    [0, 1, 0],           // Process P0 has 0 of R0, 1 of R1, 0 of R2
    [2, 0, 0],           // Process P1 has 2 of R0, 0 of R1, 0 of R2
    ...
  ],
  
  max: [                  // Maximum resource claims
    [7, 5, 3],           // P0 needs max 7 of R0, 5 of R1, 3 of R2
    [3, 2, 2],
    ...
  ],
  
  available: [3, 3, 2],  // Resources currently available
  
  need: [                 // Computed: need = max - allocation
    [7, 4, 3],           // P0 still needs 7 of R0, 4 of R1, 3 of R2
    [1, 2, 2],
    ...
  ]
}
```

**Safety Algorithm**:
```javascript
// Simplified version from BankerContext.js
const runSafetyAlgorithm = async (tempAllocation, tempAvailable, skipAnimation) => {
  const alloc = tempAllocation || allocation;
  const avail = tempAvailable || available;
  
  // Initialize
  let work = [...avail];
  let finish = Array(numProcesses).fill(false);
  let safeSequence = [];
  let steps = [];
  
  // Find executable processes
  while (safeSequence.length < numProcesses) {
    let found = false;
    
    for (let i = 0; i < numProcesses; i++) {
      if (!finish[i]) {
        // Check if need[i] <= work for all resources
        let canExecute = need[i].every((needVal, j) => needVal <= work[j]);
        
        if (canExecute) {
          // Process can execute
          const workBefore = [...work];
          work = work.map((w, j) => w + alloc[i][j]); // Release resources
          finish[i] = true;
          safeSequence.push(i);
          found = true;
          
          // Record step
          steps.push({
            type: 'execute',
            processIndex: i,
            workBefore,
            workAfter: [...work],
            finish: [...finish],
            safeSequence: [...safeSequence]
          });
          
          break;
        }
      }
    }
    
    if (!found) {
      // No process can execute - UNSAFE
      return {
        isSafe: false,
        safeSequence: [],
        steps
      };
    }
  }
  
  // All processes finished - SAFE
  return {
    isSafe: true,
    safeSequence,
    steps
  };
};
```

---

## 🔧 Component Architecture

### Core Components

#### 1. BankerContext (State Management)
**File**: `/frontend/src/contexts/BankerContext.js`

**Purpose**: Central state manager for all algorithm data and operations.

**Key State**:
```javascript
{
  // Core data
  numProcesses, numResources,
  allocation, max, available,
  need, // computed
  
  // Algorithm execution
  safetyResult: { isSafe, safeSequence, steps },
  isRunning: boolean,
  activeProcess: number | null,
  
  // Step-by-step
  stepByStepMode: boolean,
  allSteps: Step[],
  currentStepIndex: number,
  
  // Request simulation
  requestSimulation: {
    phase: 'validating' | 'checking_safety' | 'granted' | 'denied' | 'rollback',
    processIndex, request, tempAllocation, tempAvailable,
    isSafe, safeSequence
  },
  
  // Config
  animationSpeed: number
}
```

**Key Actions**:
```javascript
// Data updates
updateAllocation(processIndex, resourceIndex, value)
updateMax(processIndex, resourceIndex, value)
updateAvailable(resourceIndex, value)
updateDimensions(numProc, numRes)

// Algorithm operations
runSafetyAlgorithm(tempAlloc?, tempAvail?, skipAnim?)
requestResources(processIndex, request)
terminateProcess(processIndex)

// Step-by-step
enableStepByStepMode()
stepForward()
stepBackward()
resetSteps()
playSteps()
pauseSteps()

// Utilities
loadExample(type: 'silberschatz' | 'custom')
importState(data)
resetSystem()
```

**Usage**:
```javascript
import { useBanker } from '../contexts/BankerContext';

function MyComponent() {
  const {
    allocation, max, available, need,
    updateAllocation,
    runSafetyAlgorithm,
    safetyResult
  } = useBanker();
  
  return (
    <div>
      <button onClick={runSafetyAlgorithm}>
        Run Safety Check
      </button>
      {safetyResult && (
        <div>Status: {safetyResult.isSafe ? 'SAFE' : 'UNSAFE'}</div>
      )}
    </div>
  );
}
```

---

#### 2. MatrixDisplay Component
**File**: `/frontend/src/components/MatrixDisplay.js`

**Purpose**: Displays and allows editing of 2D matrices (Allocation, Max, Need).

**Props**:
```javascript
{
  title: string,              // "Allocation Matrix"
  matrix: number[][],         // The data
  editable: boolean,          // Can cells be edited?
  numProcesses: number,
  numResources: number,
  onCellChange: (i, j, val) => void,
  colorScheme: 'blue' | 'purple' | 'orange'
}
```

**Example**:
```javascript
<MatrixDisplay
  title="Allocation Matrix"
  matrix={allocation}
  editable={!isTutorialActive}
  numProcesses={numProcesses}
  numResources={numResources}
  onCellChange={updateAllocation}
  colorScheme="blue"
/>
```

---

#### 3. StepByStepSafetyDisplay
**File**: `/frontend/src/components/StepByStepSafetyDisplay.js`

**Purpose**: Provides step-by-step navigation through safety algorithm execution.

**Key Features**:
- Mode toggle (Auto vs Step-by-Step)
- Navigation controls (Reset, Back, Forward, Play, Pause)
- Visual indicators (Finish Flags, Work vectors)
- Step explanations

**State Flow**:
```
1. User clicks "Step-by-Step" toggle
   → enableStepByStepMode() sets stepByStepMode = true

2. User clicks "Run Safety Check"
   → runSafetyAlgorithm() executes and stores steps in allSteps[]

3. User clicks "Forward"
   → stepForward() increments currentStepIndex
   → Component displays allSteps[currentStepIndex]

4. Display shows:
   - Current process (highlighted)
   - Work before/after
   - Finish flags
   - Safe sequence so far
   - Explanation
```

---

#### 4. InteractiveResourceRequest
**File**: `/frontend/src/components/InteractiveResourceRequest.js`

**Purpose**: Simulates resource request submission with multi-phase animation.

**Request Flow**:
```javascript
// User submits request
const handleSubmit = async () => {
  const result = await requestResources(selectedProcess, requestVector);
  // Result contains: { granted, reason, safeSequence }
};

// Inside requestResources (BankerContext):
1. Phase: "validating"
   - Check request <= need
   - Check request <= available
   - Wait 500ms

2. Phase: "checking_safety"
   - Tentative allocation: tempAlloc[i] += request
   - Tentative available: tempAvail -= request
   - Run safety algorithm with temp state

3. Phase: "granted" | "denied"
   - If safe: commit changes, show safe sequence
   - If unsafe: prepare for rollback
   - Wait 1000ms

4. Phase: "rollback" (only if denied)
   - Restore original state
   - Wait 800ms
   - Clear simulation
```

**Visual Elements**:
```javascript
{requestSimulation.phase === 'validating' && (
  <div className="bg-yellow-500/10">
    <Loader className="animate-spin" />
    Validating Request...
  </div>
)}

{requestSimulation.phase === 'checking_safety' && (
  <div className="bg-blue-500/10">
    Running safety algorithm on temporary state...
    <div className="temporary-state-preview">
      Allocation[P1]: [2,0,0] → [3,0,2]
      Available: [3,3,2] → [2,3,0]
    </div>
  </div>
)}

{requestSimulation.phase === 'granted' && (
  <div className="bg-green-500/10">
    ✅ Request Granted!
    Safe Sequence: P1 → P3 → P0 → P2 → P4
  </div>
)}
```

---

#### 5. MistakeDetectionPanel
**File**: `/frontend/src/components/MistakeDetectionPanel.js`

**Purpose**: Displays real-time validation errors with suggestions.

**Backend Integration**:
```javascript
// Debounced API call
const debouncedValidation = useMemo(
  () => debounce(async (state) => {
    const response = await fetch(`${BACKEND_URL}/api/banker/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    });
    const data = await response.json();
    setMistakes(data.mistakes || []);
  }, 500),
  []
);

useEffect(() => {
  if (isActive) {
    debouncedValidation(bankerState);
  }
}, [allocation, max, available]);
```

**Mistake Types**:
```javascript
[
  {
    mistake_type: "allocation_exceeds_max",
    severity: "error",
    location: "allocation[2][1]",
    message: "Process P2 has allocated 5 of R1, but max is 3",
    suggestion: "Set allocation[2][1] to ≤ 3"
  },
  {
    mistake_type: "low_available",
    severity: "warning",
    location: "available[0]",
    message: "Low available resources for R0 (2)",
    suggestion: "Increase available or reduce requirements"
  }
]
```

**UI Display**:
```javascript
// Color by severity
const severityColors = {
  error: 'border-red-500 bg-red-500/10',
  warning: 'border-yellow-500 bg-yellow-500/10',
  info: 'border-blue-500 bg-blue-500/10'
};

// Expandable with suggestion
<Alert className={severityColors[mistake.severity]}>
  <AlertTitle>{mistake.message}</AlertTitle>
  {expanded && (
    <AlertDescription>
      💡 {mistake.suggestion}
    </AlertDescription>
  )}
</Alert>
```

---

#### 6. ScenarioComparisonEnhanced
**File**: `/frontend/src/components/ScenarioComparisonEnhanced.js`

**Purpose**: Side-by-side comparison of two independent scenarios.

**Key Architecture Decision**: Dual BankerProvider instances for true isolation.

```javascript
// Two completely independent contexts
<div className="comparison-container">
  <div className="scenario-left">
    <BankerProvider initialState={preset1}>
      <ScenarioPanel 
        title="Scenario 1"
        onStateChange={setScenario1State}
      />
    </BankerProvider>
  </div>
  
  <div className="scenario-right">
    <BankerProvider initialState={preset2}>
      <ScenarioPanel 
        title="Scenario 2"
        onStateChange={setScenario2State}
      />
    </BankerProvider>
  </div>
</div>

{/* Comparison analysis */}
<ComparisonContext.Provider>
  <ComparativeMetricsDashboard 
    scenario1={scenario1State}
    scenario2={scenario2State}
  />
</ComparisonContext.Provider>
```

**State Export from Each Scenario**:
```javascript
// In ScenarioPanel
const { allocation, max, available, safetyResult } = useBanker();

useEffect(() => {
  onStateChange({
    numProcesses, numResources,
    allocation, max, available,
    safetyResult
  });
}, [allocation, max, available, safetyResult]);
```

**Tabs**:
1. **Side-by-Side View**: Full simulations running independently
2. **Differential View**: MatrixDiffDisplay showing cell-by-cell changes

---

## 🔌 API Reference

### Backend Endpoints

#### POST /api/banker/validate
**Purpose**: Validate system state and detect mistakes.

**Request**:
```json
{
  "numProcesses": 5,
  "numResources": 3,
  "allocation": [[0,1,0], [2,0,0], [3,0,2], [2,1,1], [0,0,2]],
  "max": [[7,5,3], [3,2,2], [9,0,2], [2,2,2], [4,3,3]],
  "available": [3,3,2]
}
```

**Response**:
```json
[
  {
    "mistake_type": "allocation_exceeds_max",
    "severity": "error",
    "location": "allocation[2][1]",
    "message": "Process P2 has allocated 5 of R1, but max is 3",
    "suggestion": "Set allocation[2][1] to a value ≤ 3"
  }
]
```

**When to Call**: On state change (debounced 500ms).

---

#### POST /api/banker/compare
**Purpose**: Calculate comparative metrics for two scenarios.

**Request**:
```json
{
  "scenarioA": {
    "numProcesses": 5,
    "numResources": 3,
    "allocation": [...],
    "max": [...],
    "available": [...],
    "safetyResult": { "isSafe": true }
  },
  "scenarioB": {
    "numProcesses": 5,
    "numResources": 3,
    "allocation": [...],
    "max": [...],
    "available": [...],
    "safetyResult": { "isSafe": false }
  }
}
```

**Response**:
```json
{
  "utilization_a": 67.5,
  "utilization_b": 82.3,
  "utilization_diff": 14.8,
  "safety_margin_a": 45.2,
  "safety_margin_b": 38.7,
  "safety_margin_diff": -6.5,
  "resource_slack_a": 15.0,
  "resource_slack_b": 12.5,
  "resource_slack_diff": -2.5,
  "is_safe_a": true,
  "is_safe_b": false,
  "total_divergence_score": 23.4
}
```

**When to Call**: When both scenario states are updated.

---

## 🎨 Styling Guide

### Tailwind Classes

**Color Schemes**:
```javascript
// Matrices
allocation: 'bg-blue-500/10 border-blue-500/50 text-blue-400'
max: 'bg-purple-500/10 border-purple-500/50 text-purple-400'
need: 'bg-orange-500/10 border-orange-500/50 text-orange-400'
available: 'bg-green-500/10 border-green-500/50 text-green-400'

// Safety states
safe: 'bg-green-500/20 text-green-400'
unsafe: 'bg-red-500/20 text-red-400'

// Severity
error: 'bg-red-500/10 border-red-500 text-red-400'
warning: 'bg-yellow-500/10 border-yellow-500 text-yellow-400'
info: 'bg-blue-500/10 border-blue-500 text-blue-400'

// Active process
active: 'ring-2 ring-yellow-500 bg-yellow-500/20'
```

**Common Patterns**:
```javascript
// Card
className="bg-card border border-border rounded-lg p-4"

// Section header
className="text-xl font-semibold mb-4"

// Button primary
className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"

// Input
className="bg-background border border-input rounded-md px-3 py-2"
```

---

## 🧪 Testing Approach

### Manual Testing Checklist

**Core Features**:
- [ ] Edit allocation/max matrices
- [ ] Run safety algorithm (auto mode)
- [ ] Submit resource request (valid)
- [ ] Submit resource request (invalid - exceeds need)
- [ ] Submit resource request (denied - unsafe)
- [ ] Terminate process
- [ ] Load preset example
- [ ] Export state
- [ ] Import state

**Step-by-Step**:
- [ ] Enable step-by-step mode
- [ ] Navigate forward through steps
- [ ] Navigate backward through steps
- [ ] Play auto-advance
- [ ] Pause auto-advance
- [ ] Reset to initial step

**Comparison**:
- [ ] Open comparison mode
- [ ] Edit scenario 1
- [ ] Edit scenario 2
- [ ] Switch to differential view
- [ ] Toggle sync scroll
- [ ] View metrics dashboard

**Mistake Detection**:
- [ ] Set allocation > max (should show error)
- [ ] Set max = 0 with allocation > 0 (should show warning)
- [ ] Make available very low (should show warning)
- [ ] Fix mistake (should disappear)
- [ ] Dismiss mistake

---

## 🐛 Common Issues & Solutions

### Issue 1: Backend routes not working
**Symptom**: 404 errors when calling `/api/banker/validate`

**Cause**: `app.include_router(api_router)` called before route definitions.

**Solution**: Move `app.include_router(api_router)` to END of `server.py`.

```python
# Wrong order
app.include_router(api_router)  # Line 70
@api_router.post("/banker/validate")  # Line 210

# Correct order
@api_router.post("/banker/validate")  # Line 210
app.include_router(api_router)  # Line 288 (END)
```

---

### Issue 2: State not updating after edit
**Symptom**: Edit matrix cell, but changes don't persist.

**Cause**: Missing `onCellChange` handler or tutorial mode active.

**Solution**:
```javascript
// Check if tutorial is active (editing disabled)
const { isTutorialActive } = useTutorial();

<MatrixDisplay
  editable={!isTutorialActive}  // ← Important
  onCellChange={updateAllocation}  // ← Must be connected
/>
```

---

### Issue 3: Comparison scenarios show same data
**Symptom**: Both scenarios display identical matrices despite different configs.

**Cause**: Single BankerProvider shared between scenarios (tight coupling).

**Solution**: Use separate BankerProvider instances.

```javascript
// Wrong: Single provider
<BankerProvider>
  <ScenarioPanel1 />
  <ScenarioPanel2 />
</BankerProvider>

// Correct: Dual providers
<BankerProvider initialState={scenario1}>
  <ScenarioPanel1 />
</BankerProvider>
<BankerProvider initialState={scenario2}>
  <ScenarioPanel2 />
</BankerProvider>
```

---

### Issue 4: Frontend crashes on invalid import
**Symptom**: App crashes when importing JSON with wrong structure.

**Cause**: Missing validation before applying imported state.

**Solution**:
```javascript
const importState = (data) => {
  // Validate structure
  const validation = validateImportedState(data);
  if (!validation.valid) {
    toast.error(validation.error);
    return;
  }
  
  // Safe to apply
  setNumProcesses(data.numProcesses);
  setAllocation(data.allocation);
  // ...
};
```

---

## 🚀 Performance Optimization Tips

### 1. Memoize Computed Values
```javascript
// Good: Recomputes only when dependencies change
const need = useMemo(() => 
  max.map((row, i) => row.map((val, j) => val - allocation[i][j])),
  [allocation, max]
);

// Bad: Recomputes on every render
const need = max.map((row, i) => row.map((val, j) => val - allocation[i][j]));
```

### 2. Debounce Expensive Operations
```javascript
// Validation with debounce
const debouncedValidation = useMemo(
  () => debounce(validateState, 500),
  []
);

useEffect(() => {
  debouncedValidation(state);
}, [state]);
```

### 3. Use Callback Hooks
```javascript
// Prevents re-creation on every render
const updateAllocation = useCallback((i, j, val) => {
  setAllocation(prev => {
    const newAlloc = [...prev];
    newAlloc[i] = [...newAlloc[i]];
    newAlloc[i][j] = val;
    return newAlloc;
  });
}, []);
```

### 4. Lazy Load Heavy Components
```javascript
const GanttChart = React.lazy(() => import('./GanttChart'));

<Suspense fallback={<Spinner />}>
  <GanttChart data={chartData} />
</Suspense>
```

---

## 📦 Dependencies

### Frontend
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router-dom": "^6.x",
  "recharts": "^3.6.0",
  "@radix-ui/react-*": "^1.x",
  "lucide-react": "^0.x",
  "tailwindcss": "^3.x",
  "sonner": "^1.x"
}
```

### Backend
```txt
fastapi==0.100.0
uvicorn==0.23.0
motor==3.3.0
pydantic==2.3.0
python-dotenv==1.0.0
```

---

## 🎯 Code Style

### React Components
```javascript
// Functional components with hooks
export const MyComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);
  const computed = useMemo(() => expensiveCalc(state), [state]);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  return (
    <div className="container">
      {/* JSX */}
    </div>
  );
};
```

### Python Backend
```python
# Type hints everywhere
@api_router.post("/endpoint", response_model=ResponseModel)
async def endpoint_handler(request: RequestModel) -> ResponseModel:
    # Logic
    result = process_request(request)
    return result
```

---

## 📚 Resources

### Documentation Files
- `PROJECT_DOCUMENTATION.md` - Complete technical documentation
- `EXECUTIVE_OVERVIEW.md` - High-level overview
- `DEVELOPER_REFERENCE.md` - This file
- `test_result.md` - Testing history and protocols

### External Resources
- [React Documentation](https://react.dev)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org)
- [Banker's Algorithm (Wikipedia)](https://en.wikipedia.org/wiki/Banker%27s_algorithm)

---

## 🤝 Contributing

### Development Workflow
1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes
3. Test thoroughly (manual + automated)
4. Commit: `git commit -m "feat: add my feature"`
5. Push: `git push origin feature/my-feature`
6. Create pull request

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

**Types**: feat, fix, docs, style, refactor, test, chore

**Example**:
```
feat(comparison): add divergence score calculation

- Calculate weighted sum of metric differences
- Cap score at 100
- Display in metrics dashboard

Closes #42
```

---

## 📞 Support

For questions or issues:
1. Check this guide
2. Review `PROJECT_DOCUMENTATION.md`
3. Search existing issues on GitHub
4. Create new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if relevant

---

**Last Updated**: January 26, 2026
**Maintainer**: Dhruv Patel
**Version**: 1.0.0
