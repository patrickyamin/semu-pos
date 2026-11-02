'use strict';

const APP_MODE = window.BAZAAR_DEMO ? 'demo' : 'live';
const DB_KEY = APP_MODE === 'demo' ? 'semupos.demo.v1' : 'semupos.v1';
const BRAND_NAME = 'SEMU';
const SYNC_DEFAULTS = {
  url: 'https://delprygcvapmmgswxjos.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbHByeWdjdmFwbW1nc3d4am9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2MzczNDksImV4cCI6MjEwNTIxMzM0OX0.dK6OoZEA0eK1HSeH8geiZvj31IEWtgg2ePjXV8uAI3U'
};
const VERSION = '1.1.0';
// Buy 3 get 1 free on 50ml bottles, any mix of scents. Toggle in Settings > Selling.
const PROMO = { size: '50ml', buy: 3, free: 1, label: 'Buy 3 get 1 free' };

const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function uid(prefix) {
  return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function pad(n, len) {
  return String(n).padStart(len, '0');
}
function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}
function rp(n) {
  const v = Math.round(Number(n) || 0);
  const sign = v < 0 ? '-' : '';
  return sign + 'Rp ' + Math.abs(v).toLocaleString('id-ID');
}
function rpShort(n) {
  const v = Math.round(Number(n) || 0);
  if (v >= 1000000) return (v / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' jt';
  if (v >= 1000) return (v / 1000).toLocaleString('id-ID', { maximumFractionDigits: 0 }) + ' rb';
  return String(v);
}
function digitsToNumber(s) {
  const d = String(s == null ? '' : s).replace(/[^\d]/g, '');
  return d ? parseInt(d, 10) : 0;
}
function fmtDigits(s) {
  const d = String(s == null ? '' : s).replace(/[^\d]/g, '');
  if (!d) return '';
  return parseInt(d, 10).toLocaleString('id-ID');
}
function dayKey(ts) {
  const d = new Date(ts);
  return d.getFullYear() + '-' + pad(d.getMonth() + 1, 2) + '-' + pad(d.getDate(), 2);
}
function fmtTime(ts) {
  const d = new Date(ts);
  return pad(d.getHours(), 2) + ':' + pad(d.getMinutes(), 2);
}
function fmtDate(ts) {
  const d = new Date(ts);
  return pad(d.getDate(), 2) + '/' + pad(d.getMonth() + 1, 2) + '/' + d.getFullYear();
}
function fmtDateLong(key) {
  const parts = String(key).split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  const today = dayKey(Date.now());
  const yesterday = dayKey(Date.now() - 86400000);
  if (key === today) return 'Today';
  if (key === yesterday) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
function shiftDay(key, delta) {
  const parts = String(key).split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2] + delta);
  return dayKey(d);
}
function haptic(ms) {
  try { if (navigator.vibrate) navigator.vibrate(ms || 8); } catch (e) {}
}
function download(filename, content, mime) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
}
function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); resolve(); } catch (e) { reject(e); }
    ta.remove();
  });
}

const COLOR_HEX = {
  black: '#1c1c1e', hitam: '#1c1c1e', white: '#ffffff', putih: '#f5f5f5', 'off white': '#f7f4ee',
  ivory: '#fffff0', cream: '#f3ead8', beige: '#e6d8bf', sand: '#dcc8a0', khaki: '#c3b091',
  tan: '#c68b59', camel: '#c19a6b', brown: '#8b5e3c', coklat: '#8b5e3c', chocolate: '#5b3a29',
  navy: '#1f2a44', blue: '#0a84ff', biru: '#2b6cb0', 'light blue': '#7fb3e8', sky: '#87ceeb',
  denim: '#3b5998', teal: '#2c7a7b', mint: '#a8e6cf', green: '#34c759', hijau: '#2f855a',
  olive: '#6b7f3a', army: '#4b5320', sage: '#9caf88', grey: '#8e8e93', gray: '#8e8e93',
  abu: '#8e8e93', 'light grey': '#c7c7cc', silver: '#d1d1d6', charcoal: '#36454f',
  red: '#ff3b30', merah: '#e63946', maroon: '#6b1d21', burgundy: '#6d1a2c', wine: '#722f37',
  pink: '#ff9fbf', 'light pink': '#fadadd', rose: '#f43f5e', purple: '#af52de', ungu: '#7b5ea7',
  lavender: '#c4b5fd', violet: '#7c3aed', yellow: '#ffd60a', kuning: '#f6c445', mustard: '#d4a017',
  orange: '#ff9500', peach: '#ffcdb2', coral: '#ff7f50'
};
const PRINTED_COLORS = ['multi', 'print', 'graphic', 'stripe', 'stripes', 'pattern', 'tie dye', 'tiedye', 'floral'];

function colorSwatchCss(name) {
  const key = String(name || '').trim().toLowerCase();
  if (PRINTED_COLORS.includes(key)) return 'background: conic-gradient(from 210deg, #ff9f0a, #ff375f, #bf5af2, #0a84ff, #30d158, #ff9f0a);';
  if (COLOR_HEX[key]) return 'background: ' + COLOR_HEX[key] + ';';
  return '';
}
function colorInitials(name) {
  const s = String(name || '').trim();
  if (!s) return '?';
  return s.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', 'XXL', '3XL', 'XXXL', '4XL', '5XL', 'ALL SIZE', 'ONE SIZE', 'FREE SIZE', 'OS', 'ALL'];
function sizeRank(size) {
  const s = String(size || '').trim().toUpperCase();
  const i = SIZE_ORDER.indexOf(s);
  if (i >= 0) return i;
  const n = parseFloat(s);
  if (!isNaN(n) && String(n) === s.replace(/[^\d.]/g, '')) return 100 + n;
  return 500;
}
function sortSizes(list) {
  return list.slice().sort((a, b) => sizeRank(a) - sizeRank(b) || String(a).localeCompare(String(b)));
}
function nextSize(size) {
  const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const i = order.indexOf(String(size || '').trim().toUpperCase());
  if (i >= 0 && i < order.length - 1) return order[i + 1];
  return '';
}

const PAYMENTS = {
  cash: { label: 'Cash', sub: 'With change', icon: 'i-cash' },
  qris: { label: 'QRIS', sub: 'Scan & pay', icon: 'i-qr' },
  transfer: { label: 'Transfer', sub: 'Bank transfer', icon: 'i-transfer' },
  card: { label: 'Card', sub: 'Debit / credit', icon: 'i-card' }
};
function payLabel(method) {
  return (PAYMENTS[method] || { label: method || 'Payment' }).label;
}

function defaultDB() {
  return {
    v: 1,
    onboarded: false,
    counter: 1,
    brand: {
      name: BRAND_NAME,
      tagline: 'Extrait de Parfum',
      footer: 'Terima kasih sudah berbelanja!\nThank you for your purchase',
      wa: '',
      ig: '',
      bankName: '',
      bankAccount: '',
      bankHolder: ''
    },
    qris: null,
    prefs: {
      promo: true,
      allowNegativeStock: false,
      lowStock: 2,
      paperWidth: 58,
      theme: 'system'
    },
    lock: { enabled: false, hash: '', salt: '', len: 4 },
    sync: {
      url: SYNC_DEFAULTS.url,
      key: SYNC_DEFAULTS.key,
      booth: '',
      device: 1,
      lastSync: 0,
      lastPull: '',
      lastError: ''
    },
    products: [],
    sales: [],
    seeded: false
  };
}

let db = defaultDB();
let cart = [];
let activeTab = 'sell';
let activeCategory = 'all';
let searchQuery = '';
let reportDay = dayKey(Date.now());
const screenScroll = {};

function save(immediate) {
  if (save.timer) { clearTimeout(save.timer); save.timer = null; }
  const write = () => {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch (e) {
      toast('Storage is full. Export a backup and remove some photos.', { icon: 'i-warn', error: true });
    }
  };
  if (immediate) write();
  else save.timer = setTimeout(write, 300);
}

function load() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return false;
    db = Object.assign(defaultDB(), parsed);
    db.brand = Object.assign(defaultDB().brand, parsed.brand || {});
    db.prefs = Object.assign(defaultDB().prefs, parsed.prefs || {});
    db.products = Array.isArray(parsed.products) ? parsed.products : [];
    db.sales = Array.isArray(parsed.sales) ? parsed.sales : [];
    return true;
  } catch (e) {
    return false;
  }
}

function toast(message, opts) {
  const o = opts || {};
  const node = document.createElement('div');
  node.className = 'toast' + (o.error ? ' is-error' : '');
  node.innerHTML = (o.icon ? '<svg class="ico"><use href="#' + o.icon + '"/></svg>' : '') + '<span>' + esc(message) + '</span>';
  $('#toast-root').appendChild(node);
  requestAnimationFrame(() => requestAnimationFrame(() => node.classList.add('is-in')));
  setTimeout(() => {
    node.classList.remove('is-in');
    setTimeout(() => node.remove(), 350);
  }, o.duration || 2100);
}

function dialog(opts) {
  return new Promise((resolve) => {
    const scrim = document.createElement('div');
    scrim.className = 'dialog-scrim';
    scrim.innerHTML =
      '<div class="dialog" role="alertdialog" aria-modal="true">' +
      '<div class="dialog-content"><h3>' + esc(opts.title) + '</h3>' +
      (opts.message ? '<p>' + esc(opts.message) + '</p>' : '') +
      '</div><div class="dialog-actions">' +
      (opts.cancel !== false ? '<button type="button" data-act="cancel">' + esc(opts.cancelLabel || 'Cancel') + '</button>' : '') +
      '<button type="button" data-act="ok" class="' + (opts.destructive ? 'is-destructive ' : '') + 'is-strong">' + esc(opts.okLabel || 'OK') + '</button>' +
      '</div></div>';
    document.body.appendChild(scrim);
    requestAnimationFrame(() => scrim.classList.add('is-in'));
    const finish = (val) => {
      scrim.classList.remove('is-in');
      setTimeout(() => scrim.remove(), 220);
      resolve(val);
    };
    scrim.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) { if (e.target === scrim) finish(false); return; }
      haptic(6);
      finish(btn.dataset.act === 'ok');
    });
  });
}

const layerStack = [];

function pushLayer(rec) {
  layerStack.push(rec);
  try { history.pushState({ lid: rec.id }, ''); } catch (e) {}
}
function requestClose(rec) {
  const top = layerStack[layerStack.length - 1];
  if (top === rec && history.state && history.state.lid === rec.id) {
    history.back();
  } else {
    finalizeLayer(rec);
  }
}
function finalizeLayer(rec) {
  const i = layerStack.indexOf(rec);
  if (i >= 0) layerStack.splice(i, 1);
  rec.destroy();
}
window.addEventListener('popstate', () => {
  const top = layerStack[layerStack.length - 1];
  if (top) finalizeLayer(top);
});

function openSheet(opts) {
  const rec = { id: uid('layer'), destroy: null };
  const scrim = document.createElement('div');
  scrim.className = 'sheet-scrim';
  const sheet = document.createElement('div');
  sheet.className = 'sheet' + (opts.full ? ' is-full' : '');
  sheet.innerHTML =
    '<div class="sheet-grabber"><span></span></div>' +
    (opts.title !== null
      ? '<div class="sheet-head"><div><div class="sheet-title">' + esc(opts.title || '') + '</div>' +
        (opts.sub ? '<div class="sheet-sub">' + esc(opts.sub) + '</div>' : '') +
        '</div><button class="sheet-close" type="button" aria-label="Close"><svg class="ico"><use href="#i-x"/></svg></button></div>'
      : '') +
    '<div class="sheet-body"></div>' +
    (opts.footer ? '<div class="sheet-foot"></div>' : '');
  const body = $('.sheet-body', sheet);
  if (typeof opts.body === 'string') body.innerHTML = opts.body;
  else if (opts.body) body.appendChild(opts.body);
  if (opts.footer) $('.sheet-foot', sheet).appendChild(opts.footer);
  $('#sheet-root').appendChild(scrim);
  $('#sheet-root').appendChild(sheet);

  let closed = false;
  const destroy = () => {
    if (closed) return;
    closed = true;
    sheet.classList.remove('is-in');
    scrim.classList.remove('is-in');
    setTimeout(() => { sheet.remove(); scrim.remove(); }, 420);
    if (opts.onClose) opts.onClose();
  };
  rec.destroy = destroy;

  requestAnimationFrame(() => requestAnimationFrame(() => {
    sheet.classList.add('is-in');
    scrim.classList.add('is-in');
  }));

  const closeBtn = $('.sheet-close', sheet);
  if (closeBtn) closeBtn.addEventListener('click', () => { haptic(6); requestClose(rec); });
  scrim.addEventListener('click', () => { haptic(6); requestClose(rec); });

  const grabber = $('.sheet-grabber', sheet);
  let startY = 0;
  let dy = 0;
  let dragging = false;
  let startTime = 0;
  grabber.addEventListener('pointerdown', (e) => {
    dragging = true;
    startY = e.clientY;
    dy = 0;
    startTime = Date.now();
    sheet.classList.add('is-dragging');
    grabber.setPointerCapture(e.pointerId);
  });
  const dragBase = () => (window.matchMedia('(min-width: 700px)').matches ? 'translateX(-50%) ' : '');
  grabber.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dy = Math.max(0, e.clientY - startY);
    sheet.style.transform = dragBase() + 'translateY(' + dy + 'px)';
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    sheet.classList.remove('is-dragging');
    sheet.style.transform = '';
    const velocity = dy / Math.max(1, Date.now() - startTime);
    if (dy > 110 || velocity > 0.65) requestClose(rec);
  };
  grabber.addEventListener('pointerup', endDrag);
  grabber.addEventListener('pointercancel', endDrag);

  pushLayer(rec);
  return {
    el: sheet,
    body,
    footer: opts.footer ? $('.sheet-foot', sheet) : null,
    close: () => requestClose(rec),
    destroyNow: destroy
  };
}

function openTextSheet(title, value, opts) {
  const o = opts || {};
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.innerHTML =
      '<div class="list"><div class="row">' +
      (o.multiline
        ? '<textarea id="ts-val" rows="4" style="width:100%;border:0;outline:none;background:transparent;font-size:17px;resize:none;padding:0" placeholder="' + esc(o.placeholder || '') + '">' + esc(value || '') + '</textarea>'
        : '<input id="ts-val" class="text-input" style="text-align:left" type="' + (o.type || 'text') + '" inputmode="' + (o.inputmode || 'text') + '" placeholder="' + esc(o.placeholder || '') + '" value="' + esc(value || '') + '">') +
      '</div></div>' + (o.hint ? '<div class="list-title" style="padding:8px 4px 0">' + esc(o.hint) + '</div>' : '');
    const footer = document.createElement('button');
    footer.type = 'button';
    footer.className = 'btn btn-primary btn-xl';
    footer.textContent = 'Save';
    const sheet = openSheet({ title: title, sub: o.sub, body: wrap, footer: footer });
    const input = $('#ts-val', sheet.el);
    const save = () => {
      resolve(input.value.trim());
      sheet.close();
    };
    footer.addEventListener('click', save);
    if (o.multiline) input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save(); });
    else input.addEventListener('keydown', (e) => { if (e.key === 'Enter') save(); });
    setTimeout(() => { try { input.focus({ preventScroll: true }); } catch (e) {} }, 420);
    sheet.el.addEventListener('transitionend', () => {}, { once: true });
  });
}

function keypad(callbacks) {
  const wrap = document.createElement('div');
  wrap.className = 'keypad';
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'del'];
  keys.forEach((k) => {
    const b = document.createElement('button');
    b.type = 'button';
    if (k === 'del') {
      b.className = 'util';
      b.innerHTML = '<svg class="ico"><use href="#i-del"/></svg>';
      b.setAttribute('aria-label', 'Delete');
    } else {
      b.textContent = k === '000' ? '000' : k;
      if (k === '000') b.className = 'util';
    }
    b.addEventListener('click', () => {
      haptic(8);
      if (k === 'del') callbacks.onDelete();
      else callbacks.onKey(k);
    });
    wrap.appendChild(b);
  });
  return wrap;
}

function openAmountSheet(title, sub, initial, opts) {
  const o = opts || {};
  return new Promise((resolve) => {
    let value = Math.max(0, Math.round(initial || 0));
    let unit = o.unit || 'rp';
    const body = document.createElement('div');
    const display = document.createElement('div');
    display.className = 'list';
    display.innerHTML = '<div class="row"><div class="row-main"><div class="row-sub">' + esc(o.label || 'Amount') + '</div>' +
      '<div class="row-value strong" style="font-size:32px;letter-spacing:-0.03em" data-role="amt"></div></div></div>';
    body.appendChild(display);
    const update = () => {
      $('[data-role="amt"]', display).textContent = unit === 'pct' ? value + '%' : rp(value);
    };
    if (o.allowPercent) {
      const seg = document.createElement('div');
      seg.className = 'segmented';
      seg.style.marginTop = '16px';
      seg.innerHTML = '<span class="seg-ind"></span><button type="button" data-v="rp">Rp</button><button type="button" data-v="pct">%</button>';
      segmented(seg, unit, (v) => { unit = v; update(); });
      body.appendChild(seg);
    }
    const kpad = keypad({
      onKey: (k) => { value = digitsToNumber(String(value) + k); update(); },
      onDelete: () => { value = Math.floor(value / 10); update(); }
    });
    kpad.style.marginTop = '16px';
    body.appendChild(kpad);
    const footer = document.createElement('button');
    footer.type = 'button';
    footer.className = 'btn btn-primary btn-xl';
    footer.textContent = 'Set';
    const sheet = openSheet({ title: title, sub: sub, body: body, footer: footer });
    update();
    footer.addEventListener('click', () => { resolve({ value: value, unit: unit }); sheet.close(); });
  });
}

function segmented(root, value, onChange) {
  const buttons = $$('button', root);
  root.style.setProperty('--seg-count', buttons.length);
  const api = {
    set(v) {
      const i = Math.max(0, buttons.findIndex((b) => b.dataset.v === v));
      root.style.setProperty('--seg-index', i);
      buttons.forEach((b) => b.classList.toggle('is-active', b.dataset.v === v));
      value = v;
    },
    value() { return value; }
  };
  api.set(value);
  buttons.forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.v === value) return;
    haptic(6);
    api.set(b.dataset.v);
    if (onChange) onChange(b.dataset.v);
  }));
  return api;
}

function toggleRow(label, checked, onChange, sub) {
  const row = document.createElement('div');
  row.className = 'row';
  row.innerHTML = '<div class="row-main"><div class="row-title">' + esc(label) + '</div>' + (sub ? '<div class="row-sub">' + esc(sub) + '</div>' : '') + '</div>' +
    '<label class="switch"><input type="checkbox"' + (checked ? ' checked' : '') + '><span class="track"></span></label>';
  $('input', row).addEventListener('change', (e) => onChange(e.target.checked));
  return row;
}

function stepperRow(label, value, min, max, onChange, sub) {
  const row = document.createElement('div');
  row.className = 'row';
  row.innerHTML = '<div class="row-main"><div class="row-title">' + esc(label) + '</div>' + (sub ? '<div class="row-sub">' + esc(sub) + '</div>' : '') + '</div>' +
    '<div class="stepper"><button type="button" data-d="-1" aria-label="Decrease"><svg class="ico"><use href="#i-minus"/></svg></button>' +
    '<span class="val">' + value + '</span>' +
    '<button type="button" data-d="1" aria-label="Increase"><svg class="ico"><use href="#i-plus"/></svg></button></div>';
  const val = $('.val', row);
  $$('button', row).forEach((b) => b.addEventListener('click', () => {
    let v = clamp(Number(val.textContent) + Number(b.dataset.d), min, max);
    haptic(6);
    val.textContent = v;
    onChange(v);
  }));
  return row;
}

function getProduct(id) {
  return db.products.find((p) => p.id === id);
}
function variantOf(p, color, size) {
  return p.variants.find((v) => (v.color || '') === (color || '') && (v.size || '') === (size || ''));
}
function productStock(p) {
  return productAvailable(p);
}
function productColors(p) {
  const seen = [];
  p.variants.forEach((v) => { const c = v.color || ''; if (!seen.includes(c)) seen.push(c); });
  return seen;
}
function productSizes(p, color) {
  const list = p.variants.filter((v) => (color === undefined ? true : (v.color || '') === (color || ''))).map((v) => v.size || '');
  return sortSizes(Array.from(new Set(list)));
}
function cartQtyForVariant(pid, color, size, exceptIndex) {
  return cart.reduce((s, l, i) => (i === exceptIndex ? s : (l.pid === pid && l.color === color && l.size === size ? s + l.qty : s)), 0);
}
function lineGross(l) {
  return l.price * l.qty;
}
function lineDiscount(l) {
  if (!l.disc) return 0;
  return l.disc.type === 'pct' ? Math.round(lineGross(l) * clamp(l.disc.value, 0, 100) / 100) : Math.min(lineGross(l), l.disc.value || 0);
}
function lineTotal(l) {
  return Math.max(0, lineGross(l) - lineDiscount(l));
}
function promoOn() {
  return db.prefs.promo !== false;
}
function promoEligibleCount() {
  return cart.reduce((s, l) => s + (l.size === PROMO.size ? l.qty : 0), 0);
}
// Per cart line: how many units are free and what they're worth. Cheapest bottles go free first.
function cartPromo() {
  const lines = cart.map(() => ({ free: 0, amount: 0 }));
  if (!promoOn()) return lines;
  const units = [];
  cart.forEach((l, i) => {
    if (l.size !== PROMO.size || !l.qty) return;
    const unit = Math.round(lineTotal(l) / l.qty);
    for (let k = 0; k < l.qty; k++) units.push({ i: i, unit: unit });
  });
  const freeCount = Math.floor(units.length / (PROMO.buy + PROMO.free)) * PROMO.free;
  units.sort((a, b) => a.unit - b.unit).slice(0, freeCount).forEach((u) => {
    lines[u.i].free += 1;
    lines[u.i].amount += u.unit;
  });
  return lines;
}
function promoDiscountValue() {
  return cartPromo().reduce((s, x) => s + x.amount, 0);
}
function cartSubtotal() {
  return cart.reduce((s, l) => s + lineGross(l), 0);
}
function cartItemDiscounts() {
  return cart.reduce((s, l) => s + lineDiscount(l), 0);
}
function orderDiscountValue() {
  if (!cart.discount) return 0;
  const base = cartSubtotal() - cartItemDiscounts() - promoDiscountValue();
  return cart.discount.type === 'pct' ? Math.round(base * clamp(cart.discount.value, 0, 100) / 100) : Math.min(base, cart.discount.value || 0);
}
function cartTotal() {
  return Math.max(0, cartSubtotal() - cartItemDiscounts() - promoDiscountValue() - orderDiscountValue());
}
function cartCount() {
  return cart.reduce((s, l) => s + l.qty, 0);
}

