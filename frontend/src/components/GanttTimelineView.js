import React, { useState, useRef } from 'react';
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
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const GanttTimelineView = ({ safetyResult, isRunning }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
      explanation: step.explanation || `Process P${step.processIndex} executes`
    }));

    return timelineData;
  };

  const timelineData = generateTimelineData();
  const maxTime = timelineData.length;
  const processes = [...new Set(timelineData.map(d => d.processIndex))].sort((a, b) => a - b);

  const exportAsPNG = async () => {
    if (!chartRef.current) return;

    try {
      // Create a canvas from the SVG
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
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.6));
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
  const baseBarHeight = 40;
  const processLabelWidth = 100;
  const timeAxisHeight = 50;
  const chartPadding = 20;
  const timeUnitWidth = 150 * zoomLevel;

  const chartWidth = processLabelWidth + (maxTime * timeUnitWidth) + (chartPadding * 2);
  const chartHeight = (processes.length * (baseBarHeight + 20)) + timeAxisHeight + (chartPadding * 2);

  // Color palette for processes
  const processColors = [
    '#8b5cf6', // purple
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
  ];

  return (
    <Card
      ref={containerRef}
      className={cn(
        "bg-card/50 border-border/50 backdrop-blur-sm",
        isFullscreen && "fixed inset-0 z-50 rounded-none"
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Gantt Timeline View
            {safetyResult.isSafe && (
              <Badge variant="outline" className="bg-green-500/20 border-green-500/50 text-green-400 ml-2">
                Safe Sequence
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.6}
              className="gap-2"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 2}
              className="gap-2"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="gap-2"
            >
              <Maximize2 className="w-4 h-4" />
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportAsPNG}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              PNG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportAsSVG}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              SVG
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className={cn("w-full", isFullscreen ? "h-[calc(100vh-120px)]" : "h-[500px]")}>
          <div className="min-w-max p-4">
            <svg
              ref={chartRef}
              width={chartWidth}
              height={chartHeight}
              className="bg-card/30 rounded-lg border border-border/50"
            >
              {/* Time axis */}
              <g transform={`translate(${processLabelWidth}, ${chartPadding})`}>
                {/* Time labels */}
                {Array.from({ length: maxTime + 1 }, (_, i) => (
                  <g key={i} transform={`translate(${i * timeUnitWidth}, 0)`}>
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2={chartHeight - timeAxisHeight - chartPadding}
                      stroke="currentColor"
                      strokeWidth="1"
                      className="text-border/30"
                    />
                    <text
                      x="0"
                      y={chartHeight - timeAxisHeight - chartPadding + 20}
                      textAnchor="middle"
                      className="text-xs fill-muted-foreground font-mono"
                    >
                      T{i}
                    </text>
                  </g>
                ))}
              </g>

              {/* Process rows */}
              {processes.map((processIndex, idx) => {
                const yPosition = chartPadding + timeAxisHeight + (idx * (baseBarHeight + 20));
                const processSteps = timelineData.filter(d => d.processIndex === processIndex);

                return (
                  <g key={processIndex}>
                    {/* Process label */}
                    <rect
                      x={chartPadding}
                      y={yPosition}
                      width={processLabelWidth - 10}
                      height={baseBarHeight}
                      fill="currentColor"
                      className="text-card/50"
                      rx="4"
                    />
                    <text
                      x={chartPadding + (processLabelWidth - 10) / 2}
                      y={yPosition + baseBarHeight / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-sm font-bold fill-foreground"
                    >
                      Process P{processIndex}
                    </text>

                    {/* Timeline bars for this process */}
                    {processSteps.map((step, stepIdx) => {
                      const xStart = processLabelWidth + (step.startTime * timeUnitWidth);
                      const barWidth = timeUnitWidth * 0.9;
                      const color = processColors[processIndex % processColors.length];

                      return (
                        <g key={`${processIndex}-${stepIdx}`}>
                          {/* Bar */}
                          <rect
                            x={xStart}
                            y={yPosition}
                            width={barWidth}
                            height={baseBarHeight}
                            fill={color}
                            opacity="0.8"
                            rx="4"
                            className="transition-all hover:opacity-100"
                          >
                            <title>
                              {`Step ${step.stepNumber}: Process P${processIndex}\n`}
                              {`Time: T${step.startTime} → T${step.endTime}\n`}
                              {`Resources Allocated: [${step.allocation.join(', ')}]\n`}
                              {`Work Before: [${step.workBefore.join(', ')}]\n`}
                              {`Work After: [${step.workAfter.join(', ')}]`}
                            </title>
                          </rect>

                          {/* Step number badge */}
                          <circle
                            cx={xStart + barWidth / 2}
                            cy={yPosition + baseBarHeight / 2}
                            r="12"
                            fill="white"
                            opacity="0.9"
                          />
                          <text
                            x={xStart + barWidth / 2}
                            y={yPosition + baseBarHeight / 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-xs font-bold"
                            fill={color}
                          >
                            {step.stepNumber}
                          </text>

                          {/* Execution icon */}
                          <g transform={`translate(${xStart + 10}, ${yPosition + 8})`}>
                            <Play width="16" height="16" className="fill-white/80" />
                          </g>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>
        </ScrollArea>

        {/* Legend */}
        <div className="mt-4 p-4 rounded-lg bg-card/30 border border-border/50">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Timeline shows execution sequence: {safetyResult.safeSequence?.map(p => `P${p}`).join(' → ')}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {processes.map((processIndex, idx) => (
                <div key={processIndex} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: processColors[processIndex % processColors.length] }}
                  />
                  <span className="text-xs text-muted-foreground">P{processIndex}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {timelineData.length === 0 && (
          <div className="flex items-center justify-center p-8 text-center">
            <div>
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">
                Run the safety algorithm to see the Gantt timeline
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
