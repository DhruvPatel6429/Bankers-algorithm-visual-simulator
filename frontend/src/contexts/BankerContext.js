import React, { createContext, useContext, useState, useCallback } from 'react';

const BankerContext = createContext();

export const useBanker = () => {
  const context = useContext(BankerContext);
  if (!context) {
    throw new Error('useBanker must be used within BankerProvider');
  }
  return context;
};

export const BankerProvider = ({ children }) => {
  const [numProcesses, setNumProcesses] = useState(5);
  const [numResources, setNumResources] = useState(3);
  const [allocation, setAllocation] = useState([
    [0, 1, 0],
    [2, 0, 0],
    [3, 0, 2],
    [2, 1, 1],
    [0, 0, 2]
  ]);
  const [max, setMax] = useState([
    [7, 5, 3],
    [3, 2, 2],
    [9, 0, 2],
    [2, 2, 2],
    [4, 3, 3]
  ]);
  const [available, setAvailable] = useState([3, 3, 2]);
  const [animationSpeed, setAnimationSpeed] = useState(1000); // ms
  const [safetyResult, setSafetyResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [activeProcess, setActiveProcess] = useState(null);
  
  // Step-by-step execution state
  const [stepByStepMode, setStepByStepMode] = useState(false);
  const [allSteps, setAllSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPaused, setIsPaused] = useState(false);
  
  // Resource request simulation state
  const [requestSimulation, setRequestSimulation] = useState(null);

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
          type: 'deadlock',
          stepNumber: stepNumber++,
          work: [...work],
          finish: [...finish],
          safeSequence: [...safeSequence],
          unfinishedProcesses,
          message: 'No process can execute - System is UNSAFE',
          explanation: `No remaining process has Need ≤ Work. Unfinished processes: ${unfinishedProcesses.map(p => `P${p}`).join(', ')}.`,
          detailedExplanation: `The algorithm cannot proceed. All remaining processes have resource needs that exceed the available resources. This indicates the system is in an UNSAFE state.`
        });
      }
    }
    
    if (found || safeSequence.length === numProcesses) {
      detailedSteps.push({
        type: 'complete',
        stepNumber: stepNumber++,
        work: [...work],
        finish: [...finish],
        safeSequence: [...safeSequence],
        message: 'All processes completed - System is SAFE',
        explanation: `Safe sequence found: ${safeSequence.map(p => `P${p}`).join(' → ')}`,
        detailedExplanation: `All processes have been executed successfully in the order: ${safeSequence.map(p => `P${p}`).join(' → ')}. The system is in a SAFE state.`
      });
    }
    
    setActiveProcess(null);
    setCurrentStep(null);
    setAllSteps(detailedSteps);
    
    const isSafe = safeSequence.length === numProcesses;
    setSafetyResult({
      isSafe,
      safeSequence,
      steps: detailedSteps
    });
    
    setIsRunning(false);
    return { isSafe, safeSequence, steps: detailedSteps };
  }, [allocation, available, max, numProcesses, numResources, animationSpeed, stepByStepMode]);

  // Step-by-step controls
  const enableStepByStepMode = useCallback(() => {
    setStepByStepMode(true);
    setCurrentStepIndex(-1);
  }, []);
  
  const disableStepByStepMode = useCallback(() => {
    setStepByStepMode(false);
    setCurrentStepIndex(-1);
    setIsPaused(false);
    setActiveProcess(null);
    setCurrentStep(null);
  }, []);
  
  const stepForward = useCallback(() => {
    if (currentStepIndex < allSteps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      const step = allSteps[nextIndex];
      
      if (step.type === 'execute') {
        setActiveProcess(step.processIndex);
      } else {
        setActiveProcess(null);
      }
      
      setCurrentStep(step);
    }
  }, [currentStepIndex, allSteps]);
  
  const stepBackward = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      const step = allSteps[prevIndex];
      
      if (step.type === 'execute') {
        setActiveProcess(step.processIndex);
      } else {
        setActiveProcess(null);
      }
      
      setCurrentStep(step);
    }
  }, [currentStepIndex, allSteps]);
  
  const resetSteps = useCallback(() => {
    setCurrentStepIndex(-1);
    setActiveProcess(null);
    setCurrentStep(null);
  }, []);
  
  const playSteps = useCallback(async () => {
    setIsPaused(false);
    for (let i = currentStepIndex + 1; i < allSteps.length; i++) {
      if (isPaused) break;
      setCurrentStepIndex(i);
      const step = allSteps[i];
      
      if (step.type === 'execute') {
        setActiveProcess(step.processIndex);
      } else {
        setActiveProcess(null);
      }
      
      setCurrentStep(step);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
    }
  }, [currentStepIndex, allSteps, isPaused, animationSpeed]);
  
  const pauseSteps = useCallback(() => {
    setIsPaused(true);
  }, []);

  // Resource Request Handler with Enhanced Simulation
  const requestResources = useCallback(async (processIndex, request) => {
    // Validate: Request <= Need
    const validationErrors = [];
    for (let j = 0; j < numResources; j++) {
      if (request[j] > need[processIndex][j]) {
        validationErrors.push({
          type: 'exceeds_need',
          resource: j,
          requested: request[j],
          need: need[processIndex][j],
          message: `R${j}: Requested ${request[j]} but Need is only ${need[processIndex][j]}`
        });
      }
    }
    
    // Validate: Request <= Available
    for (let j = 0; j < numResources; j++) {
      if (request[j] > available[j]) {
        validationErrors.push({
          type: 'exceeds_available',
          resource: j,
          requested: request[j],
          available: available[j],
          message: `R${j}: Requested ${request[j]} but only ${available[j]} available`
        });
      }
    }
    
    if (validationErrors.length > 0) {
      return {
        granted: false,
        reason: validationErrors.map(e => e.message).join(', '),
        validationErrors
      };
    }
    
    // Tentatively allocate
    const tempAllocation = allocation.map((row, i) => 
      i === processIndex 
        ? row.map((val, j) => val + request[j])
        : [...row]
    );
    
    const tempAvailable = available.map((val, j) => val - request[j]);
    
    // Show simulation state
    setRequestSimulation({
      phase: 'validating',
      processIndex,
      request,
      tempAllocation,
      tempAvailable,
      originalAllocation: allocation,
      originalAvailable: available
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setRequestSimulation(prev => ({ ...prev, phase: 'checking_safety' }));
    
    // Run safety check
    const { isSafe, safeSequence } = await runSafetyAlgorithm(tempAllocation, tempAvailable, true);
    
    if (isSafe) {
      setRequestSimulation(prev => ({ ...prev, phase: 'granted', isSafe, safeSequence }));
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAllocation(tempAllocation);
      setAvailable(tempAvailable);
      setRequestSimulation(null);
      
      return { 
        granted: true, 
        reason: `Request granted. System remains in safe state with sequence: ${safeSequence.map(p => `P${p}`).join(' → ')}`,
        tempAllocation,
        tempAvailable,
        safeSequence
      };
    } else {
      setRequestSimulation(prev => ({ ...prev, phase: 'denied', isSafe }));
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Rollback animation
      setRequestSimulation(prev => ({ ...prev, phase: 'rollback' }));
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setRequestSimulation(null);
      return { 
        granted: false, 
        reason: 'Request denied. System would enter unsafe state. No safe sequence exists.',
        tempAllocation,
        tempAvailable
      };
    }
  }, [allocation, available, need, numResources, runSafetyAlgorithm]);

  // Terminate Process
  const terminateProcess = useCallback((processIndex) => {
    // Release all allocated resources
    const newAvailable = [...available];
    for (let j = 0; j < numResources; j++) {
      newAvailable[j] += allocation[processIndex][j];
    }
    
    const newAllocation = [...allocation];
    newAllocation[processIndex] = Array(numResources).fill(0);
    
    const newMax = [...max];
    newMax[processIndex] = Array(numResources).fill(0);
    
    setAvailable(newAvailable);
    setAllocation(newAllocation);
    setMax(newMax);
  }, [allocation, available, max, numResources]);

  // Reset system
  const resetSystem = useCallback(() => {
    setAllocation([
      [0, 1, 0],
      [2, 0, 0],
      [3, 0, 2],
      [2, 1, 1],
      [0, 0, 2]
    ]);
    setMax([
      [7, 5, 3],
      [3, 2, 2],
      [9, 0, 2],
      [2, 2, 2],
      [4, 3, 3]
    ]);
    setAvailable([3, 3, 2]);
    setNumProcesses(5);
    setNumResources(3);
    setSafetyResult(null);
    setCurrentStep(null);
    setActiveProcess(null);
  }, []);

  // Load example
  const loadExample = useCallback((exampleType) => {
    if (exampleType === 'silberschatz') {
      setNumProcesses(5);
      setNumResources(3);
      setAllocation([
        [0, 1, 0],
        [2, 0, 0],
        [3, 0, 2],
        [2, 1, 1],
        [0, 0, 2]
      ]);
      setMax([
        [7, 5, 3],
        [3, 2, 2],
        [9, 0, 2],
        [2, 2, 2],
        [4, 3, 3]
      ]);
      setAvailable([3, 3, 2]);
    } else if (exampleType === 'custom') {
      setNumProcesses(4);
      setNumResources(4);
      setAllocation([
        [0, 0, 1, 2],
        [1, 0, 0, 0],
        [1, 3, 5, 4],
        [0, 6, 3, 2]
      ]);
      setMax([
        [0, 0, 1, 2],
        [1, 7, 5, 0],
        [2, 3, 5, 6],
        [0, 6, 5, 2]
      ]);
      setAvailable([1, 5, 2, 0]);
    }
    setSafetyResult(null);
  }, []);

  // Import state from JSON
  const importState = useCallback((importedData) => {
    setNumProcesses(importedData.numProcesses);
    setNumResources(importedData.numResources);
    setAllocation(importedData.allocation);
    setMax(importedData.max);
    setAvailable(importedData.available);
    setAnimationSpeed(importedData.animationSpeed);
    setSafetyResult(null);
    setCurrentStep(null);
    setActiveProcess(null);
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
    setAnimationSpeed,
    updateDimensions,
    updateAllocation,
    updateMax,
    updateAvailable,
    runSafetyAlgorithm,
    requestResources,
    terminateProcess,
    resetSystem,
    loadExample,
    importState
  };

  return (
    <BankerContext.Provider value={value}>
      {children}
    </BankerContext.Provider>
  );
};
