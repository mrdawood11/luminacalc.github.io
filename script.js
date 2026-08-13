/* LuminaCalc – matched to your preferred HTML */

// Theme
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
function getPreferredTheme() {
  const s = localStorage.getItem('luminacalc-theme');
  if (s) return s;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}
function setTheme(t) {
  root.setAttribute('data-theme', t);
  localStorage.setItem('luminacalc-theme', t);
}
setTheme(getPreferredTheme());
themeToggle.addEventListener('click', () => {
  setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

// Soft glow only (system cursor stays – no dot)
const glow = document.getElementById('cursorGlow');
let mx = 0, my = 0, gx = 0, gy = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function loop() {
  gx += (mx - gx) * 0.12;
  gy += (my - gy) * 0.12;
  if (glow) { glow.style.left = gx + 'px'; glow.style.top = gy + 'px'; }
  requestAnimationFrame(loop);
})();

// Particles
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
(function create() {
  particles = [];
  const n = Math.min(30, Math.floor(window.innerWidth / 45));
  for (let i = 0; i < n; i++) {
    particles.push({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.4, vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
      a: Math.random() * 0.3 + 0.1
    });
  }
})();
(function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const light = root.getAttribute('data-theme') === 'light';
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = light ? `rgba(124,58,237,${p.a * 0.5})` : `rgba(183,148,246,${p.a})`;
    ctx.fill();
  });
  requestAnimationFrame(draw);
})();

// Nav
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40));
document.getElementById('navToggle').addEventListener('click', () => nav.classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}
window.scrollToSection = scrollToSection;

// Hero – words one by one (matches your HTML classes)
window.addEventListener('load', () => {
  const badge = document.querySelector('.hero-badge');
  const words = document.querySelectorAll('.hero-title .word');
  const sub = document.querySelector('.hero-sub');
  const cta = document.querySelector('.hero-cta');
  const cards = document.querySelectorAll('.floating-card');

  setTimeout(() => badge && badge.classList.add('show'), 150);
  words.forEach((w, i) => setTimeout(() => w.classList.add('show'), 450 + i * 200));
  setTimeout(() => sub && sub.classList.add('show'), 1200);
  setTimeout(() => cta && cta.classList.add('show'), 1450);
  cards.forEach((c, i) => setTimeout(() => c.classList.add('show'), 1650 + i * 200));
});

// Light blur reveal on scroll
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -25px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// Calculator
let expression = '', result = '0', mode = 'basic';
let history = JSON.parse(localStorage.getItem('luminacalc-history') || '[]');
const exprEl = document.getElementById('calcExpression');
const resultEl = document.getElementById('calcResult');
const historyEl = document.getElementById('calcHistory');
const buttonsContainer = document.getElementById('calcButtons');

const basicButtons = [
  { label: 'C', action: 'clear', class: 'clear' },
  { label: '⌫', action: 'back', class: 'fn' },
  { label: '%', action: 'percent', class: 'op' },
  { label: '÷', action: 'op', value: '/', class: 'op' },
  { label: '7', action: 'num', value: '7' }, { label: '8', action: 'num', value: '8' },
  { label: '9', action: 'num', value: '9' }, { label: '×', action: 'op', value: '*', class: 'op' },
  { label: '4', action: 'num', value: '4' }, { label: '5', action: 'num', value: '5' },
  { label: '6', action: 'num', value: '6' }, { label: '−', action: 'op', value: '-', class: 'op' },
  { label: '1', action: 'num', value: '1' }, { label: '2', action: 'num', value: '2' },
  { label: '3', action: 'num', value: '3' }, { label: '+', action: 'op', value: '+', class: 'op' },
  { label: '0', action: 'num', value: '0', class: 'span2' }, { label: '.', action: 'num', value: '.' },
  { label: '=', action: 'equals', class: 'equals' }
];
const scientificButtons = [
  { label: 'C', action: 'clear', class: 'clear' }, { label: '⌫', action: 'back', class: 'fn' },
  { label: '(', action: 'num', value: '(', class: 'fn' }, { label: ')', action: 'num', value: ')', class: 'fn' },
  { label: 'sin', action: 'fn', value: 'sin', class: 'fn' }, { label: 'cos', action: 'fn', value: 'cos', class: 'fn' },
  { label: 'tan', action: 'fn', value: 'tan', class: 'fn' }, { label: '÷', action: 'op', value: '/', class: 'op' },
  { label: 'ln', action: 'fn', value: 'ln', class: 'fn' }, { label: 'log', action: 'fn', value: 'log', class: 'fn' },
  { label: '√', action: 'fn', value: 'sqrt', class: 'fn' }, { label: '×', action: 'op', value: '*', class: 'op' },
  { label: 'π', action: 'num', value: 'π' }, { label: 'e', action: 'num', value: 'e' },
  { label: 'x²', action: 'fn', value: 'square', class: 'fn' }, { label: '−', action: 'op', value: '-', class: 'op' },
  { label: '7', action: 'num', value: '7' }, { label: '8', action: 'num', value: '8' },
  { label: '9', action: 'num', value: '9' }, { label: '+', action: 'op', value: '+', class: 'op' },
  { label: '4', action: 'num', value: '4' }, { label: '5', action: 'num', value: '5' },
  { label: '6', action: 'num', value: '6' }, { label: '^', action: 'op', value: '^', class: 'op' },
  { label: '1', action: 'num', value: '1' }, { label: '2', action: 'num', value: '2' },
  { label: '3', action: 'num', value: '3' }, { label: '%', action: 'percent', class: 'op' },
  { label: '0', action: 'num', value: '0' }, { label: '.', action: 'num', value: '.' },
  { label: '=', action: 'equals', class: 'equals span2' }
];

