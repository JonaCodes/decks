import React, { createContext, useContext } from 'react';
import { RootStore } from './RootStore';

const StoreContext = createContext<RootStore | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [store] = React.useState(() => new RootStore());
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};

export function useStore(): RootStore {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used within StoreProvider');
  return store;
}
