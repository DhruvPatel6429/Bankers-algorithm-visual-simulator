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

  const updateAllocation = useCallback((processIndex, resourceIndex, value) => {
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

  // Banker's Safety Algorithm
  const runSafetyAlgorithm = useCallback(async (tempAllocation = null, tempAvailable = null) => {
    setIsRunning(true);
    setSafetyResult(null);
    
    const alloc = tempAllocation || allocation;
    const work = [...(tempAvailable || available)];
    const finish = Array(numProcesses).fill(false);
    const safeSequence = [];
    const steps = [];

    let found = true;
    while (found && safeSequence.length < numProcesses) {
      found = false;
      
      for (let i = 0; i < numProcesses; i++) {
        if (!finish[i]) {
          let canExecute = true;
          
          // Check if Need[i] <= Work
          for (let j = 0; j < numResources; j++) {
            const needValue = max[i][j] - alloc[i][j];
            if (needValue > work[j]) {
              canExecute = false;
              break;
            }
          }
          
          if (canExecute) {
            // Animate this step
            setActiveProcess(i);
            setCurrentStep({
              processIndex: i,
              work: [...work],
              message: `Process P${i} can execute. Need ≤ Work.`
            });
            
            await new Promise(resolve => setTimeout(resolve, animationSpeed));
            
            // Add resources back to work
            for (let j = 0; j < numResources; j++) {
              work[j] += alloc[i][j];
            }
            
            finish[i] = true;
            safeSequence.push(i);
            found = true;
            
            steps.push({
              processIndex: i,
              work: [...work],
              finished: [...finish]
            });
            
            break;
          }
        }
      }
    }
    
    setActiveProcess(null);
    setCurrentStep(null);
    
    const isSafe = safeSequence.length === numProcesses;
    setSafetyResult({
      isSafe,
      safeSequence,
      steps
    });
    
    setIsRunning(false);
    return { isSafe, safeSequence };
  }, [allocation, available, max, numProcesses, numResources, animationSpeed]);

  // Resource Request Handler
  const requestResources = useCallback(async (processIndex, request) => {
    // Validate: Request <= Need
    for (let j = 0; j < numResources; j++) {
      if (request[j] > need[processIndex][j]) {
        return {
          granted: false,
          reason: `Request exceeds Need for process P${processIndex}`
        };
      }
    }
    
    // Validate: Request <= Available
    for (let j = 0; j < numResources; j++) {
      if (request[j] > available[j]) {
        return {
          granted: false,
          reason: `Request exceeds Available resources`
        };
      }
    }
    
    // Tentatively allocate
    const tempAllocation = allocation.map((row, i) => 
      i === processIndex 
        ? row.map((val, j) => val + request[j])
        : [...row]
    );
    
    const tempAvailable = available.map((val, j) => val - request[j]);
    
    // Run safety check
    const { isSafe } = await runSafetyAlgorithm(tempAllocation, tempAvailable);
    
    if (isSafe) {
      setAllocation(tempAllocation);
      setAvailable(tempAvailable);
      return { granted: true, reason: 'System remains in safe state' };
    } else {
      return { granted: false, reason: 'System would enter unsafe state' };
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
    loadExample
  };

  return (
    <BankerContext.Provider value={value}>
      {children}
    </BankerContext.Provider>
  );
};
