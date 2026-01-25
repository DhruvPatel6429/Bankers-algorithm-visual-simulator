import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBanker } from '@/contexts/BankerContext';
import { Play, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SafetyAlgorithmDisplay = () => {
  const { 
    runSafetyAlgorithm, 
    safetyResult, 
    isRunning,
    currentStep 
  } = useBanker();

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold tracking-tight">
          Safety Algorithm
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={() => runSafetyAlgorithm()}
          disabled={isRunning}
          className="w-full"
          data-testid="run-safety-btn"
        >
          <Play className="w-4 h-4 mr-2" />
          {isRunning ? 'Running...' : 'Run Safety Check'}
        </Button>

        {currentStep && (
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/50 animate-pulse">
            <p className="text-sm font-medium text-primary">
              {currentStep.message}
            </p>
            <div className="mt-2 flex gap-2">
              <span className="text-xs text-muted-foreground">Work:</span>
              <span className="text-xs font-mono">
                [{currentStep.work.join(', ')}]
              </span>
            </div>
          </div>
        )}

        {safetyResult && !isRunning && (
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
                  <AlertTriangle className="w-5 h-5 text-red-400" />
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};
