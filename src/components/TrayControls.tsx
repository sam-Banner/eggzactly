import { useState } from 'react';
import { useMessContext } from '@/context/MessContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RotateCcw, UserPlus, IndianRupee } from 'lucide-react';

const TrayControls = () => {
  const { group, setTrayPrice, resetTray, addMember, members, pricePerEgg } = useMessContext();
  const [newName, setNewName] = useState('');
  const [priceInput, setPriceInput] = useState(group.trayPrice.toString());

  const handleAddMember = () => {
    if (!newName.trim()) return;
    addMember(newName.trim(), '');
    setNewName('');
  };

  const handlePriceUpdate = () => {
    const p = parseFloat(priceInput);
    if (!isNaN(p) && p > 0) setTrayPrice(p);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Group header */}
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        <h3 className="font-display font-bold text-foreground mb-1">{group.name}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <IndianRupee className="h-3.5 w-3.5" />
          <span>₹{pricePerEgg.toFixed(1)}/egg</span>
          <span className="mx-1">·</span>
          <span>{members.length} members</span>
        </div>
      </div>

      {/* Price */}
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Tray Price (₹)</label>
        <div className="flex gap-2">
          <Input
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            type="number"
            className="h-9"
          />
          <Button size="sm" onClick={handlePriceUpdate} className="shrink-0">
            Set
          </Button>
        </div>
      </div>

      {/* Add member */}
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Add Member</label>
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name"
            className="h-9"
            onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
          />
          <Button size="sm" onClick={handleAddMember} className="shrink-0">
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Reset */}
      <Button variant="outline" onClick={resetTray} className="gap-2">
        <RotateCcw className="h-4 w-4" />
        New Tray
      </Button>
    </div>
  );
};

export default TrayControls;
