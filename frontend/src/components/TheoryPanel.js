import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen } from 'lucide-react';

export const TheoryPanel = () => {
  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Theory & Concepts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="deadlock">
            <AccordionTrigger className="text-sm">What is Deadlock?</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              A deadlock is a situation where a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process. The four necessary conditions for deadlock are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="banker">
            <AccordionTrigger className="text-sm">Banker's Algorithm</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              The Banker's Algorithm is a deadlock avoidance algorithm developed by Edsger Dijkstra. It tests for safety by simulating the allocation of predetermined maximum possible amounts of all resources, then makes a "safe state" check to test for possible deadlock conditions before deciding whether allocation should be allowed to continue.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="safe-state">
            <AccordionTrigger className="text-sm">Safe State</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              A state is safe if the system can allocate resources to each process in some order and still avoid deadlock. This means there exists a safe sequence of processes where each process can obtain its maximum needs, execute, and release resources for others. If no such sequence exists, the state is unsafe.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="safety-algorithm">
            <AccordionTrigger className="text-sm">Safety Algorithm Steps</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              <ol className="list-decimal list-inside space-y-1">
                <li>Initialize Work = Available and Finish[i] = false for all processes</li>
                <li>Find a process i where Finish[i] = false and Need[i] ≤ Work</li>
                <li>If found: Work = Work + Allocation[i], Finish[i] = true, go to step 2</li>
                <li>If all Finish[i] = true, system is in safe state; otherwise unsafe</li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="matrices">
            <AccordionTrigger className="text-sm">Key Matrices</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              <ul className="space-y-1">
                <li><span className="font-semibold text-blue-400">Allocation:</span> Currently allocated resources to each process</li>
                <li><span className="font-semibold text-purple-400">Max:</span> Maximum resources each process may need</li>
                <li><span className="font-semibold text-orange-400">Need:</span> Remaining resources needed (Max - Allocation)</li>
                <li><span className="font-semibold text-green-400">Available:</span> Currently available resources</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};