function addToCart(pid, color, size, qty) {
  const existing = cart.find((l) => l.pid === pid && l.color === color && l.size === size);
  if (existing) {
    existing.qty += qty;
  } else {
    const p = getProduct(pid);
    if (!p) return;
    const v = variantOf(p, color, size);
    cart.push({ pid: pid, name: p.name, price: variantPrice(p, v), color: color, size: size, qty: qty, disc: null });
  }
  haptic(12);
  save();
  renderCart();
  renderTabBadge();
}

function switchTab(name) {
  const current = $('#screen-' + activeTab);
  if (current) screenScroll[activeTab] = current.scrollTop;
  activeTab = name;
  $$('.screen').forEach((s) => {
    const on = s.dataset.tab === name;
    s.hidden = !on;
    if (on) {
      const target = screenScroll[name] || 0;
      requestAnimationFrame(() => { s.scrollTop = target; });
    }
  });
  $$('#tabbar .tab').forEach((b) => b.classList.toggle('is-active', b.dataset.tab === name));
  if (name === 'reports') renderReports();
  if (name === 'settings') renderSettings();
  if (name === 'cart') renderCart();
  updateCartbar();
  haptic(6);
}

function updateCartbar() {
  const bar = $('#cartbar');
  const n = cartCount();
  const show = n > 0 && activeTab === 'sell';
  $('#screen-sell').classList.toggle('has-cartbar', show);
  if (show) {
    $('#cartbar-count').textContent = n;
    $('#cartbar-total').textContent = rp(cartTotal());
    if (bar.hidden) {
      bar.hidden = false;
      bar.classList.remove('is-hiding');
      requestAnimationFrame(() => requestAnimationFrame(() => bar.classList.remove('is-hiding')));
    }
    bar.classList.remove('is-hiding');
  } else if (!bar.hidden) {
    bar.classList.add('is-hiding');
    setTimeout(() => { if (cartCount() === 0 || activeTab !== 'sell') bar.hidden = true; }, 380);
  }
}

function renderTabBadge() {
  const n = cartCount();
  const badge = $('#tab-badge');
  badge.hidden = n === 0;
  badge.textContent = n > 99 ? '99+' : n;
}

function initHeaders() {
  $$('.screen').forEach((s) => {
    const header = $('.screen-header', s);
    let ticking = false;
    let condensed = false;
    s.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = s.scrollTop;
        if (!condensed && y > 64) condensed = true;
        else if (condensed && y < 20) condensed = false;
        header.classList.toggle('is-condensed', condensed);
        header.classList.toggle('is-scrolled', y > 2);
        ticking = false;
      });
    }, { passive: true });
  });
}

function imgFallback(el, initials) {
  el.style.display = 'none';
  const parent = el.parentNode;
  if (parent && !parent.querySelector('.p-initials')) {
    const span = document.createElement('span');
    span.className = 'p-initials';
    span.textContent = initials;
    parent.appendChild(span);
  }
}

function categories() {
  const set = [];
  db.products.forEach((p) => {
    const c = (p.category || '').trim() || 'Uncategorized';
    if (!set.includes(c)) set.push(c);
  });
  return set.sort((a, b) => a.localeCompare(b));
}

function renderChips() {
  const wrap = $('#category-chips');
  const cats = categories();
  if (activeCategory !== 'all' && !cats.includes(activeCategory)) activeCategory = 'all';
  if (cats.length < 2) { wrap.innerHTML = ''; wrap.hidden = true; return; }
  wrap.hidden = false;
  const items = [{ id: 'all', label: 'All', count: db.products.length }].concat(
    cats.map((c) => ({ id: c, label: c, count: db.products.filter((p) => ((p.category || '').trim() || 'Uncategorized') === c).length }))
  );
  wrap.innerHTML = items.map((c) =>
    '<button type="button" class="chip' + (activeCategory === c.id ? ' is-active' : '') + '" data-cat="' + esc(c.id) + '">' + esc(c.label) + ' <span class="count">' + c.count + '</span></button>'
  ).join('');
  $$('button', wrap).forEach((b) => b.addEventListener('click', () => {
    activeCategory = b.dataset.cat;
    haptic(6);
    renderChips();
    renderGrid();
  }));
}

function filteredProducts() {
  const q = searchQuery.trim().toLowerCase();
  return db.products.filter((p) => {
    const cat = (p.category || '').trim() || 'Uncategorized';
    if (activeCategory !== 'all' && cat !== activeCategory) return false;
    if (!q) return true;
    const hay = (p.name + ' ' + cat + ' ' + p.variants.map((v) => (v.color || '') + ' ' + (v.size || '')).join(' ')).toLowerCase();
    return hay.includes(q);
  });
}

