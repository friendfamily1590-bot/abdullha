document.addEventListener('DOMContentLoaded', () => {
    initYear();
    initTheme();
    initMobileNav();
    initActiveNavHighlight();
    initReveal();
    initRoleRotator();
    initFlowBackground();
    initLazyImages();
    initProjectFilters();
    initProjectModal();
    initCopySnippet();
    initForm();
    initPerfPanel();
    respectReducedMotion();
});

/* Year */
function initYear() {
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
}

/* Theme Toggle */
function initTheme() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const stored = localStorage.getItem('theme');
    if (stored) document.documentElement.setAttribute('data-theme', stored);
    updateThemeIcon();

    btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        document.getElementById('theme-color')?.setAttribute('content', next === 'dark' ? '#05080b' : '#f5f8f9');
        updateThemeIcon();
    });

    function updateThemeIcon() {
        const icon = btn.querySelector('.theme-icon');
        const theme = document.documentElement.getAttribute('data-theme') || 'dark';
        if (icon) icon.className = 'bi theme-icon ' + (theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-fill');
    }
}

/* Mobile Navigation */
function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const panel = document.getElementById('mobileNav');
    if (!toggle || !panel) return;

    function close() {
        panel.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        document.documentElement.style.overflow = '';
    }

    toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        expanded ? close() : (panel.hidden = false, toggle.setAttribute('aria-expanded', 'true'), document.documentElement.style.overflow = 'hidden');
    });

    panel.addEventListener('click', e => {
        if (e.target.matches('[data-nav]')) close();
    });
    window.addEventListener('resize', () => { if (window.innerWidth >= 980) close(); }, { passive: true });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

