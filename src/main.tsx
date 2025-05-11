
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/owl-carousel.css'

// Import jQuery properly
import $ from 'jquery';
// Import owl carousel after jQuery is loaded
import 'owl.carousel';

// Make jQuery available globally for owl carousel
// Use proper TypeScript syntax to avoid errors
declare global {
  interface Window {
    $: typeof $;
    jQuery: typeof $;
  }
}

window.$ = window.jQuery = $;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
