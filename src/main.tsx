import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeSanitization } from './lib/sanitize'

// Initialize DOMPurify security hooks
initializeSanitization();

createRoot(document.getElementById("root")!).render(<App />);