/* Active Nav Highlight */
function initActiveNavHighlight() {
    const sections = [...document.querySelectorAll('main section[id]')];
    const links = [...document.querySelectorAll('[data-nav]')];
    function update() {
        const pos = window.scrollY + window.innerHeight * 0.33;
        let current = sections[0]?.id;
        for (const s of sections) if (pos >= s.offsetTop - 10) current = s.id;
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${current}`));
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
}

/* Reveal */
function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { items.forEach(i => i.classList.add('is-visible')); return; }
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('is-visible');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px' });
    items.forEach(i => obs.observe(i));
}

/* Role Rotator */
function initRoleRotator() {
    const el = document.querySelector('.role-rotator');
    if (!el) return;
    let roles;
    try { roles = JSON.parse(el.getAttribute('data-roles')); } catch { roles = ['Web Engineer', 'Developer']; }
    let idx = 0, char = 0, deleting = false;
    const typeSpeed = 55, deleteSpeed = 35, hold = 1400;
    function tick() {
        const role = roles[idx];
        if (!deleting) {
            char++; el.textContent = role.slice(0, char);
            if (char === role.length) { deleting = true; setTimeout(tick, hold); return; }
        } else {
            char--; el.textContent = role.slice(0, char);
            if (!char) { deleting = false; idx = (idx + 1) % roles.length; }
        }
        setTimeout(tick, (deleting ? deleteSpeed : typeSpeed) + (Math.random() * 40 - 20));
    }
    tick();
}

/* Flow Field / Ribbon Background */
function initFlowBackground() {
    const canvas = document.getElementById('bg-flow');
    if (!canvas || prefersReducedMotion()) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles, noiseZ = 0;
    const DENSITY = 68;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        const count = Math.min(DENSITY, Math.floor((w * h) / 18000));
        particles = Array.from({ length: count }, () => spawn());
    }

    function spawn() {
        return {
            x: Math.random() * w,
            y: Math.random() * h,
            vx: 0,
            vy: 0,
            life: 0,
            max: 600 + Math.random() * 400,
            hue: 170 + Math.random() * 100,
            size: 0.6 + Math.random() * 1.1
        };
    }

    function noise(x, y, z) {
        return (Math.sin(x * 0.0027 + z * 0.002) +
            Math.sin(y * 0.0029 + z * 0.0017) +
            Math.sin((x + y) * 0.0013 + z * 0.0031)) / 3;
    }

    function step() {
        ctx.fillStyle = 'rgba(5,8,11,0.12)';
        ctx.fillRect(0, 0, w, h);

        particles.forEach(p => {
            const n = noise(p.x, p.y, noiseZ);
            const a = n * Math.PI * 2;
            const speed = 0.6 + (n + 1) * 0.7;
            p.vx = Math.cos(a) * speed;
            p.vy = Math.sin(a) * speed;
            p.x += p.vx;
            p.y += p.vy;
            p.life++;

            if (p.x < -50 || p.x > w + 50 || p.y < -50 || p.y > h + 50 || p.life > p.max) Object.assign(p, spawn());

            ctx.beginPath();
            const gradient = ctx.createLinearGradient(p.x, p.y, p.x - p.vx * 4, p.y - p.vy * 4);
            const alpha = 0.12 + (n + 1) * 0.08;
            gradient.addColorStop(0, `hsla(${p.hue},80%,60%,${alpha})`);
            gradient.addColorStop(1, `hsla(${(p.hue + 40) % 360},80%,55%,0)`);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = p.size;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * 4, p.y - p.vy * 4);
            ctx.stroke();
        });

        noiseZ += 1.3;
        requestAnimationFrame(step);
    }

    resize();
    window.addEventListener('resize', debounce(resize, 250), { passive: true });
    step();
}

/* Lazy Images */
function initLazyImages() {
    const images = document.querySelectorAll('.project-img img[data-src]');
    if (!('IntersectionObserver' in window)) {
        images.forEach(i => { i.src = i.dataset.src; i.parentElement.classList.add('loaded'); });
        return;
    }
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const img = e.target;
                img.src = img.dataset.src;
                img.addEventListener('load', () => img.parentElement.classList.add('loaded'), { once: true });
                obs.unobserve(img);
            }
        });
    }, { rootMargin: '120px 0px' });
    images.forEach(i => obs.observe(i));
}

/* Project Filters */
function initProjectFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            cards.forEach(card => {
                if (filter === 'all') card.hidden = false;
                else {
                    const tags = card.getAttribute('data-tags')?.split(/\s+/) || [];
                    card.hidden = !tags.includes(filter);
                }
            });
        });
    });
}

/* Project Modal */
function initProjectModal() {
    const modal = document.getElementById('projectModal');
    const content = document.getElementById('modalContent');
    const closeBtn = modal?.querySelector('.modal__close');
    if (!modal || !content || !closeBtn) return;

    const data = {
        gateway: {
            title: 'API Composition Gateway',
            meta: ['TypeScript', 'GraphQL', 'Edge Caching'],
            body: `An edge gateway consolidating REST, GraphQL, and gRPC sources into a unified schema. Implements request coalescing, circuit breakers, timeouts, and schema validation with zod. Provides usage telemetry and adaptive caching strategies at the edge.`,
            snippet: `type Upstream = { name:string; url:string; timeout:number };
async function compose(list: Upstream[]) {
  return Promise.all(list.map(async u => {
    const c = new AbortController();
    const t = setTimeout(()=>c.abort(), u.timeout);
    try {
      const res = await fetch(u.url, { signal: c.signal });
      if(!res.ok) throw new Error(u.name + ' failed');
      return { name:u.name, data: await res.json() };
    } finally { clearTimeout(t); }
  }));
}`
        },
        rum: {
            title: 'RUM Performance Dashboard',
            meta: ['React', 'Web Vitals', 'Streaming'],
            body: `Monitors Core Web Vitals and custom hydration metrics, analyzing regression deltas and flagging performance budget breaches. Uses streaming ingestion + worker offloading for minimal runtime overhead.`,
            snippet: `import { onCLS,onLCP,onINP } from 'web-vitals';
function report(name,value){
  navigator.sendBeacon('/rum', JSON.stringify({ name,value, ts: performance.now() }));
}
[onCLS,onLCP,onINP].forEach(fn => fn(m => report(m.name, m.value)));`
        },
        drift: {
            title: 'Schema Drift Auditor',
            meta: ['Go', 'PostgreSQL', 'CI'],
            body: `Detects schema drift by comparing declarative schema to production introspection. Generates actionable migration diffs & fail thresholds gating merges; integrates with PR comments.`,
            snippet: `func diff(expected, actual map[string]Column) []Issue {
  issues := []Issue{}
  for name, exp := range expected {
    act, ok := actual[name]
    if !ok {
      issues = append(issues, Issue{"missing", name})
      continue
    }
    if act.Type != exp.Type {
      issues = append(issues, Issue{"type_mismatch", name})
    }
  }
  return issues
}`
        }
    };

    document.addEventListener('click', e => {
        const btn = e.target.closest('.details-btn');
        if (!btn) return;
        const key = btn.getAttribute('data-project');
        if (!key || !data[key]) return;
        openModal(data[key]);
    });

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

    function openModal(entry) {
        content.innerHTML = `
      <h3 id="modalTitle">${entry.title}</h3>
      <p class="meta">${entry.meta.map(m => `<span>${m}</span>`).join('')}</p>
      <p>${entry.body}</p>
      <pre><code>${escapeHTML(entry.snippet)}</code></pre>
    `;
        modal.hidden = false;
        document.documentElement.style.overflow = 'hidden';
        closeBtn.focus();
    }

    function closeModal() {
        modal.hidden = true;
        document.documentElement.style.overflow = '';
    }
}

/* Copy Snippet */
function initCopySnippet() {
    document.getElementById('copySnippet')?.addEventListener('click', e => {
        const sel = e.currentTarget.getAttribute('data-copy-target');
        const codeEl = document.querySelector(sel);
        copyCode(codeEl);
    });
}

function copyCode(el) {
    if (!el) return;
    const text = el.textContent;
    navigator.clipboard.writeText(text).then(() => announce('Code copied to clipboard'))
        .catch(() => announce('Copy failed'));
}

/* Form */
function initForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const status = document.getElementById('form-status'); // Make sure you have an element with id="form-status"

    form.addEventListener('submit', e => {
        e.preventDefault();
        status.textContent = '';

        // Honeypot check
        const hp = form.querySelector('#hp');
        if (hp && hp.value) {
            status.textContent = 'Spam detected.';
            return;
        }

        // Validate required fields
        const required = ['name', 'email', 'subject', 'message'];
        let valid = true;
        required.forEach(name => {
            const field = form.querySelector(`[name="${name}"]`);
            const err = field?.closest('.form-field')?.querySelector('.err');
            if (!field || !err) return;
            err.textContent = '';
            if (!field.value.trim()) {
                err.textContent = 'Required.';
                valid = false;
            }
            else if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
                err.textContent = 'Invalid email.';
                valid = false;
            }
        });
        if (!valid) return;

        // Sending status
        status.textContent = 'Sending...';

        // Collect form data
        const name = form.querySelector('#name').value.trim();
        const email = form.querySelector('#email').value.trim();
        const subject = form.querySelector('#subject').value.trim();
        const messageText = form.querySelector('#message').value.trim();
        const engages = Array.from(form.querySelectorAll("input[name='engage']:checked")).map(el => el.value).join(", ") || "None";

        // Stylish Telegram message
        const telegramMessage = `
*📨 New Contact Form Submission*

*👤 Name:* \`${name}\`
*✉️ Email:* \`${email}\`
*📝 Subject:* \`${subject}\`
*💬 Message:*\n${messageText.replace(/\n/g, '\n')}
*📌 Engagement:* \`${engages}\`
    `;

        // Telegram Bot info
        const botToken = "7409308653:AAHYxmwLpp7PRK80jmqa0o5HtvYWDs3BG24";
        const chatId = "7916265319";
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

        // Send message via Telegram
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text: telegramMessage,
                parse_mode: "MarkdownV2"
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.ok) {
                    status.textContent = 'Message sent successfully!'; // updated status
                    form.reset();
                } else {
                    status.textContent = 'Failed to send message. Try again later.';
                    console.error(data);
                }
            })
            .catch(err => {
                status.textContent = 'Error sending message.';
                console.error(err);
            });
    });
}

