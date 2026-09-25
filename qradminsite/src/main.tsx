import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initPwa } from './lib/pwa';
import { installAudioUnlock, unlockAudio } from './lib/sound';
import './styles.css';

initPwa();
installAudioUnlock();
unlockAudio(); // в установленном приложении звук часто разрешён сразу

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
