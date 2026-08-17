/*
  Lógica compartida para todo el sitio.
  Cada página define su propio diccionario en window.I18N = { es:{...}, en:{...} }
  antes de incluir este script.
*/
(function(){
  // Guardado de preferencia con fallback en memoria si el navegador bloquea storage
  // (esto pasa dentro de la vista previa de Claude, pero funciona normal una vez publicado en GitHub Pages).
  const memoryStore = {};
  function safeGet(key){
    try{ const v = localStorage.getItem(key); return v === null ? memoryStore[key] : v; }
    catch(e){ return memoryStore[key]; }
  }
  function safeSet(key, value){
    memoryStore[key] = value;
    try{ localStorage.setItem(key, value); }catch(e){ /* preview sandbox: seguimos solo en memoria */ }
  }

  const I18N = window.I18N || { es:{}, en:{} };
  let currentLang = safeGet('rc_lang') || 'es';

  function applyLang(lang){
    currentLang = lang;
    safeSet('rc_lang', lang);
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      const dict = I18N[lang] || {};
      if(dict[key]) el.textContent = dict[key];
    });
    const langSwitch = document.getElementById('lang-switch');
    if(langSwitch) langSwitch.setAttribute('data-state', lang === 'es' ? 'left' : 'right');
  }

  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    safeSet('rc_theme', theme);
    const themeSwitch = document.getElementById('theme-switch');
    if(themeSwitch) themeSwitch.setAttribute('data-state', theme === 'dark' ? 'left' : 'right');
  }

  document.addEventListener('DOMContentLoaded', function(){
    const langSwitch = document.getElementById('lang-switch');
    const themeSwitch = document.getElementById('theme-switch');
    if(langSwitch) langSwitch.addEventListener('click', ()=> applyLang(currentLang === 'es' ? 'en' : 'es'));
    if(themeSwitch) themeSwitch.addEventListener('click', ()=>{
      const now = document.documentElement.getAttribute('data-theme');
      applyTheme(now === 'dark' ? 'light' : 'dark');
    });

    applyLang(currentLang);
    applyTheme(safeGet('rc_theme') || 'dark');

    // ---- Carrusel de imágenes (opcional, por proyecto) ----
    document.querySelectorAll('.carousel').forEach(function(carousel){
      const track = carousel.querySelector('.carousel-track');
      const slides = carousel.querySelectorAll('.carousel-slide');
      const dotsWrap = carousel.querySelector('.carousel-dots');
      let index = 0;
      if(!track || slides.length === 0) return;

      slides.forEach((_, i)=>{
        const dot = document.createElement('span');
        if(i === 0) dot.classList.add('active');
        dotsWrap && dotsWrap.appendChild(dot);
      });

      function go(i){
        index = (i + slides.length) % slides.length;
        track.style.transform = `translateX(-${index * 100}%)`;
        if(dotsWrap){
          dotsWrap.querySelectorAll('span').forEach((d, di)=> d.classList.toggle('active', di === index));
        }
      }
      const prev = carousel.querySelector('.carousel-btn.prev');
      const next = carousel.querySelector('.carousel-btn.next');
      if(prev) prev.addEventListener('click', ()=> go(index - 1));
      if(next) next.addEventListener('click', ()=> go(index + 1));
    });
  });
})();