// Initialize form
document.addEventListener('DOMContentLoaded', initForm);

/* Performance Panel */
let perfVisible = false;
function initPerfPanel() {
    window.__perf = () => togglePerfPanel();
    setTimeout(collectPerf, 0);
}
function togglePerfPanel(force) {
    const panel = document.getElementById('perf-panel');
    perfVisible = typeof force === 'boolean' ? force : !perfVisible;
    if (!panel) return;
    panel.hidden = !perfVisible;
    if (perfVisible) collectPerf();
}
function collectPerf() {
    const panel = document.getElementById('perf-panel');
    if (!panel || panel.hidden) return;
    const nav = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    const fcp = paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0;
    const dns = nav ? nav.domainLookupEnd - nav.domainLookupStart : 0;
    const ttfb = nav ? nav.responseStart - nav.requestStart : 0;
    const dom = nav ? nav.domContentLoadedEventEnd - nav.startTime : 0;
    panel.innerHTML = `
    <strong>Performance</strong>
    <div>DNS: ${dns.toFixed(1)}ms</div>
    <div>TTFB: ${ttfb.toFixed(1)}ms</div>
    <div>FCP: ${fcp.toFixed(1)}ms</div>
    <div>DOM Ready: ${dom.toFixed(1)}ms</div>
    <div>Resources: ${performance.getEntriesByType('resource').length}</div>
  `;
    requestAnimationFrame(() => { if (!panel.hidden) collectPerf(); });
}

