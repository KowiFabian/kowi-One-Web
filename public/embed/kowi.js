/* Kowi Business widget. Without data-agent it opens the synthetic demo. */
(function () {
  'use strict';
  var script = document.currentScript;
  if (!script || script.dataset.kowiMounted === 'true') return;
  script.dataset.kowiMounted = 'true';

  var origin;
  try { origin = new URL(script.src).origin; } catch (_) { return; }
  var label = script.dataset.kowiLabel || 'Hablar con Kowi';
  var businessId = (script.dataset.agent || script.dataset.kowiBusiness || '').trim();
  var mount = function () {
    var root = document.createElement('div');
    root.setAttribute('data-kowi-business-widget', '');
    var shadow = root.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<style>' +
      ':host{all:initial;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}' +
      'button{font:inherit;cursor:pointer}' +
      '.launcher{position:fixed;right:20px;bottom:20px;z-index:2147483646;border:0;border-radius:999px;padding:14px 20px;background:#194538;color:#fff;box-shadow:0 8px 28px #0005;font-weight:650}' +
      '.panel{position:fixed;right:20px;bottom:82px;z-index:2147483647;width:min(390px,calc(100vw - 24px));height:min(610px,calc(100dvh - 110px));border-radius:18px;overflow:hidden;background:#f4f5ec;box-shadow:0 14px 48px #0006;display:none;flex-direction:column}' +
      '.panel.open{display:flex}.top{display:flex;align-items:center;justify-content:space-between;background:#123d31;color:#fff;padding:8px 12px;font-size:13px;font-weight:650}' +
      '.close{border:0;background:transparent;color:#fff;padding:5px 8px;font-size:22px;line-height:1}' +
      'iframe{width:100%;height:100%;border:0;background:#f4f5ec;flex:1}' +
      '@media(max-width:480px){.panel{right:12px;bottom:76px}}' +
      '</style><section class="panel" role="dialog" aria-modal="false" aria-label="Demo Kowi Business"><div class="top"><span>KOWI BUSINESS · DEMO</span><button class="close" type="button" aria-label="Cerrar demo">×</button></div></section><button class="launcher" type="button" aria-expanded="false"></button>';
    var panel = shadow.querySelector('.panel');
    var launcher = shadow.querySelector('.launcher');
    var close = shadow.querySelector('.close');
    launcher.textContent = label;
    function toggle(open) {
      panel.classList.toggle('open', open);
      launcher.setAttribute('aria-expanded', String(open));
      if (open && !panel.querySelector('iframe')) {
        var frame = document.createElement('iframe');
        frame.src = origin + '/business/embed' + (businessId
          ? '?business=' + encodeURIComponent(businessId) + '&siteOrigin=' + encodeURIComponent(window.location.origin)
          : '');
        frame.title = businessId ? 'Asistente Kowi Business' : 'Demostración Kowi Business';
        frame.loading = 'lazy';
        panel.appendChild(frame);
      }
      (open ? close : launcher).focus();
    }
    launcher.addEventListener('click', function () { toggle(launcher.getAttribute('aria-expanded') !== 'true'); });
    close.addEventListener('click', function () { toggle(false); });
    shadow.addEventListener('keydown', function (event) { if (event.key === 'Escape') toggle(false); });
    document.body.appendChild(root);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
