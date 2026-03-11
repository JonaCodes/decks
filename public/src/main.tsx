import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
// Import only latin subset to reduce bundle size and eliminate FOUT
import '@fontsource/figtree/latin-400.css';
import '@fontsource/figtree/latin-600.css';

import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/carousel/styles.css';

import './index.css';
import { MantineProvider } from '@mantine/core';
import App from './App.tsx';
import { StoreProvider } from './stores/StoreContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <MantineProvider defaultColorScheme='dark'>
        <Router
          future={{
            v7_relativeSplatPath: true,
            v7_startTransition: true,
          }}
        >
          <App />
        </Router>
      </MantineProvider>
    </StoreProvider>
  </StrictMode>
);
