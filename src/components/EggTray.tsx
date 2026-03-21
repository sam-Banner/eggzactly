import { useMessContext } from '@/context/MessContext';

const EggTray = () => {
  const { eggs, members } = useMessContext();

  const getOwnerColor = (ownerId: string | null) => {
    if (!ownerId) return undefined;
    return members.find(m => m.id === ownerId)?.color;
  };

  const totalConsumed = eggs.filter(e => e.consumed).length;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full px-1">
        <h2 className="text-sm font-display font-bold text-foreground">🥚 Egg Tray</h2>
        <span className="text-xs font-medium text-muted-foreground">
          {30 - totalConsumed}/30
        </span>
      </div>

      <div className="tray-container w-full max-w-[220px] mx-auto p-3">
        <div className="grid grid-cols-5 gap-1.5">
          {eggs.map((egg) => (
            <div key={egg.index} className="tray-cell flex items-center justify-center p-1">
              {egg.consumed ? (
                <div
                  className="egg-cell-consumed w-full aspect-square rounded-full flex items-center justify-center animate-scale-in"
                  style={{
                    backgroundColor: getOwnerColor(egg.ownerId) || '#888',
                    boxShadow: `inset 0 -2px 4px rgba(0,0,0,0.2), 0 2px 4px ${getOwnerColor(egg.ownerId) || '#888'}44`,
                  }}
                >
                  <span className="text-[8px] font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    {members.find(m => m.id === egg.ownerId)?.name?.[0]}
                  </span>
                </div>
              ) : (
                <div className="egg-cell w-full cursor-default" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EggTray;
