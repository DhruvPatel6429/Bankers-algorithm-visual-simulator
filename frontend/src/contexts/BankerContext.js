import React, { createContext, useContext, useState, useCallback } from 'react';

const BankerContext = createContext();

export const useBanker = () => {
  const context = useContext(BankerContext);
  if (!context) {
    throw new Error('useBanker must be used within BankerProvider');
  }
  return context;
};

// Preset scenarios for comparison
export const PRESET_SCENARIOS = {
  SAFE_DEFAULT: {
    name: 'Safe Scenario (Default)',
    allocation: [
      [0, 1, 0],
      [2, 0, 0],
      [3, 0, 2],
      [2, 1, 1],
      [0, 0, 2]
    ],
    max: [
      [7, 5, 3],
      [3, 2, 2],
      [9, 0, 2],
      [2, 2, 2],
      [4, 3, 3]
    ],
    available: [3, 3, 2]
  },
  UNSAFE_SCENARIO: {
    name: 'Unsafe Scenario',
    allocation: [
      [0, 1, 0],
      [2, 0, 0],
      [3, 0, 2],
      [2, 1, 1],
      [0, 0, 2]
    ],
    max: [
      [7, 5, 3],
      [3, 2, 2],
      [9, 0, 2],
      [2, 2, 2],
      [4, 3, 3]
    ],
    available: [1, 0, 0] // Very low resources - unsafe
  },
  HIGH_UTILIZATION: {
    name: 'High Resource Utilization',
    allocation: [
      [2, 2, 1],
      [3, 1, 2],
      [4, 0, 3],
      [1, 2, 2],
      [2, 1, 1]
    ],
    max: [
      [5, 4, 3],
      [6, 3, 4],
      [7, 2, 5],
      [4, 4, 4],
      [5, 3, 3]
    ],
    available: [2, 2, 2]
  },
  LOW_UTILIZATION: {
    name: 'Low Resource Utilization',
    allocation: [
      [0, 0, 1],
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
      [1, 0, 1]
    ],
    max: [
      [7, 5, 3],
      [3, 2, 2],
      [9, 0, 2],
      [2, 2, 2],
      [4, 3, 3]
    ],
    available: [7, 6, 5] // Many available resources
  },
  CRITICAL_STATE: {
    name: 'Critical Resource State',
    allocation: [
      [1, 2, 0],
      [2, 1, 1],
      [3, 0, 2],
      [2, 1, 1],
      [1, 1, 2]
    ],
    max: [
      [4, 5, 2],
      [5, 3, 3],
      [6, 2, 4],
      [4, 3, 3],
      [3, 4, 4]
    ],
    available: [2, 2, 1] // Just enough to be safe
  }
};

