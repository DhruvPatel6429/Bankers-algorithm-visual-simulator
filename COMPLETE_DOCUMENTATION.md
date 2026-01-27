# Banker's Algorithm Simulator - Complete Documentation

## 📚 Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Features & Capabilities](#features--capabilities)
4. [User Guide](#user-guide)
5. [Technical Documentation](#technical-documentation)
6. [Algorithm Explanation](#algorithm-explanation)
7. [File Structure](#file-structure)
8. [Setup & Installation](#setup--installation)
9. [API Reference](#api-reference)
10. [Troubleshooting](#troubleshooting)

---

## 📖 Project Overview

### What is the Banker's Algorithm?
The Banker's Algorithm is a deadlock avoidance algorithm developed by Edsger Dijkstra. It ensures that a system will never enter an unsafe state by carefully managing resource allocation to processes.

### Purpose of This Simulator
This interactive web application helps students and educators:
- **Visualize** the Banker's Algorithm in action
- **Understand** how safe states are determined
- **Experiment** with different resource configurations
- **Learn** through step-by-step execution
- **Practice** with interactive resource requests

### Key Characteristics
- **Technology Stack**: React (Frontend), FastAPI (Backend), MongoDB (Database)
- **User Interface**: Modern dark theme with smooth animations
- **Interactivity**: Real-time validation, step-by-step execution, visual feedback
- **Educational Focus**: Clear explanations, theory panels, justification logs

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │         React Frontend (Port 3000)                 │  │
│  │  - UI Components (Matrices, Charts, Forms)         │  │
│  │  - Context API (State Management)                  │  │
│  │  - Banker's Algorithm Logic                        │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP/REST API
                      ↓
┌─────────────────────────────────────────────────────────┐
│              FastAPI Backend (Port 8001)                 │
│  - Validation Endpoints                                  │
│  - Comparison Endpoints                                  │
│  - State Export/Import                                   │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────┐
│              MongoDB Database (Port 27017)               │
│  - System Configurations                                 │
│  - Historical States                                     │
│  - User Sessions                                         │
└─────────────────────────────────────────────────────────┘
```

### Component Architecture

```
Frontend Components Hierarchy:

App.js
├── TutorialProvider (Context)
│   └── BankerProvider (Context)
│       └── BankerDashboard
│           ├── Header
│           │   ├── TutorialToggle
│           │   └── ComparisonModeToggle
│           │
│           ├── Left Sidebar
│           │   └── ConfigurationPanel
│           │       ├── Dimension Controls
│           │       ├── Animation Speed
│           │       ├── Example Loader
│           │       └── Export/Import
│           │
│           ├── Main Content
│           │   ├── System State Matrices
│           │   │   ├── Allocation Matrix
│           │   │   ├── Max Matrix
│           │   │   ├── Need Matrix (Computed)
│           │   │   └── Available Vector
│           │   │
│           │   ├── Algorithm & Request
│           │   │   ├── StepByStepSafetyDisplay
│           │   │   └── InteractiveResourceRequest
│           │   │
│           │   ├── System Resource Chart
│           │   └── Per-Process Resource Charts
│           │
│           └── Right Sidebar
│               ├── ProcessList
│               ├── MistakeDetectionPanel
│               ├── StepJustificationPanel
│               └── TheoryPanel
│
└── TutorialOverlay
```

---

## 🎯 Features & Capabilities

### 1. **System Configuration**
- **Number of Processes**: Configure 1-10 processes
- **Number of Resources**: Configure 1-5 resource types
- **Animation Speed**: Adjust from Fast to Slow
- **Preset Examples**: Load Silberschatz or Custom examples

### 2. **Matrix Management**
#### Allocation Matrix
- Shows currently allocated resources to each process
- **Editable**: Click any cell to modify values
- **Color**: Blue theme
- **Validation**: Real-time mistake detection

#### Max Matrix
- Shows maximum resource needs declared by each process
- **Editable**: Click any cell to modify values
- **Color**: Purple theme
- **Purpose**: Defines upper bound for each process

#### Need Matrix (Computed)
- Automatically calculated: Need = Max - Allocation
- **Read-only**: Cannot be edited directly
- **Color**: Orange theme
- **Updates**: Recalculates when Allocation or Max changes

#### Available Vector
- Shows currently available resources in the system
- **Editable**: Click to modify values
- **Color**: Green theme
- **Critical**: Determines which processes can execute

### 3. **Safety Algorithm Execution**

#### Auto Mode (Default)
- Click "Run Safety Check" to execute
- Animates through all processes automatically
- Shows final result: SAFE or UNSAFE
- Displays safe sequence if found

#### Step-by-Step Mode
- Toggle "Step-by-Step" button to enable
- **Navigation Controls**:
  - **Reset**: Go back to step 0
  - **Back**: Previous step
  - **Forward**: Next step
  - **Play**: Auto-advance
  - **Pause**: Stop auto-advance

- **Visual Feedback**:
  - **Finish Flags**: Shows completion status
    - `P0: ✓` = Completed
    - `P0: ○` = Pending
  - **Active Process**: Yellow ring around current process
  - **Work Vector**:
    - Before: Resources available before execution
    - After: Resources available after release
  - **Safe Sequence**: Progressive display (P1 → P3 → ...)

- **Explanations**:
  - **Simple**: "Process P4 can execute. Need ≤ Work."
  - **Detailed**: Full breakdown with resource values
  - **Step Counter**: "Step 3 of 7"

### 4. **Interactive Resource Request**

#### Request Submission Flow
1. **Select Process**: Choose from dropdown (P0-P4)
2. **View Current State**: 
   - Need[Process]: Shows remaining needs
   - Available: Shows available resources
3. **Enter Request**: Input values for each resource
4. **Real-Time Validation**:
   - ✅ Green: Valid request
   - ❌ Red: Exceeds Need or Available
5. **Submit**: Click "Submit Request"

#### Simulation Phases
1. **Validating Request** (500ms)
   - Checks Request ≤ Need
   - Checks Request ≤ Available
   
2. **Checking Safety** (variable)
   - Temporarily allocates resources
   - Runs safety algorithm on new state
   - Shows temporary state preview
   
3. **Result** (1000-1500ms)
   - **Granted**: ✅ Shows safe sequence, updates state
   - **Denied**: ❌ Shows reason, initiates rollback
   
4. **Rollback** (800ms, if denied)
   - Animates return to previous state
   - Resources not allocated

#### Visual Elements
- **Temporary State Preview**:
  - Shows Allocation[Process] before/after
  - Shows Available before/after
  - Arrow indicators for transitions

- **Validation Messages**:
  - Real-time as you type
  - Clear error/success indicators
  - Specific resource violations

### 5. **Mistake Detection System**

Automatically detects and highlights:
1. **Allocation > Max** (ERROR)
   - Severity: High
   - Impact: Invalid state
   
2. **Negative Need** (ERROR)
   - Severity: High
   - Cause: Allocation exceeds Max
   
3. **Low Available Resources** (WARNING)
   - Severity: Medium
   - Impact: May lead to unsafe state
   
4. **Allocation without Max** (WARNING)
   - Severity: Low
   - Suggestion: Define Max values
   
5. **All Processes Completed** (INFO)
   - Severity: Low
   - Status: System in final state

**Features**:
- Badge counter showing number of issues
- Expandable panels for each mistake
- Actionable suggestions
- Dismissible alerts
- Color-coded severity (red=error, yellow=warning, blue=info)

### 6. **Step Justification Panel**

Provides formal proof for each execution step:
- **Accordion Interface**: Expand any step to see details
- **For Each Step**:
  - Step number and process (e.g., "Step 1: Process P1")
  - Decision: GRANT
  - Condition checked: Need ≤ Work
  - Work vectors (before/after)
  - Formal explanation
  - Mathematical proof steps

**Export Feature**:
- Click "Export" to download as .txt file
- Contains complete justification for all steps
- Suitable for academic submission

### 7. **Scenario Comparison** (Existing Feature)

Compare two independent scenarios side-by-side:
- **Side-by-Side View**: Two complete panels
- **Differential View**: Shows differences
- **Sync Scroll**: Coordinate scrolling
- **Independent States**: No shared data
- **Metrics Dashboard**: Comparison statistics

### 8. **Tutorial Mode** (Existing Feature)

Guided walkthrough of the system:
- **6 Tutorial Steps**:
  1. Overview: Introduction
  2. Matrices: Understanding data structures
  3. Safety: Algorithm execution
  4. Request: Resource requests
  5. Outcome: Safe vs Unsafe
  6. Completed: Summary

**Features**:
- Step-by-step navigation
- Highlighted target elements
- Descriptive text for each concept
- Matrix editing locked during tutorial
- Escape key to exit

### 9. **Export/Import System State**

#### Export
- Click "Export State" to download JSON
- Contains:
  - Number of processes and resources
  - All matrix values (Allocation, Max)
  - Available vector
  - Animation speed
  - Timestamp

#### Import
- Click "Import State" to upload JSON
- Validates structure before applying
- Preserves all system configuration
- Resets safety result

### 10. **Visualization & Charts**

#### System-Wide Resource Chart
- Bar chart showing total allocation vs available
- Color-coded by resource type
- Legend: Blue (Allocated), Green (Available)

#### Per-Process Resource Charts
- Individual charts for each process
- Shows Allocation, Max, and Need
- Scroll area for multiple processes
- Color-coded bars

### 11. **Process Control**

- **Process List**: Shows all active processes
- **Termination**: Click trash icon to terminate
  - Releases all allocated resources
  - Resets Max to zero
  - Resources returned to Available
- **Status Indicators**: Green dot for active processes

### 12. **Theory Panel**

Educational content covering:
- **What is Deadlock?**
  - Conditions for deadlock
  - Real-world examples
  
- **Banker's Algorithm**
  - Purpose and history
  - How it works
  
- **Safe State**
  - Definition
  - Characteristics
  
- **Safety Algorithm Steps**
  - Detailed algorithm walkthrough
  
- **Key Matrices**
  - Allocation, Max, Need, Available
  - Purpose of each

---

## 📘 User Guide

### Getting Started

#### 1. **Understanding the Default State**
When you first load the simulator:
- 5 processes (P0-P4)
- 3 resource types (R0-R2)
- Pre-loaded Silberschatz example
- Available: [3, 3, 2]

#### 2. **Running Your First Safety Check**
1. Scroll to "Safety Algorithm Execution" section
2. Click "Run Safety Check" button
3. Watch the animation (processes highlighted one by one)
4. View result: SAFE or UNSAFE
5. See safe sequence if system is safe

#### 3. **Experimenting with Step-by-Step Mode**
1. Click "Step-by-Step" toggle button
2. Click "Run Safety Check" to generate steps
3. Use "Forward" button to advance one step
4. Observe:
   - Current process highlighted
   - Work vector before/after
   - Finish flags updating
   - Safe sequence building
5. Use "Back" to review previous steps
6. Click "Play" to auto-advance

#### 4. **Making a Resource Request**
1. Scroll to "Interactive Resource Request" section
2. Select a process (e.g., P0)
3. View current Need and Available
4. Enter request values (e.g., [1, 0, 0])
5. Watch real-time validation
6. Click "Submit Request"
7. Observe simulation phases
8. See result (granted or denied)

### Advanced Usage

#### Modifying System Configuration
1. **Change Dimensions**:
   - Enter new number of processes (1-10)
   - Enter new number of resources (1-5)
   - Click "Apply Dimensions"
   - All matrices reset to zero

2. **Edit Matrices**:
   - Click any cell in Allocation or Max
   - Enter new value
   - Press Enter or click outside
   - Need matrix updates automatically

3. **Adjust Animation Speed**:
   - Drag slider: Fast ↔ Slow
   - Affects algorithm execution speed
   - Useful for demonstrations

#### Loading Examples
1. **Silberschatz Example**:
   - Classic textbook example
   - 5 processes, 3 resources
   - Known safe state
   
2. **Custom Example**:
   - Different configuration
   - 4 processes, 4 resources
   - Alternative scenario

#### Using Tutorial Mode
1. Click "Start Tutorial" in header
2. Read each step's explanation
3. Click "Next" to advance
4. Click "Previous" to go back
5. Press Escape to exit anytime
6. Editing disabled during tutorial

#### Comparing Scenarios
1. Click "Compare Scenarios" in header
2. Two independent panels appear
3. Configure each scenario differently
4. Switch between "Side-by-Side" and "Differential" tabs
5. Toggle "Sync Scroll" as needed
6. Click "Exit Comparison" to return

### Best Practices

#### For Learning
1. Start with default example
2. Run safety check in auto mode first
3. Enable step-by-step mode to understand details
4. Try modifying one value at a time
5. Make resource requests to see validation
6. Use theory panel for concept review

#### For Teaching
1. Use tutorial mode for first-time users
2. Enable step-by-step for demonstrations
3. Slow animation speed for explanations
4. Use comparison mode for different scenarios
5. Export step justification for assignments
6. Create custom examples for specific lessons

#### For Testing Understanding
1. Predict safe sequence before running
2. Verify prediction with step-by-step
3. Try unsafe configurations
4. Submit requests and predict outcomes
5. Use mistake detection to find errors
6. Export states for later review

---

## 🔧 Technical Documentation

### Technology Stack

#### Frontend
- **React 19.0.0**: UI framework
- **Tailwind CSS**: Styling
- **Radix UI**: Component primitives
- **Recharts 3.6.0**: Data visualization
- **Lucide React**: Icons
- **Sonner**: Toast notifications
- **React Router DOM**: Navigation

#### Backend
- **FastAPI**: Python web framework
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation
- **Python 3.11**: Runtime

#### Database
- **MongoDB**: Document database
- **PyMongo**: Python driver

#### Build Tools
- **CRACO**: React customization
- **Yarn**: Package manager
- **Supervisor**: Process management

### State Management

#### Context Structure
```javascript
BankerContext {
  // State
  numProcesses: number,
  numResources: number,
  allocation: number[][],
  max: number[][],
  available: number[],
  need: number[][] (computed),
  animationSpeed: number,
  safetyResult: object | null,
  isRunning: boolean,
  currentStep: object | null,
  activeProcess: number | null,
  
  // Step-by-step state
  stepByStepMode: boolean,
  allSteps: array,
  currentStepIndex: number,
  isPaused: boolean,
  
  // Request simulation state
  requestSimulation: object | null,
  
  // Actions
  updateDimensions(p, r),
  updateAllocation(pi, ri, val),
  updateMax(pi, ri, val),
  updateAvailable(ri, val),
  runSafetyAlgorithm(),
  requestResources(pi, request),
  terminateProcess(pi),
  resetSystem(),
  loadExample(type),
  importState(data),
  
  // Step-by-step actions
  enableStepByStepMode(),
  disableStepByStepMode(),
  stepForward(),
  stepBackward(),
  resetSteps(),
  playSteps(),
  pauseSteps()
}
```

### Data Structures

#### Step Object
```javascript
{
  type: 'init' | 'execute' | 'complete' | 'deadlock',
  stepNumber: number,
  processIndex?: number,
  need?: number[],
  workBefore?: number[],
  workAfter?: number[],
  allocation?: number[],
  finish: boolean[],
  safeSequence: number[],
  message: string,
  explanation: string,
  detailedExplanation?: string,
  unfinishedProcesses?: number[]
}
```

#### Request Simulation Object
```javascript
{
  phase: 'validating' | 'checking_safety' | 'granted' | 'denied' | 'rollback',
  processIndex: number,
  request: number[],
  tempAllocation: number[][],
  tempAvailable: number[],
  originalAllocation: number[][],
  originalAvailable: number[],
  isSafe?: boolean,
  safeSequence?: number[]
}
```

#### Safety Result Object
```javascript
{
  isSafe: boolean,
  safeSequence: number[],
  steps: Step[]
}
```

### API Endpoints

#### Backend Endpoints

**1. GET /api/**
- Description: Health check
- Response: `{"status": "ok"}`

**2. POST /api/status**
- Description: Service status
- Response: `{"backend": "running", "mongodb": "connected"}`

**3. POST /api/banker/compare**
- Description: Compare two scenarios
- Request Body:
```json
{
  "scenario1": {
    "allocation": number[][],
    "max": number[][],
    "available": number[],
    "safetyResult": object
  },
  "scenario2": { ... }
}
```
- Response:
```json
{
  "utilization1": number,
  "utilization2": number,
  "safetyMargin1": number,
  "safetyMargin2": number,
  "divergenceScore": number
}
```

**4. POST /api/banker/validate**
- Description: Validate system state
- Request Body:
```json
{
  "numProcesses": number,
  "numResources": number,
  "allocation": number[][],
  "max": number[][],
  "available": number[]
}
```
- Response:
```json
{
  "mistakes": [
    {
      "type": string,
      "severity": string,
      "processIndex": number,
      "resourceIndex": number,
      "message": string,
      "suggestion": string
    }
  ]
}
```

### Performance Characteristics

#### Time Complexity
- **Safety Algorithm**: O(m × n²)
  - m = number of resources
  - n = number of processes
  
- **Need Calculation**: O(m × n)

- **Request Validation**: O(m)

#### Space Complexity
- **State Storage**: O(m × n)
- **Step History**: O(n × s)
  - s = number of steps

#### Rendering Performance
- **Initial Render**: ~500ms
- **Matrix Update**: <50ms
- **Chart Render**: ~200ms
- **Step Navigation**: <50ms

---

## 📐 Algorithm Explanation

### Banker's Algorithm - Deep Dive

#### Core Concept
The Banker's Algorithm simulates resource allocation ahead of time to determine if granting a request would leave the system in a safe state. A state is "safe" if there exists at least one sequence in which all processes can complete.

#### Key Terms

**Safe State**: A state where there exists a safe sequence.

**Safe Sequence**: An ordering of processes (P₁, P₂, ..., Pₙ) such that for each Pᵢ:
- Needᵢ ≤ Work (after P₁...Pᵢ₋₁ complete)
- Where Work = Available + Σ(Allocation of completed processes)

**Unsafe State**: A state where no safe sequence exists. Does NOT mean deadlock will occur, but deadlock is possible.

**Deadlock**: A state where processes are waiting indefinitely for resources held by other waiting processes. All deadlocked states are unsafe, but not all unsafe states lead to deadlock.

#### Algorithm Steps

**Safety Algorithm**:
```
Input: 
  - Allocation[n][m]: Current allocations
  - Max[n][m]: Maximum needs
  - Available[m]: Available resources

Output:
  - isSafe: boolean
  - safeSequence: array of process indices

1. Initialize:
   Work = Available
   Finish[n] = [false, false, ..., false]
   SafeSequence = []

2. While (there exists an unfinished process):
   a. Find process Pᵢ where:
      - Finish[i] == false
      - Need[i] ≤ Work (for all resources)
   
   b. If such process found:
      - Work = Work + Allocation[i]
      - Finish[i] = true
      - SafeSequence.append(i)
   
   c. If no such process found:
      - Break (system is unsafe)

3. If all Finish[i] == true:
   - Return (true, SafeSequence)
   Else:
   - Return (false, [])
```

**Resource Request Algorithm**:
```
Input:
  - Process: Pᵢ
  - Request[m]: Requested resources

1. Validation:
   If Request > Need[i]:
     Return "Request exceeds maximum claim"
   If Request > Available:
     Return "Resources not available"

2. Tentative Allocation:
   Available = Available - Request
   Allocation[i] = Allocation[i] + Request
   Need[i] = Need[i] - Request

3. Safety Check:
   Run Safety Algorithm with new state
   
4. Decision:
   If safe:
     Commit the allocation
     Return "Request granted"
   Else:
     Rollback to original state
     Return "Request denied - would lead to unsafe state"
```

### Example Walkthrough

#### Initial State
```
Processes: 5 (P0-P4)
Resources: 3 (R0-R2)

Allocation:
    R0  R1  R2
P0   0   1   0
P1   2   0   0
P2   3   0   2
P3   2   1   1
P4   0   0   2

Max:
    R0  R1  R2
P0   7   5   3
P1   3   2   2
P2   9   0   2
P3   2   2   2
P4   4   3   3

Available: [3, 3, 2]

Need (Max - Allocation):
    R0  R1  R2
P0   7   4   3
P1   1   2   2
P2   6   0   0
P3   0   1   1
P4   4   3   1
```

#### Safety Check Execution

**Step 1**: Initialize
- Work = [3, 3, 2]
- Finish = [F, F, F, F, F]
- SafeSequence = []

**Step 2**: Find executable process
- Check P0: Need[0]=[7,4,3] > Work=[3,3,2] ❌
- Check P1: Need[1]=[1,2,2] ≤ Work=[3,3,2] ✅

Execute P1:
- Work = [3,3,2] + [2,0,0] = [5,3,2]
- Finish[1] = true
- SafeSequence = [1]

**Step 3**: Find next process
- Check P0: Need[0]=[7,4,3] > Work=[5,3,2] ❌
- Check P2: Need[2]=[6,0,0] > Work=[5,3,2] ❌
- Check P3: Need[3]=[0,1,1] ≤ Work=[5,3,2] ✅

Execute P3:
- Work = [5,3,2] + [2,1,1] = [7,4,3]
- Finish[3] = true
- SafeSequence = [1, 3]

**Step 4**: Find next process
- Check P0: Need[0]=[7,4,3] ≤ Work=[7,4,3] ✅

Execute P0:
- Work = [7,4,3] + [0,1,0] = [7,5,3]
- Finish[0] = true
- SafeSequence = [1, 3, 0]

**Step 5**: Find next process
- Check P2: Need[2]=[6,0,0] ≤ Work=[7,5,3] ✅

Execute P2:
- Work = [7,5,3] + [3,0,2] = [10,5,5]
- Finish[2] = true
- SafeSequence = [1, 3, 0, 2]

**Step 6**: Find next process
- Check P4: Need[4]=[4,3,1] ≤ Work=[10,5,5] ✅

Execute P4:
- Work = [10,5,5] + [0,0,2] = [10,5,7]
- Finish[4] = true
- SafeSequence = [1, 3, 0, 2, 4]

**Result**: 
- All processes finished ✅
- System is SAFE
- Safe sequence: P1 → P3 → P0 → P2 → P4

#### Request Example

**Scenario**: P1 requests [1, 0, 2]

**Step 1**: Validate
- Request [1,0,2] vs Need[1] [1,2,2] → [1,0,2] ≤ [1,2,2] ✅
- Request [1,0,2] vs Available [3,3,2] → [1,0,2] ≤ [3,3,2] ✅

**Step 2**: Tentative allocation
```
New Allocation[1] = [2,0,0] + [1,0,2] = [3,0,2]
New Available = [3,3,2] - [1,0,2] = [2,3,0]
New Need[1] = [1,2,2] - [1,0,2] = [0,2,0]
```

**Step 3**: Run safety check with new state
- Work = [2,3,0]
- Try to find safe sequence...
- Result: UNSAFE (no safe sequence exists)

**Step 4**: Rollback
- Restore original Allocation[1] = [2,0,0]
- Restore original Available = [3,3,2]
- Return "Request DENIED"

---

## 📂 File Structure

```
/app/
├── backend/
│   ├── server.py                    # FastAPI main server
│   ├── requirements.txt             # Python dependencies
│   └── .env                        # Backend environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                 # Radix UI primitives
│   │   │   │   ├── button.jsx
│   │   │   │   ├── card.jsx
│   │   │   │   ├── input.jsx
│   │   │   │   ├── select.jsx
│   │   │   │   ├── alert.jsx
│   │   │   │   ├── badge.jsx
│   │   │   │   ├── accordion.jsx
│   │   │   │   ├── scroll-area.jsx
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── MatrixDisplay.js              # Matrix and vector displays
│   │   │   ├── ResourceCharts.js             # Chart components
│   │   │   ├── ConfigurationPanel.js         # System configuration
│   │   │   ├── ProcessList.js                # Process control panel
│   │   │   ├── TheoryPanel.js                # Educational content
│   │   │   │
│   │   │   ├── SafetyAlgorithmDisplay.js     # Original safety display
│   │   │   ├── StepByStepSafetyDisplay.js    # NEW: Step-by-step execution
│   │   │   │
│   │   │   ├── ResourceRequestForm.js         # Original request form
│   │   │   ├── InteractiveResourceRequest.js  # NEW: Interactive request
│   │   │   │
│   │   │   ├── MistakeDetectionPanel.js      # Error detection
│   │   │   ├── StepJustificationPanel.js     # Execution justification
│   │   │   │
│   │   │   ├── TutorialOverlay.js            # Tutorial system
│   │   │   ├── ScenarioComparison.js         # Scenario comparison
│   │   │   └── ScenarioComparisonEnhanced.js # Enhanced comparison
│   │   │
│   │   ├── contexts/
│   │   │   ├── BankerContext.js              # Main state management
│   │   │   ├── TutorialContext.js            # Tutorial state
│   │   │   └── ComparisonContext.js          # Comparison state
│   │   │
│   │   ├── pages/
│   │   │   └── BankerDashboard.js            # Main dashboard page
│   │   │
│   │   ├── config/
│   │   │   └── features.js                   # Feature flags
│   │   │
│   │   ├── utils/
│   │   │   ├── stateValidation.js            # State validation utilities
│   │   │   └── stateExport.js                # Export/Import utilities
│   │   │
│   │   ├── lib/
│   │   │   └── utils.js                      # Utility functions (cn, etc.)
│   │   │
│   │   ├── hooks/
│   │   │   └── use-toast.js                  # Toast hook
│   │   │
│   │   ├── App.js                            # React root component
│   │   ├── App.css                           # App styles
│   │   ├── index.js                          # React entry point
│   │   └── index.css                         # Global styles (Tailwind)
│   │
│   ├── public/
│   │   └── index.html                        # HTML template
│   │
│   ├── package.json                          # NPM dependencies
│   ├── tailwind.config.js                    # Tailwind configuration
│   ├── postcss.config.js                     # PostCSS configuration
│   ├── craco.config.js                       # CRACO configuration
│   ├── components.json                       # shadcn/ui config
│   └── .env                                  # Frontend environment variables
│
├── tests/                                    # Test directory
├── scripts/                                  # Utility scripts
│
├── test_result.md                           # Testing documentation
├── README.md                                # Project overview
├── PHASE3_IMPLEMENTATION_SUMMARY.md        # Phase 3 features
└── COMPLETE_DOCUMENTATION.md               # This file
```

### Key Files Explained

#### Backend
- **server.py**: Main FastAPI application with validation and comparison endpoints
- **requirements.txt**: Python package dependencies

#### Frontend Core
- **App.js**: Root component, wraps providers
- **BankerDashboard.js**: Main dashboard layout and component composition
- **BankerContext.js**: Core state management with all algorithm logic

#### Feature Components
- **StepByStepSafetyDisplay.js**: Step-by-step execution UI with navigation controls
- **InteractiveResourceRequest.js**: Request simulator with real-time validation
- **MistakeDetectionPanel.js**: Automatic error detection and suggestions
- **StepJustificationPanel.js**: Formal proofs for each execution step
- **TutorialOverlay.js**: Interactive tutorial system
- **ScenarioComparisonEnhanced.js**: Side-by-side scenario comparison

#### Styling
- **index.css**: Tailwind imports and global styles
- **tailwind.config.js**: Theme configuration (dark mode, colors, animations)

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js**: v18+ (for frontend)
- **Python**: 3.11+ (for backend)
- **MongoDB**: 6.0+ (for database)
- **Yarn**: 1.22+ (package manager)

### Installation Steps

#### 1. Clone Repository
```bash
git clone <repository-url>
cd app
```

#### 2. Frontend Setup
```bash
cd frontend
yarn install
```

#### 3. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

#### 4. Environment Configuration

**Frontend `.env`**:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

**Backend `.env`**:
```env
MONGO_URL=mongodb://localhost:27017/banker_db
```

#### 5. Start Services

**Option A: Using Supervisor (Production)**
```bash
sudo supervisorctl start all
```

**Option B: Manual (Development)**

Terminal 1 - MongoDB:
```bash
mongod --dbpath /data/db
```

Terminal 2 - Backend:
```bash
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

Terminal 3 - Frontend:
```bash
cd frontend
yarn start
```

#### 6. Access Application
Open browser to: `http://localhost:3000`

### Verification

Check that all services are running:
- Frontend: http://localhost:3000 (should show dashboard)
- Backend: http://localhost:8001/docs (should show API docs)
- MongoDB: Connection on port 27017

---

## 📚 API Reference

### Frontend API (BankerContext)

#### State Management Functions

**updateDimensions(processes, resources)**
- Purpose: Change system dimensions
- Parameters:
  - `processes` (number): New process count (1-10)
  - `resources` (number): New resource count (1-5)
- Effect: Resets all matrices to zero

**updateAllocation(processIndex, resourceIndex, value)**
- Purpose: Update allocation matrix
- Parameters:
  - `processIndex` (number): Process index (0-n)
  - `resourceIndex` (number): Resource index (0-m)
  - `value` (number): New allocation value
- Effect: Updates Allocation[processIndex][resourceIndex]

**updateMax(processIndex, resourceIndex, value)**
- Purpose: Update max matrix
- Parameters: Same as updateAllocation
- Effect: Updates Max[processIndex][resourceIndex]

**updateAvailable(resourceIndex, value)**
- Purpose: Update available vector
- Parameters:
  - `resourceIndex` (number): Resource index (0-m)
  - `value` (number): New available value
- Effect: Updates Available[resourceIndex]

#### Algorithm Functions

**runSafetyAlgorithm(tempAllocation?, tempAvailable?, skipAnimation?)**
- Purpose: Execute safety algorithm
- Parameters:
  - `tempAllocation` (optional): Temporary allocation state
  - `tempAvailable` (optional): Temporary available state
  - `skipAnimation` (optional): Skip animation delays
- Returns: Promise<{isSafe: boolean, safeSequence: number[], steps: Step[]}>
- Effect: Updates safetyResult state

**requestResources(processIndex, request)**
- Purpose: Submit resource request
- Parameters:
  - `processIndex` (number): Requesting process
  - `request` (number[]): Request vector
- Returns: Promise<{granted: boolean, reason: string, ...}>
- Effect: May update allocation and available if granted

**terminateProcess(processIndex)**
- Purpose: Terminate a process
- Parameters:
  - `processIndex` (number): Process to terminate
- Effect: Releases resources, resets process allocation/max

#### Step-by-Step Functions

**enableStepByStepMode()**
- Purpose: Enable step-by-step execution
- Effect: Sets stepByStepMode = true

**disableStepByStepMode()**
- Purpose: Disable step-by-step execution
- Effect: Sets stepByStepMode = false, resets step index

**stepForward()**
- Purpose: Advance to next step
- Effect: Increments currentStepIndex, updates currentStep

**stepBackward()**
- Purpose: Go to previous step
- Effect: Decrements currentStepIndex, updates currentStep

**resetSteps()**
- Purpose: Reset to initial step
- Effect: Sets currentStepIndex = -1

**playSteps()**
- Purpose: Auto-advance through steps
- Effect: Increments step index with animation delays

**pauseSteps()**
- Purpose: Stop auto-advancement
- Effect: Sets isPaused = true

#### Utility Functions

**resetSystem()**
- Purpose: Reset to default Silberschatz example
- Effect: Restores default allocation, max, available

**loadExample(exampleType)**
- Purpose: Load preset example
- Parameters:
  - `exampleType` (string): 'silberschatz' or 'custom'
- Effect: Updates all matrices to example values

**importState(importedData)**
- Purpose: Import system state from JSON
- Parameters:
  - `importedData` (object): State object with all matrices
- Effect: Restores complete system state

### Backend API

#### GET /api/
Health check endpoint
- Response: `{"status": "ok"}`

#### POST /api/status
Service status check
- Response: 
```json
{
  "backend": "running",
  "mongodb": "connected",
  "timestamp": "2025-01-26T..."
}
```

#### POST /api/banker/compare
Compare two scenarios
- Request:
```json
{
  "scenario1": {
    "numProcesses": 5,
    "numResources": 3,
    "allocation": [[0,1,0], ...],
    "max": [[7,5,3], ...],
    "available": [3,3,2],
    "safetyResult": {...}
  },
  "scenario2": {...}
}
```
- Response:
```json
{
  "utilization1": 0.67,
  "utilization2": 0.82,
  "safetyMargin1": 0.15,
  "safetyMargin2": 0.08,
  "divergenceScore": 23.5
}
```

#### POST /api/banker/validate
Validate system state
- Request:
```json
{
  "numProcesses": 5,
  "numResources": 3,
  "allocation": [[0,1,0], ...],
  "max": [[7,5,3], ...],
  "available": [3,3,2]
}
```
- Response:
```json
{
  "mistakes": [
    {
      "type": "allocation_exceeds_max",
      "severity": "error",
      "processIndex": 2,
      "resourceIndex": 1,
      "message": "Allocation exceeds Max for P2 R1",
      "suggestion": "Reduce allocation or increase max claim"
    }
  ]
}
```

---

## 🔍 Troubleshooting

### Common Issues

#### Frontend won't start
**Symptoms**: Yarn start fails, compilation errors
**Solutions**:
1. Delete node_modules: `rm -rf node_modules`
2. Clear yarn cache: `yarn cache clean`
3. Reinstall: `yarn install`
4. Check Node version: `node --version` (need v18+)

#### Backend not responding
**Symptoms**: API calls fail, 502 errors
**Solutions**:
1. Check if backend running: `curl http://localhost:8001/api/`
2. View logs: `tail -f /var/log/supervisor/backend.err.log`
3. Restart: `sudo supervisorctl restart backend`
4. Check Python version: `python --version` (need 3.11+)

#### MongoDB connection error
**Symptoms**: Database connection refused
**Solutions**:
1. Check MongoDB status: `sudo systemctl status mongodb`
2. Start MongoDB: `sudo systemctl start mongodb`
3. Verify port: `netstat -an | grep 27017`
4. Check MONGO_URL in backend/.env

#### Step-by-step controls not appearing
**Symptoms**: No step navigation buttons
**Solutions**:
1. Click "Step-by-Step" toggle first
2. Run safety check to generate steps
3. Check browser console for errors
4. Refresh page

#### Resource request not working
**Symptoms**: Submit button disabled or no response
**Solutions**:
1. Check if request values exceed Need or Available
2. Ensure at least one resource is requested (not all zeros)
3. Look for validation error messages below inputs
4. Check browser console for errors

#### Matrices not updating
**Symptoms**: Edited values don't persist
**Solutions**:
1. Press Enter after editing
2. Click outside the input field
3. Check if tutorial mode is active (editing disabled)
4. Refresh page and try again

### Browser Compatibility

**Supported Browsers**:
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

**Not Supported**:
- Internet Explorer ❌
- Opera Mini ❌

### Performance Issues

**Slow animations**:
- Increase animation speed slider
- Disable step-by-step mode for quick checks
- Close other browser tabs

**High memory usage**:
- Clear browser cache
- Close comparison mode when not needed
- Restart browser

**Charts not rendering**:
- Check if data is valid (no NaN or undefined)
- Refresh page
- Clear browser cache

---

## 📖 Glossary

**Allocation Matrix**: Current resources allocated to each process

**Available Vector**: Resources currently available in the system

**Deadlock**: State where processes wait indefinitely for resources held by other waiting processes

**Finish Flag**: Boolean indicating if a process has completed execution in the safety algorithm

**Max Matrix**: Maximum resource needs declared by each process

**Need Matrix**: Remaining resource needs (Max - Allocation)

**Process**: Independent unit of execution that requires resources

**Resource**: System resource that can be allocated (e.g., CPU, memory, I/O devices)

**Safe Sequence**: Ordering of processes such that each can complete without deadlock

**Safe State**: State where at least one safe sequence exists

**Safety Algorithm**: Algorithm to determine if system is in safe state

**Unsafe State**: State where no safe sequence exists (potential for deadlock)

**Work Vector**: Temporary available resources during safety algorithm execution

---

## 📝 FAQ

**Q: What happens if I enter invalid values?**
A: The mistake detection system will flag errors automatically. Red error messages will appear, and suggestions will be provided.

**Q: Can I undo changes?**
A: Currently, no undo feature. Use Export before making changes to save current state, then Import to restore.

**Q: How do I save my configuration?**
A: Click "Export State" to download JSON file. Later, click "Import State" to restore.

**Q: Why is my request denied?**
A: Requests are denied if they would lead to an unsafe state. The system shows the reason (e.g., "No safe sequence exists").

**Q: What's the difference between unsafe and deadlock?**
A: Unsafe means deadlock is possible but not guaranteed. Deadlock means processes are actually stuck. The theory panel explains this in detail.

**Q: Can I have more than 10 processes?**
A: Currently limited to 10 processes and 5 resources for UI clarity and performance.

**Q: How do I reset to default?**
A: Click the red "Reset System" button in the configuration panel.

**Q: Why can't I edit during tutorial?**
A: Matrix editing is disabled during tutorial mode to prevent confusion. Exit tutorial to edit.

**Q: What's the safe sequence for my configuration?**
A: Run the safety check to find out. If safe, the sequence will be displayed.

**Q: How accurate is the simulator?**
A: 100% accurate implementation of the Banker's Algorithm as described in operating systems textbooks.

---

## 🎓 Educational Resources

### Learning Path

**Beginner**:
1. Read Theory Panel → "What is Deadlock?"
2. Watch default example in auto mode
3. Try tutorial mode
4. Experiment with simple requests

**Intermediate**:
1. Use step-by-step mode to understand algorithm
2. Try unsafe configurations
3. Submit various requests
4. Study step justification logs

**Advanced**:
1. Compare different scenarios
2. Create custom configurations
3. Predict outcomes before running
4. Export justifications for analysis

### Recommended Exercises

**Exercise 1: Understanding Safe States**
- Start with default example
- Run safety check
- Predict next executable process at each step
- Verify with step-by-step mode

**Exercise 2: Request Validation**
- Try requesting more than Need
- Try requesting more than Available
- Submit a valid request
- Submit a request that would cause unsafe state

**Exercise 3: Creating Unsafe States**
- Modify matrices to create unsafe configuration
- Predict which processes can't complete
- Run safety check to verify

**Exercise 4: Deadlock Conditions**
- Create configuration with:
  - Mutual exclusion
  - Hold and wait
  - No preemption
  - Circular wait
- Observe system behavior

### Citation

If using this simulator in academic work, please cite as:
```
Banker's Algorithm Interactive Simulator
Version 3.0, January 2026
URL: [Your deployment URL]
```

---

## 📄 License & Credits

**License**: [Your license here]

**Built with**:
- React (Meta)
- FastAPI (Sebastián Ramírez)
- Tailwind CSS (Tailwind Labs)
- Radix UI (WorkOS)
- Recharts (Recharts team)

**Algorithm**: Based on Banker's Algorithm by Edsger Dijkstra (1965)

**Reference**: Operating System Concepts by Silberschatz, Galvin, and Gagne

---

## 📧 Support

For issues or questions:
1. Check this documentation
2. Review troubleshooting section
3. Check browser console for errors
4. Contact: [Your contact info]

---

**Last Updated**: January 26, 2026
**Version**: 3.0
**Documentation Author**: AI Assistant
**Review Status**: Complete

---

*This documentation is comprehensive but always evolving. Feedback and suggestions are welcome.*
