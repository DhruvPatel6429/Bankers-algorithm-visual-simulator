import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useBanker } from '@/contexts/BankerContext';
import { RotateCcw, Database, Download, Upload } from 'lucide-react';
import { exportSystemState, importSystemState } from '@/utils/stateExport';
import { toast } from 'sonner';

export const ConfigurationPanel = () => {
  const {
    numProcesses,
    numResources,
    animationSpeed,
    setAnimationSpeed,
    updateDimensions,
    resetSystem,
    loadExample,
  } = useBanker();

  const [tempProcesses, setTempProcesses] = React.useState(numProcesses);
  const [tempResources, setTempResources] = React.useState(numResources);

  const handleApplyDimensions = () => {
    updateDimensions(tempProcesses, tempResources);
  };

  const speedLabels = {
    500: 'Fast',
    1000: 'Medium',
    2000: 'Slow'
  };

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm h-fit sticky top-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
          <Database className="w-5 h-5" />
          System Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dimensions */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="num-processes" className="text-sm text-muted-foreground mb-2 block">
              Number of Processes
            </Label>
            <Input
              id="num-processes"
              type="number"
              min="1"
              max="10"
              value={tempProcesses}
              onChange={(e) => setTempProcesses(parseInt(e.target.value) || 1)}
              className="font-mono"
              data-testid="config-num-processes"
            />
          </div>

          <div>
            <Label htmlFor="num-resources" className="text-sm text-muted-foreground mb-2 block">
              Number of Resources
            </Label>
            <Input
              id="num-resources"
              type="number"
              min="1"
              max="10"
              value={tempResources}
              onChange={(e) => setTempResources(parseInt(e.target.value) || 1)}
              className="font-mono"
              data-testid="config-num-resources"
            />
          </div>

          <Button 
            onClick={handleApplyDimensions}
            className="w-full"
            variant="secondary"
            data-testid="apply-dimensions-btn"
          >
            Apply Dimensions
          </Button>
        </div>

        {/* Animation Speed */}
        <div className="space-y-3 pt-4 border-t border-border/50">
          <Label className="text-sm text-muted-foreground">
            Animation Speed: {speedLabels[animationSpeed] || 'Custom'}
          </Label>
          <Slider
            value={[animationSpeed]}
            onValueChange={(val) => setAnimationSpeed(val[0])}
            min={500}
            max={2000}
            step={500}
            className="w-full"
            data-testid="animation-speed-slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Fast</span>
            <span>Medium</span>
            <span>Slow</span>
          </div>
        </div>

        {/* Pre-loaded Examples */}
        <div className="space-y-2 pt-4 border-t border-border/50">
          <Label className="text-sm text-muted-foreground block mb-2">
            Load Example
          </Label>
          <Button 
            onClick={() => loadExample('silberschatz')}
            variant="outline"
            className="w-full justify-start"
            data-testid="load-silberschatz-btn"
          >
            Silberschatz Example
          </Button>
          <Button 
            onClick={() => loadExample('custom')}
            variant="outline"
            className="w-full justify-start"
            data-testid="load-custom-btn"
          >
            Custom Example
          </Button>
        </div>

        {/* Reset */}
        <div className="pt-4 border-t border-border/50">
          <Button 
            onClick={resetSystem}
            variant="destructive"
            className="w-full"
            data-testid="reset-system-btn"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset System
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
