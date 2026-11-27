/**
 * Shared helpers for ACSO front-end (prototype → theme enqueue).
 */
(function (global) {
  'use strict';

  function escapeHtml(s) {
    if (global.AcsoNewsMosaic && global.AcsoNewsMosaic.escapeHtml) {
      return global.AcsoNewsMosaic.escapeHtml(s);
    }
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  global.AcsoUtil = { escapeHtml: escapeHtml };
})(typeof window !== 'undefined' ? window : this);