function thumbHtml(p, extraClass) {
  const cls = extraClass || 'p-thumb';
  if (p.image) {
    const initials = colorInitials(p.name).replace(/['"]/g, '');
    return '<div class="' + cls + '"><img src="' + p.image + '" alt="" loading="lazy" onerror="imgFallback(this, &quot;' + initials + '&quot;)"></div>';
  }
  return '<div class="' + cls + '"><span class="p-initials">' + esc(colorInitials(p.name)) + '</span></div>';
}

function renderGrid() {
  const grid = $('#product-grid');
  const list = filteredProducts();
  const empty = $('#sell-empty');
  if (!db.products.length) {
    grid.innerHTML = '';
    grid.hidden = true;
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  grid.hidden = false;
  if (!list.length) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><h3>No matches</h3><p>Try another search or category.</p></div>';
    return;
  }
  grid.innerHTML = list.map((p) => {
    const stock = productStock(p);
    const low = stock > 0 && stock <= (db.prefs.lowStock || 0);
    const out = stock <= 0;
    const tags = [];
    if (out) tags.push('<span class="p-tag low">Out</span>');
    else if (low) tags.push('<span class="p-tag low">Low</span>');
    return '<button type="button" class="p-card' + (out ? ' is-out' : '') + '" data-pid="' + p.id + '">' +
      thumbHtml(p) +
      (tags.length ? '<div class="p-tags">' + tags.join('') + '</div>' : '') +
      '<div class="p-meta"><div class="p-name">' + esc(p.name) + '</div>' +
      '<div class="p-price num">' + priceLabel(p) + '</div>' +
      '<div class="p-stock' + (out ? ' out' : low ? ' low' : '') + '">' + (out ? '<svg class="ico"><use href="#i-warn"/></svg> No stock' : stock + ' in stock') + '</div>' +
      '</div></button>';
  }).join('');
  $$('.p-card', grid).forEach((card) => card.addEventListener('click', () => openVariantSheet(card.dataset.pid)));
}

function openVariantSheet(pid) {
  const p = getProduct(pid);
  if (!p) return;
  const colors = productColors(p);
  const colorUsable = (c) => p.variants.some((v) => (v.color || '') === c && (availableStock(p, v) > 0 || db.prefs.allowNegativeStock));
  let color = colors.find(colorUsable) || (colors.length ? colors[0] : null);
  let size = null;
  let qty = 1;
  const wrap = document.createElement('div');

  const render = () => {
    const available = p.variants.filter((v) => !color || (v.color || '') === color);
    const sizes = sortSizes(Array.from(new Set(available.map((v) => v.size || ''))));
    const usable = (s) => {
      const vv = variantOf(p, color, s);
      return !!vv && (availableStock(p, vv) > 0 || db.prefs.allowNegativeStock);
    };
    if (!size || !sizes.includes(size) || (!usable(size) && sizes.some(usable))) {
      size = sizes.find(usable) || (sizes.length ? sizes[0] : null);
    }
    const v = color !== null && size !== null ? variantOf(p, color, size) : null;
    const stock = v ? availableStock(p, v) : 0;
    const inCart = color !== null && size !== null ? cartQtyForVariant(p.id, color, size) : 0;
    const maxQty = db.prefs.allowNegativeStock ? 999 : Math.max(0, stock - inCart);
    if (qty > maxQty) qty = Math.max(1, maxQty);
    const canAdd = !!(v && (db.prefs.allowNegativeStock ? true : maxQty > 0));
    const lineTotal = variantPrice(p, v) * (canAdd ? qty : 0);

    const sheetPhoto = productImageFor(p, color);
    wrap.innerHTML =
      (sheetPhoto ? '<div class="variant-photo"><img src="' + sheetPhoto + '" alt=""></div>' : '') +
      (colors.length > 1
        ? '<div><div class="list-title">Color' + (color ? ' · ' + esc(color) : '') + '</div><div class="list"><div class="row" style="flex-wrap:wrap"><div class="swatch-row" data-role="colors"></div></div></div></div>'
        : '') +
      '<div><div class="list-title">Size' + (size ? ' · ' + esc(size) : '') + '</div><div class="list"><div class="row"><div class="size-grid" data-role="sizes" style="width:100%"></div></div></div></div>' +
      '<div class="list"><div class="row" style="justify-content:space-between">' +
      '<div class="row-main"><div class="row-sub">' + (v ? (db.prefs.allowNegativeStock ? 'Stock ' + stock : inCart ? stock + ' in stock · ' + inCart + ' in cart' : stock + ' in stock') : 'Choose options') + '</div>' +
      '<div class="row-title" style="font-size:15px" data-role="stocknote"></div></div>' +
      '<div class="stepper big"><button type="button" data-d="-1" aria-label="Decrease"><svg class="ico"><use href="#i-minus"/></svg></button><span class="val">' + qty + '</span><button type="button" data-d="1" aria-label="Increase"><svg class="ico"><use href="#i-plus"/></svg></button></div>' +
      '</div></div>' +
      '<div class="banner warn" data-role="soldout"' + (canAdd ? ' hidden' : '') + '><svg class="ico"><use href="#i-warn"/></svg><div><strong>Not enough stock.</strong> Enable "Sell below zero stock" in Settings to sell anyway.</div></div>';

    if (colors.length > 1) {
      const cwrap = $('[data-role="colors"]', wrap);
      colors.forEach((c) => {
        const anyStock = p.variants.some((vv) => (vv.color || '') === c && ((vv.stock > 0) || db.prefs.allowNegativeStock));
        const sw = document.createElement('button');
        sw.type = 'button';
        sw.className = 'swatch' + (color === c ? ' is-active' : '') + (anyStock ? '' : ' is-disabled');
        const css = colorSwatchCss(c);
        sw.innerHTML = css ? '<span class="swatch-dot" style="' + css + '"></span>' : esc(colorInitials(c));
        sw.setAttribute('aria-label', c || 'Default');
        sw.addEventListener('click', () => {
          haptic(8);
          color = c;
          size = null;
          qty = 1;
          render();
        });
        cwrap.appendChild(sw);
      });
    }

    const swrap = $('[data-role="sizes"]', wrap);
    const allSizes = sortSizes(Array.from(new Set(p.variants.map((vv) => vv.size || ''))));
    (allSizes.length ? allSizes : ['']).forEach((s) => {
      const vv = variantOf(p, color, s);
      const ok = !!vv && (availableStock(p, vv) > 0 || db.prefs.allowNegativeStock);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'size-btn' + (size === s ? ' is-active' : '') + (ok ? '' : ' is-disabled');
      b.textContent = s || 'One size';
      b.addEventListener('click', () => {
        haptic(8);
        size = s;
        qty = 1;
        render();
      });
      swrap.appendChild(b);
    });

    const note = $('[data-role="stocknote"]', wrap);
    if (v) {
      if (!db.prefs.allowNegativeStock && stock <= 0) note.innerHTML = '<span style="color:var(--red)">Out of stock</span>';
      else if (!db.prefs.allowNegativeStock && stock - inCart <= 0) note.innerHTML = '<span style="color:var(--red)">All ' + stock + ' already in cart</span>';
      else if (stock <= (db.prefs.lowStock || 0)) note.innerHTML = '<span style="color:var(--orange)">Only ' + stock + ' left</span>';
      else note.innerHTML = '<span style="color:var(--label-2)">Ready to sell</span>';
    } else note.textContent = 'Pick a size';

    $$('.stepper button', wrap).forEach((b) => {
      b.disabled = !canAdd;
      b.addEventListener('click', () => {
        qty = clamp(qty + Number(b.dataset.d), 1, db.prefs.allowNegativeStock ? 999 : Math.max(1, maxQty));
        haptic(8);
        render();
      });
    });

    const addBtn = $('[data-role="add"]', sheet.el);
    addBtn.disabled = !canAdd;
    addBtn.textContent = canAdd ? 'Add to cart · ' + rp(lineTotal) : 'Unavailable';
  };

  const footer = document.createElement('div');
  footer.style.display = 'flex';
  footer.style.gap = '10px';
  footer.style.width = '100%';
  footer.innerHTML = '<button type="button" class="btn btn-primary btn-xl" data-role="add">Add to cart</button>';
  const sheet = openSheet({ title: p.name, sub: priceLabel(p) + (p.category ? ' · ' + p.category : ''), body: wrap, footer: footer });
  render();
  $('[data-role="add"]', sheet.el).addEventListener('click', () => {
    if (!color && colors.length > 1) return;
    addToCart(p.id, color || '', size === null ? '' : size, qty);
    const label = [p.name, color, size].filter(Boolean).join(' · ');
    toast(label + ' added', { icon: 'i-check' });
    sheet.close();
  });
}

function renderCart() {
  const empty = $('#cart-empty');
  const content = $('#cart-content');
  const cta = $('#cart-cta');
  const n = cartCount();
  $('#cart-clear').hidden = n === 0;
  if (!n) {
    empty.hidden = false;
    content.hidden = true;
    cta.hidden = true;
    renderTabBadge();
    updateCartbar();
    return;
  }
  empty.hidden = true;
  content.hidden = false;
  cta.hidden = false;

  const promo = cartPromo();
  $('#cart-list').innerHTML = cart.map((l, i) => {
    const p = getProduct(l.pid);
    const variant = [l.color, l.size].filter(Boolean).join(' / ');
    const disc = lineDiscount(l);
    return '<div class="row line-item tappable" data-idx="' + i + '">' +
      (p ? thumbHtml(p, 'li-thumb') : '<div class="li-thumb">' + esc(colorInitials(l.name)) + '</div>') +
      '<div class="row-main"><div class="row-title" style="font-size:16px">' + esc(l.name) + '</div>' +
      (variant ? '<div class="row-sub">' + esc(variant) + '</div>' : '') +
      '<div class="li-price num">' + rp(l.price) + ' × ' + l.qty + (disc ? ' <span class="li-disc">−' + rp(disc) + '</span>' : '') +
      (promo[i].free ? ' <span class="li-disc" style="color:var(--green)">' + promo[i].free + ' free</span>' : '') + '</div></div>' +
      '<div class="li-right"><div class="li-total num">' + rp(lineTotal(l) - promo[i].amount) + '</div>' +
      '<div class="stepper"><button type="button" data-step="-1" aria-label="Decrease"><svg class="ico"><use href="#i-minus"/></svg></button><span class="val">' + l.qty + '</span><button type="button" data-step="1" aria-label="Increase"><svg class="ico"><use href="#i-plus"/></svg></button></div></div>' +
      '</div>';
  }).join('');

  $$('#cart-list .line-item').forEach((row) => {
    const idx = Number(row.dataset.idx);
    row.addEventListener('click', (e) => {
      const stepBtn = e.target.closest('[data-step]');
      if (stepBtn) {
        e.stopPropagation();
        const d = Number(stepBtn.dataset.step);
        const l = cart[idx];
        const next = l.qty + d;
        if (next <= 0) { removeFromCart(idx, true); return; }
        const p = getProduct(l.pid);
        const v = p ? variantOf(p, l.color, l.size) : null;
        if (d > 0 && !db.prefs.allowNegativeStock && v) {
          const avail = availableStock(p, v) - cartQtyForVariant(l.pid, l.color, l.size, idx);
          if (avail <= 0) { toast('Only ' + Math.max(0, availableStock(p, v)) + ' in stock', { icon: 'i-warn', error: true }); return; }
        }
        l.qty = next;
        haptic(8);
        save();
        renderCart();
        renderTabBadge();
        updateCartbar();
        return;
      }
      openCartItemSheet(idx);
    });
  });

  const od = orderDiscountValue();
  const promoAmt = promo.reduce((s, x) => s + x.amount, 0);
  const promoFree = promo.reduce((s, x) => s + x.free, 0);
  const promoNext = promoOn() && promoEligibleCount() % (PROMO.buy + PROMO.free) === PROMO.buy;
  $('#cart-discount-row').innerHTML = '<button type="button" class="row tappable" id="discount-row-btn">' +
    '<div class="row-icon"><svg class="ico"><use href="#i-tag"/></svg></div>' +
    '<div class="row-main"><div class="row-title">Order discount</div>' +
    '<div class="row-sub">' + (cart.discount ? (cart.discount.type === 'pct' ? cart.discount.value + '% off' : rp(cart.discount.value) + ' off') : 'Add a discount') + '</div></div>' +
    '<div class="row-value' + (od ? ' strong' : '') + '">' + (od ? '−' + rp(od) : '') + '</div>' +
    '<span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></button>';
  $('#discount-row-btn').addEventListener('click', openOrderDiscountSheet);

  $('#cart-summary').innerHTML =
    '<div class="row"><div class="row-main"><div class="row-title">Subtotal</div></div><div class="row-value num">' + rp(cartSubtotal()) + '</div></div>' +
    (cartItemDiscounts() ? '<div class="row"><div class="row-main"><div class="row-title">Item discounts</div></div><div class="row-value num" style="color:var(--red)">−' + rp(cartItemDiscounts()) + '</div></div>' : '') +
    (promoAmt ? '<div class="row"><div class="row-main"><div class="row-title">' + PROMO.label + '</div><div class="row-sub">' + PROMO.size + ' · ' + promoFree + ' free</div></div><div class="row-value num" style="color:var(--green)">−' + rp(promoAmt) + '</div></div>' : '') +
    (promoNext ? '<div class="row"><div class="row-main"><div class="row-title" style="color:var(--green)">Add 1 more ' + PROMO.size + ', it\'s free</div><div class="row-sub">' + PROMO.label + '</div></div></div>' : '') +
    (od ?'<div class="row"><div class="row-main"><div class="row-title">Order discount</div></div><div class="row-value num" style="color:var(--red)">−' + rp(od) + '</div></div>' : '') +
    '<div class="row"><div class="row-main"><div class="row-title" style="font-weight:700;font-size:19px">Total</div></div><div class="row-value strong num" style="font-size:22px;letter-spacing:-0.02em">' + rp(cartTotal()) + '</div></div>';

  $('#checkout-btn').textContent = 'Checkout · ' + rp(cartTotal());
  renderTabBadge();
  updateCartbar();
}

function removeFromCart(idx, confirmFirst) {
  const l = cart[idx];
  const doRemove = () => {
    cart.splice(idx, 1);
    haptic(14);
    save();
    renderCart();
    renderTabBadge();
    updateCartbar();
  };
  if (!confirmFirst) { doRemove(); return; }
  dialog({ title: 'Remove item?', message: l.name + ' will be removed from the cart.', okLabel: 'Remove', destructive: true }).then((ok) => { if (ok) doRemove(); });
}

function openCartItemSheet(idx) {
  const l = cart[idx];
  if (!l) return;
  const wrap = document.createElement('div');
  const render = () => {
    const disc = lineDiscount(l);
    wrap.innerHTML =
      '<div class="list">' +
      '<div class="row"><div class="row-main"><div class="row-sub">Unit price</div><div class="row-title num">' + rp(l.price) + '</div></div>' +
      '<div class="stepper big"><button type="button" data-d="-1" aria-label="Decrease"><svg class="ico"><use href="#i-minus"/></svg></button><span class="val">' + l.qty + '</span><button type="button" data-d="1" aria-label="Increase"><svg class="ico"><use href="#i-plus"/></svg></button></div></div>' +
      '<div class="row tappable" data-role="disc"><div class="row-icon"><svg class="ico"><use href="#i-tag"/></svg></div><div class="row-main"><div class="row-title">Item discount</div>' +
      '<div class="row-sub">' + (l.disc ? (l.disc.type === 'pct' ? l.disc.value + '%' : rp(l.disc.value)) : 'None') + '</div></div>' +
      '<div class="row-value' + (disc ? ' strong' : '') + '">' + (disc ? '−' + rp(disc) : '') + '</div><span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></div>' +
      '<div class="row"><div class="row-main"><div class="row-title" style="font-weight:700">Line total</div></div><div class="row-value strong num">' + rp(lineTotal(l)) + '</div></div>' +
      '</div>';
    $$('.stepper button', wrap).forEach((b) => b.addEventListener('click', () => {
      const p = getProduct(l.pid);
      const v = p ? variantOf(p, l.color, l.size) : null;
      const next = l.qty + Number(b.dataset.d);
      if (next <= 0) { sheet.close(); removeFromCart(idx, true); return; }
      if (Number(b.dataset.d) > 0 && !db.prefs.allowNegativeStock && v) {
        const avail = availableStock(p, v) - cartQtyForVariant(l.pid, l.color, l.size, idx);
        if (avail <= 0) { toast('Only ' + Math.max(0, availableStock(p, v)) + ' in stock', { icon: 'i-warn', error: true }); return; }
      }
      l.qty = next;
      haptic(8);
      save();
      render();
      renderCart();
    }));
    $('[data-role="disc"]', wrap).addEventListener('click', () => {
      openAmountSheet('Item discount', l.name, l.disc ? l.disc.value : 0, {
        allowPercent: true,
        unit: l.disc ? l.disc.type : 'rp',
        label: 'Discount'
      }).then((res) => {
        if (!res) return;
        if (res.value <= 0) l.disc = null;
        else l.disc = { type: res.unit, value: res.value };
        save();
        render();
        renderCart();
      });
    });
  };
  const footer = document.createElement('div');
  footer.style.width = '100%';
  footer.style.display = 'flex';
  footer.style.gap = '10px';
  footer.innerHTML =
    '<button type="button" class="btn btn-destructive-tinted" data-role="del" style="flex:0 0 54px;padding:0" aria-label="Remove"><svg class="ico"><use href="#i-trash"/></svg></button>' +
    '<button type="button" class="btn btn-primary" style="flex:1" data-role="done">Done</button>';
  const sheet = openSheet({ title: l.name, sub: [l.color, l.size].filter(Boolean).join(' / ') || rp(l.price), body: wrap, footer: footer });
  render();
  $('[data-role="done"]', sheet.el).addEventListener('click', () => sheet.close());
  $('[data-role="del"]', sheet.el).addEventListener('click', () => { sheet.close(); removeFromCart(idx, true); });
}

function openOrderDiscountSheet() {
  const base = cartSubtotal() - cartItemDiscounts() - promoDiscountValue();
  const current = cart.discount ? cart.discount.value : 0;
  openAmountSheet('Order discount', rp(base) + ' before discount', current, {
    allowPercent: true,
    unit: cart.discount ? cart.discount.type : 'rp',
    label: 'Discount'
  }).then((res) => {
    if (!res) return;
    cart.discount = res.value > 0 ? { type: res.unit, value: res.value } : null;
    save();
    renderCart();
  });
}

function roundUpTo(note, value) {
  return Math.ceil(value / note) * note;
}
function quickCashOptions(total) {
  const notes = [5000, 10000, 20000, 50000, 100000];
  const out = [];
  notes.forEach((n) => {
    const v = roundUpTo(n, total);
    if (v >= total && !out.includes(v)) out.push(v);
  });
  if (total > 0 && !out.includes(total)) out.unshift(total);
  const common = [20000, 50000, 100000, 200000, 500000].filter((v) => v > total && !out.includes(v));
  return out.concat(common).sort((a, b) => a - b).slice(0, 6);
}

function openCheckout() {
  if (!cart.length) return;
  const total = cartTotal();
  let method = 'cash';
  let received = 0;
  let receivedTouched = false;

  const wrap = document.createElement('div');
  wrap.innerHTML =
    '<div class="list"><div class="row"><div class="row-main"><div class="row-sub">Total due · ' + cartCount() + ' item' + (cartCount() > 1 ? 's' : '') + '</div>' +
    '<div class="row-title num" style="font-size:28px;font-weight:700;letter-spacing:-0.03em">' + rp(total) + '</div></div></div></div>' +
    '<div class="pay-grid" data-role="methods"></div>' +
    '<div data-role="detail"></div>';

  const footer = document.createElement('button');
  footer.type = 'button';
  footer.className = 'btn btn-primary btn-xl';
  const sheet = openSheet({ title: 'Payment', sub: 'Charge the customer, then confirm', full: true, body: wrap, footer: footer });

  const methodsWrap = $('[data-role="methods"]', wrap);
  Object.keys(PAYMENTS).forEach((key) => {
    const m = PAYMENTS[key];
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pay-opt' + (key === method ? ' is-active' : '');
    b.dataset.m = key;
    b.innerHTML = '<svg class="ico"><use href="#' + m.icon + '"/></svg><div class="lbl">' + m.label + '</div><div class="sub">' + m.sub + '</div>';
    b.addEventListener('click', () => {
      method = key;
      haptic(8);
      $$('.pay-opt', methodsWrap).forEach((x) => x.classList.toggle('is-active', x.dataset.m === key));
      renderDetail();
    });
    methodsWrap.appendChild(b);
  });

  const detail = $('[data-role="detail"]', wrap);
  detail.className = 'stack';

  function renderDetail() {
    detail.innerHTML = '';
    if (method === 'cash') {
      const box = document.createElement('div');
      const change = received - total;
      box.innerHTML =
        '<div class="list">' +
        '<div class="row tappable" data-role="cashrow">' +
        '<div class="row-main"><div class="row-sub">Cash received</div>' +
        '<div class="row-title num" style="font-size:30px;font-weight:700;letter-spacing:-0.03em' + (receivedTouched ? '' : ';color:var(--label-3);font-weight:600') + '">' + (receivedTouched ? rp(received) : 'Tap to enter') + '</div></div>' +
        '<span class="row-chev"><svg class="ico"><use href="#i-pencil"/></svg></span></div>' +
        '<div class="row" style="padding-top:8px;padding-bottom:8px"><div class="row-main"><div class="row-sub">' +
        (receivedTouched ? (change < 0 ? 'Still short' : 'Change due') : 'Enter the amount received') + '</div></div>' +
        (receivedTouched ? '<div class="row-value strong num" style="font-size:22px;letter-spacing:-0.02em;color:' + (change < 0 ? 'var(--red)' : 'var(--green)') + '">' + (change < 0 ? '−' + rp(Math.abs(change)) : rp(change)) + '</div>' : '') +
        '</div></div>' +
        '<div class="quick-cash" data-role="quick"></div>' +
        '<div data-role="keys"></div>';
      detail.appendChild(box);
      const quick = $('[data-role="quick"]', box);
      quickCashOptions(total).forEach((v) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = v === total ? 'Exact ' + rpShort(v) : rpShort(v);
        b.addEventListener('click', () => { received = v; receivedTouched = true; haptic(8); renderDetail(); });
        quick.appendChild(b);
      });
      const keypadWrap = $('[data-role="keys"]', box);
      keypadWrap.appendChild(keypad({
        onKey: (k) => {
          const next = String(received === 0 && !receivedTouched ? '' : received) + k;
          received = digitsToNumber(next);
          receivedTouched = true;
          renderDetail();
        },
        onDelete: () => {
          receivedTouched = true;
          received = Math.floor(received / 10);
          renderDetail();
        }
      }));
      $('[data-role="cashrow"]', box).addEventListener('click', () => {
        openAmountSheet('Cash received', 'Total ' + rp(total), received, { label: 'Cash received' }).then((res) => {
          if (!res) return;
          received = res.value;
          receivedTouched = true;
          renderDetail();
        });
      });
      footer.disabled = !receivedTouched || received < total;
      footer.textContent = footer.disabled ? (receivedTouched && received < total ? 'Short ' + rp(total - received) : 'Enter cash received') : 'Complete sale · ' + rp(total);
    } else if (method === 'qris') {
      if (db.qris) {
        detail.innerHTML = '<div class="list"><div class="row" style="justify-content:center;padding:16px"><img src="' + db.qris + '" alt="QRIS code" style="width:min(280px,70vw);height:auto;border-radius:12px;display:block"></div>' +
          '<div class="row"><div class="row-main"><div class="row-sub">Ask the customer to scan and pay ' + rp(total) + '</div></div></div></div>';
      } else {
        detail.innerHTML = '<div class="banner"><svg class="ico"><use href="#i-qr"/></svg><div><strong>No QRIS image yet.</strong> Add your QRIS code in Settings → Payments so you can show it here.</div></div>';
      }
      footer.disabled = false;
      footer.textContent = 'Payment received · ' + rp(total);
    } else if (method === 'transfer') {
      const has = db.brand.bankAccount;
      detail.innerHTML = has
        ? '<div class="list"><div class="row"><div class="row-main"><div class="row-sub">Bank</div><div class="row-title">' + esc(db.brand.bankName || '—') + '</div></div></div>' +
          '<div class="row tappable" data-role="copyacct"><div class="row-main"><div class="row-sub">Account number</div><div class="row-title num">' + esc(db.brand.bankAccount) + '</div></div>' +
          '<span class="row-chev"><svg class="ico"><use href="#i-copy"/></svg></span></div>' +
          (db.brand.bankHolder ? '<div class="row"><div class="row-main"><div class="row-sub">Account holder</div><div class="row-title">' + esc(db.brand.bankHolder) + '</div></div></div>' : '') +
          '<div class="row"><div class="row-main"><div class="row-sub">Confirm the transfer of ' + rp(total) + ' arrived, then complete.</div></div></div></div>'
        : '<div class="banner"><svg class="ico"><use href="#i-info"/></svg><div><strong>No bank details yet.</strong> Add them in Settings → Payments to show them here.</div></div>';
      const copy = $('[data-role="copyacct"]', detail);
      if (copy) copy.addEventListener('click', () => { copyText(db.brand.bankAccount).then(() => toast('Account number copied', { icon: 'i-check' })); });
      footer.disabled = false;
      footer.textContent = 'Transfer received · ' + rp(total);
    } else {
      detail.innerHTML = '<div class="banner"><svg class="ico"><use href="#i-card"/></svg><div>Charge <strong>' + rp(total) + '</strong> on your EDC machine, then complete the sale.</div></div>';
      footer.disabled = false;
      footer.textContent = 'Card paid · ' + rp(total);
    }
  }

  renderDetail();

  footer.addEventListener('click', () => {
    if (footer.disabled) return;
    completeSale(method, method === 'cash' ? received : total);
  });
}

function nextReceiptNo() {
  const n = db.counter;
  db.counter = n + 1;
  const dev = db.sync && Number(db.sync.device) ? String(Number(db.sync.device)) : '';
  return (dev ? dev + '-' : '') + pad(n, 3);
}

function completeSale(method, received) {
  const subtotal = cartSubtotal();
  const itemDisc = cartItemDiscounts();
  const promo = cartPromo();
  const promoDisc = promo.reduce((s, x) => s + x.amount, 0);
  const orderDisc = orderDiscountValue();
  const total = cartTotal();
  // Free bottles are saved as part of each line's discount so reports and exports net them out.
  const items = cart.map((l, i) => ({
    pid: l.pid,
    name: l.name,
    color: l.color,
    size: l.size,
    price: l.price,
    qty: l.qty,
    disc: (l.disc ? lineDiscount(l) : 0) + promo[i].amount,
    discRaw: l.disc,
    free: promo[i].free,
    promo: promo[i].amount,
    total: Math.max(0, lineTotal(l) - promo[i].amount)
  }));
  invalidateStock();
  const sale = {
    id: uid('sale'),
    no: nextReceiptNo(),
    ts: Date.now(),
    day: dayKey(Date.now()),
    items: items,
    subtotal: subtotal,
    itemDiscount: itemDisc + promoDisc,
    promoDiscount: promoDisc,
    orderDiscount: orderDisc,
    orderDiscountRaw: cart.discount || null,
    total: total,
    method: method,
    received: method === 'cash' ? received : total,
    change: method === 'cash' ? Math.max(0, received - total) : 0,
    voided: false
  };
  db.sales.push(sale);
  cart = [];
  cart.discount = null;
  save(true);
  haptic([12, 40, 24]);
  syncNow({});
  const openLayers = layerStack.length;
  layerStack.length = 0;
  if (openLayers) { try { history.go(-openLayers); } catch (e) {} }
  const dyingSheets = Array.from($$('#sheet-root .sheet'));
  const dyingScrims = Array.from($$('#sheet-root .sheet-scrim'));
  dyingSheets.forEach((s) => s.classList.remove('is-in'));
  dyingScrims.forEach((s) => s.classList.remove('is-in'));
  setTimeout(() => {
    dyingSheets.forEach((s) => s.remove());
    dyingScrims.forEach((s) => s.remove());
  }, 620);
  renderCart();
  renderGrid();
  renderTabBadge();
  showSuccess(sale);
}

function showSuccess(sale) {
  const root = $('#overlay-root');
  const screen = document.createElement('div');
  screen.className = 'success-screen';
  screen.innerHTML =
    '<div class="success-check"><svg class="ico"><use href="#i-check"/></svg></div>' +
    '<h2>Sale complete</h2>' +
    '<div class="success-amount num">' + rp(sale.total) + '</div>' +
    (sale.method === 'cash' && sale.change > 0 ? '<div class="success-change">Change due <strong>' + rp(sale.change) + '</strong></div>' : '') +
    '<div class="success-actions">' +
    '<button type="button" class="btn btn-primary btn-xl" data-role="next">New sale</button>' +
    '<button type="button" class="btn btn-tinted btn-xl" data-role="receipt">View receipt</button>' +
    '<div style="display:flex;gap:10px;justify-content:center">' +
    '<button type="button" class="btn btn-gray" style="flex:1" data-role="share"><svg class="ico"><use href="#i-share"/></svg>Share</button>' +
    '<button type="button" class="btn btn-gray" style="flex:1" data-role="print"><svg class="ico"><use href="#i-printer"/></svg>Print</button>' +
    '</div></div>';
  root.appendChild(screen);
  requestAnimationFrame(() => requestAnimationFrame(() => screen.classList.add('is-in')));
  const close = () => {
    screen.classList.remove('is-in');
    setTimeout(() => screen.remove(), 300);
  };
  $('[data-role="next"]', screen).addEventListener('click', () => { haptic(8); close(); switchTab('sell'); });
  $('[data-role="receipt"]', screen).addEventListener('click', () => { close(); setTimeout(() => openReceiptSheet(sale), 240); });
  $('[data-role="share"]', screen).addEventListener('click', () => shareReceipt(sale));
  $('[data-role="print"]', screen).addEventListener('click', () => choosePrint(sale));
}

function saleLineRows(sale) {
  return sale.items.map((it) => {
    const variant = [it.color, it.size].filter(Boolean).join(' / ');
    return { name: it.name, variant: variant, qty: it.qty, price: it.price, disc: (it.disc || 0) - (it.promo || 0), free: it.free || 0, total: it.total };
  });
}

function receiptHtml(sale) {
  const rows = saleLineRows(sale);
  return '<div class="receipt-card">' +
    '<div class="receipt-head"><div class="receipt-brand">' + esc(db.brand.name || 'Your Brand') + '</div>' +
    (db.brand.tagline ? '<div class="receipt-tag">' + esc(db.brand.tagline) + '</div>' : '') + '</div>' +
    '<hr class="receipt-hr">' +
    '<div class="receipt-meta"><span>#' + esc(sale.no) + '</span><span>' + fmtDate(sale.ts) + ' · ' + fmtTime(sale.ts) + '</span></div>' +
    '<hr class="receipt-hr">' +
    rows.map((r) =>
      '<div class="receipt-line"><div class="name">' + esc(r.name) + (r.variant ? '<div class="receipt-line sub"><span>' + esc(r.variant) + '</span></div>' : '') + '<div class="receipt-line sub"><span>' + r.qty + ' × ' + rp(r.price) + (r.free ? ' · ' + r.free + ' free' : '') + (r.disc ? ' · disc −' + rp(r.disc) : '') + '</span></div></div>' +
      '<div class="amt">' + rp(r.total) + '</div></div>'
    ).join('') +
    '<hr class="receipt-hr">' +
    '<div class="receipt-line"><span>Subtotal</span><span class="amt">' + rp(sale.subtotal) + '</span></div>' +
    (sale.itemDiscount - (sale.promoDiscount || 0) ? '<div class="receipt-line"><span>Item discounts</span><span class="amt">−' + rp(sale.itemDiscount - (sale.promoDiscount || 0)) + '</span></div>' : '') +
    (sale.promoDiscount ? '<div class="receipt-line"><span>' + PROMO.label + '</span><span class="amt">−' + rp(sale.promoDiscount) + '</span></div>' : '') +
    (sale.orderDiscount ? '<div class="receipt-line"><span>Order discount</span><span class="amt">−' + rp(sale.orderDiscount) + '</span></div>' : '') +
    '<div class="receipt-line total"><span>Total</span><span class="amt">' + rp(sale.total) + '</span></div>' +
    '<div class="receipt-line"><span>' + payLabel(sale.method) + '</span><span class="amt">' + rp(sale.received) + '</span></div>' +
    (sale.change ? '<div class="receipt-line"><span>Change</span><span class="amt">' + rp(sale.change) + '</span></div>' : '') +
    '<hr class="receipt-hr">' +
    '<div class="receipt-foot">' + esc(db.brand.footer || '') + '</div>' +
    ((db.brand.ig || db.brand.wa) ? '<div class="receipt-foot" style="padding-top:4px">' + esc([db.brand.ig ? '@' + db.brand.ig.replace(/^@/, '') : '', db.brand.wa ? 'WA ' + db.brand.wa : ''].filter(Boolean).join(' · ')) + '</div>' : '') +
    '</div>';
}

function openReceiptSheet(sale) {
  const wrap = document.createElement('div');
  wrap.innerHTML = receiptHtml(sale) +
    '<div class="list"><div class="row tappable" data-role="share"><div class="row-icon"><svg class="ico"><use href="#i-share"/></svg></div><div class="row-main"><div class="row-title">Share receipt</div><div class="row-sub">WhatsApp, email or any app</div></div><span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></div>' +
    '<div class="row tappable" data-role="wa"><div class="row-icon"><svg class="ico"><use href="#i-chat"/></svg></div><div class="row-main"><div class="row-title">Send on WhatsApp</div><div class="row-sub">Opens WhatsApp with the receipt</div></div><span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></div>' +
    '<div class="row tappable" data-role="copy"><div class="row-icon"><svg class="ico"><use href="#i-copy"/></svg></div><div class="row-main"><div class="row-title">Copy as text</div></div><span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></div>' +
    '<div class="row tappable" data-role="print"><div class="row-icon"><svg class="ico"><use href="#i-printer"/></svg></div><div class="row-main"><div class="row-title">Print</div><div class="row-sub">Thermal printer or system print</div></div><span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></div>' +
    '</div>' +
    '<div class="list"><div class="row tappable" data-role="void"><div class="row-icon" style="background:var(--red-soft);color:var(--red)"><svg class="ico"><use href="#i-x"/></svg></div><div class="row-main"><div class="row-title" style="color:var(--red)">' + (sale.voided ? 'Voided sale' : 'Void this sale') + '</div><div class="row-sub">' + (sale.voided ? 'Stock was returned' : 'Returns stock and removes it from reports') + '</div></div></div></div>';
  const sheet = openSheet({ title: 'Receipt #' + sale.no, sub: payLabel(sale.method) + ' · ' + rp(sale.total), body: wrap });
  $('[data-role="share"]', wrap).addEventListener('click', () => shareReceipt(sale));
  $('[data-role="wa"]', wrap).addEventListener('click', () => shareWhatsapp(sale));
  $('[data-role="copy"]', wrap).addEventListener('click', () => {
    copyText(receiptText(sale, 40)).then(() => toast('Receipt copied', { icon: 'i-check' }));
  });
  $('[data-role="print"]', wrap).addEventListener('click', () => choosePrint(sale));
  const voidRow = $('[data-role="void"]', wrap);
  if (sale.voided) { voidRow.style.opacity = '0.55'; voidRow.classList.remove('tappable'); }
  else voidRow.addEventListener('click', () => {
    dialog({ title: 'Void sale #' + sale.no + '?', message: 'Items go back into stock and the sale stops counting in reports.', okLabel: 'Void sale', destructive: true }).then((ok) => {
      if (!ok) return;
      sale.voided = true;
      sale.voidedAt = Date.now();
      sale.dirty = true;
      invalidateStock();
      save(true);
      sheet.close();
      toast('Sale voided · stock returned', { icon: 'i-check' });
      renderGrid();
      renderReports();
      syncNow({});
    });
  });
}

const RECEIPT_WIDTH = { 58: 32, 80: 48 };

function wrapText(text, width) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  words.forEach((w) => {
    if (!cur.length) cur = w;
    else if ((cur + ' ' + w).length <= width) cur += ' ' + w;
    else { lines.push(cur); cur = w; }
  });
  if (cur) lines.push(cur);
  return lines;
}
function padRight(s, n) { return s.length >= n ? s : s + ' '.repeat(n - s.length); }
function padLeft(s, n) { return s.length >= n ? s : ' '.repeat(n - s.length) + s; }
function lr(left, right, width) {
  const l = String(left);
  const r = String(right);
  if (l.length + r.length + 1 <= width) return padRight(l, width - r.length) + r;
  return l + '\n' + padLeft(r, width);
}

function receiptText(sale, width) {
  const w = width || RECEIPT_WIDTH[db.prefs.paperWidth] || 32;
  const brandName = db.brand.name || 'Your Brand';
  const out = [];
  out.push(padLeft(brandName.toUpperCase().slice(0, w), Math.floor((w + brandName.length) / 2)).slice(0, w));
  if (db.brand.tagline) out.push(padLeft(db.brand.tagline.slice(0, w), Math.floor((w + db.brand.tagline.length) / 2)).slice(0, w));
  out.push('-'.repeat(w));
  out.push(lr('#' + sale.no, fmtDate(sale.ts) + ' ' + fmtTime(sale.ts), w));
  out.push('-'.repeat(w));
  sale.items.forEach((it) => {
    const variant = [it.color, it.size].filter(Boolean).join(' / ');
    wrapText(it.name, w).forEach((l) => out.push(l));
    if (variant) out.push('  ' + variant);
    out.push(lr('  ' + it.qty + ' x ' + rp(it.price), rp(it.total), w));
    if (it.free) out.push(lr('  ' + it.free + ' free (3+1)', '-' + rp(it.promo || 0), w));
    if ((it.disc || 0) - (it.promo || 0)) out.push(lr('  item disc', '-' + rp(it.disc - (it.promo || 0)), w));
  });
  out.push('-'.repeat(w));
  out.push(lr('Subtotal', rp(sale.subtotal), w));
  if (sale.itemDiscount - (sale.promoDiscount || 0)) out.push(lr('Item disc', '-' + rp(sale.itemDiscount - (sale.promoDiscount || 0)), w));
  if (sale.promoDiscount) out.push(lr('Promo 3+1', '-' + rp(sale.promoDiscount), w));
  if (sale.orderDiscount) out.push(lr('Order disc', '-' + rp(sale.orderDiscount), w));
  out.push(lr('TOTAL', rp(sale.total), w));
  out.push(lr(payLabel(sale.method), rp(sale.received), w));
  if (sale.change) out.push(lr('Change', rp(sale.change), w));
  out.push('-'.repeat(w));
  if (db.brand.footer) wrapText(db.brand.footer, w).forEach((l) => out.push(l));
  const contact = [db.brand.ig ? '@' + db.brand.ig.replace(/^@/, '') : '', db.brand.wa ? 'WA ' + db.brand.wa : ''].filter(Boolean).join(' | ');
  if (contact) out.push(contact);
  return out.join('\n');
}

