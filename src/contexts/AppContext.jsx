import React, { createContext, useContext, useState } from 'react';
import { AppLoadState } from '@/lib/appState';

const AppContext = createContext({
  isInitialLoadComplete: true,
  setIsInitialLoadComplete: () => {},
  stage: 'ready',
  setStage: () => {},
  catalogLoaded: false,
  setCatalogLoaded: () => {},
  activeDetailsProduct: null,
  setActiveDetailsProduct: () => {},
  isGlobalSearchOpen: false,
  setIsGlobalSearchOpen: () => {},
  globalSearchQuery: '',
  setGlobalSearchQuery: () => {},
});

export const AppProvider = ({ children }) => {
  // If already loaded this session → skip to initial load complete
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(
    AppLoadState.hasLoaded
  );

  // Maintain stage compatibility for step-by-step preloader components
  const [stage, setStage] = useState(
    AppLoadState.hasLoaded ? 'ready' : 'welcome'
  );

  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [activeDetailsProduct, setActiveDetailsProduct] = useState(null);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  const handleCompleteInitialLoad = () => {
    setIsInitialLoadComplete(true);
    setStage('ready');
    AppLoadState.setLoaded();
  };

  const handleSetStage = (s) => {
    setStage(s);
    if (s === 'ready') {
      setIsInitialLoadComplete(true);
      AppLoadState.setLoaded();
    }
  };

  return (
    <AppContext.Provider value={{
      isInitialLoadComplete,
      setIsInitialLoadComplete: handleCompleteInitialLoad,
      stage,
      setStage: handleSetStage,
      catalogLoaded,
      setCatalogLoaded,
      activeDetailsProduct,
      setActiveDetailsProduct,
      isGlobalSearchOpen,
      setIsGlobalSearchOpen,
      globalSearchQuery,
      setGlobalSearchQuery,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
