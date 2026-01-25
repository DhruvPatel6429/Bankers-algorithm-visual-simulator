import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BankerProvider, useBanker } from '@/contexts/BankerContext';
import { ComparisonProvider } from '@/contexts/ComparisonContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MatrixDisplay, VectorDisplay } from '@/components/MatrixDisplay';
import { MatrixDiffDisplay, VectorDiffDisplay } from '@/components/MatrixDiffDisplay';
import { SystemResourceChart, ProcessResourceChart } from '@/components/ResourceCharts';
import { SafetyAlgorithmDisplay } from '@/components/SafetyAlgorithmDisplay';
import { ResourceRequestForm } from '@/components/ResourceRequestForm';
import { ComparativeMetricsDashboard } from '@/components/ComparativeMetricsDashboard';
import { Copy, X, ArrowLeftRight, GitCompare, Link } from 'lucide-react';
import { cn } from '@/lib/utils';

// Individual Scenario Panel with state export
const ScenarioPanel = ({ scenarioId, onStateChange, showCloseButton = true }) => {
  return (
    <BankerProvider>
      <ScenarioPanelContent 
        scenarioId={scenarioId}
        onStateChange={onStateChange}
        showCloseButton={showCloseButton}
      />
    </BankerProvider>
  );
};

// Panel content that uses the isolated context
const ScenarioPanelContent = ({ scenarioId, onStateChange, showCloseButton }) => {
  const bankerState = useBanker();
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
  } = bankerState;

  // Notify parent of state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        numProcesses,
        numResources,
        allocation,
        max,
        available,
        need,
        safetyResult
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numProcesses, numResources, allocation, max, available, need, safetyResult]);

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
          {safetyResult && (
            <span className={cn(
              "text-xs px-2 py-1 rounded-full border font-medium",
              safetyResult.isSafe 
                ? "bg-green-500/10 border-green-500/50 text-green-400"
                : "bg-red-500/10 border-red-500/50 text-red-400"
            )}>
              {safetyResult.isSafe ? "SAFE" : "UNSAFE"}
            </span>
          )}
        </div>
      </div>

      {/* Scenario Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Matrices */}
          <div className="space-y-4">
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

          {/* System Chart */}
          <SystemResourceChart key={`chart-${scenarioId}`} />

          {/* Per-Process Charts */}
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

