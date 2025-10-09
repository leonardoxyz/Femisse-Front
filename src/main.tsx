import { createRoot } from 'react-dom/client'
import axios from 'axios'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker } from './utils/registerSW'

// Configuração global do axios para enviar cookies httpOnly
axios.defaults.withCredentials = true;

createRoot(document.getElementById("root")!).render(<App />);

// Registra Service Worker (PWA)
registerServiceWorker();
