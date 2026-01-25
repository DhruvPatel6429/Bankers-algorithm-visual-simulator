import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const ComparativeMetricsDashboard = ({ stateA, stateB }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!stateA || !stateB) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.post(`${BACKEND_URL}/api/banker/compare`, {
          scenarioA: stateA,
          scenarioB: stateB
        });
        setMetrics(response.data);
      } catch (err) {
        console.error('Error fetching comparison metrics:', err);
        setError('Failed to calculate comparison metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [stateA, stateB]);

  if (loading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  const MetricCard = ({ title, valueA, valueB, diff, unit = '%', inverse = false }) => {
    const isPositive = inverse ? diff < 0 : diff > 0;
    const isNeutral = diff === 0;

    return (
      <div className="p-4 rounded-lg bg-card/30 border border-border/50">
        <div className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
          {title}
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <div className="text-xs text-blue-400 mb-1">Scenario 1</div>
            <div className="text-2xl font-bold text-blue-400">
              {valueA.toFixed(1)}{unit}
            </div>
          </div>
          <div>
            <div className="text-xs text-purple-400 mb-1">Scenario 2</div>
            <div className="text-2xl font-bold text-purple-400">
              {valueB.toFixed(1)}{unit}
            </div>
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-2 text-sm font-medium",
          isNeutral ? "text-muted-foreground" : isPositive ? "text-green-400" : "text-red-400"
        )}>
          {isNeutral ? (
            <Minus className="w-4 h-4" />
          ) : isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>
            {diff > 0 ? '+' : ''}{diff.toFixed(1)}{unit}
          </span>
          {!isNeutral && (
            <Badge variant={isPositive ? "default" : "destructive"} className="ml-auto">
              {isPositive ? "Better" : "Worse"}
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-card/80 to-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-blue-400">vs</span>
            <div className="w-3 h-3 rounded-full bg-purple-500" />
          </div>
          <span>Comparative Metrics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Safety Status Comparison */}
        <div className="p-4 rounded-lg bg-card/30 border border-border/50">
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
            System Safety
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              {metrics.is_safe_a ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <span className={cn(
                "font-medium",
                metrics.is_safe_a ? "text-green-400" : "text-red-400"
              )}>
                {metrics.is_safe_a ? "SAFE" : "UNSAFE"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {metrics.is_safe_b ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <span className={cn(
                "font-medium",
                metrics.is_safe_b ? "text-green-400" : "text-red-400"
              )}>
                {metrics.is_safe_b ? "SAFE" : "UNSAFE"}
              </span>
            </div>
          </div>
        </div>

        {/* Resource Utilization */}
        <MetricCard
          title="Resource Utilization"
          valueA={metrics.utilization_a}
          valueB={metrics.utilization_b}
          diff={metrics.utilization_diff}
        />

        {/* Safety Margin */}
        <MetricCard
          title="Safety Margin"
          valueA={metrics.safety_margin_a}
          valueB={metrics.safety_margin_b}
          diff={metrics.safety_margin_diff}
        />

        {/* Resource Slack */}
        <MetricCard
          title="Resource Slack"
          valueA={metrics.resource_slack_a}
          valueB={metrics.resource_slack_b}
          diff={metrics.resource_slack_diff}
        />

        {/* Divergence Score */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/50">
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            Overall Divergence
          </div>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-orange-400">
              {metrics.total_divergence_score.toFixed(1)}%
            </div>
            <Badge variant={metrics.total_divergence_score > 50 ? "destructive" : "default"}>
              {metrics.total_divergence_score > 50 ? "High" : metrics.total_divergence_score > 25 ? "Medium" : "Low"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Measures how different the two scenarios are across all metrics
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
