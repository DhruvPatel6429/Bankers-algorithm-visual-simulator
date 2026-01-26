import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBanker } from '@/contexts/BankerContext';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const StepByStepSafetyDisplay = () => {
  const { 
    runSafetyAlgorithm,
    safetyResult,
    isRunning,
    stepByStepMode,
    enableStepByStepMode,
    disableStepByStepMode,
    allSteps,
    currentStepIndex,
    currentStep,
    activeProcess,
    stepForward,
    stepBackward,
    resetSteps,
    playSteps,
    pauseSteps,
    isPaused,
    numProcesses
  } = useBanker();

  const handleRunSafety = async () => {
    if (stepByStepMode) {
      resetSteps();
    }
    await runSafetyAlgorithm();
  };

  const renderFinishFlags = () => {
    if (!currentStep || !currentStep.finish) return null;
    
    return (
      <div className="grid grid-cols-5 gap-2 mt-3">
        {currentStep.finish.map((finished, idx) => (
          <div 
            key={idx}
            className={cn(
              "px-2 py-1 rounded text-xs font-medium text-center transition-all duration-300",
              finished 
                ? "bg-green-500/20 border border-green-500/50 text-green-400" 
                : "bg-gray-500/10 border border-gray-500/30 text-gray-500",
              activeProcess === idx && "ring-2 ring-yellow-400 scale-110"
            )}
          >
            P{idx}: {finished ? '✓' : '○'}
          </div>
        ))}
      </div>
    );
  };

  const renderWorkVector = () => {
    if (!currentStep) return null;
    
    const workToShow = currentStep.workBefore || currentStep.work;
    const workAfter = currentStep.workAfter;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-semibold min-w-[80px]">
            Work (Before):
          </span>
          <div className="flex gap-1">
            {workToShow && workToShow.map((val, idx) => (
              <Badge key={idx} variant="outline" className="font-mono text-xs">
                R{idx}: {val}
              </Badge>
            ))}
          </div>
        </div>
        
        {workAfter && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <span className="text-xs text-green-400 font-semibold min-w-[80px]">
              Work (After):
            </span>
            <div className="flex gap-1">
              {workAfter.map((val, idx) => (
                <Badge key={idx} className="bg-green-500/20 border-green-500/50 text-green-400 font-mono text-xs">
                  R{idx}: {val}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSafeSequence = () => {
    if (!currentStep || !currentStep.safeSequence || currentStep.safeSequence.length === 0) {
      return null;
    }
    
    return (
      <div className="mt-3">
        <p className="text-xs text-muted-foreground mb-2">Safe Sequence (so far):</p>
        <div className="flex items-center gap-2 flex-wrap">
          {currentStep.safeSequence.map((processIndex, idx) => (
            <React.Fragment key={processIndex}>
              <div className={cn(
                "px-3 py-1 rounded-md border font-medium text-sm transition-all duration-300",
                idx === currentStep.safeSequence.length - 1 
                  ? "bg-green-500/30 border-green-500 text-green-300 scale-110" 
                  : "bg-green-500/10 border-green-500/30 text-green-400"
              )}>
                P{processIndex}
              </div>
              {idx < currentStep.safeSequence.length - 1 && (
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold tracking-tight">
            Safety Algorithm Execution
          </CardTitle>
          <Button
            size="sm"
            variant={stepByStepMode ? "default" : "outline"}
            onClick={() => stepByStepMode ? disableStepByStepMode() : enableStepByStepMode()}
          >
            {stepByStepMode ? "Auto Mode" : "Step-by-Step"}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Run Button */}
        <Button 
          onClick={handleRunSafety}
          disabled={isRunning}
          className="w-full"
        >
          <Play className="w-4 h-4 mr-2" />
          {isRunning ? 'Running...' : 'Run Safety Check'}
        </Button>

        {/* Step Controls (only in step-by-step mode) */}
        {stepByStepMode && allSteps.length > 0 && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={resetSteps}
                disabled={currentStepIndex === -1}
                className="flex-1"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={stepBackward}
                disabled={currentStepIndex <= 0}
                className="flex-1"
              >
                <SkipBack className="w-3 h-3 mr-1" />
                Back
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={stepForward}
                disabled={currentStepIndex >= allSteps.length - 1}
                className="flex-1"
              >
                <SkipForward className="w-3 h-3 mr-1" />
                Forward
              </Button>
              
              <Button 
                size="sm" 
                variant="default"
                onClick={isPaused ? playSteps : pauseSteps}
                disabled={currentStepIndex >= allSteps.length - 1}
                className="flex-1"
              >
                {isPaused ? (
                  <><Play className="w-3 h-3 mr-1" /> Play</>
                ) : (
                  <><Pause className="w-3 h-3 mr-1" /> Pause</>
                )}
              </Button>
            </div>
            
            <div className="text-xs text-center text-muted-foreground">
              Step {currentStepIndex + 1} of {allSteps.length}
            </div>
          </div>
        )}

        {/* Current Step Display */}
        {currentStep && (
          <div className={cn(
            "p-4 rounded-lg border transition-all duration-500",
            currentStep.type === 'execute' && "bg-blue-500/10 border-blue-500/50",
            currentStep.type === 'init' && "bg-gray-500/10 border-gray-500/50",
            currentStep.type === 'complete' && "bg-green-500/10 border-green-500/50",
            currentStep.type === 'deadlock' && "bg-red-500/10 border-red-500/50"
          )}>
            <div className="flex items-start gap-2 mb-3">
              {currentStep.type === 'execute' && <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5" />}
              {currentStep.type === 'complete' && <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />}
              {currentStep.type === 'deadlock' && <XCircle className="w-5 h-5 text-red-400 mt-0.5" />}
              {currentStep.type === 'init' && <Info className="w-5 h-5 text-gray-400 mt-0.5" />}
              
              <div className="flex-1">
                <p className="font-bold text-sm mb-1">{currentStep.message}</p>
                <p className="text-xs text-muted-foreground">{currentStep.explanation}</p>
              </div>
            </div>
            
            {currentStep.detailedExplanation && (
              <div className="mt-3 p-3 rounded bg-background/50 border border-border/30">
                <p className="text-xs leading-relaxed">{currentStep.detailedExplanation}</p>
              </div>
            )}
            
            {renderWorkVector()}
            {renderFinishFlags()}
            {renderSafeSequence()}
          </div>
        )}

        {/* Final Result (only in auto mode) */}
        {safetyResult && !isRunning && !stepByStepMode && (
          <div className={cn(
            "p-4 rounded-lg transition-all duration-500 animate-in fade-in slide-in-from-bottom-4",
            safetyResult.isSafe 
              ? "bg-green-500/10 border border-green-500/50" 
              : "bg-red-500/10 border border-red-500/50"
          )}>
            <div className="flex items-center gap-2 mb-3">
              {safetyResult.isSafe ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="font-bold text-green-400 text-lg">
                    SAFE STATE
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-400" />
                  <span className="font-bold text-red-400 text-lg">
                    UNSAFE STATE
                  </span>
                </>
              )}
            </div>

            {safetyResult.isSafe && safetyResult.safeSequence.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Safe Sequence:</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {safetyResult.safeSequence.map((processIndex, idx) => (
                    <React.Fragment key={processIndex}>
                      <div className="px-3 py-1 rounded-md bg-green-500/20 border border-green-500/50 text-green-400 font-medium text-sm">
                        P{processIndex}
                      </div>
                      {idx < safetyResult.safeSequence.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
            
            {!safetyResult.isSafe && (
              <p className="text-sm text-red-300">
                No safe sequence exists. The system cannot guarantee that all processes will complete without deadlock.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