export const BankerProvider = ({ children, initialState = null }) => {
  // Use initialState if provided, otherwise use default
  const defaultScenario = PRESET_SCENARIOS.SAFE_DEFAULT;
  const initial = initialState || defaultScenario;
  
  const [numProcesses, setNumProcesses] = useState(5);
  const [numResources, setNumResources] = useState(3);
  const [allocation, setAllocation] = useState(initial.allocation);
  const [max, setMax] = useState(initial.max);
  const [available, setAvailable] = useState(initial.available);
  const [animationSpeed, setAnimationSpeed] = useState(1000); // ms
  const [safetyResult, setSafetyResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [activeProcess, setActiveProcess] = useState(null);
  const [scenarioName, setScenarioName] = useState(initial.name || 'Custom');
  
  // Step-by-step execution state
  const [stepByStepMode, setStepByStepMode] = useState(false);
  const [allSteps, setAllSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPaused, setIsPaused] = useState(false);
  
  // Resource request simulation state
  const [requestSimulation, setRequestSimulation] = useState(null);

  // Load a preset scenario
  const loadPreset = useCallback((presetKey) => {
    const preset = PRESET_SCENARIOS[presetKey];
    if (preset) {
      setAllocation(preset.allocation);
      setMax(preset.max);
      setAvailable(preset.available);
      setScenarioName(preset.name);
      setSafetyResult(null);
      setRequestSimulation(null);
    }
  }, []);

  // Calculate Need matrix
  const calculateNeed = useCallback(() => {
    const need = [];
    for (let i = 0; i < numProcesses; i++) {
      need[i] = [];
      for (let j = 0; j < numResources; j++) {
        need[i][j] = max[i][j] - allocation[i][j];
      }
    }
    return need;
  }, [allocation, max, numProcesses, numResources]);

  const need = calculateNeed();

  // Initialize matrices when dimensions change
  const updateDimensions = useCallback((processes, resources) => {
    setNumProcesses(processes);
    setNumResources(resources);
    
    // Initialize allocation with zeros
    const newAllocation = Array(processes).fill(null).map(() => 
      Array(resources).fill(0)
    );
    setAllocation(newAllocation);
    
    // Initialize max with zeros
    const newMax = Array(processes).fill(null).map(() => 
      Array(resources).fill(0)
    );
    setMax(newMax);
    
    // Initialize available with zeros
    setAvailable(Array(resources).fill(0));
    setSafetyResult(null);
  }, []);

  const updateAllocation = useCallback((processIndex, resourceIndex, value, skipTutorialCheck = false) => {
    setAllocation(prev => {
      const newAllocation = [...prev];
      newAllocation[processIndex] = [...newAllocation[processIndex]];
      newAllocation[processIndex][resourceIndex] = parseInt(value) || 0;
      return newAllocation;
    });
  }, []);

  const updateMax = useCallback((processIndex, resourceIndex, value) => {
    setMax(prev => {
      const newMax = [...prev];
      newMax[processIndex] = [...newMax[processIndex]];
      newMax[processIndex][resourceIndex] = parseInt(value) || 0;
      return newMax;
    });
  }, []);

  const updateAvailable = useCallback((resourceIndex, value) => {
    setAvailable(prev => {
      const newAvailable = [...prev];
      newAvailable[resourceIndex] = parseInt(value) || 0;
      return newAvailable;
    });
  }, []);

  // Banker's Safety Algorithm with Step-by-Step Support
  const runSafetyAlgorithm = useCallback(async (tempAllocation = null, tempAvailable = null, skipAnimation = false) => {
    setIsRunning(true);
    setSafetyResult(null);
    
    const alloc = tempAllocation || allocation;
    const work = [...(tempAvailable || available)];
    const finish = Array(numProcesses).fill(false);
    const safeSequence = [];
    const detailedSteps = [];
    
    // Initial state
    detailedSteps.push({
      type: 'init',
      stepNumber: 0,
      work: [...work],
      finish: [...finish],
      safeSequence: [],
      message: 'Initializing Safety Algorithm',
      explanation: `Work vector initialized to Available: [${work.join(', ')}]`
    });

    let found = true;
    let stepNumber = 1;
    
    while (found && safeSequence.length < numProcesses) {
      found = false;
      
      for (let i = 0; i < numProcesses; i++) {
        if (!finish[i]) {
          let canExecute = true;
          const needVals = [];
          
          // Check if Need[i] <= Work
          for (let j = 0; j < numResources; j++) {
            const needValue = max[i][j] - alloc[i][j];
            needVals.push(needValue);
            if (needValue > work[j]) {
              canExecute = false;
            }
          }
          
          if (canExecute) {
            const workBefore = [...work];
            
            // Add resources back to work
            for (let j = 0; j < numResources; j++) {
              work[j] += alloc[i][j];
            }
            
            finish[i] = true;
            safeSequence.push(i);
            found = true;
            
            detailedSteps.push({
              type: 'execute',
              stepNumber: stepNumber++,
              processIndex: i,
              need: needVals,
              workBefore: workBefore,
              workAfter: [...work],
              allocation: [...alloc[i]],
              finish: [...finish],
              safeSequence: [...safeSequence],
              message: `Process P${i} can execute`,
              explanation: `Need[P${i}] = [${needVals.join(', ')}] ≤ Work = [${workBefore.join(', ')}]. Executing P${i}.`,
              detailedExplanation: `Process P${i} has Need[P${i}] = [${needVals.join(', ')}] and current Work = [${workBefore.join(', ')}]. Since all elements of Need are less than or equal to Work, P${i} can execute. After P${i} completes, it releases Allocation[P${i}] = [${alloc[i].join(', ')}] back to the system. New Work = [${work.join(', ')}].`
            });
            
            if (!skipAnimation && !stepByStepMode) {
              setActiveProcess(i);
              setCurrentStep({
                processIndex: i,
                work: workBefore,
                message: `Process P${i} can execute. Need ≤ Work.`
              });
              await new Promise(resolve => setTimeout(resolve, animationSpeed));
            }
            
            break;
          }
        }
      }
      
      if (!found && safeSequence.length < numProcesses) {
        // No process can execute - unsafe state
        const unfinishedProcesses = [];
        for (let i = 0; i < numProcesses; i++) {
          if (!finish[i]) {
            unfinishedProcesses.push(i);
          }
        }
        
        detailedSteps.push({
          type: 'unsafe',
          stepNumber: stepNumber++,
          work: [...work],
          finish: [...finish],
          unfinishedProcesses,
          message: 'System is in UNSAFE state',
          explanation: `Cannot find a process that can execute. Remaining processes: P${unfinishedProcesses.join(', P')}`
        });
      }
    }

    const result = {
      isSafe: safeSequence.length === numProcesses,
      safeSequence,
      steps: detailedSteps,
      finalWork: work
    };

    setSafetyResult(result);
    setAllSteps(detailedSteps);
    setIsRunning(false);
    setActiveProcess(null);
    setCurrentStep(null);
    
    return result;
  }, [allocation, available, max, numProcesses, numResources, animationSpeed, stepByStepMode]);

  // Step-by-step navigation
  const goToStep = useCallback((index) => {
    if (index >= 0 && index < allSteps.length) {
      setCurrentStepIndex(index);
      const step = allSteps[index];
      if (step.processIndex !== undefined) {
        setActiveProcess(step.processIndex);
      }
    }
  }, [allSteps]);

  const nextStep = useCallback(() => {
    if (currentStepIndex < allSteps.length - 1) {
      goToStep(currentStepIndex + 1);
    }
  }, [currentStepIndex, allSteps.length, goToStep]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    }
  }, [currentStepIndex, goToStep]);

  const resetSteps = useCallback(() => {
    setCurrentStepIndex(-1);
    setActiveProcess(null);
  }, []);

  const toggleStepByStepMode = useCallback(() => {
    setStepByStepMode(prev => !prev);
    resetSteps();
  }, [resetSteps]);

  // Resource request handling
  const simulateResourceRequest = useCallback(async (processIndex, request) => {
    setRequestSimulation({ phase: 'validating', processIndex, request });
    await new Promise(resolve => setTimeout(resolve, 500));

    // Validate request
    let isValid = true;
    for (let j = 0; j < numResources; j++) {
      const needValue = need[processIndex][j];
      if (request[j] > needValue || request[j] > available[j]) {
        isValid = false;
        break;
      }
    }

    if (!isValid) {
      setRequestSimulation({ 
        phase: 'denied', 
        processIndex, 
        request,
        reason: 'Request exceeds Need or Available resources'
      });
      return { granted: false };
    }

    // Simulate temporary allocation
    const tempAllocation = allocation.map((row, i) => 
      i === processIndex ? row.map((val, j) => val + request[j]) : [...row]
    );
    const tempAvailable = available.map((val, j) => val - request[j]);

    setRequestSimulation({ phase: 'checking_safety', processIndex, request });
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check if new state is safe
    const safetyCheck = await runSafetyAlgorithm(tempAllocation, tempAvailable, true);

    if (safetyCheck.isSafe) {
      setRequestSimulation({ 
        phase: 'granted', 
        processIndex, 
        request,
        safeSequence: safetyCheck.safeSequence,
        newAllocation: tempAllocation,
        newAvailable: tempAvailable
      });
      
      // Apply the changes
      setAllocation(tempAllocation);
      setAvailable(tempAvailable);
      
      return { granted: true, safeSequence: safetyCheck.safeSequence };
    } else {
      setRequestSimulation({ 
        phase: 'denied', 
        processIndex, 
        request,
        reason: 'Granting this request would lead to an unsafe state'
      });
      return { granted: false };
    }
  }, [allocation, available, need, numResources, runSafetyAlgorithm]);

  const clearRequestSimulation = useCallback(() => {
    setRequestSimulation(null);
  }, []);

  // Import state function
  const importState = useCallback((newState) => {
    if (newState.numProcesses) setNumProcesses(newState.numProcesses);
    if (newState.numResources) setNumResources(newState.numResources);
    if (newState.allocation) setAllocation(newState.allocation);
    if (newState.max) setMax(newState.max);
    if (newState.available) setAvailable(newState.available);
    setSafetyResult(null);
  }, []);

  const value = {
    numProcesses,
    numResources,
    allocation,
    max,
    available,
    need,
    animationSpeed,
    safetyResult,
    isRunning,
    currentStep,
    activeProcess,
    scenarioName,
    stepByStepMode,
    allSteps,
    currentStepIndex,
    isPaused,
    requestSimulation,
    setNumProcesses,
    setNumResources,
    updateDimensions,
    updateAllocation,
    updateMax,
    updateAvailable,
    setAnimationSpeed,
    runSafetyAlgorithm,
    toggleStepByStepMode,
    goToStep,
    nextStep,
    prevStep,
    resetSteps,
    setIsPaused,
    simulateResourceRequest,
    clearRequestSimulation,
    importState,
    loadPreset
  };

  return (
    <BankerContext.Provider value={value}>
      {children}
    </BankerContext.Provider>
  );
};
