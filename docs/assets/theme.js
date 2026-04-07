/**
 * vibe-init docs — Apple-inspired theme system + Mermaid sync
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'vibe-theme';

  var darkMermaid = {
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
      darkMode: true,
      background: '#1C1C1E',
      primaryColor: '#2C2C2E',
      primaryTextColor: '#F5F5F7',
      primaryBorderColor: '#FF6D35',
      secondaryColor: '#1C1C1E',
      secondaryTextColor: '#F5F5F7',
      secondaryBorderColor: '#48484A',
      tertiaryColor: '#2C2C2E',
      tertiaryTextColor: '#F5F5F7',
      tertiaryBorderColor: '#48484A',
      lineColor: '#636366',
      textColor: '#F5F5F7',
      mainBkg: '#2C2C2E',
      nodeBorder: '#FF6D35',
      nodeTextColor: '#F5F5F7',
      clusterBkg: '#1C1C1E',
      clusterBorder: '#48484A',
      titleColor: '#F5F5F7',
      edgeLabelBackground: '#2C2C2E',
      actorBkg: '#2C2C2E',
      actorBorder: '#FF6D35',
      actorTextColor: '#F5F5F7',
      actorLineColor: '#636366',
      signalColor: '#636366',
      signalTextColor: '#F5F5F7',
      labelBoxBkgColor: '#2C2C2E',
      labelBoxBorderColor: '#48484A',
      labelTextColor: '#F5F5F7',
      loopTextColor: '#F5F5F7',
      noteBkgColor: '#3A3A3C',
      noteTextColor: '#F5F5F7',
      noteBorderColor: '#FF6D35',
      activationBkgColor: '#3A3A3C',
      activationBorderColor: '#FF6D35',
      sequenceNumberColor: '#F5F5F7',
      sectionBkgColor: '#1C1C1E',
      altSectionBkgColor: '#2C2C2E',
      fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif',
      fontSize: '13px'
    }
  };

  var lightMermaid = {
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
      darkMode: false,
      background: '#F5F5F7',
      primaryColor: '#FFFFFF',
      primaryTextColor: '#1D1D1F',
      primaryBorderColor: '#E8511A',
      secondaryColor: '#F5F5F7',
      secondaryTextColor: '#1D1D1F',
      secondaryBorderColor: '#D2D2D7',
      tertiaryColor: '#FFFFFF',
      tertiaryTextColor: '#1D1D1F',
      tertiaryBorderColor: '#D2D2D7',
      lineColor: '#AEAEB2',
      textColor: '#1D1D1F',
      mainBkg: '#FFFFFF',
      nodeBorder: '#E8511A',
      nodeTextColor: '#1D1D1F',
      clusterBkg: '#F5F5F7',
      clusterBorder: '#D2D2D7',
      titleColor: '#1D1D1F',
      edgeLabelBackground: '#F5F5F7',
      actorBkg: '#FFFFFF',
      actorBorder: '#E8511A',
      actorTextColor: '#1D1D1F',
      actorLineColor: '#AEAEB2',
      signalColor: '#AEAEB2',
      signalTextColor: '#1D1D1F',
      labelBoxBkgColor: '#FFFFFF',
      labelBoxBorderColor: '#D2D2D7',
      labelTextColor: '#1D1D1F',
      loopTextColor: '#1D1D1F',
      noteBkgColor: '#FFF7ED',
      noteTextColor: '#1D1D1F',
      noteBorderColor: '#E8511A',
      activationBkgColor: '#FFF7ED',
      activationBorderColor: '#E8511A',
      sequenceNumberColor: '#1D1D1F',
      sectionBkgColor: '#F5F5F7',
      altSectionBkgColor: '#FFFFFF',
      fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif',
      fontSize: '13px'
    }
  };

  function getPreferred() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    return 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  applyTheme(getPreferred());

  function rerenderMermaid() {
    if (typeof window.mermaid === 'undefined') return;

    var theme = document.documentElement.getAttribute('data-theme') || 'dark';
    var config = theme === 'light' ? lightMermaid : darkMermaid;

    window.mermaid.initialize(config);

    var diagrams = document.querySelectorAll('.mermaid');
    diagrams.forEach(function (el) {
      if (!el.getAttribute('data-mermaid-src')) {
        el.setAttribute('data-mermaid-src', el.textContent);
      }
      var source = el.getAttribute('data-mermaid-src');
      if (!source) return;
      el.removeAttribute('data-processed');
      el.innerHTML = source;
    });

    window.mermaid.run();
  }

  window.toggleTheme = function () {
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    var next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    rerenderMermaid();
  };

  function initMermaid() {
    if (typeof window.mermaid === 'undefined') return;
    document.querySelectorAll('.mermaid').forEach(function (el) {
      if (!el.getAttribute('data-mermaid-src')) {
        el.setAttribute('data-mermaid-src', el.textContent);
      }
    });
    var theme = document.documentElement.getAttribute('data-theme') || 'dark';
    var config = theme === 'light' ? lightMermaid : darkMermaid;
    window.mermaid.initialize(config);
    window.mermaid.run();
  }

  window.addEventListener('mermaid-loaded', initMermaid);
  document.addEventListener('DOMContentLoaded', initMermaid);

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
        rerenderMermaid();
      }
    });
  }
})();