function shareReceipt(sale) {
  const text = receiptText(sale, 40);
  if (navigator.share) {
    navigator.share({ title: 'Receipt #' + sale.no, text: text }).catch(() => {});
  } else {
    copyText(text).then(() => toast('Receipt copied — paste it anywhere', { icon: 'i-check' }));
  }
}
function shareWhatsapp(sale) {
  const text = encodeURIComponent(receiptText(sale, 40));
  const phone = String(db.brand.wa || '').replace(/[^\d]/g, '').replace(/^0/, '62');
  const url = phone ? 'https://wa.me/' + phone + '?text=' + text : 'https://wa.me/?text=' + text;
  window.open(url, '_blank');
}

function choosePrint(sale) {
  const sheet = openSheet({
    title: 'Print receipt',
    sub: '# ' + sale.no + ' · ' + rp(sale.total),
    body: '<div class="list"><div class="row tappable" data-role="ble"><div class="row-icon"><svg class="ico"><use href="#i-bluetooth"/></svg></div><div class="row-main"><div class="row-title">Bluetooth thermal printer</div><div class="row-sub">58 mm / 80 mm ESC/POS</div></div><span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></div>' +
      '<div class="row tappable" data-role="sys"><div class="row-icon"><svg class="ico"><use href="#i-printer"/></svg></div><div class="row-main"><div class="row-title">System print dialog</div><div class="row-sub">AirPrint, network printer, or save as PDF</div></div><span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></div></div>' +
      (navigator.bluetooth ? '' : '<div class="banner" style="margin-top:16px"><svg class="ico"><use href="#i-info"/></svg><div>Bluetooth printing needs Chrome on Android. On iPhone, use the system print dialog with an AirPrint printer.</div></div>')
  });
  $('[data-role="ble"]', sheet.el).addEventListener('click', () => { sheet.close(); printThermal(sale); });
  $('[data-role="sys"]', sheet.el).addEventListener('click', () => { sheet.close(); printSystem(sale); });
}

const BLE_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb',
  '0000ff00-0000-1000-8000-00805f9b34fb',
  '0000ff10-0000-1000-8000-00805f9b34fb',
  '49535343-fe7d-4ae5-8fa9-9fafd205e455',
  'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f',
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
  '0000e781-0000-1000-8000-00805f9b34fb',
  '0000ffe0-0000-1000-8000-00805f9b34fb'
];
let bleState = { device: null, char: null, name: null };

async function findWritableChar(server) {
  for (const uuid of BLE_SERVICES) {
    try {
      const service = await server.getPrimaryService(uuid);
      const chars = await service.getCharacteristics();
      const writable = chars.find((c) => c.properties.writeWithoutResponse || c.properties.write);
      if (writable) return writable;
    } catch (e) {}
  }
  return null;
}

async function bleConnect() {
  if (!navigator.bluetooth) throw new Error('Bluetooth is not available in this browser');
  const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true, optionalServices: BLE_SERVICES });
  const server = await device.gatt.connect();
  const char = await findWritableChar(server);
  if (!char) { try { device.gatt.disconnect(); } catch (e) {} throw new Error('This printer is not supported'); }
  bleState = { device: device, char: char, name: device.name || 'Printer' };
  device.addEventListener('gattserverdisconnected', () => { bleState.char = null; });
  return bleState;
}

function asciiClean(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[·•]/g, '-')
    .replace(/[—–]/g, '-')
    .replace(/[“”„]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, '...')
    .replace(/[^\x20-\x7E\n]/g, '');
}

function escposBytes(text, opts) {
  const o = opts || {};
  const chunks = [];
  const enc = new TextEncoder();
  const push = (arr) => chunks.push(new Uint8Array(arr));
  const textBytes = (s) => enc.encode(asciiClean(s));
  push([0x1b, 0x40]);
  push([0x1b, 0x61, 0x01]);
  const big = o.bigLine || /^TOTAL\b/;
  text.split('\n').forEach((line) => {
    if (big.test(line.trim())) {
      const compact = line.trim().replace(/\s{2,}/g, '  ');
      push([0x1b, 0x21, 0x30]);
      push(textBytes(compact + '\n'));
      push([0x1b, 0x21, 0x00]);
      push([0x1b, 0x45, 0x00]);
    } else {
      push(textBytes(line + '\n'));
    }
  });
  push([0x0a, 0x0a, 0x0a]);
  if (o.cut !== false) push([0x1d, 0x56, 0x42, 0x00]);
  const total = chunks.reduce((s, c) => s + c.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  chunks.forEach((c) => { out.set(c, off); off += c.length; });
  return out;
}

async function writeBytes(char, bytes) {
  const chunkSize = char.properties.writeWithoutResponse ? 100 : 20;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.slice(i, i + chunkSize);
    if (char.properties.writeWithoutResponse) await char.writeValueWithoutResponse(slice);
    else await char.writeValue(slice);
    await new Promise((r) => setTimeout(r, 24));
  }
}

async function printThermal(sale) {
  try {
    if (!bleState.char) {
      toast('Connecting to printer…', { icon: 'i-bluetooth' });
      await bleConnect();
      toast('Connected to ' + bleState.name, { icon: 'i-check' });
    }
    const width = RECEIPT_WIDTH[db.prefs.paperWidth] || 32;
    const text = receiptText(sale, width);
    const bytes = escposBytes(text, { cut: true });
    await writeBytes(bleState.char, bytes);
    toast('Printed', { icon: 'i-check' });
  } catch (e) {
    const msg = String(e && e.message || e);
    if (/cancel/i.test(e && e.name)) return;
    dialog({ title: 'Printing failed', message: msg + (navigator.bluetooth ? '' : ' — Bluetooth printing needs Chrome on Android.'), okLabel: 'OK', cancel: false });
  }
}

function printSystem(sale) {
  const width = RECEIPT_WIDTH[db.prefs.paperWidth] || 32;
  const area = document.createElement('div');
  area.className = 'print-area';
  const pre = document.createElement('pre');
  pre.style.fontFamily = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';
  pre.style.fontSize = '12px';
  pre.style.lineHeight = '1.35';
  pre.style.whiteSpace = 'pre-wrap';
  pre.textContent = receiptText(sale, width);
  area.appendChild(pre);
  document.body.appendChild(area);
  const cleanup = () => { area.remove(); window.removeEventListener('afterprint', cleanup); };
  window.addEventListener('afterprint', cleanup);
  setTimeout(() => { window.print(); setTimeout(cleanup, 4000); }, 100);
}

function salesForDay(day) {
  return db.sales.filter((s) => s.day === day);
}
function summarize(sales) {
  const live = sales.filter((s) => !s.voided);
  const revenue = live.reduce((s, x) => s + x.total, 0);
  const items = live.reduce((s, x) => s + x.items.reduce((a, i) => a + i.qty, 0), 0);
  const orders = live.length;
  const byMethod = {};
  Object.keys(PAYMENTS).forEach((k) => { byMethod[k] = { count: 0, amount: 0 }; });
  live.forEach((s) => {
    byMethod[s.method].count += 1;
    byMethod[s.method].amount += s.total;
  });
  const productMap = {};
  live.forEach((s) => s.items.forEach((i) => {
    const key = i.name;
    if (!productMap[key]) productMap[key] = { name: i.name, qty: 0, amount: 0 };
    productMap[key].qty += i.qty;
    productMap[key].amount += i.total;
  }));
  const top = Object.values(productMap).sort((a, b) => b.qty - a.qty).slice(0, 5);
  const hours = new Array(24).fill(0);
  live.forEach((s) => { hours[new Date(s.ts).getHours()] += s.total; });
  return { revenue: revenue, items: items, orders: orders, avg: orders ? Math.round(revenue / orders) : 0, byMethod: byMethod, top: top, hours: hours, voided: sales.length - live.length };
}

function renderReports() {
  const body = $('#report-body');
  const sales = salesForDay(reportDay).slice().reverse();
  const sum = summarize(sales);
  const isToday = reportDay === dayKey(Date.now());
  const maxHour = Math.max.apply(null, sum.hours.concat([1]));

  body.innerHTML =
    '<div class="list"><div class="row thin"><button type="button" class="text-btn" data-role="prev" style="min-height:36px;padding:0 10px"><svg class="ico sm"><use href="#i-chev-l"/></svg></button>' +
    '<div class="row-main" style="text-align:center"><div class="row-title" style="font-weight:600" data-role="datelabel">' + esc(fmtDateLong(reportDay)) + '</div></div>' +
    '<button type="button" class="text-btn" data-role="next" style="min-height:36px;padding:0 10px"' + (isToday ? ' disabled' : '') + '><svg class="ico sm"><use href="#i-chev-r"/></svg></button>' +
    '<input type="date" data-role="dateinput" value="' + reportDay + '" style="position:absolute;opacity:0;pointer-events:none;width:1px;height:1px"></div></div>' +

    '<div class="section"><div class="list-title">' + (isToday ? 'Today' : fmtDateLong(reportDay)) + (sum.voided ? ' · ' + sum.voided + ' voided' : '') + '</div>' +
    '<div class="stat-grid">' +
    '<div class="stat-card accent"><div class="stat-label">Revenue</div><div class="stat-value num">' + rp(sum.revenue) + '</div></div>' +
    '<div class="stat-card"><div class="stat-label">Sales</div><div class="stat-value num">' + sum.orders + '</div></div>' +
    '<div class="stat-card"><div class="stat-label">Items sold</div><div class="stat-value num">' + sum.items + '</div></div>' +
    '<div class="stat-card"><div class="stat-label">Avg sale</div><div class="stat-value num">' + rp(sum.avg) + '</div></div>' +
    '</div></div>' +

    (sum.orders
      ? '<div class="section"><div class="list-title">Sales by hour</div><div class="list"><div class="chart">' +
        sum.hours.map((v, h) =>
          '<div class="col' + (v ? '' : ' is-empty') + '"><div class="bar" style="height:' + Math.max(3, Math.round(v / maxHour * 84)) + 'px" title="' + h + ':00 — ' + rp(v) + '"></div>' +
          '<div class="tick">' + (h % 4 === 0 ? h : '') + '</div></div>'
        ).join('') +
        '</div></div></div>'
      : '' ) +

    (sum.orders
      ? '<div class="section"><div class="list-title">Payment methods</div><div class="list">' +
        Object.keys(PAYMENTS).map((k, i) => {
          const m = sum.byMethod[k];
          if (!m.count) return '';
          const pct = sum.revenue ? Math.round(m.amount / sum.revenue * 100) : 0;
          const colors = ['green', '', '', 'orange'];
          return '<div class="row bar-row"><div style="width:100%"><div class="bar-head"><span>' + PAYMENTS[k].label + ' <span style="color:var(--label-3)">' + m.count + '×</span></span><span class="amt">' + rp(m.amount) + ' · ' + pct + '%</span></div>' +
            '<div class="bar-track"><div class="bar-fill ' + colors[i] + '" style="width:' + pct + '%"></div></div></div></div>';
        }).join('') +
        '</div></div>'
      : '') +

    (sum.top.length
      ? '<div class="section"><div class="list-title">Best sellers</div><div class="list">' +
        sum.top.map((t, i) =>
          '<div class="row"><div class="row-icon" style="background:var(--fill-1);font-weight:700">' + (i + 1) + '</div><div class="row-main"><div class="row-title">' + esc(t.name) + '</div><div class="row-sub">' + t.qty + ' sold</div></div><div class="row-value num">' + rp(t.amount) + '</div></div>'
        ).join('') +
        '</div></div>'
      : '') +

    '<div class="section"><div class="list-title">Transactions</div>' +
    (sales.length
      ? '<div class="list">' + sales.map((s) =>
        '<button type="button" class="row tappable" data-sid="' + s.id + '"><div class="row-main"><div class="row-title"' + (s.voided ? ' style="text-decoration:line-through;color:var(--label-2)"' : '') + '>#' + esc(s.no) + ' · ' + fmtTime(s.ts) + '</div>' +
        '<div class="row-sub">' + s.items.reduce((a, i) => a + i.qty, 0) + ' items · ' + payLabel(s.method) + (s.voided ? ' · voided' : '') + '</div></div>' +
        '<div class="row-value strong num"' + (s.voided ? ' style="text-decoration:line-through"' : '') + '>' + rp(s.total) + '</div>' +
        '<span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></button>'
      ).join('') + '</div>'
      : '<div class="list"><div class="empty-state" style="padding:32px 20px"><div class="empty-icon"><svg class="ico"><use href="#i-chart"/></svg></div><h3>No sales yet</h3><p>' + (isToday ? 'Sales you complete today will show up here.' : 'Nothing was sold on this day.') + '</p></div></div>') +
    '</div>' +
    (sales.length ? '<div class="kbd-hint" style="padding:4px 0">Tap a transaction to view, share or void its receipt.</div>' : '') +
    '<div class="section"><button type="button" class="btn btn-gray btn-xl" data-role="csvexport"><svg class="ico"><use href="#i-download"/></svg>Export ' + (isToday ? "today's" : "this day's") + ' sales to CSV</button>' +
    '<button type="button" class="btn btn-gray btn-xl" data-role="excelexport" style="margin-top:10px"><svg class="ico"><use href="#i-doc"/></svg>Export to Excel (products + sales, with photos)</button></div>';

  const dateInput = $('[data-role="dateinput"]', body);
  $('[data-role="prev"]', body).addEventListener('click', () => { reportDay = shiftDay(reportDay, -1); haptic(6); renderReports(); });
  const nextBtn = $('[data-role="next"]', body);
  if (nextBtn) nextBtn.addEventListener('click', () => {
    if (reportDay === dayKey(Date.now())) return;
    reportDay = shiftDay(reportDay, 1);
    haptic(6);
    renderReports();
  });
  $('[data-role="datelabel"]', body).addEventListener('click', () => {
    if (dateInput.showPicker) { try { dateInput.showPicker(); return; } catch (e) {} }
    dateInput.focus();
  });
  dateInput.addEventListener('change', () => {
    if (!dateInput.value) return;
    reportDay = dateInput.value;
    renderReports();
  });
  $$('[data-sid]', body).forEach((b) => b.addEventListener('click', () => {
    const s = db.sales.find((x) => x.id === b.dataset.sid);
    if (s) openReceiptSheet(s);
  }));
  $('[data-role="csvexport"]', body).addEventListener('click', () => exportCSV(reportDay));
  $('[data-role="excelexport"]', body).addEventListener('click', () => exportExcel({}));
}

function csvEscape(v) {
  const s = String(v == null ? '' : v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function buildCSV(sales) {
  const header = ['Order', 'Date', 'Time', 'Product', 'Color', 'Size', 'Qty', 'Unit price', 'Item discount', 'Line total', 'Order discount', 'Order total', 'Payment', 'Status'];
  const rows = [header.join(',')];
  sales.forEach((s) => {
    s.items.forEach((it, i) => {
      rows.push([
        '#' + s.no,
        fmtDate(s.ts),
        fmtTime(s.ts),
        it.name,
        it.color || '',
        it.size || '',
        it.qty,
        it.price,
        it.disc || 0,
        it.total,
        i === 0 ? (s.orderDiscount || 0) : '',
        i === 0 ? s.total : '',
        payLabel(s.method),
        s.voided ? 'Voided' : 'Paid'
      ].map(csvEscape).join(','));
    });
  });
  return '\ufeff' + rows.join('\r\n');
}
async function exportCSV(day) {
  const sales = db.sales.filter((s) => (day ? s.day === day : true));
  if (!sales.length) { toast('No sales to export', { icon: 'i-info' }); return; }
  const csv = buildCSV(sales);
  const name = 'pos-sales-' + (day || 'all') + '.csv';
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const file = new File([blob], name, { type: 'text/csv' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name });
      return;
    } catch (e) { if (/cancel/i.test(e && e.name)) return; }
  }
  download(name, blob);
  toast(sales.length + ' transactions exported', { icon: 'i-check' });
}

function sampleProducts() {
  return [
    {
      id: uid('p'), name: 'Oversized Tee "Midnight"', price: 149000, cost: 75000, category: 'Tops', image: null, demo: true,
      variants: [
        { id: uid('v'), color: 'Black', size: 'M', stock: 6 },
        { id: uid('v'), color: 'Black', size: 'L', stock: 8 },
        { id: uid('v'), color: 'Black', size: 'XL', stock: 4 },
        { id: uid('v'), color: 'White', size: 'M', stock: 5 },
        { id: uid('v'), color: 'White', size: 'L', stock: 7 },
        { id: uid('v'), color: 'White', size: 'XL', stock: 2 }
      ]
    },
    {
      id: uid('p'), name: 'Canvas Tote Bag', price: 89000, cost: 40000, category: 'Accessories', image: null, demo: true,
      variants: [
        { id: uid('v'), color: 'Cream', size: 'One Size', stock: 12 },
        { id: uid('v'), color: 'Charcoal', size: 'One Size', stock: 9 }
      ]
    },
    {
      id: uid('p'), name: 'Cargo Pants', price: 259000, cost: 140000, category: 'Bottoms', image: null, demo: true,
      variants: [
        { id: uid('v'), color: 'Khaki', size: 'M', stock: 3 },
        { id: uid('v'), color: 'Khaki', size: 'L', stock: 5 },
        { id: uid('v'), color: 'Khaki', size: 'XL', stock: 1 },
        { id: uid('v'), color: 'Army', size: 'M', stock: 4 },
        { id: uid('v'), color: 'Army', size: 'L', stock: 6 },
        { id: uid('v'), color: 'Army', size: 'XL', stock: 2 }
      ]
    },
    {
      id: uid('p'), name: 'Sticker Pack', price: 25000, cost: 8000, category: 'Accessories', image: null, demo: true,
      variants: [{ id: uid('v'), color: 'Print', size: 'One Size', stock: 30 }]
    }
  ];
}

function catalogProducts() {
  const src = window.SEMU_CATALOG;
  if (!Array.isArray(src) || !src.length) return null;
  const src2 = src;
  return src.map((p) => ({
    id: p.id || uid('p'),
    name: String(p.name || 'Untitled'),
    price: Number(p.price) || 0,
    cost: 0,
    category: String(p.category || ''),
    image: p.image || null,
    variants: (p.variants || []).map((v) => {
      const out = { id: v.id || uid('v'), color: String(v.color || ''), size: String(v.size || ''), stock: Number(v.stock) || 0 };
      if (Number(v.price)) out.price = Number(v.price);
      return out;
    })
  })).map((prod, i) => {
    const src = src2[i];
    if (src && src.colorImages) prod.colorImages = Object.assign({}, src.colorImages);
    return prod;
  });
}

function productImageFor(p, color) {
  if (p && p.colorImages && color && p.colorImages[color]) return p.colorImages[color];
  return p ? p.image : null;
}

function refreshCatalogImages() {
  const ver = Number(window.SEMU_CATALOG_VERSION || 0);
  if (!ver || Number(db.catalogVersion || 0) === ver) return false;
  const list = window.SEMU_CATALOG;
  let touched = 0;
  if (Array.isArray(list)) {
    list.forEach((sp) => {
      const p = db.products.find((x) => x.id === sp.id);
      if (!p) return;
      let local = 0;
      if (sp.image && !p.image) { p.image = sp.image; local += 1; }
      if (sp.colorImages) {
        p.colorImages = p.colorImages || {};
        Object.keys(sp.colorImages).forEach((c) => {
          if (!p.colorImages[c]) { p.colorImages[c] = sp.colorImages[c]; local += 1; }
        });
      }
      if (local) {
        p.dirty = true;
        p.updatedAt = new Date().toISOString();
        touched += local;
      }
    });
  }
  db.catalogVersion = ver;
  save(true);
  if (touched) {
    invalidateStock();
    renderGrid();
    renderCart();
    syncNow({});
  }
  return touched > 0;
}

let soldCache = null;

function invalidateStock() { soldCache = null; }

function soldMap() {
  if (soldCache) return soldCache;
  const map = new Map();
  db.sales.forEach((s) => {
    if (s.voided) return;
    (s.items || []).forEach((it) => {
      const key = it.pid + '|' + (it.color || '') + '|' + (it.size || '');
      map.set(key, (map.get(key) || 0) + (Number(it.qty) || 0));
    });
  });
  soldCache = map;
  return map;
}

function soldFor(pid, color, size) {
  return soldMap().get(pid + '|' + (color || '') + '|' + (size || '')) || 0;
}

function availableStock(p, v) {
  if (!p || !v) return 0;
  return (Number(v.stock) || 0) - soldFor(p.id, v.color, v.size);
}

function productAvailable(p) {
  return p.variants.reduce((sum, v) => sum + Math.max(0, availableStock(p, v)), 0);
}

function variantPrice(p, v) {
  if (v && Number(v.price)) return Number(v.price);
  return Number(p.price) || 0;
}

function priceRange(p) {
  const prices = p.variants.map((v) => variantPrice(p, v)).filter((n) => n > 0);
  if (!prices.length) return { min: Number(p.price) || 0, max: Number(p.price) || 0, same: true };
  const min = Math.min.apply(null, prices);
  const max = Math.max.apply(null, prices);
  return { min: min, max: max, same: min === max };
}

function priceLabel(p) {
  const r = priceRange(p);
  if (r.same) return rp(r.min);
  return rp(r.min) + ' – ' + Math.round(r.max).toLocaleString('id-ID');
}

