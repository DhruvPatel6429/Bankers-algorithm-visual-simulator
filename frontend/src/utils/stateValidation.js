// State validation utilities for Banker's Algorithm

/**
 * Validates that a Banker's Algorithm state is valid
 * @param {Object} state - The state object to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const isValidBankerState = (state) => {
  const errors = [];

  // Check required fields
  if (typeof state.numProcesses !== 'number' || state.numProcesses < 1) {
    errors.push('numProcesses must be a positive number');
  }

  if (typeof state.numResources !== 'number' || state.numResources < 1) {
    errors.push('numResources must be a positive number');
  }

  // Check allocation matrix
  if (!Array.isArray(state.allocation)) {
    errors.push('allocation must be an array');
  } else if (state.allocation.length !== state.numProcesses) {
    errors.push('allocation matrix must have numProcesses rows');
  } else {
    for (let i = 0; i < state.allocation.length; i++) {
      if (!Array.isArray(state.allocation[i]) || state.allocation[i].length !== state.numResources) {
        errors.push(`allocation[${i}] must have numResources columns`);
      }
      // Check for negative values
      if (state.allocation[i].some(val => val < 0)) {
        errors.push(`allocation[${i}] contains negative values`);
      }
    }
  }

  // Check max matrix
  if (!Array.isArray(state.max)) {
    errors.push('max must be an array');
  } else if (state.max.length !== state.numProcesses) {
    errors.push('max matrix must have numProcesses rows');
  } else {
    for (let i = 0; i < state.max.length; i++) {
      if (!Array.isArray(state.max[i]) || state.max[i].length !== state.numResources) {
        errors.push(`max[${i}] must have numResources columns`);
      }
      // Check for negative values
      if (state.max[i].some(val => val < 0)) {
        errors.push(`max[${i}] contains negative values`);
      }
      // Check that max >= allocation
      if (state.allocation && state.allocation[i]) {
        for (let j = 0; j < state.numResources; j++) {
          if (state.max[i][j] < state.allocation[i][j]) {
            errors.push(`max[${i}][${j}] must be >= allocation[${i}][${j}]`);
          }
        }
      }
    }
  }

  // Check available vector
  if (!Array.isArray(state.available)) {
    errors.push('available must be an array');
  } else if (state.available.length !== state.numResources) {
    errors.push('available vector must have numResources elements');
  } else if (state.available.some(val => val < 0)) {
    errors.push('available vector contains negative values');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Deep clones a Banker's Algorithm state
 * @param {Object} state - The state to clone
 * @returns {Object} - A deep copy of the state
 */
export const cloneBankerState = (state) => {
  return {
    numProcesses: state.numProcesses,
    numResources: state.numResources,
    allocation: state.allocation.map(row => [...row]),
    max: state.max.map(row => [...row]),
    available: [...state.available],
    animationSpeed: state.animationSpeed,
  };
};
