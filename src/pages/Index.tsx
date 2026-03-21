import { MessProvider } from '@/context/MessContext';
import EggTray from '@/components/EggTray';
import MemberPanel from '@/components/MemberPanel';
import TrayControls from '@/components/TrayControls';
import { Egg } from 'lucide-react';

const Index = () => {
  return (
    <MessProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
            <div className="bg-primary rounded-xl p-2">
              <Egg className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold text-foreground leading-tight">EggTracker</h1>
              <p className="text-xs text-muted-foreground">Mess egg consumption tracker</p>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="container max-w-5xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Tray */}
            <div className="lg:col-span-5">
              <EggTray />
            </div>

            {/* Right: Members + Controls */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <MemberPanel />
                <TrayControls />
              </div>
            </div>
          </div>
        </main>
      </div>
    </MessProvider>
  );
};

export default Index;