function demoSeed() {
  const fresh = defaultDB();
  fresh.onboarded = true;
  fresh.seeded = true;
  fresh.prefs.lowStock = 2;
  fresh.prefs.paperWidth = 58;
  const catalog = catalogProducts();
  const real = !!(catalog && catalog.length);
  if (real) {
    fresh.products = catalog;
    fresh.brand.name = BRAND_NAME;
    fresh.brand.tagline = 'Extrait de Parfum';
    fresh.brand.footer = 'Terima kasih sudah berbelanja!\nThank you for your purchase';
  } else {
    const mk = (name, price, cost, category, variants) => ({
      id: uid('p'), name: name, price: price, cost: cost, category: category, image: null, demo: true,
      variants: variants.map((v) => ({ id: uid('v'), color: v[0], size: v[1], stock: v[2] }))
    });
    fresh.products = [
      mk('Oversized Tee', 149000, 75000, 'Tops', [['Black', 'S', 4], ['Black', 'M', 6], ['Black', 'L', 8], ['White', 'M', 5], ['White', 'L', 7]]),
      mk('Canvas Tote Bag', 89000, 40000, 'Accessories', [['Cream', 'One Size', 12], ['Charcoal', 'One Size', 9]]),
      mk('Cargo Pants', 259000, 140000, 'Bottoms', [['Khaki', 'M', 3], ['Khaki', 'L', 5], ['Army', 'M', 4], ['Army', 'L', 6]]),
      mk('Logo Cap', 119000, 55000, 'Accessories', [['Black', 'One Size', 7], ['Navy', 'One Size', 5]]),
      mk('Sticker Pack', 25000, 8000, 'Accessories', [['Print', 'One Size', 30]])
    ];
    fresh.brand.name = 'NOIR STUDIO';
    fresh.brand.tagline = 'Jakarta streetwear';
    fresh.brand.wa = '081234567890';
    fresh.brand.ig = 'noir.studio';
    fresh.brand.bankName = 'BCA';
    fresh.brand.bankAccount = '8830123456';
    fresh.brand.bankHolder = 'Rani Prameswari';
    fresh.brand.footer = 'Terima kasih sudah berbelanja!\nThank you for your purchase';
  }
  const pickVariant = (p, n) => {
    const withStock = p.variants.filter((v) => (Number(v.stock) || 0) > 0);
    const list = withStock.length ? withStock : p.variants;
    return list[(n || 0) % list.length];
  };
  let counter = 1;
  const mkSale = (entries, when, method, opts) => {
    const o = opts || {};
    const ts = when.getTime();
    const items = entries.map((e) => {
      const p = e[0];
      const v = e[1];
      const qty = e[2];
      const price = variantPrice(p, v);
      return {
        pid: p.id, name: p.name, color: v ? v.color || '' : '', size: v ? v.size || '' : '',
        price: price, qty: qty, disc: 0, discRaw: null, total: price * qty
      };
    });
    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const orderDiscount = o.orderDiscount || 0;
    const total = Math.max(0, subtotal - orderDiscount);
    const received = method === 'cash' ? Math.ceil(total / 50000) * 50000 : total;
    return {
      id: uid('sale'), no: pad(counter++, 4), ts: ts, day: dayKey(ts), items: items,
      subtotal: subtotal, itemDiscount: 0, orderDiscount: orderDiscount,
      orderDiscountRaw: orderDiscount ? { type: 'rp', value: orderDiscount } : null,
      total: total, method: method, received: received,
      change: method === 'cash' ? received - total : 0, voided: !!o.voided
    };
  };
  const nowMs = Date.now();
  const startToday = new Date();
  startToday.setHours(9, 0, 0, 0);
  const windowStart = Math.max(startToday.getTime(), nowMs - 7 * 3600 * 1000);
  const span = Math.max(40 * 60 * 1000, nowMs - 5 * 60 * 1000 - windowStart);
  const slot = (i, n) => new Date(windowStart + Math.round(span * i / Math.max(1, n - 1)));
  const methods = ['cash', 'qris', 'cash', 'card', 'cash', 'qris', 'transfer', 'card'];
  const pool = fresh.products.slice();
  const picks = [];
  const step = Math.max(1, Math.floor(pool.length / 8));
  for (let i = 0; i < pool.length && picks.length < 8; i += step) {
    picks.push(pool[i]);
  }
  const sales = [];
  picks.forEach((p, i) => {
    const v = pickVariant(p, i);
    const qty = (i % 3 === 0) ? 2 : 1;
    const method = methods[i % methods.length];
    sales.push(mkSale([[p, v, qty]], slot(i, picks.length), method, i === 3 ? { orderDiscount: 10000 } : null));
  });
  const voidedAt = Math.min(nowMs - 60000, windowStart + Math.round(span * 0.5));
  if (pool.length > 1) {
    sales.push(mkSale([[pool[pool.length - 1], pickVariant(pool[pool.length - 1], 1), 1]], new Date(voidedAt), 'cash', { voided: true }));
  }
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yAt = (h, m) => new Date(y.getFullYear(), y.getMonth(), y.getDate(), h, m);
  if (pool.length) {
    sales.push(mkSale([[pool[0], pickVariant(pool[0], 0), 1]], yAt(11, 20), 'cash'));
    sales.push(mkSale([[pool[Math.min(1, pool.length - 1)], pickVariant(pool[Math.min(1, pool.length - 1)], 1), 1]], yAt(13, 45), 'qris'));
    sales.push(mkSale([[pool[Math.min(2, pool.length - 1)], pickVariant(pool[Math.min(2, pool.length - 1)], 2), 2]], yAt(15, 10), 'cash', { orderDiscount: 10000 }));
    sales.push(mkSale([[pool[Math.min(3, pool.length - 1)], pickVariant(pool[Math.min(3, pool.length - 1)], 3), 1], [pool[Math.min(4, pool.length - 1)], pickVariant(pool[Math.min(4, pool.length - 1)], 4), 1]], yAt(17, 35), 'card'));
  }
  fresh.sales = sales;
  fresh.counter = counter;
  return fresh;
}

function renderSettings() {
  const body = $('#settings-body');
  const lowStockList = db.products.filter((p) => productStock(p) <= (db.prefs.lowStock || 0));
  const demoCount = db.products.filter((p) => p.demo).length;
  const used = (() => {
    try { return Math.round((localStorage.getItem(DB_KEY) || '').length / 1024); } catch (e) { return 0; }
  })();

  body.innerHTML =
    (APP_MODE === 'demo'
      ? '<div class="section"><div class="list-title">Demo</div>' +
        '<div class="banner good"><svg class="ico"><use href="#i-info"/></svg><div><strong>Demo build.</strong> Sample products and sales are loaded so you can show how selling works. Everything you tap stays in this browser — nothing is uploaded or charged.</div></div>' +
        '<div class="list" style="margin-top:12px"><button type="button" class="row tappable" data-role="resetdemo"><div class="row-icon" style="background:var(--orange-soft);color:var(--orange)"><svg class="ico"><use href="#i-warn"/></svg></div><div class="row-main"><div class="row-title">Reset demo data</div><div class="row-sub">Restore the sample products and sales</div></div><span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></button></div></div>'
      : '') +
    '<div class="section"><div class="list-title">Store</div><div class="list">' +
    '<button type="button" class="row tappable" data-role="brand"><div class="row-main"><div class="row-title">Brand name</div><div class="row-sub">' + esc(db.brand.name || 'Not set') + '</div></div><span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></button>' +
    '<button type="button" class="row tappable" data-role="tagline"><div class="row-main"><div class="row-title">Tagline</div><div class="row-sub">' + esc(db.brand.tagline || 'Not set') + '</div></div><span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></button>' +
    '<button type="button" class="row tappable" data-role="footer"><div class="row-main"><div class="row-title">Receipt footer</div><div class="row-sub">' + esc((db.brand.footer || '').split('\n')[0] || 'Not set') + '</div></div><span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></button>' +
    '<button type="button" class="row tappable" data-role="wa"><div class="row-main"><div class="row-title">WhatsApp number</div><div class="row-sub">' + esc(db.brand.wa || 'Not set') + '</div></div><span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></button>' +
    '<button type="button" class="row tappable" data-role="ig"><div class="row-main"><div class="row-title">Instagram</div><div class="row-sub">' + esc(db.brand.ig || 'Not set') + '</div></div><span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></button>' +
    '</div></div>' +

    '<div class="section"><div class="list-title">Payments</div><div class="list">' +
    '<button type="button" class="row tappable" data-role="bankname"><div class="row-main"><div class="row-title">Bank</div><div class="row-sub">' + esc(db.brand.bankName || 'Not set') + '</div></div><span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></button>' +
    '<button type="button" class="row tappable" data-role="bankaccount"><div class="row-main"><div class="row-title">Account number</div><div class="row-sub num">' + esc(db.brand.bankAccount || 'Not set') + '</div></div><span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></button>' +
    '<button type="button" class="row tappable" data-role="bankholder"><div class="row-main"><div class="row-title">Account holder</div><div class="row-sub">' + esc(db.brand.bankHolder || 'Not set') + '</div></div><span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></button>' +
    '<button type="button" class="row tappable" data-role="qris"><div class="row-main"><div class="row-title">QRIS code</div><div class="row-sub">' + (db.qris ? 'Uploaded' : 'Not uploaded') + '</div></div>' +
    (db.qris ? '<img src="' + db.qris + '" alt="" style="width:40px;height:40px;border-radius:8px;object-fit:cover">' : '<span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span>') + '</button>' +
    '</div></div>' +

    '<div class="section"><div class="list-title">Selling</div><div class="list" id="selling-list"></div>' +
    (lowStockList.length ? '<div class="banner warn" style="margin-top:12px"><svg class="ico"><use href="#i-warn"/></svg><div><strong>' + lowStockList.length + ' product' + (lowStockList.length > 1 ? 's' : '') + ' low or out of stock</strong><div style="margin-top:2px">' + esc(lowStockList.slice(0, 4).map((p) => p.name).join(', ')) + (lowStockList.length > 4 ? '…' : '') + '</div><button class="btn btn-gray" type="button" data-role="lowstock">Review stock</button></div></div>' : '') +
    '</div>' +

    '<div class="section"><div class="list-title">Products</div><div class="list">' +
    '<button type="button" class="row tappable" data-role="manage"><div class="row-icon"><svg class="ico"><use href="#i-box"/></svg></div><div class="row-main"><div class="row-title">Manage products</div><div class="row-sub">' + db.products.length + ' product' + (db.products.length === 1 ? '' : 's') + '</div></div><span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></button>' +
    '<button type="button" class="row tappable" data-role="newproduct"><div class="row-icon"><svg class="ico"><use href="#i-plus"/></svg></div><div class="row-main"><div class="row-title">Add product</div></div><span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></button>' +
    (demoCount ? '<button type="button" class="row tappable" data-role="cleardemo"><div class="row-icon" style="background:var(--orange-soft);color:var(--orange)"><svg class="ico"><use href="#i-trash"/></svg></div><div class="row-main"><div class="row-title">Remove sample products</div><div class="row-sub">' + demoCount + ' sample product' + (demoCount > 1 ? 's' : '') + ' still in your catalog</div></div><span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></button>' : '') +
    '</div></div>' +

    '<div class="section"><div class="list-title">Cloud sync (multi-device)</div><div class="list" id="sync-list"></div></div>' +

    '<div class="section"><div class="list-title">Printer</div><div class="list" id="printer-list"></div></div>' +

    '<div class="section"><div class="list-title">Appearance</div><div class="list"><div class="row"><div class="row-main"><div class="row-title">Theme</div></div><div class="segmented" id="theme-seg" style="width:210px"><span class="seg-ind"></span>' +
    '<button type="button" data-v="system">System</button><button type="button" data-v="light">Light</button><button type="button" data-v="dark">Dark</button></div></div></div></div>' +

    '<div class="section"><div class="list-title">Data</div><div class="list">' +
    '<button type="button" class="row tappable" data-role="backup"><div class="row-icon"><svg class="ico"><use href="#i-download"/></svg></div><div class="row-main"><div class="row-title">Export backup (JSON)</div><div class="row-sub">Products, sales, settings, photos</div></div><span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></button>' +
    '<button type="button" class="row tappable" data-role="restore"><div class="row-icon"><svg class="ico"><use href="#i-upload"/></svg></div><div class="row-main"><div class="row-title">Restore from backup</div><div class="row-sub">Replaces everything on this device</div></div><span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></button>' +
    '<button type="button" class="row tappable" data-role="excel"><div class="row-icon"><svg class="ico"><use href="#i-doc"/></svg></div><div class="row-main"><div class="row-title">Export to Excel (with photos)</div><div class="row-sub">Products + all sales, photos inside the file</div></div><span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></button>' +
    '<button type="button" class="row tappable" data-role="allcsv"><div class="row-icon"><svg class="ico"><use href="#i-doc"/></svg></div><div class="row-main"><div class="row-title">Export all sales (CSV)</div><div class="row-sub">' + db.sales.length + ' transaction' + (db.sales.length === 1 ? '' : 's') + '</div></div><span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></button>' +
    '<button type="button" class="row tappable" data-role="clearsales"><div class="row-icon" style="background:var(--red-soft);color:var(--red)"><svg class="ico"><use href="#i-trash"/></svg></div><div class="row-main"><div class="row-title" style="color:var(--red)">Clear sales history</div><div class="row-sub">Keeps products and settings</div></div></button>' +
    '<button type="button" class="row tappable" data-role="wipe"><div class="row-icon" style="background:var(--red-soft);color:var(--red)"><svg class="ico"><use href="#i-warn"/></svg></div><div class="row-main"><div class="row-title" style="color:var(--red)">Reset app</div><div class="row-sub">Deletes everything on this device</div></div></button>' +
    '</div></div>' +

    '<div class="section"><div class="list-title">About</div><div class="list">' +
    '<div class="row"><div class="row-main"><div class="row-title">Version</div></div><div class="row-value num">' + VERSION + '</div></div>' +
    '<div class="row"><div class="row-main"><div class="row-title">Storage used</div></div><div class="row-value num">' + used + ' KB</div></div>' +
    '</div>' +
    '<div class="banner" style="margin-top:12px"><svg class="ico"><use href="#i-info"/></svg><div><strong>Runs fully offline.</strong> Data is saved in this browser only. Export a backup after every event, and keep the app open in one tab while selling.</div></div>' +
    '<div class="banner" style="margin-top:12px"><svg class="ico"><use href="#i-bluetooth"/></svg><div><strong>Thermal printer:</strong> pair a 58 mm or 80 mm ESC/POS printer over Bluetooth in Chrome on Android. Test it from the Printer section above.</div></div>' +
    '</div>';

  const selling = $('#selling-list', body);
  selling.appendChild(toggleRow(PROMO.label + ' (' + PROMO.size + ')', promoOn(), (v) => { db.prefs.promo = v; save(); renderCart(); }, 'Every 4th ' + PROMO.size + ' bottle in a sale is free, any mix of scents'));
  selling.appendChild(toggleRow('Sell below zero stock', db.prefs.allowNegativeStock, (v) => { db.prefs.allowNegativeStock = v; save(); renderGrid(); }, 'Allow selling items that show 0 stock'));
  selling.appendChild(stepperRow('Low stock alert', db.prefs.lowStock, 0, 20, (v) => { db.prefs.lowStock = v; save(); renderGrid(); }, 'Highlight products with this much stock or less'));

  const printer = $('#printer-list', body);
  const printerRow = document.createElement('div');
  printerRow.className = 'row';
  printerRow.innerHTML = '<div class="row-icon"><svg class="ico"><use href="#i-bluetooth"/></svg></div><div class="row-main"><div class="row-title">Bluetooth printer</div><div class="row-sub">' + esc(bleState.name || (navigator.bluetooth ? 'Not connected' : 'Not supported on this browser')) + '</div></div>' +
    '<button type="button" class="text-btn" data-role="bt">' + (bleState.char ? 'Change' : 'Connect') + '</button>';
  $('[data-role="bt"]', printerRow).addEventListener('click', () => {
    bleConnect().then(() => { toast('Connected to ' + bleState.name, { icon: 'i-check' }); renderSettings(); }).catch((e) => { if (!/cancel/i.test(e && e.name)) toast(String(e.message || e), { icon: 'i-warn', error: true }); });
  });
  printer.appendChild(printerRow);
  const testRow = document.createElement('div');
  testRow.className = 'row';
  testRow.innerHTML = '<div class="row-icon"><svg class="ico"><use href="#i-printer"/></svg></div><div class="row-main"><div class="row-title">Test print</div><div class="row-sub">Sends a sample receipt to the printer</div></div><button type="button" class="text-btn" data-role="test">Print</button>';
  $('[data-role="test"]', testRow).addEventListener('click', () => {
    const fake = {
      no: 'TEST', ts: Date.now(), day: dayKey(Date.now()), method: 'cash', subtotal: 149000, itemDiscount: 0, orderDiscount: 0, total: 149000, received: 150000, change: 1000,
      items: [{ name: 'Test product', color: 'Black', size: 'L', qty: 1, price: 149000, disc: 0, total: 149000 }]
    };
    printThermal(fake);
  });
  printer.appendChild(testRow);
  const widthRow = document.createElement('div');
  widthRow.className = 'row';
  widthRow.innerHTML = '<div class="row-main"><div class="row-title">Paper width</div></div><div class="segmented" style="width:150px"><span class="seg-ind"></span>' +
    '<button type="button" data-v="58">58 mm</button><button type="button" data-v="80">80 mm</button></div>';
  segmented($('.segmented', widthRow), String(db.prefs.paperWidth), (v) => { db.prefs.paperWidth = Number(v); save(); });
  printer.appendChild(widthRow);

  const secList = document.createElement('div');
  secList.className = 'list';
  const pinRow = document.createElement('div');
  pinRow.className = 'row tappable';
  pinRow.innerHTML = '<div class="row-icon"><svg class="ico"><use href="#i-' + (lockOn() ? 'check' : 'info') + '"/></svg></div>' +
    '<div class="row-main"><div class="row-title">' + (lockOn() ? 'PIN lock is on' : 'Set a PIN') + '</div>' +
    '<div class="row-sub">' + (lockOn() ? 'Asked every time the app opens · ' + (db.lock.len || 4) + ' digits' : 'Only people with the PIN can open the till') + '</div></div>' +
    '<span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span>';
  secList.appendChild(pinRow);
  if (lockOn()) {
    const actions = document.createElement('div');
    actions.className = 'row';
    actions.style.gap = '10px';
    actions.innerHTML = '<button type="button" class="btn btn-gray" style="flex:1;min-height:42px;font-size:15px" data-role="chpin">Change PIN</button>' +
      '<button type="button" class="btn btn-destructive-tinted" style="flex:1;min-height:42px;font-size:15px" data-role="rmpin">Remove PIN</button>';
    secList.appendChild(actions);
    $('[data-role="chpin"]', actions).addEventListener('click', () => openPinSheet('change'));
    $('[data-role="rmpin"]', actions).addEventListener('click', () => openPinSheet('remove'));
  }
  pinRow.addEventListener('click', () => { if (!lockOn()) openPinSheet('set'); });
  const secSection = document.createElement('div');
  secSection.className = 'section';
  secSection.innerHTML = '<div class="list-title">Security</div>';
  secSection.appendChild(secList);
  const printerSection = $('#printer-list', body);
  if (printerSection) (printerSection.closest('.section') || printerSection).parentNode.insertBefore(secSection, (printerSection.closest('.section') || printerSection));

  const syncList = $('#sync-list', body);
  if (APP_MODE === 'demo') {
    const demoSection = syncList.closest('.section');
    if (demoSection) demoSection.remove();
  }
  const statusRow = document.createElement('div');
  statusRow.className = 'row';
  statusRow.innerHTML = '<div class="row-icon"' + (syncOn() ? ' style="background:var(--green-soft);color:var(--green)"' : '') + '><svg class="ico"><use href="#i-' + (syncOn() ? 'check' : 'info') + '"/></svg></div>' +
    '<div class="row-main"><div class="row-title">' + (syncOn() ? 'Connected' : 'Not connected') + '</div><div class="row-sub">' + esc(syncStatusText()) + '</div></div>' +
    '<button type="button" class="text-btn" data-role="syncnow"' + (syncOn() ? '' : ' disabled') + '>Sync now</button>';
  syncList.appendChild(statusRow);
  const setupRow = document.createElement('div');
  setupRow.className = 'row tappable';
  setupRow.innerHTML = '<div class="row-icon"><svg class="ico"><use href="#i-upload"/></svg></div><div class="row-main"><div class="row-title">' + (syncOn() ? 'Sync settings' : 'Connect this device') + '</div>' +
    '<div class="row-sub">' + (syncOn() ? 'booth ' + esc(db.sync.booth || '') + ' · phone #' + (db.sync.device || 1) : 'Tap Connect, then use the same code on every phone') + '</div></div>' +
    '<span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span>';
  syncList.appendChild(setupRow);
  if (syncOn()) {
    const offRow = document.createElement('div');
    offRow.className = 'row tappable';
    offRow.innerHTML = '<div class="row-icon" style="background:var(--red-soft);color:var(--red)"><svg class="ico"><use href="#i-x"/></svg></div><div class="row-main"><div class="row-title" style="color:var(--red)">Disconnect</div><div class="row-sub">Stops syncing on this phone, keeps its data</div></div>';
    syncList.appendChild(offRow);
    offRow.addEventListener('click', () => {
      dialog({ title: 'Disconnect cloud sync?', message: 'This phone keeps its data but stops sharing it.', okLabel: 'Disconnect', destructive: true }).then((ok) => {
        if (!ok) return;
        db.sync.url = '';
        db.sync.key = '';
        db.sync.booth = '';
        db.sync.lastSync = 0;
        db.sync.lastError = '';
        save(true);
        renderSettings();
      });
    });
  }
  statusRow.querySelector('[data-role="syncnow"]').addEventListener('click', () => { haptic(8); syncNow({ toast: true }); });
  setupRow.addEventListener('click', () => openSyncSetup());

  const themeSeg = $('#theme-seg', body);
  segmented(themeSeg, db.prefs.theme, (v) => {
    db.prefs.theme = v;
    applyTheme();
    save();
  });

  const bind = (role, fn) => { const n = $('[data-role="' + role + '"]', body); if (n) n.addEventListener('click', fn); };
  bind('brand', () => openTextSheet('Brand name', db.brand.name, { placeholder: 'e.g. NOIR Studio', hint: 'Shown on receipts' }).then((v) => { if (v != null) { db.brand.name = v; save(); renderSettings(); } }));
  bind('tagline', () => openTextSheet('Tagline', db.brand.tagline, { placeholder: 'e.g. Extrait de Parfum' }).then((v) => { if (v != null) { db.brand.tagline = v; save(); renderSettings(); } }));
  bind('footer', () => openTextSheet('Receipt footer', db.brand.footer, { placeholder: 'Thank you!', multiline: true, hint: 'Shown at the bottom of every receipt' }).then((v) => { if (v != null) { db.brand.footer = v; save(); renderSettings(); } }));
  bind('wa', () => openTextSheet('WhatsApp number', db.brand.wa, { placeholder: '08xxxxxxxxxx', inputmode: 'tel' }).then((v) => { if (v != null) { db.brand.wa = v; save(); renderSettings(); } }));
  bind('ig', () => openTextSheet('Instagram handle', db.brand.ig, { placeholder: 'yourbrand' }).then((v) => { if (v != null) { db.brand.ig = v; save(); renderSettings(); } }));
  bind('bankname', () => openTextSheet('Bank name', db.brand.bankName, { placeholder: 'BCA / Mandiri / BNI' }).then((v) => { if (v != null) { db.brand.bankName = v; save(); renderSettings(); } }));
  bind('bankaccount', () => openTextSheet('Account number', db.brand.bankAccount, { placeholder: '1234567890', inputmode: 'numeric' }).then((v) => { if (v != null) { db.brand.bankAccount = v; save(); renderSettings(); } }));
  bind('bankholder', () => openTextSheet('Account holder', db.brand.bankHolder, { placeholder: 'Name on the account' }).then((v) => { if (v != null) { db.brand.bankHolder = v; save(); renderSettings(); } }));
  bind('qris', () => {
    if (db.qris) {
      const wrap = document.createElement('div');
      wrap.innerHTML = '<div class="list"><div class="row" style="justify-content:center;padding:16px"><img src="' + db.qris + '" alt="QRIS" style="width:min(280px,70vw);border-radius:12px"></div></div>';
      const footer = document.createElement('div');
      footer.style.display = 'flex';
      footer.style.gap = '10px';
      footer.style.width = '100%';
      footer.innerHTML = '<button type="button" class="btn btn-destructive-tinted" data-role="rm" style="flex:1">Remove</button><button type="button" class="btn btn-gray" data-role="replace" style="flex:1">Replace</button>';
      const sheet = openSheet({ title: 'QRIS code', body: wrap, footer: footer });
      $('[data-role="rm"]', sheet.el).addEventListener('click', () => { db.qris = null; save(); sheet.close(); renderSettings(); });
      $('[data-role="replace"]', sheet.el).addEventListener('click', () => { sheet.close(); pickImage().then((img) => { if (img) { db.qris = img; save(); renderSettings(); toast('QRIS updated', { icon: 'i-check' }); } }); });
      return;
    }
    pickImage().then((img) => { if (img) { db.qris = img; save(); renderSettings(); toast('QRIS code added', { icon: 'i-check' }); } });
  });
  bind('manage', () => openProductManager());
  bind('newproduct', () => openProductEditor(null));
  bind('resetdemo', () => {
    dialog({ title: 'Reset demo data?', message: 'Sample products and sales will be restored.', okLabel: 'Reset', destructive: true }).then((ok) => {
      if (!ok) return;
      db = demoSeed();
      save(true);
      cart = [];
      renderAll();
      toast('Demo data restored', { icon: 'i-check' });
    });
  });
  bind('lowstock', () => openProductManager());
  bind('cleardemo', () => {
    dialog({ title: 'Remove sample products?', message: 'They will be deleted from your catalog.', okLabel: 'Remove', destructive: true }).then((ok) => {
      if (!ok) return;
      db.products = db.products.filter((p) => !p.demo);
      save(true);
      renderGrid();
      renderChips();
      renderSettings();
      toast('Sample products removed', { icon: 'i-check' });
    });
  });
  bind('backup', () => {
    const backup = JSON.parse(JSON.stringify(db));
    delete backup.sync;
    const payload = JSON.stringify(backup);
    const name = 'pos-backup-' + dayKey(Date.now()) + '.json';
    const file = new File([payload], name, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: name }).catch(() => download(name, payload, 'application/json'));
    } else {
      download(name, payload, 'application/json');
      toast('Backup downloaded', { icon: 'i-check' });
    }
  });
  bind('restore', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        let parsed;
        try { parsed = JSON.parse(String(reader.result)); } catch (e) { toast('That file is not a valid backup', { icon: 'i-warn', error: true }); return; }
        if (!parsed || !Array.isArray(parsed.products)) { toast('That file is not a valid backup', { icon: 'i-warn', error: true }); return; }
        dialog({ title: 'Restore this backup?', message: parsed.products.length + ' products and ' + ((parsed.sales || []).length) + ' sales will replace everything on this device.', okLabel: 'Restore', destructive: true }).then((ok) => {
          if (!ok) return;
          db = Object.assign(defaultDB(), parsed);
          db.brand = Object.assign(defaultDB().brand, parsed.brand || {});
          db.prefs = Object.assign(defaultDB().prefs, parsed.prefs || {});
          save(true);
          applyTheme();
          cart = [];
          renderAll();
          toast('Backup restored', { icon: 'i-check' });
        });
      };
      reader.readAsText(file);
    });
    input.click();
  });
  bind('allcsv', () => exportCSV(null));
  bind('excel', () => exportExcel({}));
  bind('clearsales', () => {
    dialog({ title: 'Clear sales history?', message: 'Reports and transaction history will be empty. Products and stock are kept.', okLabel: 'Clear', destructive: true }).then((ok) => {
      if (!ok) return;
      db.sales = [];
      db.counter = 1;
      save(true);
      renderReports();
      renderSettings();
      toast('Sales history cleared', { icon: 'i-check' });
    });
  });
  bind('wipe', () => {
    dialog({ title: 'Reset the app?', message: APP_MODE === 'demo' ? 'Sample products and sales will be restored.' : 'This deletes products, sales and settings on this device. Export a backup first if you need one.', okLabel: 'Reset everything', destructive: true }).then((ok) => {
      if (!ok) return;
      localStorage.removeItem(DB_KEY);
      db = APP_MODE === 'demo' ? demoSeed() : defaultDB();
      cart = [];
      save(true);
      renderAll();
      if (APP_MODE === 'demo') toast('Demo data restored', { icon: 'i-check' });
      else showOnboarding();
    });
  });
}

