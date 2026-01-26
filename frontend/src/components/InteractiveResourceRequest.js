import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBanker } from '@/contexts/BankerContext';
import { toast } from 'sonner';
import { 
  Send, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Loader2,
  RotateCcw,
  ArrowRight,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const InteractiveResourceRequest = () => {
  const { 
    numProcesses, 
    numResources, 
    requestResources,
    isRunning,
    need,
    available,
    allocation,
    requestSimulation
  } = useBanker();
  
  const [selectedProcess, setSelectedProcess] = useState(0);
  const [request, setRequest] = useState(Array(numResources).fill(0));
  const [validationMessages, setValidationMessages] = useState([]);

  // Real-time validation
  useEffect(() => {
    const messages = [];
    
    for (let j = 0; j < numResources; j++) {
      if (request[j] > need[selectedProcess][j]) {
        messages.push({
          type: 'error',
          resource: j,
          message: `R${j}: Exceeds Need (${request[j]} > ${need[selectedProcess][j]})`
        });
      } else if (request[j] > available[j]) {
        messages.push({
          type: 'error',
          resource: j,
          message: `R${j}: Exceeds Available (${request[j]} > ${available[j]})`
        });
      } else if (request[j] > 0) {
        messages.push({
          type: 'success',
          resource: j,
          message: `R${j}: Valid request (${request[j]} ≤ min(Need: ${need[selectedProcess][j]}, Available: ${available[j]}))`
        });
      }
    }
    
    setValidationMessages(messages);
  }, [request, selectedProcess, need, available, numResources]);

  const handleRequestChange = (resourceIndex, value) => {
    const newRequest = [...request];
    newRequest[resourceIndex] = Math.max(0, parseInt(value) || 0);
    setRequest(newRequest);
  };

  const handleSubmit = async () => {
    const result = await requestResources(selectedProcess, request);
    
    if (result.granted) {
      toast.success('Request Granted! ✅', {
        description: result.reason,
        duration: 4000
      });
      setRequest(Array(numResources).fill(0));
    } else {
      toast.error('Request Denied ❌', {
        description: result.reason,
        duration: 4000
      });
    }
  };

  const isRequestValid = validationMessages.every(m => m.type !== 'error') && 
                         validationMessages.some(m => m.type === 'success');

  const renderSimulationPhase = () => {
    if (!requestSimulation) return null;

    const { phase, processIndex, request: reqVector, tempAllocation, tempAvailable, safeSequence } = requestSimulation;

    return (
      <div className="space-y-3 mt-4 p-4 rounded-lg border-2 border-yellow-500/50 bg-yellow-500/5">
        <div className="flex items-center gap-2 mb-2">
          <Loader2 className={cn(
            "w-5 h-5",
            (phase === 'validating' || phase === 'checking_safety') && "animate-spin text-yellow-400",
            phase === 'granted' && "text-green-400",
            phase === 'denied' && "text-red-400"
          )} />
          <span className="font-bold text-sm">
            {phase === 'validating' && 'Validating Request...'}
            {phase === 'checking_safety' && 'Running Safety Algorithm...'}
            {phase === 'granted' && 'Request Granted! Applying Changes...'}
            {phase === 'denied' && 'Request Denied! Rolling Back...'}
            {phase === 'rollback' && 'Rolling Back to Previous State...'}
          </span>
        </div>

        {/* Show temporary state */}
        {(phase === 'checking_safety' || phase === 'granted' || phase === 'denied') && (
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              Temporary State (if granted):
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-blue-400">Allocation[P{processIndex}]</div>
                <div className="flex gap-1">
                  {allocation[processIndex].map((val, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">R{idx}</div>
                      <Badge variant="outline" className="font-mono">
                        {val}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="flex gap-1">
                  {tempAllocation[processIndex].map((val, idx) => (
                    <div key={idx} className="text-center">
                      <Badge 
                        className={cn(
                          "font-mono",
                          phase === 'granted' ? "bg-green-500/20 border-green-500/50 text-green-400" : ""
                        )}
                      >
                        {val}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-green-400">Available Resources</div>
                <div className="flex gap-1">
                  {available.map((val, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">R{idx}</div>
                      <Badge variant="outline" className="font-mono">
                        {val}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="flex gap-1">
                  {tempAvailable.map((val, idx) => (
                    <div key={idx} className="text-center">
                      <Badge 
                        className={cn(
                          "font-mono",
                          phase === 'granted' ? "bg-green-500/20 border-green-500/50 text-green-400" : ""
                        )}
                      >
                        {val}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Show result */}
        {phase === 'granted' && safeSequence && (
          <Alert className="bg-green-500/10 border-green-500/50">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <AlertDescription className="text-green-300 text-xs">
              Safe sequence exists: {safeSequence.map(p => `P${p}`).join(' → ')}
            </AlertDescription>
          </Alert>
        )}

        {phase === 'denied' && (
          <Alert className="bg-red-500/10 border-red-500/50">
            <XCircle className="w-4 h-4 text-red-400" />
            <AlertDescription className="text-red-300 text-xs">
              No safe sequence exists. Request would lead to unsafe state.
            </AlertDescription>
          </Alert>
        )}

        {phase === 'rollback' && (
          <Alert className="bg-yellow-500/10 border-yellow-500/50">
            <RotateCcw className="w-4 h-4 text-yellow-400 animate-spin" />
            <AlertDescription className="text-yellow-300 text-xs">
              Reverting to previous safe state...
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold tracking-tight text-yellow-400">
          Interactive Resource Request
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Process Selection */}
        <div>
          <Label htmlFor="process-select" className="text-sm text-muted-foreground mb-2 block">
            Select Process
          </Label>
          <Select 
            value={selectedProcess.toString()} 
            onValueChange={(val) => {
              setSelectedProcess(parseInt(val));
              setRequest(Array(numResources).fill(0));
            }}
            disabled={isRunning || !!requestSimulation}
          >
            <SelectTrigger id="process-select">
              <SelectValue placeholder="Select process" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: numProcesses }, (_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  Process P{i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Show current Need and Available */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
          <div>
            <div className="text-xs text-muted-foreground mb-2">Need[P{selectedProcess}]</div>
            <div className="flex gap-1">
              {need[selectedProcess].map((val, idx) => (
                <Badge key={idx} variant="outline" className="font-mono text-xs">
                  R{idx}: {val}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-2">Available</div>
            <div className="flex gap-1">
              {available.map((val, idx) => (
                <Badge key={idx} variant="outline" className="font-mono text-xs">
                  R{idx}: {val}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Request Vector Input */}
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">
            Request Vector
          </Label>
          <div className="flex gap-2">
            {Array.from({ length: numResources }, (_, j) => (
              <div key={j} className="flex-1">
                <div className="text-xs text-muted-foreground text-center mb-1">R{j}</div>
                <Input
                  type="number"
                  min="0"
                  value={request[j]}
                  onChange={(e) => handleRequestChange(j, e.target.value)}
                  className={cn(
                    "h-9 text-center font-mono text-sm",
                    request[j] > need[selectedProcess][j] && "border-red-500 focus-visible:ring-red-500",
                    request[j] > available[j] && "border-orange-500 focus-visible:ring-orange-500"
                  )}
                  disabled={isRunning || !!requestSimulation}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Validation Messages */}
        {validationMessages.length > 0 && (
          <div className="space-y-2">
            {validationMessages.map((msg, idx) => (
              <Alert 
                key={idx}
                className={cn(
                  "py-2",
                  msg.type === 'error' && "bg-red-500/10 border-red-500/50",
                  msg.type === 'success' && "bg-green-500/10 border-green-500/50"
                )}
              >
                {msg.type === 'error' ? (
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                )}
                <AlertDescription className={cn(
                  "text-xs",
                  msg.type === 'error' ? "text-red-300" : "text-green-300"
                )}>
                  {msg.message}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Simulation Display */}
        {renderSimulationPhase()}

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit}
          disabled={!isRequestValid || isRunning || !!requestSimulation}
          className="w-full"
        >
          {requestSimulation ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Request
            </>
          )}
        </Button>

        {/* Info */}
        <Alert className="bg-blue-500/10 border-blue-500/30">
          <Info className="w-4 h-4 text-blue-400" />
          <AlertDescription className="text-xs text-blue-300">
            The system will validate your request, temporarily allocate resources, 
            run the safety algorithm, and either grant or deny based on the result.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
