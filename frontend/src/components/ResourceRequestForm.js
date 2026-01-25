import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBanker } from '@/contexts/BankerContext';
import { toast } from 'sonner';

export const ResourceRequestForm = () => {
  const { 
    numProcesses, 
    numResources, 
    requestResources,
    isRunning 
  } = useBanker();
  
  const [selectedProcess, setSelectedProcess] = useState(0);
  const [request, setRequest] = useState(Array(numResources).fill(0));

  const handleRequestChange = (resourceIndex, value) => {
    const newRequest = [...request];
    newRequest[resourceIndex] = parseInt(value) || 0;
    setRequest(newRequest);
  };

  const handleSubmit = async () => {
    const result = await requestResources(selectedProcess, request);
    
    if (result.granted) {
      toast.success('Request Granted', {
        description: result.reason,
      });
      setRequest(Array(numResources).fill(0));
    } else {
      toast.error('Request Denied', {
        description: result.reason,
      });
    }
  };

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold tracking-tight text-yellow-400">
          Resource Request
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="process-select" className="text-sm text-muted-foreground mb-2 block">
            Select Process
          </Label>
          <Select 
            value={selectedProcess.toString()} 
            onValueChange={(val) => setSelectedProcess(parseInt(val))}
            data-testid="request-process-select"
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
                  className="h-9 text-center font-mono text-sm"
                  disabled={isRunning}
                  data-testid={`request-r${j}`}
                />
              </div>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={isRunning}
          className="w-full"
          data-testid="request-submit-btn"
        >
          Submit Request
        </Button>
      </CardContent>
    </Card>
  );
};