function pickImage() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) { resolve(null); return; }
      compressImage(file).then(resolve).catch(() => { toast('Could not read that image. Try a JPEG or PNG.', { icon: 'i-warn', error: true }); resolve(null); });
    });
    input.click();
  });
}
function compressImage(file, maxSize, quality) {
  const max = maxSize || 700;
  const q = quality || 0.72;
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', q));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')); };
    img.src = url;
  });
}

function openProductManager() {
  const wrap = document.createElement('div');
  const render = () => {
    if (!db.products.length) {
      wrap.innerHTML = '<div class="list"><div class="empty-state" style="padding:40px 20px"><div class="empty-icon"><svg class="ico"><use href="#i-box"/></svg></div><h3>No products yet</h3><p>Add products with their sizes, colors and stock.</p></div></div>';
      return;
    }
    wrap.innerHTML = '<div class="list">' + db.products.map((p) => {
      const stock = productStock(p);
      const low = stock <= (db.prefs.lowStock || 0);
      return '<button type="button" class="row line-item tappable" data-pid="' + p.id + '" style="min-height:68px">' +
        thumbHtml(p, 'li-thumb') +
        '<div class="row-main"><div class="row-title" style="font-size:16px">' + esc(p.name) + '</div>' +
        '<div class="row-sub">' + rp(p.price) + ' · ' + p.variants.length + ' variant' + (p.variants.length === 1 ? '' : 's') + ' · <span style="color:' + (stock <= 0 ? 'var(--red)' : low ? 'var(--orange)' : 'inherit') + '">' + stock + ' in stock</span></div></div>' +
        '<span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></button>';
    }).join('') + '</div>';
    $$('[data-pid]', wrap).forEach((b) => b.addEventListener('click', () => openProductEditor(db.products.find((p) => p.id === b.dataset.pid), { onDone: render })));
  };
  const footer = document.createElement('button');
  footer.type = 'button';
  footer.className = 'btn btn-primary btn-xl';
  footer.innerHTML = '<svg class="ico"><use href="#i-plus"/></svg>Add product';
  const sheet = openSheet({ title: 'Products', sub: db.products.length + ' items · tap to edit', full: true, body: wrap, footer: footer });
  render();
  footer.addEventListener('click', () => openProductEditor(null, { onDone: render }));
}

function openProductEditor(product, opts) {
  const isNew = !product;
  const done = () => { if (opts && opts.onDone) opts.onDone(); };
  const draft = product
    ? JSON.parse(JSON.stringify(product))
    : { id: uid('p'), name: '', price: 0, cost: 0, category: '', image: null, variants: [] };
  const soldAtOpen = {};
  (draft.variants || []).forEach((v) => { soldAtOpen[v.id] = soldFor(draft.id, v.color, v.size); });
  const soldOf = (v) => Number(soldAtOpen[v.id] || 0);
  const wrap = document.createElement('div');

  const render = () => {
    wrap.innerHTML =
      '<div class="list"><div class="row"><div class="thumb-picker" style="width:100%">' +
      '<div class="thumb-preview">' + (draft.image ? '<img src="' + draft.image + '" alt="">' : '<svg class="ico lg"><use href="#i-image"/></svg>') + '</div>' +
      '<div class="thumb-actions">' +
      '<button type="button" class="btn btn-gray" data-role="pic"><svg class="ico"><use href="#i-camera"/></svg>' + (draft.image ? 'Change photo' : 'Add photo') + '</button>' +
      (draft.image ? '<button type="button" class="btn btn-destructive-tinted" data-role="rmpic">Remove photo</button>' : '') +
      '</div></div></div></div>' +

      '<div class="list">' +
      '<div class="row"><div class="row-main"><div class="row-sub">Name</div><input class="text-input" style="text-align:left;font-size:18px;font-weight:600" data-role="name" placeholder="Product name" value="' + esc(draft.name) + '"></div></div>' +
      '<div class="row"><div class="row-main"><div class="row-sub">Price (Rp)</div><input class="text-input" style="text-align:left;font-size:18px" inputmode="numeric" data-role="price" placeholder="0" value="' + (draft.price ? fmtDigits(draft.price) : '') + '"></div></div>' +
      '<div class="row"><div class="row-main"><div class="row-sub">Cost (Rp) — optional</div><input class="text-input" style="text-align:left" inputmode="numeric" data-role="cost" placeholder="0" value="' + (draft.cost ? fmtDigits(draft.cost) : '') + '"></div></div>' +
      '<div class="row"><div class="row-main"><div class="row-sub">Category</div><input class="text-input" style="text-align:left" data-role="cat" list="cat-list" placeholder="e.g. Tops" value="' + esc(draft.category || '') + '">' +
      '<datalist id="cat-list">' + categories().map((c) => '<option value="' + esc(c) + '">').join('') + '</datalist></div></div>' +
      '</div>' +

      '<div class="section"><div class="list-title">Variants · color, size, stock, price</div><div class="variant-editor">' +
      '<div class="v-edit-row head"><span>Color</span><span>Size</span><span>Stock</span><span>Price</span><span></span></div>' +
      draft.variants.map((v, i) =>
        '<div class="v-edit-row" data-i="' + i + '">' +
        '<input data-f="color" placeholder="Black" value="' + esc(v.color || '') + '">' +
        '<input data-f="size" placeholder="M" value="' + esc(v.size || '') + '">' +
        '<input data-f="stock" inputmode="numeric" placeholder="0" value="' + (v.stock === '' || v.stock == null ? '' : Math.max(0, (Number(v.stock) || 0) - soldOf(v))) + '">' +
        '<input data-f="price" inputmode="numeric" placeholder="—" value="' + (v.price ? fmtDigits(v.price) : '') + '">' +
        '<button type="button" class="del" aria-label="Remove variant"><svg class="ico"><use href="#i-x"/></svg></button>' +
        '</div>'
      ).join('') +
      '</div>' +
      '<button type="button" class="btn btn-tinted btn-xl" data-role="addv" style="margin-top:12px"><svg class="ico"><use href="#i-plus"/></svg>Add variant</button>' +
      '<div class="kbd-hint" style="padding-top:8px">Stock = what you counted; sold units are subtracted automatically. Leave Price empty to use the product price. ' + draft.variants.length + ' variant' + (draft.variants.length === 1 ? '' : 's') + ' so far.</div>' +
      '</div>' +
      (!isNew ? '<div class="section"><button type="button" class="btn btn-destructive-tinted btn-xl" data-role="del"><svg class="ico"><use href="#i-trash"/></svg>Delete product</button></div>' : '');

    const read = (sel) => $(sel, wrap);
    read('[data-role="name"]').addEventListener('input', (e) => { draft.name = e.target.value; });
    read('[data-role="price"]').addEventListener('input', (e) => { draft.price = digitsToNumber(e.target.value); e.target.value = fmtDigits(e.target.value); });
    read('[data-role="cost"]').addEventListener('input', (e) => { draft.cost = digitsToNumber(e.target.value); e.target.value = fmtDigits(e.target.value); });
    read('[data-role="cat"]').addEventListener('input', (e) => { draft.category = e.target.value; });
    read('[data-role="pic"]').addEventListener('click', () => {
      pickImage().then((img) => { if (img) { draft.image = img; render(); } });
    });
    const rmpic = read('[data-role="rmpic"]');
    if (rmpic) rmpic.addEventListener('click', () => { draft.image = null; render(); });
    read('[data-role="addv"]').addEventListener('click', () => {
      const last = draft.variants[draft.variants.length - 1];
      draft.variants.push({ id: uid('v'), color: last ? last.color : '', size: last ? nextSize(last.size) : 'M', stock: '' });
      haptic(8);
      render();
      const rows = $$('.v-edit-row', wrap);
      const input = $('input', rows[rows.length - 1]);
      if (input) input.focus();
    });
    $$('.v-edit-row input', wrap).forEach((inp) => {
      inp.addEventListener('input', () => {
        const i = Number(inp.closest('.v-edit-row').dataset.i);
        const f = inp.dataset.f;
        if (!draft.variants[i]) return;
        if (f === 'stock') {
          draft.variants[i].stock = digitsToNumber(inp.value) + soldOf(draft.variants[i]);
          const clean = inp.value.replace(/[^\d]/g, '');
          if (clean !== inp.value) inp.value = clean;
        } else if (f === 'price') {
          const num = digitsToNumber(inp.value);
          if (num > 0) draft.variants[i].price = num;
          else delete draft.variants[i].price;
          const formatted = num > 0 ? fmtDigits(num) : '';
          if (formatted !== inp.value) inp.value = formatted;
        } else draft.variants[i][f] = inp.value;
      });
    });
    $$('.v-edit-row .del', wrap).forEach((b) => b.addEventListener('click', () => {
      const i = Number(b.closest('.v-edit-row').dataset.i);
      draft.variants.splice(i, 1);
      haptic(10);
      render();
    }));
    const del = read('[data-role="del"]');
    if (del) del.addEventListener('click', () => {
      dialog({ title: 'Delete ' + (draft.name || 'this product') + '?', message: 'It will be removed from your catalog.', okLabel: 'Delete', destructive: true }).then((ok) => {
        if (!ok) return;
        db.products = db.products.filter((p) => p.id !== draft.id);
        cart = cart.filter((l) => l.pid !== draft.id);
        save(true);
        syncDeleteProduct(draft.id);
        sheet.close();
        done();
        renderGrid();
        renderChips();
        renderCart();
        renderSettings();
        toast('Product deleted', { icon: 'i-check' });
      });
    });
  };

  const footer = document.createElement('button');
  footer.type = 'button';
  footer.className = 'btn btn-primary btn-xl';
  footer.textContent = isNew ? 'Add product' : 'Save changes';
  const sheet = openSheet({ title: isNew ? 'New product' : 'Edit product', sub: isNew ? 'Sells in seconds at the booth' : draft.name, full: true, body: wrap, footer: footer });
  render();

  footer.addEventListener('click', () => {
    if (!draft.name.trim()) { toast('Give the product a name', { icon: 'i-warn', error: true }); return; }
    if (!draft.variants.length) { toast('Add at least one variant', { icon: 'i-warn', error: true }); return; }
    draft.variants = draft.variants.map((v) => {
      const out = {
        id: v.id || uid('v'),
        color: String(v.color || '').trim(),
        size: String(v.size || '').trim(),
        stock: Number(v.stock) || 0
      };
      if (Number(v.price)) out.price = Number(v.price);
      return out;
    });
    const dup = new Set();
    for (const v of draft.variants) {
      const key = v.color + '|' + v.size;
      if (dup.has(key)) { toast('Duplicate variant: ' + [v.color, v.size].filter(Boolean).join(' / '), { icon: 'i-warn', error: true }); return; }
      dup.add(key);
    }
    draft.dirty = true;
    draft.updatedAt = new Date().toISOString();
    if (isNew) db.products.push(draft);
    else db.products = db.products.map((p) => (p.id === draft.id ? draft : p));
    save(true);
    syncNow({});
    renderGrid();
    renderChips();
    renderCart();
    renderSettings();
    toast(isNew ? 'Product added' : 'Changes saved', { icon: 'i-check' });
    sheet.close();
    done();
  });
}

function applyTheme() {
  const t = db.prefs.theme;
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
  else delete document.documentElement.dataset.theme;
}

function showOnboarding() {
  const root = $('#onboarding');
  root.hidden = false;
  const productCount = db.products.length;
  root.innerHTML =
    '<div class="onboard-inner">' +
    '<div class="onboard-logo"><svg class="ico"><use href="#i-bag"/></svg></div>' +
    '<h1>Your booth,<br>ready in a minute</h1>' +
    '<p class="lede">A fast point of sale that works with no internet. Everything is stored on this device.</p>' +
    '<div class="field-group">' +
    '<div class="field-row"><label>Brand</label><input id="ob-name" placeholder="Your brand name" autocomplete="organization" value="' + esc(db.brand.name || '') + '"></div>' +
    '<div class="field-row"><label>WhatsApp</label><input id="ob-wa" placeholder="08xxxxxxxxxx" inputmode="tel" value="' + esc(db.brand.wa || '') + '"></div>' +
    '</div>' +
    '<div class="hint" style="font-size:13px;color:var(--label-2)">You can change these later in Settings.' +
    (productCount ? ' ' + productCount + ' products are already loaded and ready to sell.' : ' Sample products will be added so you can try it right away.') +
    '</div>' +
    '<button type="button" class="btn btn-primary btn-xl" id="ob-start">Start selling</button>' +
    '<div class="kbd-hint">Tip: add this to your home screen for a full-screen app.</div>' +
    '</div>';
  $('#ob-start').addEventListener('click', () => {
    db.brand.name = $('#ob-name').value.trim() || BRAND_NAME;
    db.brand.wa = $('#ob-wa').value.trim();
    if (!db.seeded) {
      const seeded = catalogProducts();
      db.products = seeded && seeded.length ? seeded : sampleProducts();
      db.seeded = true;
    }
    db.onboarded = true;
    save(true);
    root.hidden = true;
    renderAll();
    toast('You are ready to sell', { icon: 'i-check' });
  });
  setTimeout(() => { const n = $('#ob-name'); if (n) n.focus(); }, 300);
}

function renderAll() {
  applyTheme();
  renderChips();
  renderGrid();
  renderCart();
  renderTabBadge();
  updateCartbar();
  renderReports();
  renderSettings();
}

const SYNC_TIMEOUT = 12000;

function syncOn() {
  const c = db.sync;
  return !!(c && c.url && c.key && c.booth);
}

function syncBase() {
  return String(db.sync.url || '').trim().replace(/\/+$/, '');
}

function syncFetch(path, opts) {
  const c = db.sync;
  const key = String(c.key || '').trim();
  const headers = Object.assign({
    apikey: key,
    'Content-Type': 'application/json',
    'x-sync-key': c.booth
  }, (opts && opts.headers) || {});
  if (key.startsWith('eyJ')) headers.Authorization = 'Bearer ' + key;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), SYNC_TIMEOUT);
  return fetch(syncBase() + '/rest/v1/' + path, Object.assign({}, opts, { headers: headers, signal: ctrl.signal }))
    .then((res) => { clearTimeout(timer); return res; })
    .catch((err) => { clearTimeout(timer); throw err; });
}

function pushBody(rows) {
  return JSON.stringify(rows);
}

async function syncPush() {
  if (!syncOn()) return { ok: false, reason: 'off' };
  const booth = db.sync.booth;
  const dirtyProducts = db.products.filter((p) => p.dirty);
  const pendingSales = db.sales.filter((s) => !s.syncedAt || s.dirty);
  const jobs = [];
  if (dirtyProducts.length) {
    jobs.push(syncFetch('pos_products?on_conflict=booth,id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: pushBody(dirtyProducts.map((p) => ({ booth: booth, id: p.id, data: p, updated_at: new Date().toISOString() })))
    }));
  }
  if (pendingSales.length) {
    jobs.push(syncFetch('pos_sales?on_conflict=booth,id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: pushBody(pendingSales.map((s) => ({
        booth: booth, id: s.id, data: s,
        created_at: new Date(s.ts || Date.now()).toISOString(),
        updated_at: new Date().toISOString()
      })))
    }));
  }
  const results = await Promise.all(jobs);
  const bad = results.filter((r) => !r.ok);
  if (bad.length) throw new Error('push failed (' + bad.map((r) => r.status).join(', ') + ')');
  dirtyProducts.forEach((p) => { delete p.dirty; p.updatedAt = new Date().toISOString(); });
  pendingSales.forEach((s) => { s.syncedAt = Date.now(); delete s.dirty; });
  save(true);
  return { ok: true, products: dirtyProducts.length, sales: pendingSales.length };
}

