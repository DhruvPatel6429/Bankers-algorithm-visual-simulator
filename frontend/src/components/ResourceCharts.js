import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useBanker } from '@/contexts/BankerContext';

export const ProcessResourceChart = ({ processIndex }) => {
  const { allocation, max, need, numResources } = useBanker();

  const data = Array.from({ length: numResources }, (_, i) => ({
    resource: `R${i}`,
    Allocated: allocation[processIndex]?.[i] || 0,
    Max: max[processIndex]?.[i] || 0,
    Need: need[processIndex]?.[i] || 0,
  }));

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold tracking-tight">
          Process P{processIndex} Resources
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="resource" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Bar dataKey="Allocated" fill="#3b82f6" />
            <Bar dataKey="Max" fill="#8b5cf6" />
            <Bar dataKey="Need" fill="#f97316" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const SystemResourceChart = () => {
  const { allocation, available, numResources, numProcesses } = useBanker();

  // Calculate total allocated per resource
  const totalAllocated = Array.from({ length: numResources }, (_, j) => {
    return allocation.reduce((sum, process) => sum + (process[j] || 0), 0);
  });

  const data = Array.from({ length: numResources }, (_, i) => ({
    resource: `R${i}`,
    Available: available[i] || 0,
    Allocated: totalAllocated[i],
  }));

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold tracking-tight text-green-400">
          System-Wide Resources
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="resource" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Bar dataKey="Available" fill="#10b981" />
            <Bar dataKey="Allocated" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