function renderButtons() {
  const btns = mode === 'basic' ? basicButtons : scientificButtons;
  buttonsContainer.innerHTML = '';
  btns.forEach(b => {
    const btn = document.createElement('button');
    btn.className = 'calc-btn ' + (b.class || '');
    btn.textContent = b.label;
    btn.addEventListener('click', () => handleCalc(b));
    buttonsContainer.appendChild(btn);
  });
}
function handleCalc(b) {
  if (b.action === 'clear') { expression = ''; result = '0'; }
  else if (b.action === 'back') { expression = expression.slice(0, -1); if (!expression) result = '0'; }
  else if (b.action === 'num') expression += b.value;
  else if (b.action === 'op') expression += b.value;
  else if (b.action === 'fn') {
    expression += b.value === 'square' ? '^2' : b.value + '(';
  } else if (b.action === 'percent') {
    try {
      const v = evaluate(expression || result);
      expression = String(v / 100); result = expression;
    } catch (e) {}
  } else if (b.action === 'equals') {
    try {
      const v = evaluate(expression);
      result = formatNumber(v);
      history.unshift({ expr: expression, res: result });
      if (history.length > 25) history.pop();
      localStorage.setItem('luminacalc-history', JSON.stringify(history));
      renderHistory();
      expression = '';
    } catch (e) { result = 'Error'; }
  }
  updateDisplay();
}
function evaluate(expr) {
  if (!expr || !String(expr).trim()) throw new Error('Empty');
  let s = String(expr)
    .replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
    .replace(/π/g, '(Math.PI)').replace(/\be\b/g, '(Math.E)')
    .replace(/sin\(/g, 'sind(').replace(/cos\(/g, 'cosd(').replace(/tan\(/g, 'tand(')
    .replace(/ln\(/g, 'Math.log(').replace(/log\(/g, 'Math.log10(')
    .replace(/sqrt\(/g, 'Math.sqrt(').replace(/\^/g, '**');
  const sind = x => Math.sin(x * Math.PI / 180);
  const cosd = x => Math.cos(x * Math.PI / 180);
  const tand = x => Math.tan(x * Math.PI / 180);
  const fn = new Function('sind', 'cosd', 'tand', 'Math', 'return (' + s + ')');
  const val = fn(sind, cosd, tand, Math);
  if (typeof val !== 'number' || !isFinite(val)) throw new Error('Invalid');
  return val;
}
function formatNumber(n) {
  if (Math.abs(n) < 1e-12) return '0';
  if (Number.isInteger(n) || Math.abs(n - Math.round(n)) < 1e-10) return String(Math.round(n));
  return parseFloat(n.toPrecision(12)).toString();
}
function updateDisplay() {
  exprEl.textContent = expression;
  resultEl.textContent = result;
}
function renderHistory() {
  historyEl.innerHTML = history.map(h => `<li>${h.expr} = ${h.res}</li>`).join('');
  historyEl.querySelectorAll('li').forEach((li, i) => {
    li.addEventListener('click', () => {
      expression = history[i].expr; result = history[i].res; updateDisplay();
    });
  });
}
document.getElementById('clearHistory').addEventListener('click', () => {
  history = []; localStorage.removeItem('luminacalc-history'); renderHistory();
});
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.dataset.mode;
    renderButtons();
  });
});
renderButtons(); renderHistory(); updateDisplay();

document.addEventListener('keydown', e => {
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
  const k = e.key;
  if (/[0-9.]/.test(k)) handleCalc({ action: 'num', value: k });
  else if (k === '+') handleCalc({ action: 'op', value: '+' });
  else if (k === '-') handleCalc({ action: 'op', value: '-' });
  else if (k === '*') handleCalc({ action: 'op', value: '*' });
  else if (k === '/') handleCalc({ action: 'op', value: '/' });
  else if (k === 'Enter' || k === '=') { e.preventDefault(); handleCalc({ action: 'equals' }); }
  else if (k === 'Backspace') handleCalc({ action: 'back' });
  else if (k === 'Escape') handleCalc({ action: 'clear' });
  else if (k === '%') handleCalc({ action: 'percent' });
  else if (k === '(' || k === ')') handleCalc({ action: 'num', value: k });
});

// Formulas
const formulas = [
  { cat: 'trig', title: 'Pythagorean Identity', formula: '\\sin^2\\theta + \\cos^2\\theta = 1', desc: 'Fundamental identity.' },
  { cat: 'trig', title: 'Sine of Sum', formula: '\\sin(A \\pm B) = \\sin A\\cos B \\pm \\cos A\\sin B', desc: 'Angle addition formula.' },
  { cat: 'trig', title: 'Cosine of Sum', formula: '\\cos(A \\pm B) = \\cos A\\cos B \\mp \\sin A\\sin B', desc: 'Angle addition formula.' },
  { cat: 'trig', title: 'Double Angle Sin', formula: '\\sin 2\\theta = 2\\sin\\theta\\cos\\theta', desc: 'Double-angle formula.' },
  { cat: 'trig', title: 'Law of Sines', formula: '\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B} = \\dfrac{c}{\\sin C}', desc: 'Relates sides and angles.' },
  { cat: 'trig', title: 'Law of Cosines', formula: 'c^2 = a^2 + b^2 - 2ab\\cos C', desc: 'General Pythagorean theorem.' },
  { cat: 'geo', title: 'Area of Circle', formula: 'A = \\pi r^2', desc: 'Area with radius r.' },
  { cat: 'geo', title: 'Circumference', formula: 'C = 2\\pi r', desc: 'Perimeter of a circle.' },
  { cat: 'geo', title: 'Pythagorean Theorem', formula: 'a^2 + b^2 = c^2', desc: 'Right triangle relation.' },
  { cat: 'geo', title: 'Area of Triangle', formula: 'A = \\dfrac{1}{2}bh', desc: 'Base times height over 2.' },
  { cat: 'geo', title: 'Volume of Sphere', formula: 'V = \\dfrac{4}{3}\\pi r^3', desc: 'Volume of a sphere.' },
  { cat: 'geo', title: 'Volume of Cylinder', formula: 'V = \\pi r^2 h', desc: 'Base area times height.' },
  { cat: 'alg', title: 'Quadratic Formula', formula: 'x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', desc: 'Solutions to ax²+bx+c=0.' },
  { cat: 'alg', title: 'Difference of Squares', formula: 'a^2 - b^2 = (a-b)(a+b)', desc: 'Factoring identity.' },
  { cat: 'alg', title: 'Perfect Square', formula: '(a \\pm b)^2 = a^2 \\pm 2ab + b^2', desc: 'Squared binomial.' },
  { cat: 'alg', title: 'Arithmetic Series', formula: 'S_n = \\dfrac{n}{2}(2a + (n-1)d)', desc: 'Sum of arithmetic sequence.' },
  { cat: 'alg', title: 'Geometric Series', formula: 'S_n = a \\dfrac{1-r^n}{1-r}', desc: 'Sum of geometric sequence.' },
  { cat: 'deriv', title: 'Power Rule', formula: '\\dfrac{d}{dx}[x^n] = n x^{n-1}', desc: 'Derivative of power.' },
  { cat: 'deriv', title: 'Product Rule', formula: '(uv)\' = u\'v + uv\'', desc: 'Derivative of product.' },
  { cat: 'deriv', title: 'Quotient Rule', formula: '\\left(\\dfrac{u}{v}\\right)\' = \\dfrac{u\'v - uv\'}{v^2}', desc: 'Derivative of quotient.' },
  { cat: 'deriv', title: 'Chain Rule', formula: '\\dfrac{d}{dx}[f(g(x))] = f\'(g(x))g\'(x)', desc: 'Composite derivative.' },
  { cat: 'deriv', title: 'Derivative of sin', formula: '\\dfrac{d}{dx}[\\sin x] = \\cos x', desc: 'Basic trig derivative.' },
  { cat: 'deriv', title: 'Derivative of eˣ', formula: '\\dfrac{d}{dx}[e^x] = e^x', desc: 'Exponential derivative.' },
  { cat: 'integ', title: 'Power Rule Integral', formula: '\\int x^n dx = \\dfrac{x^{n+1}}{n+1} + C', desc: 'n ≠ -1.' },
  { cat: 'integ', title: 'Integral of 1/x', formula: '\\int \\dfrac{1}{x} dx = \\ln|x| + C', desc: 'Natural log integral.' },
  { cat: 'integ', title: 'Integral of eˣ', formula: '\\int e^x dx = e^x + C', desc: 'Exponential integral.' },
  { cat: 'integ', title: 'Integral of sin', formula: '\\int \\sin x dx = -\\cos x + C', desc: 'Sine antiderivative.' },
  { cat: 'integ', title: 'Integration by Parts', formula: '\\int u dv = uv - \\int v du', desc: 'Useful for products.' },
  { cat: 'finance', title: 'Simple Interest', formula: 'I = P r t', desc: 'Principal × rate × time.' },
  { cat: 'finance', title: 'Compound Interest', formula: 'A = P(1 + \\dfrac{r}{n})^{nt}', desc: 'Compounded amount.' },
  { cat: 'finance', title: 'EMI Formula', formula: 'EMI = P \\dfrac{r(1+r)^n}{(1+r)^n - 1}', desc: 'Monthly loan payment.' },
  { cat: 'physics', title: "Newton's 2nd Law", formula: 'F = ma', desc: 'Force = mass × acceleration.' },
  { cat: 'physics', title: 'Kinetic Energy', formula: 'KE = \\dfrac{1}{2}mv^2', desc: 'Energy of motion.' },
  { cat: 'physics', title: "Ohm's Law", formula: 'V = IR', desc: 'Voltage = current × resistance.' },
  { cat: 'physics', title: 'E = mc²', formula: 'E = mc^2', desc: 'Mass-energy equivalence.' }
];
let currentCat = 'all';
const formulaGrid = document.getElementById('formulaGrid');
const formulaSearch = document.getElementById('formulaSearch');

function renderFormulas(q = '') {
  const query = q.toLowerCase().trim();
  const list = formulas.filter(f => {
    const catOk = currentCat === 'all' || f.cat === currentCat;
    const qOk = !query || f.title.toLowerCase().includes(query) || f.desc.toLowerCase().includes(query);
    return catOk && qOk;
  });
  formulaGrid.innerHTML = list.map(f => `
    <div class="formula-card">
      <h4>${f.title} <span class="cat-tag">${f.cat}</span></h4>
      <div class="formula-body" data-f="${f.formula.replace(/"/g, '&quot;')}"></div>
      <p>${f.desc}</p>
    </div>`).join('');
  formulaGrid.querySelectorAll('.formula-body').forEach(el => {
    try {
      if (typeof katex !== 'undefined') katex.render(el.dataset.f, el, { throwOnError: false, displayMode: true });
      else el.textContent = el.dataset.f;
    } catch (e) { el.textContent = el.dataset.f; }
  });
}
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCat = btn.dataset.cat;
    renderFormulas(formulaSearch.value);
  });
});
formulaSearch.addEventListener('input', () => renderFormulas(formulaSearch.value));
(function initF() {
  if (typeof katex !== 'undefined') renderFormulas();
  else setTimeout(initF, 80);
})();