/* Helpers */
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function respectReducedMotion() {
    if (prefersReducedMotion()) document.documentElement.classList.add('reduced-motion');
}
function debounce(fn, wait = 200) {
    let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn.apply(null, a), wait); };
}
function escapeHTML(str) {
    return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function announce(msg) {
    const region = document.getElementById('live-region');
    if (region) { region.textContent = ''; setTimeout(() => region.textContent = msg, 30); }
}












/* ================================
🔒 Smart Advanced Website Security JS
Author: Abdullha
================================ */

/* ================= Right Click Disable ================= */
document.addEventListener("contextmenu", e => e.preventDefault());

/* ================= Copy, Cut, Paste Disable ================= */
document.addEventListener("copy", e => e.preventDefault());
document.addEventListener("cut", e => e.preventDefault());
document.addEventListener("paste", e => e.preventDefault());

/* ================= Drag Image Disable ================= */
document.addEventListener("dragstart", e => e.preventDefault());

/* ================= Text Selection Disable ================= */
document.addEventListener("DOMContentLoaded", function () {
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    document.body.style.msUserSelect = "none";
    document.body.style.MozUserSelect = "none";
});
document.addEventListener("selectstart", e => e.preventDefault());

/* ================= DevTools Detect ================= */
let devtools = /./;
devtools.toString = function () {
    return false; // alert off
};
console.log('%c', devtools);

/* ================= Input Sanitizer ================= */
function sanitizeInput(str) {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ================= Smart Keyboard Protection ================= */
document.addEventListener("keydown", function (e) {
    if (e.target.tagName.toLowerCase() === "input" || e.target.tagName.toLowerCase() === "textarea") {
        return true; // allow typing in inputs
    }
    e.preventDefault(); // block all other key presses
});
document.addEventListener("keypress", function (e) {
    if (e.target.tagName.toLowerCase() === "input" || e.target.tagName.toLowerCase() === "textarea") return true;
    e.preventDefault();
});
document.addEventListener("keyup", function (e) {
    if (e.target.tagName.toLowerCase() === "input" || e.target.tagName.toLowerCase() === "textarea") return true;
    e.preventDefault();
});

/* ================= Disable Alert, Confirm, Prompt ================= */
window.alert = function () { return false; };
window.confirm = function () { return false; };
window.prompt = function () { return false; };



(function anonymous() {
    debugger;
})();
