import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface Member {
  id: string;
  name: string;
  color: string;
  pattern: 'striped' | 'dotted';
  eggsEaten: number;
  role: 'admin' | 'member';
}

export interface Egg {
  index: number;
  consumed: boolean;
  ownerId: string | null;
}

export interface Group {
  id: string;
  name: string;
  trayPrice: number;
}

interface MessContextType {
  group: Group;
  members: Member[];
  eggs: Egg[];
  currentUserId: string;
  setTrayPrice: (price: number) => void;
  addMember: (name: string, color: string) => void;
  removeMember: (id: string) => void;
  incrementEgg: (memberId: string) => void;
  decrementEgg: (memberId: string) => void;
  resetTray: () => void;
  pricePerEgg: number;
}

const MEMBER_COLORS = [
  '#e74c3c', '#3498db', '#2ecc71', '#9b59b6',
  '#f39c12', '#1abc9c', '#e67e22', '#e84393',
];

const createInitialEggs = (): Egg[] =>
  Array.from({ length: 30 }, (_, i) => ({ index: i, consumed: false, ownerId: null }));

const MessContext = createContext<MessContextType | null>(null);

export const useMessContext = () => {
  const ctx = useContext(MessContext);
  if (!ctx) throw new Error('useMessContext must be used within MessProvider');
  return ctx;
};

const defaultMembers: Member[] = [
  { id: '1', name: 'Rahul', color: MEMBER_COLORS[0], pattern: 'striped', eggsEaten: 0, role: 'admin' },
  { id: '2', name: 'Priya', color: MEMBER_COLORS[1], pattern: 'dotted', eggsEaten: 0, role: 'member' },
  { id: '3', name: 'Amit', color: MEMBER_COLORS[2], pattern: 'striped', eggsEaten: 0, role: 'member' },
];

export const MessProvider = ({ children }: { children: ReactNode }) => {
  const [group, setGroup] = useState<Group>({ id: '1', name: 'Hostel Mess', trayPrice: 210 });
  const [members, setMembers] = useState<Member[]>(defaultMembers);
  const [eggs, setEggs] = useState<Egg[]>(createInitialEggs);
  const currentUserId = '1';

  const pricePerEgg = group.trayPrice / 30;

  const setTrayPrice = useCallback((price: number) => {
    setGroup(g => ({ ...g, trayPrice: price }));
  }, []);

  const addMember = useCallback((name: string, color: string) => {
    const id = Date.now().toString();
    setMembers(m => [...m, { id, name, color: color || MEMBER_COLORS[m.length % MEMBER_COLORS.length], pattern: 'striped', eggsEaten: 0, role: 'member' }]);
  }, []);

  const removeMember = useCallback((id: string) => {
    setMembers(m => m.filter(mb => mb.id !== id));
    setEggs(eggs => eggs.map(e => e.ownerId === id ? { ...e, consumed: false, ownerId: null } : e));
  }, []);

  const incrementEgg = useCallback((memberId: string) => {
    const availableEggs = eggs.filter(e => !e.consumed);
    if (availableEggs.length === 0) return;
    const randomEgg = availableEggs[Math.floor(Math.random() * availableEggs.length)];

    setEggs(prev => prev.map(e =>
      e.index === randomEgg.index ? { ...e, consumed: true, ownerId: memberId } : e
    ));
    setMembers(prev => prev.map(m =>
      m.id === memberId ? { ...m, eggsEaten: m.eggsEaten + 1 } : m
    ));
  }, [eggs]);

  const decrementEgg = useCallback((memberId: string) => {
    const memberEggs = eggs.filter(e => e.ownerId === memberId);
    if (memberEggs.length === 0) return;
    const lastEgg = memberEggs[memberEggs.length - 1];

    setEggs(prev => prev.map(e =>
      e.index === lastEgg.index ? { ...e, consumed: false, ownerId: null } : e
    ));
    setMembers(prev => prev.map(m =>
      m.id === memberId ? { ...m, eggsEaten: Math.max(0, m.eggsEaten - 1) } : m
    ));
  }, [eggs]);

  const resetTray = useCallback(() => {
    setEggs(createInitialEggs());
    setMembers(prev => prev.map(m => ({ ...m, eggsEaten: 0 })));
  }, []);

  return (
    <MessContext.Provider value={{
      group, members, eggs, currentUserId,
      setTrayPrice, addMember, removeMember,
      incrementEgg, decrementEgg, resetTray, pricePerEgg,
    }}>
      {children}
    </MessContext.Provider>
  );
};