// Business
function calcEMI() {
  const P = parseFloat(document.getElementById('emiPrincipal').value) || 0;
  const annual = parseFloat(document.getElementById('emiRate').value) || 0;
  const n = parseInt(document.getElementById('emiTenure').value) || 1;
  const r = annual / 12 / 100;
  const emi = r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  const total = emi * n;
  document.getElementById('emiResult').innerHTML =
    `EMI: <strong>${emi.toFixed(2)}</strong><br><small>Total: ${total.toFixed(2)} · Interest: ${(total - P).toFixed(2)}</small>`;
}
function calcInterest() {
  const P = parseFloat(document.getElementById('intPrincipal').value) || 0;
  const r = parseFloat(document.getElementById('intRate').value) / 100 || 0;
  const t = parseFloat(document.getElementById('intTime').value) || 0;
  const type = document.getElementById('intType').value;
  let interest, total;
  if (type === 'simple') { interest = P * r * t; total = P + interest; }
  else { total = P * Math.pow(1 + r, t); interest = total - P; }
  document.getElementById('intResult').innerHTML =
    `Interest: <strong>${interest.toFixed(2)}</strong><br><small>Total: ${total.toFixed(2)}</small>`;
}
function calcDiscount() {
  const price = parseFloat(document.getElementById('discPrice').value) || 0;
  const pct = parseFloat(document.getElementById('discPercent').value) || 0;
  const disc = price * pct / 100;
  document.getElementById('discResult').innerHTML =
    `Final: <strong>${(price - disc).toFixed(2)}</strong><br><small>You save: ${disc.toFixed(2)}</small>`;
}
function calcTip() {
  const bill = parseFloat(document.getElementById('tipBill').value) || 0;
  const pct = parseFloat(document.getElementById('tipPercent').value) || 0;
  const people = parseInt(document.getElementById('tipPeople').value) || 1;
  const tip = bill * pct / 100;
  const total = bill + tip;
  document.getElementById('tipResult').innerHTML =
    `Per person: <strong>${(total / people).toFixed(2)}</strong><br><small>Tip: ${tip.toFixed(2)} · Total: ${total.toFixed(2)}</small>`;
}
window.calcEMI = calcEMI;
window.calcInterest = calcInterest;
window.calcDiscount = calcDiscount;
window.calcTip = calcTip;

