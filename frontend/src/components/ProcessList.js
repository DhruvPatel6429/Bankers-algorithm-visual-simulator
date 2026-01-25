import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBanker } from '@/contexts/BankerContext';
import { Cpu, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const ProcessList = () => {
  const { 
    numProcesses, 
    allocation, 
    max,
    terminateProcess,
    activeProcess,
    isRunning
  } = useBanker();

  const handleTerminate = (processIndex) => {
    terminateProcess(processIndex);
    toast.info(`Process P${processIndex} Terminated`, {
      description: 'Resources released back to system',
    });
  };

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
          <Cpu className="w-5 h-5" />
          Process Control
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Array.from({ length: numProcesses }, (_, i) => {
            const isActive = allocation[i]?.some(val => val > 0) || max[i]?.some(val => val > 0);
            
            return (
              <div
                key={i}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-all duration-300",
                  activeProcess === i 
                    ? "border-primary bg-primary/10 shadow-[0_0_10px_rgba(59,130,246,0.3)]" 
                    : "border-border bg-card/30 hover:border-primary/50",
                  !isActive && "opacity-50"
                )}
                data-testid={`process-card-p${i}`}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    isActive ? "bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-gray-500"
                  )} />
                  <span className="font-medium">Process P{i}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTerminate(i)}
                  disabled={!isActive || isRunning}
                  data-testid={`terminate-p${i}-btn`}
                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
