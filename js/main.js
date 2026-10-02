(function () {
  'use strict';

  var WHATSAPP_NUMBER = '5585986628400';

  var header = document.getElementById('header');
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('menu-toggle');

  /* ---------- Header: estado ao rolar ---------- */
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('is-open', open);
    header.classList.toggle('menu-active', open);
    document.body.classList.toggle('menu-open', open);
  }

  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });

  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  window.matchMedia('(min-width: 961px)').addEventListener('change', function (mq) {
    if (mq.matches) setMenu(false);
  });

  /* ---------- Link ativo no menu ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Animação de entrada ---------- */
  var reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    reveals.forEach(function (el) {
      // escalona itens irmãos (cards, etapas etc.)
      var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) {
        return c.classList.contains('reveal');
      });
      var i = siblings.indexOf(el);
      if (i > 0) el.style.transitionDelay = Math.min(i * 90, 360) + 'ms';
      revealObserver.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Marquee: duplica os itens para o loop contínuo ---------- */
  document.querySelectorAll('[data-marquee] .marquee__track').forEach(function (track) {
    Array.prototype.slice.call(track.children).forEach(function (item) {
      var clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  });

  /* ---------- FAQ (acordeão) ---------- */
  document.querySelectorAll('.accordion__btn').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));

    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('is-open', open);
    });
  });

  /* ---------- Depoimentos: o player do YouTube só carrega no clique ---------- */
  var activeVideo = null;

  document.querySelectorAll('.video__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      // fecha o vídeo que estiver tocando, devolvendo a capa
      if (activeVideo) {
        activeVideo.card.replaceChild(activeVideo.btn, activeVideo.iframe);
      }

      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + btn.dataset.video + '?autoplay=1&rel=0&playsinline=1';
      iframe.title = btn.getAttribute('aria-label');
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;

      var card = btn.parentElement;
      card.replaceChild(iframe, btn);
      iframe.focus();
      activeVideo = { card: card, btn: btn, iframe: iframe };
    });
  });

  /* ---------- Formulário → WhatsApp ---------- */
  var form = document.getElementById('form');
  var phoneInput = document.getElementById('f-whats');

  function maskPhone(value) {
    var d = value.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d.length ? '(' + d : '';
    if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }

  phoneInput.addEventListener('input', function () {
    phoneInput.value = maskPhone(phoneInput.value);
  });

  function setError(input, message) {
    var field = input.closest('.field');
    field.classList.toggle('has-error', !!message);
    field.querySelector('.field__error').textContent = message || '';
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function validate() {
    var marca = form.marca;
    var nome = form.nome;
    var whats = form.whatsapp;
    var firstInvalid = null;

    var rules = [
      [marca, marca.value.trim().length >= 2, 'Informe o nome da sua marca.'],
      [nome, nome.value.trim().length >= 2, 'Informe seu nome.'],
      [whats, whats.value.replace(/\D/g, '').length >= 10, 'Informe um WhatsApp válido com DDD.']
    ];

    rules.forEach(function (rule) {
      setError(rule[0], rule[1] ? '' : rule[2]);
      if (!rule[1] && !firstInvalid) firstInvalid = rule[0];
    });

    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  ['marca', 'nome', 'whatsapp'].forEach(function (name) {
    form[name].addEventListener('input', function () {
      if (form[name].closest('.field').classList.contains('has-error')) setError(form[name], '');
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;

    var message =
      'Olá! Quero iniciar o registro da minha marca.\n\n' +
      '*Marca:* ' + form.marca.value.trim() + '\n' +
      '*Nome:* ' + form.nome.value.trim() + '\n' +
      '*WhatsApp:* ' + form.whatsapp.value.trim();

    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message), '_blank', 'noopener');
    form.reset();
  });

  /* ---------- Ano no rodapé ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
