
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/owl-carousel.css'
import $ from 'jquery';
import 'owl.carousel';

// Make jQuery available globally for owl carousel
window.$ = window.jQuery = $;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
