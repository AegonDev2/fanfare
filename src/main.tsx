
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/owl-carousel.css'

// Import jQuery properly
import $ from 'jquery';
// Make jQuery available globally for owl carousel
window.$ = window.jQuery = $;

// Import owl carousel after jQuery is loaded and configured
import 'owl.carousel';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
