// Utility functions for exporting and importing system state

export const exportSystemState = (state) => {
  const exportData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    numProcesses: state.numProcesses,
    numResources: state.numResources,
    allocation: state.allocation,
    max: state.max,
    available: state.available,
    need: state.need,
    safetyResult: state.safetyResult,
    animationSpeed: state.animationSpeed
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `banker-state-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const validateImportedState = (data) => {
  try {
    if (!data.version || !data.numProcesses || !data.numResources) {
      return { valid: false, error: 'Missing required fields' };
    }

    if (!Array.isArray(data.allocation) || !Array.isArray(data.max) || !Array.isArray(data.available)) {
      return { valid: false, error: 'Invalid matrix format' };
    }

    if (data.allocation.length !== data.numProcesses || data.max.length !== data.numProcesses) {
      return { valid: false, error: 'Matrix dimensions mismatch' };
    }

    if (data.available.length !== data.numResources) {
      return { valid: false, error: 'Available vector dimension mismatch' };
    }

    for (let i = 0; i < data.numProcesses; i++) {
      if (data.allocation[i].length !== data.numResources || data.max[i].length !== data.numResources) {
        return { valid: false, error: `Process ${i} matrix dimension mismatch` };
      }
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

export const importSystemState = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    const validation = validateImportedState(data);
    
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    return {
      success: true,
      data: {
        numProcesses: data.numProcesses,
        numResources: data.numResources,
        allocation: data.allocation,
        max: data.max,
        available: data.available,
        animationSpeed: data.animationSpeed || 1000
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
