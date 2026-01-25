import React from "react";
import "@/App.css";
import { BankerProvider } from '@/contexts/BankerContext';
import { TutorialProvider } from '@/contexts/TutorialContext';
import { BankerDashboard } from '@/pages/BankerDashboard';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <div className="App dark min-h-screen bg-background text-foreground">
      <TutorialProvider>
        <BankerProvider>
          <BankerDashboard />
          <Toaster />
        </BankerProvider>
      </TutorialProvider>
    </div>
  );
}

export default App;
