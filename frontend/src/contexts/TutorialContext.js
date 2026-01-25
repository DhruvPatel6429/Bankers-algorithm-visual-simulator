import React, { createContext, useContext, useState, useCallback } from 'react';

// Tutorial step state machine
export const TutorialStep = {
  OVERVIEW: 'overview',
  MATRICES: 'matrices',
  SAFETY: 'safety',
  REQUEST: 'request',
  OUTCOME: 'outcome',
  COMPLETED: 'completed'
};

// Tutorial step content
export const tutorialContent = {
  [TutorialStep.OVERVIEW]: {
    title: "Welcome to Banker's Algorithm",
    description: "This simulator demonstrates deadlock avoidance using the Banker's Algorithm. The system manages resource allocation to prevent unsafe states.",
    target: null,
    actions: ["The Banker's Algorithm ensures that resource allocation never leads to a circular wait condition.", "It does this by simulating resource allocation ahead of time to ensure the system remains in a safe state."],
    nextStep: TutorialStep.MATRICES
  },
  [TutorialStep.MATRICES]: {
    title: "Understanding System Matrices",
    description: "The system state is represented by four key data structures:",
    target: "matrices-section",
    actions: [
      "Allocation Matrix: Currently allocated resources to each process",
      "Max Matrix: Maximum resource needs declared by each process",
      "Need Matrix: Computed as (Max - Allocation), represents remaining needs",
      "Available Vector: Currently available resources in the system"
    ],
    nextStep: TutorialStep.SAFETY
  },
  [TutorialStep.SAFETY]: {
    title: "Safety Algorithm Execution",
    description: "The Safety Algorithm determines if the system is in a safe state by finding a safe sequence.",
    target: "safety-algorithm-section",
    actions: [
      "Click 'Run Safety Check' to start the algorithm",
      "The algorithm finds processes that can complete with available resources",
      "When a process completes, it releases its resources back to the system",
      "A safe sequence means all processes can eventually complete without deadlock"
    ],
    nextStep: TutorialStep.REQUEST
  },
  [TutorialStep.REQUEST]: {
    title: "Resource Request Simulation",
    description: "Processes can request additional resources at runtime. The system checks if granting the request keeps the system safe.",
    target: "resource-request-section",
    actions: [
      "Select a process and specify resource request amounts",
      "The system tentatively allocates resources",
      "Runs the Safety Algorithm on the new state",
      "If safe: request is granted. If unsafe: request is denied and rolled back"
    ],
    nextStep: TutorialStep.OUTCOME
  },
  [TutorialStep.OUTCOME]: {
    title: "Safe vs Unsafe States",
    description: "Understanding the outcome of resource allocation decisions:",
    target: "safety-result-section",
    actions: [
      "SAFE STATE: A safe sequence exists - all processes can complete",
      "UNSAFE STATE: No safe sequence exists - potential for deadlock",
      "The Banker's Algorithm never allows the system to enter an unsafe state",
      "This guarantees deadlock avoidance, though it may reduce resource utilization"
    ],
    nextStep: TutorialStep.COMPLETED
  },
  [TutorialStep.COMPLETED]: {
    title: "Tutorial Complete!",
    description: "You now understand the fundamentals of the Banker's Algorithm for deadlock avoidance.",
    target: null,
    actions: [
      "Try modifying the matrices to see different scenarios",
      "Experiment with resource requests to see safe and unsafe outcomes",
      "Load different examples from the configuration panel",
      "Export and import system states to share interesting scenarios"
    ],
    nextStep: null
  }
};

const TutorialContext = createContext();

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
};

export const TutorialProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(TutorialStep.OVERVIEW);
  const [completedSteps, setCompletedSteps] = useState([]);

  const startTutorial = useCallback(() => {
    setIsActive(true);
    setCurrentStep(TutorialStep.OVERVIEW);
    setCompletedSteps([]);
  }, []);

  const exitTutorial = useCallback(() => {
    setIsActive(false);
    setCurrentStep(TutorialStep.OVERVIEW);
    setCompletedSteps([]);
  }, []);

  const nextStep = useCallback(() => {
    const content = tutorialContent[currentStep];
    if (content.nextStep) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(content.nextStep);
    } else {
      exitTutorial();
    }
  }, [currentStep, exitTutorial]);

  const previousStep = useCallback(() => {
    const stepOrder = Object.values(TutorialStep);
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  }, [currentStep]);

  const value = {
    isActive,
    currentStep,
    completedSteps,
    currentContent: tutorialContent[currentStep],
    startTutorial,
    exitTutorial,
    nextStep,
    previousStep,
    isFirstStep: currentStep === TutorialStep.OVERVIEW,
    isLastStep: currentStep === TutorialStep.COMPLETED
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
};
