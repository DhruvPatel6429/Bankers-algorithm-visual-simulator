import React, { createContext, useContext, useState, useCallback } from 'react';

const ComparisonContext = createContext();

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within ComparisonProvider');
  }
  return context;
};

export const ComparisonProvider = ({ children }) => {
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [diffData, setDiffData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [divergencePoints, setDivergencePoints] = useState([]);

  // Calculate differences between two states
  const calculateDiff = useCallback((stateA, stateB) => {
    const diff = {
      allocation: [],
      max: [],
      need: [],
      available: [],
      processes: stateA.numProcesses,
      resources: stateA.numResources
    };

    // Compare allocation matrices
    for (let i = 0; i < stateA.numProcesses; i++) {
      diff.allocation[i] = [];
      diff.max[i] = [];
      diff.need[i] = [];
      
      for (let j = 0; j < stateA.numResources; j++) {
        const allocDiff = stateB.allocation[i][j] - stateA.allocation[i][j];
        const maxDiff = stateB.max[i][j] - stateA.max[i][j];
        const needDiff = stateB.need[i][j] - stateA.need[i][j];

        diff.allocation[i][j] = {
          value: allocDiff,
          percentChange: stateA.allocation[i][j] === 0 ? 
            (allocDiff > 0 ? 100 : 0) : 
            ((allocDiff / stateA.allocation[i][j]) * 100).toFixed(1),
          status: allocDiff > 0 ? 'increased' : allocDiff < 0 ? 'decreased' : 'same'
        };

        diff.max[i][j] = {
          value: maxDiff,
          percentChange: stateA.max[i][j] === 0 ? 
            (maxDiff > 0 ? 100 : 0) : 
            ((maxDiff / stateA.max[i][j]) * 100).toFixed(1),
          status: maxDiff > 0 ? 'increased' : maxDiff < 0 ? 'decreased' : 'same'
        };

        diff.need[i][j] = {
          value: needDiff,
          percentChange: stateA.need[i][j] === 0 ? 
            (needDiff > 0 ? 100 : 0) : 
            ((needDiff / stateA.need[i][j]) * 100).toFixed(1),
          status: needDiff > 0 ? 'increased' : needDiff < 0 ? 'decreased' : 'same'
        };
      }
    }

    // Compare available resources
    for (let j = 0; j < stateA.numResources; j++) {
      const availDiff = stateB.available[j] - stateA.available[j];
      diff.available[j] = {
        value: availDiff,
        percentChange: stateA.available[j] === 0 ? 
          (availDiff > 0 ? 100 : 0) : 
          ((availDiff / stateA.available[j]) * 100).toFixed(1),
        status: availDiff > 0 ? 'increased' : availDiff < 0 ? 'decreased' : 'same'
      };
    }

    setDiffData(diff);
    return diff;
  }, []);

  // Calculate comparative metrics
  const calculateMetrics = useCallback((stateA, stateB) => {
    // Resource utilization efficiency
    const calcUtilization = (state) => {
      let totalAllocated = 0;
      let totalMax = 0;
      
      for (let i = 0; i < state.numProcesses; i++) {
        for (let j = 0; j < state.numResources; j++) {
          totalAllocated += state.allocation[i][j];
          totalMax += state.max[i][j];
        }
      }
      
      return totalMax === 0 ? 0 : (totalAllocated / totalMax) * 100;
    };

    // Safety margin (average available / average need)
    const calcSafetyMargin = (state) => {
      const avgAvailable = state.available.reduce((a, b) => a + b, 0) / state.numResources;
      
      let totalNeed = 0;
      for (let i = 0; i < state.numProcesses; i++) {
        for (let j = 0; j < state.numResources; j++) {
          totalNeed += state.need[i][j];
        }
      }
      const avgNeed = totalNeed / (state.numProcesses * state.numResources);
      
      return avgNeed === 0 ? 100 : (avgAvailable / avgNeed) * 100;
    };

    // Resource slack (unused capacity)
    const calcResourceSlack = (state) => {
      let totalAvailable = state.available.reduce((a, b) => a + b, 0);
      let totalMax = 0;
      
      for (let i = 0; i < state.numProcesses; i++) {
        for (let j = 0; j < state.numResources; j++) {
          totalMax += state.max[i][j];
        }
      }
      
      return totalMax === 0 ? 0 : (totalAvailable / totalMax) * 100;
    };

    const metricsA = {
      utilization: calcUtilization(stateA),
      safetyMargin: calcSafetyMargin(stateA),
      resourceSlack: calcResourceSlack(stateA),
      isSafe: stateA.safetyResult?.isSafe || false
    };

    const metricsB = {
      utilization: calcUtilization(stateB),
      safetyMargin: calcSafetyMargin(stateB),
      resourceSlack: calcResourceSlack(stateB),
      isSafe: stateB.safetyResult?.isSafe || false
    };

    const comparison = {
      scenarioA: metricsA,
      scenarioB: metricsB,
      diff: {
        utilization: metricsB.utilization - metricsA.utilization,
        safetyMargin: metricsB.safetyMargin - metricsA.safetyMargin,
        resourceSlack: metricsB.resourceSlack - metricsA.resourceSlack
      }
    };

    setMetrics(comparison);
    return comparison;
  }, []);

  // Track divergence points
  const addDivergencePoint = useCallback((point) => {
    setDivergencePoints(prev => [...prev, {
      timestamp: new Date().toISOString(),
      ...point
    }]);
  }, []);

  const clearDivergence = useCallback(() => {
    setDivergencePoints([]);
  }, []);

  const value = {
    syncEnabled,
    setSyncEnabled,
    diffData,
    metrics,
    divergencePoints,
    calculateDiff,
    calculateMetrics,
    addDivergencePoint,
    clearDivergence
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};
