import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@fontsource/figtree/latin-400.css';
import '@fontsource/figtree/latin-600.css';

import '@mantine/core/styles.css';

import { MantineProvider } from '@mantine/core';
import { AddonApp } from './AddonApp.js';

const root = document.getElementById('addon-root');
if (!root) throw new Error('Missing #addon-root element');

createRoot(root).render(
  <StrictMode>
    <MantineProvider defaultColorScheme='dark'>
      <AddonApp />
    </MantineProvider>
  </StrictMode>
);