function syncSince() {
  const since = db.sync && db.sync.lastPull ? String(db.sync.lastPull) : '';
  return since ? '&updated_at=gt.' + encodeURIComponent(since) : '';
}

async function syncPull() {
  if (!syncOn()) return { ok: false, reason: 'off' };
  const booth = encodeURIComponent(db.sync.booth);
  const filter = syncSince();
  const res = await Promise.all([
    syncFetch('pos_products?select=id,data,updated_at&booth=eq.' + booth + filter),
    syncFetch('pos_sales?select=id,data,updated_at&booth=eq.' + booth + filter)
  ]);
  if (!res[0].ok || !res[1].ok) throw new Error('pull failed (' + res[0].status + ', ' + res[1].status + ')');
  const remoteProducts = await res[0].json();
  const remoteSales = await res[1].json();
  let added = 0;
  let updated = 0;
  let salesAdded = 0;
  const tombstones = db.deletedProducts || [];
  remoteProducts.forEach((row) => {
    if (tombstones.some((t) => t.id === row.id)) return;
    const local = db.products.find((x) => x.id === row.id);
    if (!local) {
      db.products.push(row.data);
      added += 1;
      return;
    }
    if (local.dirty) return;
    const localTime = Date.parse(local.updatedAt || 0) || 0;
    const remoteTime = Date.parse(row.updated_at || 0) || 0;
    if (remoteTime > localTime) {
      const idx = db.products.findIndex((x) => x.id === row.id);
      db.products[idx] = row.data;
      updated += 1;
    }
  });
  remoteSales.forEach((row) => {
    const local = db.sales.find((x) => x.id === row.id);
    if (!local) {
      db.sales.push(row.data);
      salesAdded += 1;
    } else if (row.data && row.data.voided && !local.voided) {
      local.voided = true;
      local.voidedAt = row.data.voidedAt;
      local.dirty = true;
    }
  });
  let newest = db.sync.lastPull || '';
  remoteProducts.concat(remoteSales).forEach((row) => {
    const ts = row && row.updated_at ? String(row.updated_at) : '';
    if (ts && ts > newest) newest = ts;
  });
  db.sync.lastPull = newest;
  if (added || updated || salesAdded) {
    invalidateStock();
  }
  save(true);
  return { ok: true, added: added, updated: updated, salesAdded: salesAdded };
}

let syncBusy = false;

async function syncNow(opts) {
  const o = opts || {};
  if (!syncOn()) {
    if (o.toast) toast('Set up cloud sync first in Settings', { icon: 'i-info' });
    return { ok: false, reason: 'off' };
  }
  if (syncBusy) return { ok: false, reason: 'busy' };
  syncBusy = true;
  try {
    await syncPush();
    const pulled = await syncPull();
    db.sync.lastSync = Date.now();
    db.sync.lastError = '';
    save(true);
    invalidateStock();
    renderGrid();
    renderChips();
    renderCart();
    renderTabBadge();
    if (activeTab === 'reports') renderReports();
    if (activeTab === 'settings') renderSettings();
    if (o.toast) toast('Synced', { icon: 'i-check' });
    return Object.assign({ ok: true }, pulled);
  } catch (err) {
    db.sync.lastError = String((err && err.message) || err);
    save();
    if (activeTab === 'settings') renderSettings();
    if (o.toast) toast('Sync failed · ' + db.sync.lastError, { icon: 'i-warn', error: true });
    return { ok: false, reason: 'error', error: db.sync.lastError };
  } finally {
    syncBusy = false;
  }
}

function syncStatusText() {
  if (!syncOn()) return 'Not connected';
  const pending = db.products.filter((p) => p.dirty).length + db.sales.filter((s) => !s.syncedAt || s.dirty).length;
  if (db.sync.lastError) return 'Error · ' + db.sync.lastError;
  if (db.sync.lastSync) return 'Last sync ' + fmtTime(db.sync.lastSync) + (pending ? ' · ' + pending + ' pending' : ' · up to date');
  return pending ? pending + ' waiting to sync' : 'Connected';
}

function randomBoothCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 20; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

function openSyncSetup() {
  const c = db.sync;
  const wrap = document.createElement('div');
  let device = Number(c.device) || 1;
  const render = () => {
    wrap.innerHTML =
      '<div class="banner"><svg class="ico"><use href="#i-info"/></svg><div>Tap <strong>Connect</strong>. The first phone creates a <strong>booth code</strong> — type that same code on every other phone so they share the same stock and sales.</div></div>' +
      '<div class="list">' +
      '<div class="row"><div class="row-main"><div class="row-sub">Booth code (same on every phone)</div><input class="text-input" style="text-align:left;text-transform:uppercase" data-role="booth" placeholder="leave empty to create one" value="' + esc(c.booth || '') + '"></div>' +
      '<button type="button" class="text-btn" data-role="copybooth">Copy</button>' +
      '<button type="button" class="text-btn" data-role="sharebooth" aria-label="Send code"><svg class="ico sm"><use href="#i-chat"/></svg></button></div>' +
      '<button type="button" class="row tappable" data-role="advanced" style="width:100%"><div class="row-main"><div class="row-title" style="font-size:16px">Advanced</div><div class="row-sub">Project URL and key</div></div><span class="row-chev"><svg class="ico"><use href="#i-chev-r"/></svg></span></button>' +
      '</div>' +
      '<div class="list" data-role="advbox" hidden>' +
      '<div class="row"><div class="row-main"><div class="row-sub">Project URL</div><input class="text-input" style="text-align:left;font-size:14px" data-role="url" placeholder="https://xxxx.supabase.co" value="' + esc(c.url || '') + '"></div></div>' +
      '<div class="row"><div class="row-main"><div class="row-sub">Anon public key</div><input class="text-input" style="text-align:left;font-size:13px" data-role="key" placeholder="eyJhbGciOi..." value="' + esc(c.key || '') + '"></div></div>' +
      '</div>' +
      '<div class="row"><div class="row-main"><div class="row-title">This phone\'s number</div><div class="row-sub">Used to label receipts from each phone</div></div>' +
      '<div class="stepper"><button type="button" data-d="-1" aria-label="Decrease"><svg class="ico"><use href="#i-minus"/></svg></button><span class="val">' + device + '</span><button type="button" data-d="1" aria-label="Increase"><svg class="ico"><use href="#i-plus"/></svg></button></div></div>' +
      '</div>' +
      '<div class="kbd-hint" style="padding-top:8px">Data lives on this device first and syncs when online — the booth keeps working with no internet.</div>';
    $$('.stepper button', wrap).forEach((b) => b.addEventListener('click', () => {
      device = clamp(device + Number(b.dataset.d), 1, 9);
      haptic(6);
      render();
    }));
    $('[data-role="advanced"]', wrap).addEventListener('click', () => {
      const box = $('[data-role="advbox"]', wrap);
      box.hidden = !box.hidden;
      haptic(6);
    });
    $('[data-role="copybooth"]', wrap).addEventListener('click', () => {
      const val = $('[data-role="booth"]', wrap).value.trim();
      if (!val) { toast('Connect first to create a code', { icon: 'i-info' }); return; }
      copyText(val).then(() => toast('Booth code copied', { icon: 'i-check' }));
    });
    $('[data-role="sharebooth"]', wrap).addEventListener('click', () => {
      const val = $('[data-role="booth"]', wrap).value.trim();
      if (!val) { toast('Connect first to create a code', { icon: 'i-info' }); return; }
      const link = location.href.split('?')[0].split('#')[0];
      const msg = 'SEMU POS\n\n1. Open ' + link + '\n2. Add to Home Screen\n3. Settings > Cloud sync\n4. Booth code: ' + val + '\n5. Pick your own phone number, then Save & sync';
      window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
    });
  };
  const footer = document.createElement('div');
  footer.style.display = 'flex';
  footer.style.gap = '10px';
  footer.style.width = '100%';
  footer.innerHTML = '<button type="button" class="btn btn-gray" style="flex:1" data-role="cancel">Cancel</button><button type="button" class="btn btn-primary" style="flex:1" data-role="save">Save &amp; sync</button>';
  const sheet = openSheet({ title: 'Cloud sync', sub: 'Share stock and sales between phones', full: true, body: wrap, footer: footer });
  render();
  $('[data-role="cancel"]', sheet.el).addEventListener('click', () => sheet.close());
  $('[data-role="save"]', sheet.el).addEventListener('click', () => {
    const url = $('[data-role="url"]', wrap).value.trim() || SYNC_DEFAULTS.url;
    const key = $('[data-role="key"]', wrap).value.trim() || SYNC_DEFAULTS.key;
    const booth = $('[data-role="booth"]', wrap).value.trim().toUpperCase() || randomBoothCode();
    if (!url || !key) { toast('Project URL and key are required — tap Advanced', { icon: 'i-warn', error: true }); return; }
    db.sync.url = url;
    db.sync.key = key;
    db.sync.booth = booth;
    db.sync.device = device;
    db.sync.lastPull = '';
    db.products.forEach((p) => { p.dirty = true; });
    save(true);
    sheet.close();
    toast('Connecting…', { icon: 'i-bluetooth' });
    syncNow({ toast: true }).then((r) => {
      renderSettings();
      if (r && r.ok) {
        renderGrid();
        toast('Connected · code ' + booth, { icon: 'i-check', duration: 4000 });
      }
    });
  });
}

async function syncDeleteProduct(id) {
  db.deletedProducts = (db.deletedProducts || []).concat([{ id: id, at: Date.now() }]);
  save(true);
  if (syncOn()) {
    try {
      await syncFetch('pos_products?booth=eq.' + encodeURIComponent(db.sync.booth) + '&id=eq.' + encodeURIComponent(id), { method: 'DELETE' });
    } catch (e) {}
  }
  syncNow({});
}

let appUnlocked = false;
let hiddenSince = 0;

function lockOn() {
  return !!(db.lock && db.lock.enabled && db.lock.hash);
}

function simpleHash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return 'fnv' + h.toString(16);
}

function hashPin(pin) {
  if (!db.lock.salt) db.lock.salt = uid('pin');
  const data = db.lock.salt + ':' + pin;
  if (window.crypto && crypto.subtle && crypto.subtle.digest && window.TextEncoder) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(data))
      .then((buf) => 'sha' + Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join(''))
      .catch(() => simpleHash(data));
  }
  return Promise.resolve(simpleHash(data));
}

function setPin(pin) {
  return hashPin(pin).then((hash) => {
    db.lock.hash = hash;
    db.lock.len = pin.length;
    db.lock.enabled = true;
    appUnlocked = true;
    save(true);
  });
}

function verifyPin(pin) {
  if (!lockOn()) return Promise.resolve(true);
  return hashPin(pin).then((hash) => hash === db.lock.hash);
}

function showLockScreen() {
  if (!lockOn() || appUnlocked) return false;
  let pin = '';
  const root = $('#overlay-root');
  const screen = document.createElement('div');
  screen.className = 'lock-screen';
  const len = db.lock.len || 4;

  const render = () => {
    screen.innerHTML =
      '<div class="lock-head">' +
      '<div class="onboard-logo" style="width:66px;height:66px;border-radius:20px;margin:0"><svg class="ico" style="width:30px;height:30px;stroke-width:1.6"><use href="#i-bag"/></svg></div>' +
      '<div class="lock-title">' + esc(db.brand.name || BRAND_NAME) + '</div>' +
      '<div class="lock-sub">Enter your PIN to open the till</div>' +
      '</div>' +
      '<div class="lock-dots" data-role="dots">' +
      Array.from({ length: len }).map((x, i) => '<span class="lock-dot' + (i < pin.length ? ' on' : '') + '"></span>').join('') +
      '</div>' +
      '<div data-role="keys"></div>';
    const keys = $('[data-role="keys"]', screen);
    const pad = keypad({
      onKey: (k) => {
        if (pin.length >= len) return;
        pin += k;
        haptic(6);
        render();
        if (pin.length === len) submit();
      },
      onDelete: () => {
        pin = pin.slice(0, -1);
        render();
      }
    });
    pad.classList.add('lock');
    keys.appendChild(pad);
  };

  const submit = () => {
    verifyPin(pin).then((ok) => {
      if (ok) {
        appUnlocked = true;
        haptic(14);
        screen.style.transition = 'opacity 0.25s ease';
        screen.style.opacity = '0';
        setTimeout(() => screen.remove(), 260);
      } else {
        haptic([24, 50, 24]);
        const dots = $('[data-role="dots"]', screen);
        if (dots) dots.classList.add('lock-shake');
        pin = '';
        setTimeout(render, 430);
      }
    });
  };

  root.appendChild(screen);
  render();
  return true;
}

function openPinSheet(mode) {
  let newPin = '';
  const wrap = document.createElement('div');
  const footer = document.createElement('button');
  footer.type = 'button';
  footer.className = 'btn btn-primary btn-xl';
  const sheet = openSheet({
    title: mode === 'remove' ? 'Remove PIN' : (mode === 'change' ? 'Change PIN' : 'Set a PIN'),
    sub: 'Stops anyone from opening the till on this phone',
    body: wrap,
    footer: footer
  });
  let step = lockOn() && mode !== 'set' ? 'current' : 'new';

  const render = () => {
    const label = step === 'current' ? 'Enter current PIN' : (step === 'new' ? 'Choose a new PIN (4-6 digits)' : 'Repeat the new PIN');
    wrap.innerHTML =
      '<div class="lock-dots" data-role="dots" style="justify-content:center;margin:6px 0 14px">' +
      Array.from({ length: step === 'current' ? (db.lock.len || 4) : Math.max(4, newPin.length) })
        .map((x, i) => '<span class="lock-dot' + (i < newPin.length ? ' on' : '') + '"></span>').join('') +
      '</div>' +
      '<div class="row" style="justify-content:center;padding:0 0 12px"><div class="row-main" style="text-align:center"><div class="row-sub" data-role="label">' + esc(label) + '</div></div></div>' +
      '<div data-role="keys" style="display:flex;justify-content:center"></div>';
    const pad = keypad({
      onKey: (k) => {
        const max = step === 'current' ? (db.lock.len || 4) : 6;
        if (newPin.length >= max) return;
        newPin += k;
        haptic(6);
        render();
        if (step === 'current' && newPin.length === (db.lock.len || 4)) advance();
      },
      onDelete: () => { newPin = newPin.slice(0, -1); render(); }
    });
    pad.classList.add('lock');
    $('[data-role="keys"]', wrap).appendChild(pad);
    const isNew = step === 'new';
    footer.disabled = isNew && newPin.length < 4;
    footer.textContent = step === 'current' ? 'Unlock' : (isNew ? (mode === 'remove' ? 'Remove PIN' : 'Continue') : 'Save PIN');
  };

  const advance = () => {
    if (step === 'current') {
      verifyPin(newPin).then((ok) => {
        if (!ok) {
          haptic([24, 50, 24]);
          const dots = $('[data-role="dots"]', wrap);
          if (dots) dots.classList.add('lock-shake');
          newPin = '';
          setTimeout(() => { toast('Wrong PIN', { icon: 'i-warn', error: true }); render(); }, 430);
          return;
        }
        if (mode === 'remove') {
          db.lock = { enabled: false, hash: '', salt: '', len: 4 };
          save(true);
          sheet.close();
          renderSettings();
          toast('PIN removed', { icon: 'i-check' });
          return;
        }
        step = 'new';
        newPin = '';
        render();
      });
      return;
    }
    if (step === 'new') {
      step = 'confirm';
      render();
      return;
    }
    if (newPin !== window.__pendingPin) {
      haptic([24, 50, 24]);
      toast('PINs did not match', { icon: 'i-warn', error: true });
      step = 'new';
      newPin = '';
      render();
      return;
    }
    setPin(newPin).then(() => {
      sheet.close();
      renderSettings();
      toast('PIN set · you will be asked for it each time', { icon: 'i-check', duration: 3200 });
    });
  };

  footer.addEventListener('click', () => {
    if (step === 'current') { advance(); return; }
    if (step === 'new') {
      if (newPin.length < 4) return;
      window.__pendingPin = newPin;
      step = 'confirm';
      newPin = '';
      render();
      return;
    }
    advance();
  });

  render();
}

const XLSX_NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const XLSX_REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const XLSX_ST = { text: 0, head: 1, num: 2, money: 3, shade: 4, shadeNum: 5, shadeMoney: 6, bold: 7 };

function xlEsc(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
}

function xlCol(n) {
  let s = '';
  let x = n + 1;
  while (x > 0) {
    const m = (x - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    x = Math.floor((x - 1) / 26);
  }
  return s;
}

function crc32(bytes) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) {
    crc = crc ^ bytes[i];
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function zipStore(entries) {
  const enc = new TextEncoder();
  const locals = [];
  const centrals = [];
  let offset = 0;
  entries.forEach((e) => {
    const nameBytes = enc.encode(e.name);
    const data = e.bytes;
    const crc = crc32(data);
    const local = new Uint8Array(30 + nameBytes.length);
    const dv = new DataView(local.buffer);
    dv.setUint32(0, 0x04034b50, true);
    dv.setUint16(4, 20, true);
    dv.setUint16(6, 0, true);
    dv.setUint16(8, 0, true);
    dv.setUint16(10, 0x2100, true);
    dv.setUint32(14, crc, true);
    dv.setUint32(18, data.length, true);
    dv.setUint32(22, data.length, true);
    dv.setUint16(26, nameBytes.length, true);
    dv.setUint16(28, 0, true);
    local.set(nameBytes, 30);
    locals.push(local, data);
    const cen = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(cen.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0x2100, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint32(42, offset, true);
    cen.set(nameBytes, 46);
    centrals.push(cen);
    offset += local.length + data.length;
  });
  const centralSize = centrals.reduce((n, c) => n + c.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  const out = new Uint8Array(offset + centralSize + 22);
  let at = 0;
  locals.concat(centrals).forEach((b) => {
    out.set(b, at);
    at += b.length;
  });
  out.set(end, at);
  return out;
}

function dataUriBytes(uri) {
  const m = /^data:([^;]+);base64,(.*)$/.exec(String(uri || ''));
  if (!m) return null;
  const bin = atob(m[2]);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return { mime: m[1], bytes: out };
}

function shrinkImage(uri, max) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width * scale));
      c.height = Math.max(1, Math.round(img.height * scale));
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      try { resolve(c.toDataURL('image/jpeg', 0.72)); } catch (e) { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = uri;
  });
}

function xlCell(ref, v, style, formula) {
  const sAttr = style ? ' s="' + style + '"' : '';
  if (formula) return '<c r="' + ref + '"' + sAttr + '><f>' + xlEsc(formula) + '</f><v>' + (Number(v) || 0) + '</v></c>';
  if (v === null || v === undefined || v === '') return style ? '<c r="' + ref + '"' + sAttr + '/>' : '';
  if (typeof v === 'number') return '<c r="' + ref + '"' + sAttr + '><v>' + v + '</v></c>';
  return '<c r="' + ref + '"' + sAttr + ' t="inlineStr"><is><t xml:space="preserve">' + xlEsc(v) + '</t></is></c>';
}

function xlSheetXml(rows, colWidths, images, opts) {
  const o = opts || {};
  const parts = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'];
  parts.push('<worksheet xmlns="' + XLSX_NS + '" xmlns:r="' + XLSX_REL + '">');
  if (o.tabColor || o.fitToPage) {
    parts.push('<sheetPr>' + (o.tabColor ? '<tabColor rgb="' + o.tabColor + '"/>' : '') + (o.fitToPage ? '<pageSetUpPr fitToPage="1"/>' : '') + '</sheetPr>');
  }
  parts.push('<sheetViews><sheetView workbookViewId="0">');
  if (o.freezeCols || o.freezeRows) {
    const x = o.freezeCols || 0;
    const y = o.freezeRows || 0;
    const topLeft = xlCol(x) + (y + 1);
    parts.push('<pane' + (x ? ' xSplit="' + x + '"' : '') + (y ? ' ySplit="' + y + '"' : '') + ' topLeftCell="' + topLeft + '" activePane="' + (x && y ? 'bottomRight' : y ? 'bottomLeft' : 'topRight') + '" state="frozen"/>');
  }
  parts.push('</sheetView></sheetViews>');
  parts.push('<sheetFormatPr defaultRowHeight="15"/>');
  if (colWidths && colWidths.length) {
    parts.push('<cols>');
    colWidths.forEach((w, i) => {
      if (w) parts.push('<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>');
    });
    parts.push('</cols>');
  }
  parts.push('<sheetData>');
  rows.forEach((cells, ri) => {
    const img = images.find((im) => im.row === ri);
    const rowStyle = (cells && cells.length && cells[0] && cells[0].rowShade) ? 4 : 0;
    parts.push('<row r="' + (ri + 1) + '"' + (img ? ' ht="' + (img.h || 58) + '" customHeight="1"' : '') + '>');
    cells.forEach((cell, ci) => {
      if (cell === null || cell === undefined) return;
      const isObj = cell && typeof cell === 'object' && !Array.isArray(cell);
      const v = isObj ? cell.v : cell;
      const st = isObj ? cell.s : 0;
      const f = isObj ? cell.f : null;
      parts.push(xlCell(xlCol(ci) + (ri + 1), v, st, f));
    });
    parts.push('</row>');
  });
  parts.push('</sheetData>');
  if (o.autoFilter) parts.push('<autoFilter ref="' + o.autoFilter + '"/>');
  if (o.landscape) {
    parts.push('<pageMargins left="0.3" right="0.3" top="0.5" bottom="0.5" header="0.3" footer="0.3"/>');
    parts.push('<pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/>');
  }
  if (images.length) parts.push('<drawing r:id="rId1"/>');
  parts.push('</worksheet>');
  return parts.join('');
}

