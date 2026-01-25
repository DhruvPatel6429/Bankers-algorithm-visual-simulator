import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Equal } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MatrixDiffDisplay = ({ 
  title, 
  matrixA, 
  matrixB, 
  numProcesses, 
  numResources,
  colorClass = "text-blue-400",
  showPercentage = false
}) => {
  // Calculate differences
  const calculateDiff = (a, b) => {
    const diff = b - a;
    const percentChange = a === 0 ? (diff > 0 ? 100 : 0) : ((diff / a) * 100);
    return {
      value: diff,
      percent: percentChange,
      status: diff > 0 ? 'increased' : diff < 0 ? 'decreased' : 'same'
    };
  };

  const DiffCell = ({ processIdx, resourceIdx }) => {
    const valueA = matrixA[processIdx][resourceIdx];
    const valueB = matrixB[processIdx][resourceIdx];
    const diff = calculateDiff(valueA, valueB);

    return (
      <div className={cn(
        "relative p-3 rounded-md border transition-all duration-300",
        diff.status === 'same' && "bg-card/20 border-border/30",
        diff.status === 'increased' && "bg-green-500/10 border-green-500/50",
        diff.status === 'decreased' && "bg-red-500/10 border-red-500/50"
      )}>
        {/* Values */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-sm font-mono text-blue-400">{valueA}</span>
          <div className="flex items-center gap-1">
            {diff.status === 'increased' && <ArrowUp className="w-3 h-3 text-green-400" />}
            {diff.status === 'decreased' && <ArrowDown className="w-3 h-3 text-red-400" />}
            {diff.status === 'same' && <Equal className="w-3 h-3 text-muted-foreground" />}
          </div>
          <span className="text-sm font-mono text-purple-400">{valueB}</span>
        </div>

        {/* Diff value */}
        {diff.status !== 'same' && (
          <div className={cn(
            "text-xs font-medium text-center",
            diff.status === 'increased' ? "text-green-400" : "text-red-400"
          )}>
            {diff.value > 0 ? '+' : ''}{diff.value}
            {showPercentage && ` (${diff.percent.toFixed(0)}%)`}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={cn("text-lg font-bold", colorClass)}>
            {title} Comparison
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-1" />
              Scenario 1
            </Badge>
            <Badge variant="outline" className="text-xs">
              <div className="w-2 h-2 rounded-full bg-purple-500 mr-1" />
              Scenario 2
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground p-2">
                  Process
                </th>
                {Array.from({ length: numResources }, (_, j) => (
                  <th key={j} className="text-center text-xs font-medium text-muted-foreground p-2">
                    R{j}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: numProcesses }, (_, i) => (
                <tr key={i}>
                  <td className="text-sm font-medium text-muted-foreground p-2">
                    P{i}
                  </td>
                  {Array.from({ length: numResources }, (_, j) => (
                    <td key={j} className="p-1">
                      <DiffCell processIdx={i} resourceIdx={j} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/50" />
            <span className="text-muted-foreground">Increased</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/50" />
            <span className="text-muted-foreground">Decreased</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-card/20 border border-border/30" />
            <span className="text-muted-foreground">No Change</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const VectorDiffDisplay = ({ 
  title, 
  vectorA, 
  vectorB, 
  numResources,
  colorClass = "text-green-400"
}) => {
  const calculateDiff = (a, b) => {
    const diff = b - a;
    const percentChange = a === 0 ? (diff > 0 ? 100 : 0) : ((diff / a) * 100);
    return {
      value: diff,
      percent: percentChange,
      status: diff > 0 ? 'increased' : diff < 0 ? 'decreased' : 'same'
    };
  };

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={cn("text-lg font-bold", colorClass)}>
            {title} Comparison
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-1" />
              Scenario 1
            </Badge>
            <Badge variant="outline" className="text-xs">
              <div className="w-2 h-2 rounded-full bg-purple-500 mr-1" />
              Scenario 2
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {Array.from({ length: numResources }, (_, j) => {
            const diff = calculateDiff(vectorA[j], vectorB[j]);
            return (
              <div
                key={j}
                className={cn(
                  "p-3 rounded-md border transition-all duration-300",
                  diff.status === 'same' && "bg-card/20 border-border/30",
                  diff.status === 'increased' && "bg-green-500/10 border-green-500/50",
                  diff.status === 'decreased' && "bg-red-500/10 border-red-500/50"
                )}
              >
                <div className="text-xs text-muted-foreground text-center mb-2">
                  R{j}
                </div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-mono text-blue-400">{vectorA[j]}</span>
                  <div>
                    {diff.status === 'increased' && <ArrowUp className="w-3 h-3 text-green-400" />}
                    {diff.status === 'decreased' && <ArrowDown className="w-3 h-3 text-red-400" />}
                    {diff.status === 'same' && <Equal className="w-3 h-3 text-muted-foreground" />}
                  </div>
                  <span className="text-sm font-mono text-purple-400">{vectorB[j]}</span>
                </div>
                {diff.status !== 'same' && (
                  <div className={cn(
                    "text-xs font-medium text-center",
                    diff.status === 'increased' ? "text-green-400" : "text-red-400"
                  )}>
                    {diff.value > 0 ? '+' : ''}{diff.value}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
