import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const MatrixDisplay = ({ 
  title, 
  matrix, 
  numProcesses, 
  numResources, 
  onEdit,
  editable = false,
  colorClass = 'text-blue-400',
  activeProcess = null,
  dataTestIdPrefix = 'matrix'
}) => {
  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className={cn("text-lg font-bold tracking-tight", colorClass)}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Header row with resource labels */}
            <div className="flex items-center mb-2">
              <div className="w-16 text-xs font-semibold text-muted-foreground"></div>
              {Array.from({ length: numResources }, (_, j) => (
                <div key={j} className="w-14 text-center text-xs font-semibold text-muted-foreground">
                  R{j}
                </div>
              ))}
            </div>
            
            {/* Matrix rows */}
            {Array.from({ length: numProcesses }, (_, i) => (
              <div 
                key={i} 
                className={cn(
                  "flex items-center mb-1 transition-all duration-300",
                  activeProcess === i && "scale-105"
                )}
              >
                <div className="w-16 text-xs font-semibold text-muted-foreground">
                  P{i}
                </div>
                {Array.from({ length: numResources }, (_, j) => (
                  <div 
                    key={j}
                    className={cn(
                      "w-14 mx-0.5",
                      activeProcess === i && "animate-pulse"
                    )}
                  >
                    {editable ? (
                      <Input
                        type="number"
                        min="0"
                        value={matrix[i]?.[j] ?? 0}
                        onChange={(e) => onEdit(i, j, e.target.value)}
                        className="h-9 text-center font-mono text-sm bg-background/50 border-border/50"
                        data-testid={`${dataTestIdPrefix}-p${i}-r${j}`}
                      />
                    ) : (
                      <div 
                        className={cn(
                          "h-9 flex items-center justify-center rounded-md border font-mono text-sm transition-all duration-300",
                          activeProcess === i 
                            ? "border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(59,130,246,0.3)]" 
                            : "border-border/50 bg-card/30",
                          matrix[i]?.[j] < 0 && "border-red-500 bg-red-500/10 text-red-400"
                        )}
                        data-testid={`${dataTestIdPrefix}-p${i}-r${j}`}
                      >
                        {matrix[i]?.[j] ?? 0}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const VectorDisplay = ({ 
  title, 
  vector, 
  numResources, 
  onEdit,
  editable = false,
  colorClass = 'text-green-400',
  dataTestIdPrefix = 'vector'
}) => {
  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className={cn("text-lg font-bold tracking-tight", colorClass)}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          {Array.from({ length: numResources }, (_, j) => (
            <div key={j} className="mr-2">
              <div className="text-xs font-semibold text-muted-foreground text-center mb-1">
                R{j}
              </div>
              {editable ? (
                <Input
                  type="number"
                  min="0"
                  value={vector[j] ?? 0}
                  onChange={(e) => onEdit(j, e.target.value)}
                  className="w-14 h-9 text-center font-mono text-sm bg-background/50 border-border/50"
                  data-testid={`${dataTestIdPrefix}-r${j}`}
                />
              ) : (
                <div 
                  className="w-14 h-9 flex items-center justify-center rounded-md border border-border/50 bg-card/30 font-mono text-sm"
                  data-testid={`${dataTestIdPrefix}-r${j}`}
                >
                  {vector[j] ?? 0}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
