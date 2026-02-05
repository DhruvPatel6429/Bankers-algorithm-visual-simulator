import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Download,
  Code,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const StepJustificationPanel = ({ safetyResult, isRunning }) => {
  const [showMath, setShowMath] = useState(false);

  // Debug logging
  console.log('StepJustificationPanel render:', { 
    hasSafetyResult: !!safetyResult, 
    isRunning, 
    stepsCount: safetyResult?.steps?.length,
    steps: safetyResult?.steps
  });

  if (!safetyResult || isRunning) {
    console.log('StepJustificationPanel: returning null', { safetyResult: !!safetyResult, isRunning });
    return null;
  }

  const generateJustifications = () => {
    if (!safetyResult.steps || safetyResult.steps.length === 0) {
      console.log('No steps found in safetyResult');
      return [];
    }

    const executeSteps = safetyResult.steps.filter(step => step.type === 'execute');
    console.log('Execute steps found:', executeSteps.length, 'out of', safetyResult.steps.length);

    return executeSteps.map((step, index) => {
        const processIndex = step.processIndex;
        const workBefore = step.workBefore || [];
        const workAfter = step.workAfter || [];
        const need = step.need || [];
        const allocation = step.allocation || [];
        
        return {
          stepNumber: step.stepNumber || index + 1,
          processIndex,
          decision: 'grant',
          condition: 'Need ≤ Work',
          workBefore,
          workAfter,
          need,
          allocation,
          explanation: step.explanation || `Process P${processIndex} can proceed because its resource needs are less than or equal to available resources (Work vector).`,
          formalProof: {
            premise: `Need[P${processIndex}] ≤ Work`,
            conclusion: `P${processIndex} can execute and release resources`,
            steps: [
              `Check: Need[P${processIndex}][j] ≤ Work[j] for all resources j`,
              `Verified: All conditions satisfied`,
              `Action: Allocate resources to P${processIndex}`,
              `Update: Work = Work + Allocation[P${processIndex}]`,
              `Mark: P${processIndex} as finished`
            ]
          }
        };
      });
  };

  const justifications = generateJustifications();
  
  console.log('Justifications generated:', justifications.length, justifications);

  const exportToText = () => {
    let text = `Banker's Algorithm - Step Justification Report\n`;
    text += `==============================================\n\n`;
    text += `System Status: ${safetyResult.isSafe ? 'SAFE' : 'UNSAFE'}\n`;
    
    if (safetyResult.isSafe) {
      text += `Safe Sequence: ${safetyResult.safeSequence.map(p => `P${p}`).join(' → ')}\n\n`;
    }
    
    text += `Detailed Step Analysis:\n`;
    text += `------------------------\n\n`;

    justifications.forEach((just) => {
      text += `Step ${just.stepNumber}: Process P${just.processIndex}\n`;
      text += `Decision: GRANT\n`;
      text += `Condition Checked: ${just.condition}\n`;
      text += `Work Before: [${just.workBefore.join(', ')}]\n`;
      text += `Work After: [${just.workAfter.join(', ')}]\n`;
      text += `\nExplanation:\n${just.explanation}\n`;
      text += `\nFormal Proof:\n`;
      just.formalProof.steps.forEach((s, i) => {
        text += `  ${i + 1}. ${s}\n`;
      });
      text += `\n${'-'.repeat(60)}\n\n`;
    });

    // Create download
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `banker-algorithm-justification-${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Step-by-Step Justification
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMath(!showMath)}
              className="gap-2"
            >
              <Code className="w-4 h-4" />
              {showMath ? 'Hide' : 'Show'} Math
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToText}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary */}
        <div className={cn(
          "p-4 rounded-lg border mb-4",
          safetyResult.isSafe 
            ? "bg-green-500/10 border-green-500/50" 
            : "bg-red-500/10 border-red-500/50"
        )}>
          <div className="flex items-center gap-2 mb-2">
            {safetyResult.isSafe ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <span className={cn(
              "font-bold text-lg",
              safetyResult.isSafe ? "text-green-400" : "text-red-400"
            )}>
              {safetyResult.isSafe ? 'System is SAFE' : 'System is UNSAFE'}
            </span>
          </div>
          {safetyResult.isSafe && (
            <>
              <p className="text-sm text-muted-foreground mb-2">
                Safe execution sequence found:
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {safetyResult.safeSequence.map((processIndex, idx) => (
                  <React.Fragment key={processIndex}>
                    <Badge variant="outline" className="bg-green-500/20 border-green-500/50 text-green-400">
                      P{processIndex}
                    </Badge>
                    {idx < safetyResult.safeSequence.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Step Justifications */}
        <ScrollArea className="h-[500px] pr-4">
          <Accordion type="single" collapsible className="space-y-2">
            {justifications.map((just) => (
              <AccordionItem
                key={just.stepNumber}
                value={`step-${just.stepNumber}`}
                className="border border-border/50 rounded-lg overflow-hidden bg-card/30"
              >
                <AccordionTrigger className="px-4 hover:bg-card/50 hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <Badge variant="outline" className="font-mono">
                      Step {just.stepNumber}
                    </Badge>
                    <span className="font-medium">
                      Process P{just.processIndex}
                    </span>
                    <Badge variant="default" className="bg-green-500/20 border-green-500/50 text-green-400">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      GRANT
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    {/* Condition */}
                    <div className="p-3 rounded-md bg-primary/10 border border-primary/50">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                          Condition Checked
                        </span>
                      </div>
                      <p className="text-sm font-mono text-foreground">
                        {just.condition}
                      </p>
                    </div>

                    {/* Work Vector Changes */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-md bg-card/50 border border-border/50">
                        <p className="text-xs text-muted-foreground mb-2">
                          Work Before
                        </p>
                        <p className="text-sm font-mono text-foreground">
                          [{just.workBefore.join(', ')}]
                        </p>
                      </div>
                      <div className="p-3 rounded-md bg-green-500/10 border border-green-500/50">
                        <p className="text-xs text-green-400 mb-2">
                          Work After
                        </p>
                        <p className="text-sm font-mono text-green-400">
                          [{just.workAfter.join(', ')}]
                        </p>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="p-3 rounded-md bg-card/50 border border-border/50">
                      <p className="text-sm text-muted-foreground">
                        {just.explanation}
                      </p>
                    </div>

                    {/* Formal Proof */}
                    {showMath && (
                      <div className="p-4 rounded-md bg-card/30 border border-border/50">
                        <div className="flex items-center gap-2 mb-3">
                          <Code className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-primary">
                            Formal Proof
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-muted-foreground min-w-[80px]">
                              Premise:
                            </span>
                            <span className="text-xs font-mono text-foreground">
                              {just.formalProof.premise}
                            </span>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-muted-foreground min-w-[80px]">
                              Conclusion:
                            </span>
                            <span className="text-xs font-mono text-foreground">
                              {just.formalProof.conclusion}
                            </span>
                          </div>

                          <div className="mt-3 pt-3 border-t border-border/50">
                            <p className="text-xs text-muted-foreground mb-2">
                              Proof Steps:
                            </p>
                            <ol className="space-y-1">
                              {just.formalProof.steps.map((step, idx) => (
                                <li key={idx} className="text-xs font-mono text-foreground">
                                  {idx + 1}. {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>

        {justifications.length === 0 && (
          <div className="flex items-center justify-center p-8 text-center">
            <div>
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">
                Run the safety algorithm to see step justifications
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
