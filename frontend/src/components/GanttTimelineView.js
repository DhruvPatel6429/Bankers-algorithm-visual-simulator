import React, { useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Play,
  Clock,
  TrendingUp,
  Info,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const GanttTimelineView = ({ safetyResult, isRunning }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredStep, setHoveredStep] = useState(null);
  const chartRef = useRef(null);
  const containerRef = useRef(null);

  if (!safetyResult || isRunning) return null;

  const generateTimelineData = () => {
    if (!safetyResult.steps || safetyResult.steps.length === 0) {
      return [];
    }

    const executeSteps = safetyResult.steps.filter(step => step.type === 'execute');
    const timelineData = executeSteps.map((step, index) => ({
      stepNumber: step.stepNumber || index + 1,
      processIndex: step.processIndex,
      startTime: index,
      endTime: index + 1,
      duration: 1,
      workBefore: step.workBefore || [],
      workAfter: step.workAfter || [],
      allocation: step.allocation || [],
      need: step.need || [],
      explanation: step.explanation || `Process P${step.processIndex} executes`,
      detailedExplanation: step.detailedExplanation || ''
    }));

    return timelineData;
  };

  const timelineData = generateTimelineData();
  const maxTime = timelineData.length;
  const processes = [...new Set(timelineData.map(d => d.processIndex))].sort((a, b) => a - b);

  // Calculate resource utilization metrics
  const resourceMetrics = useMemo(() => {
    if (timelineData.length === 0) return null;
    
    const initialWork = timelineData[0].workBefore;
    const finalWork = timelineData[timelineData.length - 1].workAfter;
    
    const totalResourcesInitial = initialWork.reduce((sum, val) => sum + val, 0);
    const totalResourcesFinal = finalWork.reduce((sum, val) => sum + val, 0);
    const resourcesUsed = totalResourcesInitial - totalResourcesFinal;
    const utilizationRate = totalResourcesInitial > 0 
      ? ((resourcesUsed / totalResourcesInitial) * 100).toFixed(1)
      : 0;
    
    return {
      initialResources: totalResourcesInitial,
      finalResources: totalResourcesFinal,
      resourcesUsed,
      utilizationRate,
      processCount: processes.length,
      stepCount: timelineData.length
    };
  }, [timelineData, processes]);

  const exportAsPNG = async () => {
    if (!chartRef.current) return;

    try {
      const svg = chartRef.current;
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        canvas.toBlob((blob) => {
          const pngUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = pngUrl;
          a.download = `gantt-timeline-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(pngUrl);
        });
      };

      img.src = url;
    } catch (error) {
      console.error('Export PNG failed:', error);
    }
  };

  const exportAsSVG = () => {
    if (!chartRef.current) return;

    const svg = chartRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gantt-timeline-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2.5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Chart dimensions
  const baseBarHeight = 50;
  const processLabelWidth = 120;
  const timeAxisHeight = 60;
  const chartPadding = 30;
  const timeUnitWidth = 180 * zoomLevel;
  const verticalSpacing = 25;

  const chartWidth = processLabelWidth + (maxTime * timeUnitWidth) + (chartPadding * 2);
  const chartHeight = (processes.length * (baseBarHeight + verticalSpacing)) + timeAxisHeight + (chartPadding * 2) + 50;

  // Enhanced color palette with gradients
  const processColors = [
    { base: '#8b5cf6', gradient: ['#8b5cf6', '#a78bfa'], name: 'Purple' },
    { base: '#3b82f6', gradient: ['#3b82f6', '#60a5fa'], name: 'Blue' },
    { base: '#10b981', gradient: ['#10b981', '#34d399'], name: 'Green' },
    { base: '#f59e0b', gradient: ['#f59e0b', '#fbbf24'], name: 'Amber' },
    { base: '#ef4444', gradient: ['#ef4444', '#f87171'], name: 'Red' },
  ];

  return (
    <Card
      ref={containerRef}
      className={cn(
        "bg-gradient-to-br from-card/80 via-card/60 to-card/40 border-border/50 backdrop-blur-sm shadow-2xl",
        isFullscreen && "fixed inset-0 z-50 rounded-none"
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                Gantt Timeline Visualization
                {safetyResult.isSafe && (
                  <Badge className="bg-green-500/20 border-green-500/50 text-green-400 ml-2">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Safe Sequence
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Process execution timeline with resource allocation tracking
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              className="gap-1"
            >
              <ZoomOut className="w-3 h-3" />
              <span className="hidden sm:inline">Zoom Out</span>
            </Button>
            <span className="text-xs text-muted-foreground px-2">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 2.5}
              className="gap-1"
            >
              <ZoomIn className="w-3 h-3" />
              <span className="hidden sm:inline">Zoom In</span>
            </Button>
            <div className="w-px h-6 bg-border/50 mx-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="gap-1"
            >
              <Maximize2 className="w-3 h-3" />
              <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportAsPNG}
              className="gap-1"
            >
              <Download className="w-3 h-3" />
              <span className="hidden sm:inline">PNG</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportAsSVG}
              className="gap-1"
            >
              <Download className="w-3 h-3" />
              <span className="hidden sm:inline">SVG</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Resource Metrics Panel */}
        {resourceMetrics && (
          <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-muted-foreground">Utilization Rate</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">{resourceMetrics.utilizationRate}%</p>
            </div>
            
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-muted-foreground">Execution Steps</span>
              </div>
              <p className="text-2xl font-bold text-purple-400">{resourceMetrics.stepCount}</p>
            </div>
            
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-2 mb-1">
                <Play className="w-4 h-4 text-green-400" />
                <span className="text-xs text-muted-foreground">Active Processes</span>
              </div>
              <p className="text-2xl font-bold text-green-400">{resourceMetrics.processCount}</p>
            </div>
            
            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
              <div className="flex items-center gap-2 mb-1">
                <Info className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-muted-foreground">Initial Resources</span>
              </div>
              <p className="text-2xl font-bold text-orange-400">{resourceMetrics.initialResources}</p>
            </div>
            
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-muted-foreground">Final Resources</span>
              </div>
              <p className="text-2xl font-bold text-cyan-400">{resourceMetrics.finalResources}</p>
            </div>
          </div>
        )}

        <ScrollArea className={cn("w-full", isFullscreen ? "h-[calc(100vh-280px)]" : "h-[600px]")}>
          <div className="min-w-max p-4">
            <svg
              ref={chartRef}
              width={chartWidth}
              height={chartHeight}
              className="bg-gradient-to-br from-card/40 to-background/80 rounded-xl border border-border/30 shadow-inner"
            >
              {/* Define gradients for bars */}
              <defs>
                {processColors.map((color, idx) => (
                  <linearGradient key={idx} id={`gradient-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={color.gradient[0]} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={color.gradient[1]} stopOpacity="0.7" />
                  </linearGradient>
                ))}
                
                {/* Shadow filter */}
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
                </filter>
              </defs>

              {/* Background grid */}
              <g transform={`translate(${processLabelWidth}, ${chartPadding})`}>
                {Array.from({ length: maxTime + 1 }, (_, i) => (
                  <line
                    key={`grid-${i}`}
                    x1={i * timeUnitWidth}
                    y1="0"
                    x2={i * timeUnitWidth}
                    y2={chartHeight - timeAxisHeight - chartPadding}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-border/20"
                    strokeDasharray="4 4"
                  />
                ))}
              </g>

              {/* Time axis */}
              <g transform={`translate(${processLabelWidth}, ${chartPadding})`}>
                {Array.from({ length: maxTime + 1 }, (_, i) => (
                  <g key={i} transform={`translate(${i * timeUnitWidth}, 0)`}>
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2={chartHeight - timeAxisHeight - chartPadding}
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-primary/30"
                    />
                    <circle
                      cx="0"
                      cy={chartHeight - timeAxisHeight - chartPadding + 10}
                      r="4"
                      fill="currentColor"
                      className="text-primary"
                    />
                    <text
                      x="0"
                      y={chartHeight - timeAxisHeight - chartPadding + 30}
                      textAnchor="middle"
                      className="text-sm fill-foreground font-bold font-mono"
                    >
                      T{i}
                    </text>
                  </g>
                ))}
                
                {/* Timeline arrow */}
                <line
                  x1="0"
                  y1={chartHeight - timeAxisHeight - chartPadding + 10}
                  x2={maxTime * timeUnitWidth}
                  y2={chartHeight - timeAxisHeight - chartPadding + 10}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-primary/50"
                  markerEnd="url(#arrowhead)"
                />
                
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3, 0 6"
                      fill="currentColor"
                      className="text-primary/50"
                    />
                  </marker>
                </defs>
              </g>

              {/* Process rows with enhanced visualization */}
              {processes.map((processIndex, idx) => {
                const yPosition = chartPadding + timeAxisHeight + (idx * (baseBarHeight + verticalSpacing));
                const processSteps = timelineData.filter(d => d.processIndex === processIndex);
                const color = processColors[processIndex % processColors.length];

                return (
                  <g key={processIndex}>
                    {/* Process label with gradient background */}
                    <rect
                      x={chartPadding}
                      y={yPosition}
                      width={processLabelWidth - 15}
                      height={baseBarHeight}
                      fill={`url(#gradient-${processIndex % processColors.length})`}
                      rx="8"
                      className="transition-all duration-200"
                      filter="url(#shadow)"
                    />
                    <text
                      x={chartPadding + (processLabelWidth - 15) / 2}
                      y={yPosition + baseBarHeight / 2 - 5}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-base font-bold fill-white"
                    >
                      Process P{processIndex}
                    </text>
                    <text
                      x={chartPadding + (processLabelWidth - 15) / 2}
                      y={yPosition + baseBarHeight / 2 + 12}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs fill-white/70"
                    >
                      {processSteps.length} step{processSteps.length !== 1 ? 's' : ''}
                    </text>

                    {/* Timeline bars for this process */}
                    {processSteps.map((step, stepIdx) => {
                      const xStart = processLabelWidth + (step.startTime * timeUnitWidth) + 5;
                      const barWidth = timeUnitWidth * 0.85;
                      const isHovered = hoveredStep === `${processIndex}-${stepIdx}`;

                      return (
                        <g 
                          key={`${processIndex}-${stepIdx}`}
                          onMouseEnter={() => setHoveredStep(`${processIndex}-${stepIdx}`)}
                          onMouseLeave={() => setHoveredStep(null)}
                          className="cursor-pointer"
                        >
                          {/* Main bar with gradient */}
                          <rect
                            x={xStart}
                            y={yPosition + (isHovered ? -3 : 0)}
                            width={barWidth}
                            height={baseBarHeight + (isHovered ? 6 : 0)}
                            fill={`url(#gradient-${processIndex % processColors.length})`}
                            opacity={isHovered ? "1" : "0.85"}
                            rx="6"
                            className="transition-all duration-200"
                            filter={isHovered ? "url(#shadow)" : "none"}
                            stroke={isHovered ? color.base : "none"}
                            strokeWidth={isHovered ? "2" : "0"}
                          />

                          {/* Step number badge */}
                          <circle
                            cx={xStart + 20}
                            cy={yPosition + 15}
                            r="14"
                            fill="white"
                            opacity="0.95"
                          />
                          <text
                            x={xStart + 20}
                            y={yPosition + 15}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-xs font-bold"
                            fill={color.base}
                          >
                            {step.stepNumber}
                          </text>

                          {/* Resource info */}
                          <g transform={`translate(${xStart + 40}, ${yPosition + 10})`}>
                            <text className="text-[10px] fill-white/90 font-medium">
                              Alloc: [{step.allocation.join(', ')}]
                            </text>
                            <text y="12" className="text-[10px] fill-white/70">
                              Need: [{step.need.join(', ')}]
                            </text>
                          </g>

                          {/* Play icon */}
                          <g transform={`translate(${xStart + barWidth - 25}, ${yPosition + baseBarHeight / 2 - 8})`}>
                            <Play width="16" height="16" className="fill-white/80" />
                          </g>

                          {/* Arrow to next step */}
                          {stepIdx < processSteps.length - 1 && (
                            <g transform={`translate(${xStart + barWidth + 5}, ${yPosition + baseBarHeight / 2})`}>
                              <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            </g>
                          )}

                          {/* Tooltip on hover */}
                          {isHovered && (
                            <g>
                              <rect
                                x={xStart}
                                y={yPosition - 100}
                                width="280"
                                height="90"
                                fill="rgba(0,0,0,0.95)"
                                rx="8"
                                stroke={color.base}
                                strokeWidth="2"
                                filter="url(#shadow)"
                              />
                              <text
                                x={xStart + 10}
                                y={yPosition - 80}
                                className="text-xs fill-white font-bold"
                              >
                                Step {step.stepNumber}: Process P{processIndex}
                              </text>
                              <text
                                x={xStart + 10}
                                y={yPosition - 65}
                                className="text-[10px] fill-white/70"
                              >
                                Allocation: [{step.allocation.join(', ')}]
                              </text>
                              <text
                                x={xStart + 10}
                                y={yPosition - 52}
                                className="text-[10px] fill-white/70"
                              >
                                Work Before: [{step.workBefore.join(', ')}]
                              </text>
                              <text
                                x={xStart + 10}
                                y={yPosition - 39}
                                className="text-[10px] fill-white/70"
                              >
                                Work After: [{step.workAfter.join(', ')}]
                              </text>
                              <text
                                x={xStart + 10}
                                y={yPosition - 26}
                                className="text-[10px] fill-green-400"
                              >
                                ✓ {step.explanation}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>
        </ScrollArea>

        {/* Enhanced Legend */}
        <div className="mt-6 p-5 rounded-lg bg-gradient-to-r from-card/50 to-card/30 border border-border/50">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Execution Sequence</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {safetyResult.safeSequence?.map((p, idx) => (
                    <React.Fragment key={p}>
                      <span className="px-2 py-1 rounded bg-primary/20 text-primary font-mono text-xs">
                        P{p}
                      </span>
                      {idx < safetyResult.safeSequence.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Info className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex flex-wrap gap-3">
                {processes.map((processIndex, idx) => (
                  <div key={processIndex} className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded border border-white/20 shadow-sm"
                      style={{ 
                        background: `linear-gradient(135deg, ${processColors[processIndex % processColors.length].gradient[0]}, ${processColors[processIndex % processColors.length].gradient[1]})` 
                      }}
                    />
                    <span className="text-xs text-muted-foreground font-medium">
                      Process P{processIndex}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {timelineData.length === 0 && (
          <div className="flex items-center justify-center p-12 text-center">
            <div>
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                No Timeline Data Available
              </p>
              <p className="text-sm text-muted-foreground">
                Run the safety algorithm to see the Gantt timeline visualization
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
