import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  X,
  Lightbulb,
  CheckCircle2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const severityConfig = {
  error: {
    icon: AlertCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/50',
    badge: 'destructive'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/50',
    badge: 'outline'
  },
  info: {
    icon: Info,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/50',
    badge: 'secondary'
  }
};

export const MistakeDetectionPanel = ({ bankerState, isActive = true }) => {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!isActive || !bankerState) return;

    const detectMistakes = async () => {
      setLoading(true);
      
      try {
        const response = await axios.post(`${BACKEND_URL}/api/banker/validate`, {
          numProcesses: bankerState.numProcesses,
          numResources: bankerState.numResources,
          allocation: bankerState.allocation,
          max: bankerState.max,
          available: bankerState.available,
          need: bankerState.need,
          safetyResult: bankerState.safetyResult
        });
        
        setMistakes(response.data);
      } catch (err) {
        console.error('Error detecting mistakes:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce validation
    const timer = setTimeout(detectMistakes, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    bankerState?.numProcesses,
    bankerState?.numResources,
    isActive,
  ]);

  const activeMistakes = mistakes.filter(
    m => !dismissed.includes(`${m.mistake_type}-${m.location}`)
  );

  const errorCount = activeMistakes.filter(m => m.severity === 'error').length;
  const warningCount = activeMistakes.filter(m => m.severity === 'warning').length;
  const infoCount = activeMistakes.filter(m => m.severity === 'info').length;

  const handleDismiss = (mistake) => {
    setDismissed(prev => [...prev, `${mistake.mistake_type}-${mistake.location}`]);
  };

  const toggleExpand = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  if (!isActive) return null;

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            Mistake Detection
          </CardTitle>
          <div className="flex items-center gap-2">
            {errorCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="w-3 h-3" />
                {errorCount}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="outline" className="gap-1 text-yellow-400 border-yellow-500/50">
                <AlertTriangle className="w-3 h-3" />
                {warningCount}
              </Badge>
            )}
            {infoCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Info className="w-3 h-3" />
                {infoCount}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        )}

        {!loading && activeMistakes.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mb-3" />
            <p className="text-sm font-medium text-green-400">
              No issues detected!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Your Banker's Algorithm state is valid
            </p>
          </div>
        )}

        {!loading && activeMistakes.length > 0 && (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {activeMistakes.map((mistake, index) => {
                const config = severityConfig[mistake.severity];
                const Icon = config.icon;
                const isExpanded = expanded === index;

                return (
                  <Alert 
                    key={index}
                    className={cn(config.bg, config.border, "border")}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={cn("w-5 h-5 mt-0.5", config.color)} />
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTitle className={cn("text-sm font-semibold", config.color)}>
                                {mistake.mistake_type.split('_').map(w => 
                                  w.charAt(0).toUpperCase() + w.slice(1)
                                ).join(' ')}
                              </AlertTitle>
                              <Badge variant={config.badge} className="text-xs">
                                {mistake.location}
                              </Badge>
                            </div>
                            <AlertDescription className="text-sm text-foreground">
                              {mistake.message}
                            </AlertDescription>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleDismiss(mistake)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Expandable suggestion */}
                        <div>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={() => toggleExpand(index)}
                          >
                            {isExpanded ? 'Hide' : 'Show'} suggestion
                          </Button>
                          
                          {isExpanded && (
                            <div className="mt-2 p-3 rounded-md bg-card/50 border border-border/50">
                              <div className="flex items-start gap-2">
                                <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-medium text-yellow-400 mb-1">
                                    Suggested Fix:
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {mistake.suggestion}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Alert>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {dismissed.length > 0 && activeMistakes.length === 0 && mistakes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDismissed([])}
              className="w-full"
            >
              Show {dismissed.length} dismissed issue{dismissed.length > 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Compact inline mistake badges for matrices
export const MistakeBadge = ({ processIndex, resourceIndex, mistakes }) => {
  if (!mistakes || mistakes.length === 0) return null;

  const relevantMistakes = mistakes.filter(m => 
    m.location.includes(`[${processIndex}][${resourceIndex}]`) ||
    m.location === `P${processIndex}, R${resourceIndex}`
  );

  if (relevantMistakes.length === 0) return null;

  const highestSeverity = relevantMistakes.reduce((highest, m) => {
    if (m.severity === 'error') return 'error';
    if (m.severity === 'warning' && highest !== 'error') return 'warning';
    return highest;
  }, 'info');

  const config = severityConfig[highestSeverity];

  return (
    <div className={cn(
      "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
      config.bg
    )}>
      <div className={cn("w-full h-full rounded-full", config.color.replace('text-', 'bg-'))} />
    </div>
  );
};
