
/// <reference types="vite/client" />

import $ from 'jquery';

declare global {
  interface Window {
    $: typeof $;
    jQuery: typeof $;
  }
}
