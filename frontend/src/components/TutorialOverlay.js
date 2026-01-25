import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTutorial } from '@/contexts/TutorialContext';
import { X, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export const TutorialOverlay = () => {
  const {
    isActive,
    currentContent,
    nextStep,
    previousStep,
    exitTutorial,
    isFirstStep,
    isLastStep
  } = useTutorial();

  // Handle escape key to exit tutorial
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isActive) {
        exitTutorial();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isActive, exitTutorial]);

  if (!isActive) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300"
        onClick={exitTutorial}
      />

      {/* Tutorial Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <Card className={cn(
          "w-full max-w-2xl pointer-events-auto",
          "animate-in zoom-in-95 slide-in-from-bottom-4 duration-300",
          "bg-card/95 backdrop-blur-md border-2 border-primary/50 shadow-2xl"
        )}>
          <CardHeader className="relative pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20 border border-primary/50">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold tracking-tight">
                    {currentContent.title}
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    {currentContent.description}
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={exitTutorial}
                className="hover:bg-destructive/20 hover:text-destructive"
                data-testid="tutorial-close-btn"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Tutorial Content */}
            <div className="space-y-3">
              {currentContent.actions.map((action, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/30 animate-in slide-in-from-left duration-300"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/30 border border-primary flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-muted-foreground flex-1 pt-0.5">
                    {action}
                  </p>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <Button
                variant="outline"
                onClick={previousStep}
                disabled={isFirstStep}
                data-testid="tutorial-prev-btn"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {Object.keys(currentContent).length > 0 && (
                  <>
                    {['overview', 'matrices', 'safety', 'request', 'outcome', 'completed'].map((step, idx) => (
                      <div
                        key={step}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all duration-300",
                          currentContent.title.toLowerCase().includes(step.split('_')[0])
                            ? "bg-primary w-8"
                            : "bg-muted-foreground/30"
                        )}
                      />
                    ))}
                  </>
                )}
              </div>

              <Button
                onClick={isLastStep ? exitTutorial : nextStep}
                data-testid="tutorial-next-btn"
              >
                {isLastStep ? 'Finish' : 'Next'}
                {!isLastStep && <ChevronRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

// Tutorial toggle button component
export const TutorialToggle = () => {
  const { isActive, startTutorial } = useTutorial();

  if (isActive) return null;

  return (
    <Button
      onClick={startTutorial}
      variant="outline"
      size="sm"
      className="gap-2"
      data-testid="start-tutorial-btn"
    >
      <BookOpen className="w-4 h-4" />
      Start Tutorial
    </Button>
  );
};
