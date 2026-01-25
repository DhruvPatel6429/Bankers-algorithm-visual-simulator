import React, { useState } from 'react';
import { BankerProvider, useBanker } from '@/contexts/BankerContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MatrixDisplay, VectorDisplay } from '@/components/MatrixDisplay';
import { SystemResourceChart, ProcessResourceChart } from '@/components/ResourceCharts';
import { SafetyAlgorithmDisplay } from '@/components/SafetyAlgorithmDisplay';
import { ResourceRequestForm } from '@/components/ResourceRequestForm';
import { Copy, X, ArrowLeftRight } from 'lucide-react';
import { cloneBankerState } from '@/utils/stateValidation';
import { cn } from '@/lib/utils';

// Individual Scenario Panel
const ScenarioPanel = ({ scenarioId, onClose, showCloseButton = true }) => {
  return (
    <BankerProvider>
      <ScenarioPanelContent 
        scenarioId={scenarioId} 
        onClose={onClose}
        showCloseButton={showCloseButton}
      />
    </BankerProvider>
  );
};

// Panel content that uses the isolated context
const ScenarioPanelContent = ({ scenarioId, onClose, showCloseButton }) => {
  const { useBanker } = require('@/contexts/BankerContext');
  const {
    numProcesses,
    numResources,
    allocation,
    max,
    available,
    need,
    safetyResult,
    updateAllocation,
    updateMax,
    updateAvailable,
    activeProcess,
  } = useBanker();

  return (
    <div className="flex flex-col h-full">
      {/* Scenario Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/30">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-3 h-3 rounded-full",
            scenarioId === 1 ? "bg-blue-500" : "bg-purple-500"
          )} />
          <h3 className="font-bold text-lg">Scenario {scenarioId}</h3>
        </div>
        {showCloseButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-testid={`close-scenario-${scenarioId}-btn`}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Scenario Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Matrices */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
              System State
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <MatrixDisplay
                title="Allocation"
                matrix={allocation}
                numProcesses={numProcesses}
                numResources={numResources}
                onEdit={updateAllocation}
                editable={true}
                colorClass="text-blue-400"
                activeProcess={activeProcess}
                dataTestIdPrefix={`s${scenarioId}-allocation`}
              />
              <MatrixDisplay
                title="Max"
                matrix={max}
                numProcesses={numProcesses}
                numResources={numResources}
                onEdit={updateMax}
                editable={true}
                colorClass="text-purple-400"
                activeProcess={activeProcess}
                dataTestIdPrefix={`s${scenarioId}-max`}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <MatrixDisplay
                title="Need (Computed)"
                matrix={need}
                numProcesses={numProcesses}
                numResources={numResources}
                editable={false}
                colorClass="text-orange-400"
                activeProcess={activeProcess}
                dataTestIdPrefix={`s${scenarioId}-need`}
              />
              <VectorDisplay
                title="Available"
                vector={available}
                numResources={numResources}
                onEdit={updateAvailable}
                editable={true}
                colorClass="text-green-400"
                dataTestIdPrefix={`s${scenarioId}-available`}
              />
            </div>
          </div>

          {/* Algorithm & Requests */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SafetyAlgorithmDisplay />
            <ResourceRequestForm />
          </div>

          {/* Safety Result */}
          {safetyResult && (
            <Card className={cn(
              "border-2 transition-all duration-300",
              safetyResult.isSafe 
                ? "border-green-500/50 bg-green-500/5" 
                : "border-red-500/50 bg-red-500/5"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "text-lg",
                  safetyResult.isSafe ? "text-green-400" : "text-red-400"
                )}>
                  {safetyResult.isSafe ? "SAFE STATE" : "UNSAFE STATE"}
                </CardTitle>
              </CardHeader>
              {safetyResult.isSafe && safetyResult.safeSequence.length > 0 && (
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">Safe Sequence:</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {safetyResult.safeSequence.map((processIndex) => (
                      <div
                        key={processIndex}
                        className="px-3 py-1 rounded-md bg-green-500/20 border border-green-500/50 text-green-400 font-medium text-sm"
                      >
                        P{processIndex}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* System Chart - Each scenario gets its own instance */}
          <SystemResourceChart key={`chart-${scenarioId}`} />

          {/* Per-Process Charts - Isolated instances */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
              Per-Process Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: numProcesses }, (_, i) => (
                <ProcessResourceChart 
                  key={`process-chart-${scenarioId}-${i}`} 
                  processIndex={i} 
                />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

// Main Comparison Component
export const ScenarioComparison = ({ onClose }) => {
  const [scenarios] = useState([1, 2]); // Two scenarios for side-by-side

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ArrowLeftRight className="w-6 h-6 text-primary" />
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Scenario Comparison
                </h2>
                <p className="text-sm text-muted-foreground">
                  Compare two independent Banker's Algorithm scenarios side-by-side
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onClose}
              data-testid="close-comparison-btn"
            >
              <X className="w-4 h-4 mr-2" />
              Exit Comparison
            </Button>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="h-[calc(100vh-5rem)] grid grid-cols-1 lg:grid-cols-2 divide-x divide-border/50">
        {scenarios.map((scenarioId) => (
          <div key={scenarioId} className="h-full overflow-hidden">
            <ScenarioPanel 
              scenarioId={scenarioId}
              onClose={onClose}
              showCloseButton={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Button to trigger comparison mode
export const ComparisonModeToggle = () => {
  const [isComparing, setIsComparing] = useState(false);

  if (isComparing) {
    return <ScenarioComparison onClose={() => setIsComparing(false)} />;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setIsComparing(true)}
      className="gap-2"
      data-testid="start-comparison-btn"
    >
      <Copy className="w-4 h-4" />
      Compare Scenarios
    </Button>
  );
};