// Orders (localStorage)
let orders = JSON.parse(localStorage.getItem('luminacalc-orders') || '[]');
let orderFilter = 'all';
function saveOrders() { localStorage.setItem('luminacalc-orders', JSON.stringify(orders)); }
function addOrder() {
  const customer = document.getElementById('orderCustomer').value.trim();
  const item = document.getElementById('orderItem').value.trim();
  const amount = parseFloat(document.getElementById('orderAmount').value);
  const status = document.getElementById('orderStatus').value;
  const notes = document.getElementById('orderNotes').value.trim();
  if (!customer || !item || isNaN(amount) || amount < 0) {
    alert('Please fill Customer, Item and a valid Amount.');
    return;
  }
  orders.unshift({ id: Date.now(), customer, item, amount, status, notes, date: new Date().toLocaleDateString() });
  saveOrders(); renderOrders();
  document.getElementById('orderCustomer').value = '';
  document.getElementById('orderItem').value = '';
  document.getElementById('orderAmount').value = '';
  document.getElementById('orderNotes').value = '';
  document.getElementById('orderStatus').value = 'pending';
}
function deleteOrder(id) {
  orders = orders.filter(o => o.id !== id);
  saveOrders(); renderOrders();
}
function updateStatus(id, status) {
  const o = orders.find(o => o.id === id);
  if (o) { o.status = status; saveOrders(); renderOrders(); }
}
function clearAllOrders() {
  if (confirm('Delete all orders?')) { orders = []; saveOrders(); renderOrders(); }
}
function escapeHtml(s) {
  const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML;
}
function renderOrders() {
  const list = document.getElementById('orderList');
  const filtered = orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter);
  const total = orders.reduce((s, o) => s + (o.status !== 'cancelled' ? o.amount : 0), 0);
  document.getElementById('orderCount').textContent = orders.length;
  document.getElementById('orderTotal').textContent = total.toFixed(2);
  if (!filtered.length) {
    list.innerHTML = '<li style="text-align:center;color:var(--text-muted);padding:1.5rem;">No orders yet.</li>';
    return;
  }
  list.innerHTML = filtered.map(o => `
    <li class="order-item ${o.status}">
      <div class="order-item-header">
        <strong>${escapeHtml(o.customer)}</strong>
        <span class="order-amount">${Number(o.amount).toFixed(2)}</span>
      </div>
      <div class="order-meta">${escapeHtml(o.item)} · ${o.date} · <em>${o.status}</em></div>
      ${o.notes ? `<div class="order-meta" style="margin-top:0.25rem;">${escapeHtml(o.notes)}</div>` : ''}
      <div class="order-actions">
        ${o.status !== 'completed' ? `<button onclick="updateStatus(${o.id},'completed')">Complete</button>` : ''}
        ${o.status === 'pending' ? `<button onclick="updateStatus(${o.id},'processing')">Process</button>` : ''}
        <button class="delete" onclick="deleteOrder(${o.id})">Delete</button>
      </div>
    </li>`).join('');
}
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    orderFilter = btn.dataset.status;
    renderOrders();
  });
});
window.addOrder = addOrder;
window.deleteOrder = deleteOrder;
window.updateStatus = updateStatus;
window.clearAllOrders = clearAllOrders;
renderOrders();