function xlDrawingXml(images, mediaById) {
  const parts = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'];
  parts.push('<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="' + XLSX_REL + '">');
  images.forEach((im, i) => {
    const rId = mediaById[im.mediaId];
    parts.push('<xdr:twoCellAnchor editAs="oneCell">');
    parts.push('<xdr:from><xdr:col>' + im.col + '</xdr:col><xdr:colOff>63500</xdr:colOff><xdr:row>' + im.row + '</xdr:row><xdr:rowOff>63500</xdr:rowOff></xdr:from>');
    parts.push('<xdr:to><xdr:col>' + (im.col + 1) + '</xdr:col><xdr:colOff>-63500</xdr:colOff><xdr:row>' + (im.row + 1) + '</xdr:row><xdr:rowOff>-63500</xdr:rowOff></xdr:to>');
    parts.push('<xdr:pic><xdr:nvPicPr><xdr:cNvPr id="' + (i + 1) + '" name="Photo ' + (i + 1) + '"/>');
    parts.push('<xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr>');
    parts.push('<xdr:blipFill><a:blip r:embed="' + rId + '"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill>');
    parts.push('<xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr>');
    parts.push('</xdr:pic><xdr:clientData/></xdr:twoCellAnchor>');
  });
  parts.push('</xdr:wsDr>');
  return parts.join('');
}

function xlStylesXml() {
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<styleSheet xmlns="' + XLSX_NS + '">' +
    '<numFmts count="2">' +
    '<numFmt numFmtId="164" formatCode="&quot;Rp&quot;#,##0"/>' +
    '<numFmt numFmtId="165" formatCode="0"/>' +
    '</numFmts>' +
    '<fonts count="3">' +
    '<font><sz val="11"/><color rgb="FF1C1C1E"/><name val="Calibri"/></font>' +
    '<font><b/><sz val="11"/><color rgb="FF1C1C1E"/><name val="Calibri"/></font>' +
    '<font><b/><sz val="14"/><color rgb="FF1C1C1E"/><name val="Calibri"/></font>' +
    '</fonts>' +
    '<fills count="4">' +
    '<fill><patternFill patternType="none"/></fill>' +
    '<fill><patternFill patternType="gray125"/></fill>' +
    '<fill><patternFill patternType="solid"><fgColor rgb="FFF2F2F7"/><bgColor indexed="64"/></patternFill></fill>' +
    '<fill><patternFill patternType="solid"><fgColor rgb="FFFAFAFC"/><bgColor indexed="64"/></patternFill></fill>' +
    '</fills>' +
    '<borders count="2">' +
    '<border><left/><right/><top/><bottom/><diagonal/></border>' +
    '<border><left/><right/><top/><bottom style="thin"><color rgb="FFD1D1D6"/></bottom><diagonal/></border>' +
    '</borders>' +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
    '<cellXfs count="9">' +
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
    '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>' +
    '<xf numFmtId="3" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>' +
    '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>' +
    '<xf numFmtId="0" fontId="0" fillId="3" borderId="0" xfId="0" applyFill="1"/>' +
    '<xf numFmtId="3" fontId="0" fillId="3" borderId="0" xfId="0" applyNumberFormat="1" applyFill="1"/>' +
    '<xf numFmtId="164" fontId="0" fillId="3" borderId="0" xfId="0" applyNumberFormat="1" applyFill="1"/>' +
    '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
    '<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
    '</cellXfs>' +
    '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
    '</styleSheet>';
}

function xlProductSheet() {
  const products = db.products.slice().sort((a, b) => (a.category || '').localeCompare(b.category || '') || a.name.localeCompare(b.name));
  const sizeSet = [];
  products.forEach((p) => p.variants.forEach((v) => {
    const sz = v.size || 'One Size';
    if (!sizeSet.includes(sz)) sizeSet.push(sz);
  }));
  sizeSet.sort((a, b) => sizeRank(a) - sizeRank(b) || String(a).localeCompare(String(b)));
  const head = [{ v: 'Photo', s: XLSX_ST.head }, { v: 'Product', s: XLSX_ST.head }, { v: 'Category', s: XLSX_ST.head }, { v: 'Price', s: XLSX_ST.head }, { v: 'Color', s: XLSX_ST.head }];
  sizeSet.forEach((sz) => head.push({ v: sz, s: XLSX_ST.head }));
  head.push({ v: 'Total', s: XLSX_ST.head });
  const headWithShade = head.map((c) => Object.assign({ rowShade: false }, c));
  const rows = [headWithShade];
  const images = [];
  const mediaWanted = [];
  for (let gi = 0; gi < products.length; gi++) {
    const p = products[gi];
    const shade = gi % 2 === 1;
    const txt = shade ? XLSX_ST.shade : XLSX_ST.text;
    const numS = shade ? XLSX_ST.shadeNum : XLSX_ST.num;
    const monS = shade ? XLSX_ST.shadeMoney : XLSX_ST.money;
    const colors = [];
    p.variants.forEach((v) => {
      const c = v.color || '';
      if (!colors.includes(c)) colors.push(c);
    });
    colors.forEach((color) => {
      const rowVariants = p.variants.filter((v) => (v.color || '') === color);
      const prices = Array.from(new Set(rowVariants.map((v) => variantPrice(p, v)).filter((n) => n > 0)));
      const cells = [{ v: '', s: txt, rowShade: shade }, { v: p.name, s: txt }, { v: p.category || '', s: txt }];
      cells.push({ v: (prices.length ? Math.min.apply(null, prices) : Number(p.price) || 0), s: monS });
      cells.push({ v: color || 'One size', s: txt });
      let total = 0;
      sizeSet.forEach((sz) => {
        const v = rowVariants.find((x) => (x.size || 'One Size') === sz);
        if (!v) { cells.push(shade ? { v: '', s: txt } : null); return; }
        const avail = Math.max(0, availableStock(p, v));
        total += avail;
        cells.push(avail ? { v: avail, s: numS } : (shade ? { v: 0, s: numS } : { v: 0, s: 0 }));
      });
      cells.push({ v: total, s: numS });
      rows.push(cells);
      mediaWanted.push({ row: rows.length - 1, color: color, product: p });
    });
  }
  return { rows: rows, images: images, sizeSet: sizeSet, mediaWanted: mediaWanted };
}

function xlSalesSheet() {
  const payNames = { cash: 'Cash', qris: 'QRIS', transfer: 'Transfer', card: 'Card' };
  const head = ['Date', 'Time', 'Receipt', 'Photo', 'Product', 'Colour', 'Size', 'Qty', 'Unit price', 'Discount', 'Line total', 'Order total', 'Payment', 'Status', 'Phone'];
  const rows = [head.map((c) => ({ v: c, s: XLSX_ST.head }))];
  const images = [];
  const mediaWanted = [];
  const salesSorted = db.sales.slice().sort((a, b) => a.ts - b.ts);
  let qtySum = 0;
  let lineSum = 0;
  for (let i = 0; i < salesSorted.length; i++) {
    const sale = salesSorted[i];
    const shade = i % 2 === 1;
    const txt = shade ? XLSX_ST.shade : XLSX_ST.text;
    const numS = shade ? XLSX_ST.shadeNum : XLSX_ST.num;
    const monS = shade ? XLSX_ST.shadeMoney : XLSX_ST.money;
    for (let k = 0; k < sale.items.length; k++) {
      const it = sale.items[k];
      const prod = getProduct(it.pid);
      const qty = Number(it.qty) || 0;
      qtySum += qty;
      lineSum += Number(it.total) || 0;
      rows.push([
        { v: fmtDate(sale.ts), s: txt }, { v: fmtTime(sale.ts), s: txt }, { v: '#' + sale.no, s: txt },
        { v: '', s: txt },
        { v: it.name, s: txt }, { v: it.color || '', s: txt }, { v: it.size || '', s: txt },
        { v: qty, s: numS },
        { v: Number(it.price) || 0, s: monS },
        { v: Number(it.disc) || 0, s: monS },
        { v: Number(it.total) || 0, s: monS },
        { v: Number(sale.total) || 0, s: monS },
        { v: payNames[sale.method] || sale.method, s: txt },
        { v: sale.voided ? 'Voided' : 'Paid', s: txt },
        { v: db.sync && Number(db.sync.device) ? '#' + db.sync.device : '', s: txt }
      ]);
      if (prod && productImageFor(prod, it.color)) {
        mediaWanted.push({ row: rows.length - 1, color: it.color || '', product: prod });
        images.push({ row: rows.length - 1, col: 3, mediaId: prod.id + '|' + (it.color || '') });
      }
    }
  }
  if (salesSorted.length) {
    const lastData = rows.length;
    const totalRow = new Array(15).fill(null).map(() => ({ v: '', s: XLSX_ST.text }));
    totalRow[4] = { v: 'TOTAL (line items)', s: XLSX_ST.bold };
    totalRow[7] = { v: qtySum, s: XLSX_ST.bold, f: 'SUM(H2:H' + lastData + ')' };
    totalRow[10] = { v: lineSum, s: XLSX_ST.bold, f: 'SUM(K2:K' + lastData + ')' };
    rows.push(totalRow);
  }
  return { rows: rows, images: images, mediaWanted: mediaWanted, colWidths: [12, 8, 11, 15, 30, 16, 8, 6, 13, 11, 13, 13, 11, 9, 8] };
}

function xlSummarySheet() {
  const sum = summarize(db.sales);
  const units = db.products.reduce((n, p) => n + p.variants.reduce((m, v) => m + Math.max(0, availableStock(p, v)), 0), 0);
  const value = db.products.reduce((n, p) => n + p.variants.reduce((m, v) => m + Math.max(0, availableStock(p, v)) * variantPrice(p, v), 0), 0);
  const colorRows = db.products.reduce((n, p) => {
    const seen = [];
    p.variants.forEach((v) => {
      const c = v.color || '';
      if (!seen.includes(c)) seen.push(c);
    });
    return n + seen.length;
  }, 0);
  const cats = {};
  db.products.forEach((p) => {
    const c = p.category || 'Other';
    cats[c] = cats[c] || { products: 0, units: 0, value: 0 };
    cats[c].products += 1;
    p.variants.forEach((v) => {
      const a = Math.max(0, availableStock(p, v));
      cats[c].units += a;
      cats[c].value += a * variantPrice(p, v);
    });
  });
  const rows = [];
  const title = (t) => rows.push([{ v: t, s: XLSX_ST.bold }]);
  const line = (label, value, money) => rows.push([{ v: label, s: XLSX_ST.text }, typeof value === 'number' ? { v: value, s: money ? XLSX_ST.money : XLSX_ST.num } : { v: value, s: XLSX_ST.text }]);
  title('Stock & sales summary');
  line('Generated', new Date().toLocaleString('id-ID'), false);
  rows.push([]);
  title('Stock');
  line('Products', db.products.length, false);
  line('Colour rows', colorRows, false);
  line('Units in stock', units, false);
  line('Retail value of stock', value, true);
  rows.push([]);
  title('Sales (all time)');
  line('Transactions', sum.orders, false);
  line('Items sold', sum.items, false);
  line('Revenue', sum.revenue, true);
  line('Average sale', sum.avg, true);
  if (sum.voided) line('Voided sales', sum.voided, false);
  rows.push([]);
  title('Payment methods');
  ['cash', 'qris', 'transfer', 'card'].forEach((k) => {
    const m = sum.byMethod[k];
    if (!m || !m.count) return;
    line(PAYMENTS[k].label + ' (' + m.count + ')', m.amount, true);
  });
  rows.push([]);
  title('Stock by category');
  Object.keys(cats).sort().forEach((c) => {
    line(c, cats[c].products + ' products · ' + cats[c].units + ' units', true);
  });
  return { rows: rows, colWidths: [34, 30] };
}

async function buildWorkbookBytes() {
  const enc = new TextEncoder();
  const entries = [];
  const media = [];
  const mediaIndex = {};
  const mediaById = {};

  async function mediaFor(key, image) {
    if (!image || !/^data:/.test(image)) return null;
    if (mediaIndex[key]) return mediaIndex[key];
    const small = await shrinkImage(image, 260);
    const parsed = dataUriBytes(small || image);
    if (!parsed) return null;
    const ext = parsed.mime.indexOf('png') >= 0 ? 'png' : 'jpeg';
    const file = 'image' + (media.length + 1) + '.' + ext;
    media.push({ file: file, bytes: parsed.bytes });
    mediaIndex[key] = { file: file, id: media.length };
    mediaById[key] = 'rId' + media.length;
    return mediaIndex[key];
  }

  const prodSheet = xlProductSheet();
  for (let i = 0; i < prodSheet.mediaWanted.length; i++) {
    const want = prodSheet.mediaWanted[i];
    const m = await mediaFor(want.product.id + '|' + want.color, productImageFor(want.product, want.color));
    if (m) prodSheet.images.push({ row: want.row, col: 0, mediaId: want.product.id + '|' + want.color, h: 58 });
  }
  const salesSheet = xlSalesSheet();
  for (let i = 0; i < salesSheet.mediaWanted.length; i++) {
    const want = salesSheet.mediaWanted[i];
    const m = await mediaFor(want.product.id + '|' + want.color, productImageFor(want.product, want.color));
    if (!m) {
      salesSheet.images = salesSheet.images.filter((im) => im.row !== want.row);
    }
  }
  const summarySheet = xlSummarySheet();

  const prodFilter = 'A1:' + xlCol(prodSheet.rows[0].length - 1) + prodSheet.rows.length;
  const salesFilter = 'A1:O' + salesSheet.rows.length;

  const contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Default Extension="jpeg" ContentType="image/jpeg"/>' +
    '<Default Extension="png" ContentType="image/png"/>' +
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
    '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
    '<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
    '<Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
    '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
    '<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>' +
    '<Override PartName="/xl/drawings/drawing2.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>' +
    '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
    '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>' +
    '</Types>';

  const rootRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' +
    '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>' +
    '</Relationships>';

  const workbook = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<workbook xmlns="' + XLSX_NS + '" xmlns:r="' + XLSX_REL + '"><sheets>' +
    '<sheet name="Products" sheetId="1" r:id="rId1"/>' +
    '<sheet name="Sales" sheetId="2" r:id="rId2"/>' +
    '<sheet name="Summary" sheetId="3" r:id="rId3"/>' +
    '</sheets><definedNames>' +
    '<definedName name="_xlnm.Print_Titles" localSheetId="0">Products!$1:$1</definedName>' +
    '</definedNames></workbook>';

  const workbookRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>' +
    '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>' +
    '<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
    '</Relationships>';

  const core = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
    '<dc:title>' + xlEsc((db.brand.name || BRAND_NAME) + ' · stock and sales') + '</dc:title>' +
    '<dc:creator>' + xlEsc(db.brand.name || BRAND_NAME) + '</dc:creator>' +
    '<dcterms:created xsi:type="dcterms:W3CDTF">' + new Date().toISOString() + '</dcterms:created>' +
    '</cp:coreProperties>';

  const app = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">' +
    '<Application>POS</Application></Properties>';

  function sheetRels(drawing) {
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing' + drawing + '.xml"/>' +
      '</Relationships>';
  }

  function drawingRels(images) {
    const parts = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'];
    const seen = {};
    images.forEach((im) => {
      if (seen[im.mediaId]) return;
      seen[im.mediaId] = true;
      const rec = mediaIndex[im.mediaId];
      if (!rec) return;
      parts.push('<Relationship Id="' + mediaById[im.mediaId] + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/' + rec.file + '"/>');
    });
    parts.push('</Relationships>');
    return parts.join('');
  }

  entries.push({ name: '[Content_Types].xml', bytes: enc.encode(contentTypes) });
  entries.push({ name: '_rels/.rels', bytes: enc.encode(rootRels) });
  entries.push({ name: 'docProps/core.xml', bytes: enc.encode(core) });
  entries.push({ name: 'docProps/app.xml', bytes: enc.encode(app) });
  entries.push({ name: 'xl/workbook.xml', bytes: enc.encode(workbook) });
  entries.push({ name: 'xl/_rels/workbook.xml.rels', bytes: enc.encode(workbookRels) });
  entries.push({ name: 'xl/styles.xml', bytes: enc.encode(xlStylesXml()) });
  entries.push({
    name: 'xl/worksheets/sheet1.xml',
    bytes: enc.encode(xlSheetXml(prodSheet.rows, [15, 34, 14, 13, 17].concat(prodSheet.sizeSet.map(() => 7)).concat([9]), prodSheet.images, {
      tabColor: 'FF1C1C1E', freezeCols: 5, freezeRows: 1, autoFilter: prodFilter, landscape: true
    }))
  });
  entries.push({
    name: 'xl/worksheets/sheet2.xml',
    bytes: enc.encode(xlSheetXml(salesSheet.rows, salesSheet.colWidths, salesSheet.images, {
      tabColor: 'FF34C759', freezeRows: 1, autoFilter: salesFilter
    }))
  });
  entries.push({
    name: 'xl/worksheets/sheet3.xml',
    bytes: enc.encode(xlSheetXml(summarySheet.rows, summarySheet.colWidths, [], { tabColor: 'FF0A84FF' }))
  });
  entries.push({ name: 'xl/worksheets/_rels/sheet1.xml.rels', bytes: enc.encode(sheetRels(1)) });
  entries.push({ name: 'xl/worksheets/_rels/sheet2.xml.rels', bytes: enc.encode(sheetRels(2)) });
  entries.push({ name: 'xl/drawings/drawing1.xml', bytes: enc.encode(xlDrawingXml(prodSheet.images, mediaById)) });
  entries.push({ name: 'xl/drawings/drawing2.xml', bytes: enc.encode(xlDrawingXml(salesSheet.images, mediaById)) });
  entries.push({ name: 'xl/drawings/_rels/drawing1.xml.rels', bytes: enc.encode(drawingRels(prodSheet.images)) });
  entries.push({ name: 'xl/drawings/_rels/drawing2.xml.rels', bytes: enc.encode(drawingRels(salesSheet.images)) });
  media.forEach((f) => entries.push({ name: 'xl/media/' + f.file, bytes: f.bytes }));

  return zipStore(entries);
}

async function exportExcel(opts) {
  const o = opts || {};
  toast('Building Excel with photos…', { icon: 'i-doc', duration: 2600 });
  const bytes = await buildWorkbookBytes();
  const name = 'pos-export-' + dayKey(Date.now()) + '.xlsx';
  const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const file = new File([blob], name, { type: blob.type });
  if (!o.download && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name });
      toast('Excel shared · ' + (bytes.length / 1024 / 1024).toFixed(1) + ' MB', { icon: 'i-check' });
      return;
    } catch (e) {
      if (e && /cancel/i.test(e.name || '')) return;
    }
  }
  download(name, blob);
  toast('Excel downloaded · ' + db.products.length + ' products, ' + db.sales.length + ' sales', { icon: 'i-check', duration: 3200 });
}

function registerSW() {
  if (APP_MODE === 'demo') return;
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'http:' && location.protocol !== 'https:') return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

function init() {
  const had = load();
  if (APP_MODE === 'demo' && !had) { db = demoSeed(); save(true); }
  if (APP_MODE === 'live' && !had) {
    const seeded = catalogProducts();
    if (seeded && seeded.length) {
      db.products = seeded;
      db.seeded = true;
      save(true);
    }
  }
  applyTheme();
  initHeaders();
  $$('#tabbar .tab').forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  $('#cartbar').addEventListener('click', () => switchTab('cart'));
  $('#sell-manage').addEventListener('click', () => openProductManager());
  $('#sell-add-first').addEventListener('click', () => openProductEditor(null));
  $('#cart-go-sell').addEventListener('click', () => switchTab('sell'));
  $('#checkout-btn').addEventListener('click', openCheckout);
  $('#cart-clear').addEventListener('click', () => {
    dialog({ title: 'Clear the cart?', message: cartCount() + ' item' + (cartCount() > 1 ? 's' : '') + ' will be removed.', okLabel: 'Clear', destructive: true }).then((ok) => {
      if (!ok) return;
      cart = [];
      cart.discount = null;
      save();
      renderCart();
      renderTabBadge();
      updateCartbar();
    });
  });
  const search = $('#search-input');
  search.addEventListener('input', () => {
    searchQuery = search.value;
    $('#search-clear').hidden = !search.value;
    renderGrid();
  });
  $('#search-clear').addEventListener('click', () => {
    search.value = '';
    searchQuery = '';
    $('#search-clear').hidden = true;
    renderGrid();
    search.focus();
  });
  $('#export-csv').addEventListener('click', () => exportCSV(reportDay));
  window.addEventListener('online', () => { if (syncOn()) syncNow({}); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      hiddenSince = Date.now();
    } else {
      if (hiddenSince && lockOn() && Date.now() - hiddenSince > 5 * 60 * 1000) {
        appUnlocked = false;
        showLockScreen();
      }
      hiddenSince = 0;
      if (syncOn()) syncNow({});
    }
  });
  setInterval(() => { if (syncOn() && document.visibilityState === 'visible' && navigator.onLine) syncNow({}); }, 30000);
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const top = layerStack[layerStack.length - 1];
    if (top) requestClose(top);
  });
  registerSW();
  renderAll();
  refreshCatalogImages();
  showLockScreen();
  if (APP_MODE === 'demo') {
    const actions = $('#screen-sell .header-actions');
    if (actions) {
      const pill = document.createElement('span');
      pill.className = 'demo-pill';
      pill.textContent = 'Demo';
      actions.insertBefore(pill, actions.firstChild);
    }
    toast('Demo build · sample data stays on this device', { icon: 'i-info', duration: 3400 });
  } else if (!had || !db.onboarded) {
    showOnboarding();
  }
  window.addEventListener('beforeunload', () => { if (save.timer) { clearTimeout(save.timer); try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch (e) {} } });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(true); });
}

init();