// Main Enhanced Comparison Component
export const ScenarioComparisonEnhanced = ({ onClose }) => {
  const [viewMode, setViewMode] = useState('side-by-side'); // 'side-by-side' or 'diff'
  const [syncScrolling, setSyncScrolling] = useState(false);
  const [stateA, setStateA] = useState(null);
  const [stateB, setStateB] = useState(null);
  
  const scrollAreaRefA = useRef(null);
  const scrollAreaRefB = useRef(null);

  // Handle synchronized scrolling
  const handleScroll = (sourceRef, targetRef) => {
    if (!syncScrolling) return;
    
    const sourceElement = sourceRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    const targetElement = targetRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    
    if (sourceElement && targetElement) {
      targetElement.scrollTop = sourceElement.scrollTop;
    }
  };

  return (
    <ComparisonProvider>
      <div className="fixed inset-0 z-50 bg-background">
        {/* Header */}
        <div className="border-b border-border/50 bg-card/30 backdrop-blur-md">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ArrowLeftRight className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    Enhanced Scenario Comparison
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Compare, analyze, and visualize differences between scenarios
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Sync Scrolling Toggle */}
                <div className="flex items-center gap-2">
                  <Switch
                    id="sync-scroll"
                    checked={syncScrolling}
                    onCheckedChange={setSyncScrolling}
                  />
                  <Label htmlFor="sync-scroll" className="text-sm cursor-pointer flex items-center gap-1">
                    <Link className="w-4 h-4" />
                    Sync Scroll
                  </Label>
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
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-5rem)]">
          <Tabs value={viewMode} onValueChange={setViewMode} className="h-full flex flex-col">
            <div className="border-b border-border/50 bg-card/20 px-6">
              <TabsList className="bg-transparent">
                <TabsTrigger value="side-by-side" className="gap-2">
                  <Copy className="w-4 h-4" />
                  Side-by-Side
                </TabsTrigger>
                <TabsTrigger value="diff" className="gap-2">
                  <GitCompare className="w-4 h-4" />
                  Differential View
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="side-by-side" className="flex-1 m-0">
              <div className="h-full grid grid-cols-1 lg:grid-cols-2 divide-x divide-border/50">
                {/* Scenario 1 */}
                <div 
                  ref={scrollAreaRefA}
                  className="h-full overflow-hidden"
                  onScroll={() => handleScroll(scrollAreaRefA, scrollAreaRefB)}
                >
                  <ScenarioPanel 
                    scenarioId={1}
                    onStateChange={setStateA}
                    showCloseButton={false}
                  />
                </div>

                {/* Scenario 2 */}
                <div 
                  ref={scrollAreaRefB}
                  className="h-full overflow-hidden"
                  onScroll={() => handleScroll(scrollAreaRefB, scrollAreaRefA)}
                >
                  <ScenarioPanel 
                    scenarioId={2}
                    onStateChange={setStateB}
                    showCloseButton={false}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="diff" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="container mx-auto px-6 py-6 space-y-6">
                  {/* Comparative Metrics Dashboard */}
                  {stateA && stateB && (
                    <ComparativeMetricsDashboard 
                      stateA={stateA} 
                      stateB={stateB} 
                    />
                  )}

                  {/* Differential Matrix Views */}
                  {stateA && stateB && stateA.numProcesses === stateB.numProcesses && stateA.numResources === stateB.numResources && (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <MatrixDiffDisplay
                          title="Allocation"
                          matrixA={stateA.allocation}
                          matrixB={stateB.allocation}
                          numProcesses={stateA.numProcesses}
                          numResources={stateA.numResources}
                          colorClass="text-blue-400"
                          showPercentage={true}
                        />

                        <MatrixDiffDisplay
                          title="Max"
                          matrixA={stateA.max}
                          matrixB={stateB.max}
                          numProcesses={stateA.numProcesses}
                          numResources={stateA.numResources}
                          colorClass="text-purple-400"
                          showPercentage={true}
                        />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <MatrixDiffDisplay
                          title="Need"
                          matrixA={stateA.need}
                          matrixB={stateB.need}
                          numProcesses={stateA.numProcesses}
                          numResources={stateA.numResources}
                          colorClass="text-orange-400"
                        />

                        <VectorDiffDisplay
                          title="Available"
                          vectorA={stateA.available}
                          vectorB={stateB.available}
                          numResources={stateA.numResources}
                          colorClass="text-green-400"
                        />
                      </div>
                    </>
                  )}

                  {/* Dimension Mismatch Warning */}
                  {stateA && stateB && (stateA.numProcesses !== stateB.numProcesses || stateA.numResources !== stateB.numResources) && (
                    <Card className="bg-yellow-500/10 border-yellow-500/50">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <X className="w-5 h-5 text-yellow-400" />
                          <div>
                            <p className="font-medium text-yellow-400">
                              Cannot show differential view
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Scenarios have different dimensions (Processes: {stateA.numProcesses} vs {stateB.numProcesses}, Resources: {stateA.numResources} vs {stateB.numResources})
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ComparisonProvider>
  );
};

// Button to trigger enhanced comparison mode
export const ComparisonModeToggle = () => {
  const [isComparing, setIsComparing] = useState(false);

  const handleToggle = () => {
    console.log('Compare button clicked, current state:', isComparing);
    setIsComparing(true);
  };

  if (isComparing) {
    console.log('Rendering comparison view');
    return <ScenarioComparisonEnhanced onClose={() => setIsComparing(false)} />;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className="gap-2"
      data-testid="start-comparison-btn"
    >
      <GitCompare className="w-4 h-4" />
      Compare Scenarios
    </Button>
  );
};

// Export both versions for backward compatibility
export { ScenarioPanel };
export const ScenarioComparison = ScenarioComparisonEnhanced;
