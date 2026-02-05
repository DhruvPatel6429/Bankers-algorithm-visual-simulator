import React from 'react';
import { useBanker } from '@/contexts/BankerContext';
import { useTutorial } from '@/contexts/TutorialContext';
import { MatrixDisplay, VectorDisplay } from '@/components/MatrixDisplay';
import { SystemResourceChart, ProcessResourceChart } from '@/components/ResourceCharts';
import { ResourceRequestForm } from '@/components/ResourceRequestForm';
import { SafetyAlgorithmDisplay } from '@/components/SafetyAlgorithmDisplay';
import { StepByStepSafetyDisplay } from '@/components/StepByStepSafetyDisplay';
import { InteractiveResourceRequest } from '@/components/InteractiveResourceRequest';
import { ProcessList } from '@/components/ProcessList';
import { TheoryPanel } from '@/components/TheoryPanel';
import { ConfigurationPanel } from '@/components/ConfigurationPanel';
import { TutorialOverlay, TutorialToggle } from '@/components/TutorialOverlay';
import { StepJustificationPanel } from '@/components/StepJustificationPanel';
import { MistakeDetectionPanel } from '@/components/MistakeDetectionPanel';
import { GanttTimelineView } from '@/components/GanttTimelineView';
import { ComparisonModeToggle } from '@/components/ScenarioComparisonEnhanced';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FEATURES } from '@/config/features';

export const BankerDashboard = () => {
  const {
    numProcesses,
    numResources,
    allocation,
    max,
    available,
    need,
    updateAllocation,
    updateMax,
    updateAvailable,
    activeProcess,
    safetyResult,
    isRunning,
  } = useBanker();

  const { isActive: isTutorialActive } = useTutorial();

  // Get complete banker state for mistake detection
  const bankerState = {
    numProcesses,
    numResources,
    allocation,
    max,
    available,
    need,
    safetyResult
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/20">
      {/* Tutorial Overlay */}
      {FEATURES.tutorialMode && <TutorialOverlay />}
      
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Banker's Algorithm Simulator
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Deadlock Avoidance & Safety Verification
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Tutorial Toggle */}
              {FEATURES.tutorialMode && <TutorialToggle />}
              
              {/* Comparison Mode Toggle */}
              {FEATURES.comparisonMode && <ComparisonModeToggle />}
              
              {/* System Status */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/50">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium">System Active</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Configuration */}
          <div className="col-span-12 lg:col-span-3">
            <ConfigurationPanel />
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-6 space-y-6">
            {/* Matrices Section */}
            <div className="space-y-4" id="matrices-section">
              <h2 className="text-xl font-bold tracking-tight">System State Matrices</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MatrixDisplay
                  title="Allocation Matrix"
                  matrix={allocation}
                  numProcesses={numProcesses}
                  numResources={numResources}
                  onEdit={updateAllocation}
                  editable={!isTutorialActive}
                  colorClass="text-blue-400"
                  activeProcess={activeProcess}
                  dataTestIdPrefix="allocation"
                />

                <MatrixDisplay
                  title="Max Matrix"
                  matrix={max}
                  numProcesses={numProcesses}
                  numResources={numResources}
                  onEdit={updateMax}
                  editable={!isTutorialActive}
                  colorClass="text-purple-400"
                  activeProcess={activeProcess}
                  dataTestIdPrefix="max"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MatrixDisplay
                  title="Need Matrix (Computed)"
                  matrix={need}
                  numProcesses={numProcesses}
                  numResources={numResources}
                  editable={false}
                  colorClass="text-orange-400"
                  activeProcess={activeProcess}
                  dataTestIdPrefix="need"
                />

                <VectorDisplay
                  title="Available Resources"
                  vector={available}
                  numResources={numResources}
                  onEdit={updateAvailable}
                  editable={!isTutorialActive}
                  colorClass="text-green-400"
                  dataTestIdPrefix="available"
                />
              </div>
            </div>

            {/* Algorithm & Request Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div id="safety-algorithm-section">
                <StepByStepSafetyDisplay />
              </div>
              <div id="resource-request-section">
                <InteractiveResourceRequest />
              </div>
            </div>

            {/* System Resource Chart */}
            <SystemResourceChart />

            {/* Per-Process Charts */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight">Per-Process Resource Analysis</h2>
              <ScrollArea className="h-[600px] pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: numProcesses }, (_, i) => (
                    <ProcessResourceChart key={i} processIndex={i} />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Right Sidebar - Process Control & Theory */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <ProcessList />
            
            {/* Mistake Detection Panel */}
            <MistakeDetectionPanel 
              bankerState={bankerState}
              isActive={true}
            />
            
            {/* Step Justification Panel */}
            <StepJustificationPanel 
              safetyResult={safetyResult}
              isRunning={isRunning}
            />
            
            <TheoryPanel />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-md mt-12">
        <div className="container mx-auto px-6 py-4">
          <p className="text-center text-sm text-muted-foreground">
            Operating Systems Project - Banker's Algorithm Implementation
          </p>
        </div>
      </footer>
    </div>
  );
};
