/* ==========================================================
   Vaultly – login page behaviour
   1. 3D cube + card tilt
   2. View switching (sign in / sign up / forgot / success)
   3. Validation, password tools, simulated authentication
   ========================================================== */

(() => {
  "use strict";

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;

  const card  = $("#card");
  const cube  = $("#cube");
  const tabs  = $("#tabs");
  const toast = $("#toast");

  $("#year").textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     1. 3D motion
     --------------------------------------------------------- */
  const pointer = { x: 0, y: 0 };            // -0.5 .. 0.5
  const cubeState = { rx: -18, ry: 30, spin: 0 };

  if (!prefersReducedMotion) {
    window.addEventListener("pointermove", (e) => {
      pointer.x = e.clientX / window.innerWidth - 0.5;
      pointer.y = e.clientY / window.innerHeight - 0.5;

      if (canHover) tiltCard(e);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--glare-y", "0%");
    });

    const loop = () => {
      cubeState.spin += 0.35;
      const targetRx = -18 + pointer.y * -50;
      const targetRy = 30 + pointer.x * 90;
      // ease toward the pointer position
      cubeState.rx += (targetRx - cubeState.rx) * 0.06;
      cubeState.ry += (targetRy - cubeState.ry) * 0.06;
      cube.style.transform =
        `rotateX(${cubeState.rx.toFixed(2)}deg) rotateY(${(cubeState.ry + cubeState.spin).toFixed(2)}deg)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  function tiltCard(e) {
    const r = card.getBoundingClientRect();
    const nx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
    const ny = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
    const max = 14;
    card.style.setProperty("--tilt-y", `${(nx * max).toFixed(2)}deg`);
    card.style.setProperty("--tilt-x", `${(-ny * max).toFixed(2)}deg`);
    card.style.setProperty("--glare-x", `${((e.clientX - r.left) / r.width * 100).toFixed(0)}%`);
    card.style.setProperty("--glare-y", `${((e.clientY - r.top) / r.height * 100).toFixed(0)}%`);
  }

  /* ---------------------------------------------------------
     2. View switching
     --------------------------------------------------------- */
  const views = $$(".view");
  const tabButtons = $$(".tab", tabs);

  function showView(name) {
    views.forEach((v) => { v.hidden = v.dataset.view !== name; });
    tabs.dataset.active = name;
    tabs.hidden = name === "success";

    tabButtons.forEach((b) => {
      const active = b.dataset.view === name;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", String(active));
    });

    const first = $(`.view[data-view="${name}"] input:not([type="checkbox"])`);
    if (first) setTimeout(() => first.focus({ preventScroll: true }), 50);
  }

  tabButtons.forEach((b) => b.addEventListener("click", () => showView(b.dataset.view)));
  $$("[data-goto]").forEach((b) => b.addEventListener("click", () => showView(b.dataset.goto)));

  /* ---------------------------------------------------------
     3. Helpers: toast, errors, loading
     --------------------------------------------------------- */
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
  }

  function setError(input, message) {
    const field = input.closest(".field");
    const err = $(`#${input.id}-err`);
    if (field) field.classList.add("has-error");
    input.setAttribute("aria-invalid", "true");
    if (err) err.textContent = message;
  }

  function clearError(input) {
    const field = input.closest(".field");
    const err = $(`#${input.id}-err`);
    if (field) field.classList.remove("has-error");
    input.removeAttribute("aria-invalid");
    if (err) err.textContent = "";
  }

  function setLoading(form, on) {
    const btn = $(".btn-primary", form);
    btn.classList.toggle("is-loading", on);
    btn.disabled = on;
  }

  function shakeCard() {
    if (prefersReducedMotion) return;
    card.classList.remove("shake");
    void card.offsetWidth; // restart animation
    card.classList.add("shake");
  }

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // clear an error as soon as the person edits the field
  $$("input").forEach((i) => i.addEventListener("input", () => {
    clearError(i);
    const formErr = i.closest("form")?.querySelector(".form-err");
    if (formErr) formErr.textContent = "";
  }));

  /* ---------------------------------------------------------
     Validators
     --------------------------------------------------------- */
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function validEmail(input) {
    const v = input.value.trim();
    if (!v) { setError(input, "Enter your email address."); return false; }
    if (!emailRe.test(v)) { setError(input, "Enter a valid email, like name@company.com."); return false; }
    return true;
  }

  function passwordScore(pw) {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  }

  /* ---------------------------------------------------------
     Password tools: show/hide, caps lock, strength meter
     --------------------------------------------------------- */
  $$(".eye").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = $(`#${btn.dataset.toggle}`);
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.classList.toggle("is-on", show);
      btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });
  });

  const siPass = $("#si-pass");
  const capsHint = $(".hint.caps");
  const checkCaps = (e) => {
    if (typeof e.getModifierState === "function") capsHint.hidden = !e.getModifierState("CapsLock");
  };
  siPass.addEventListener("keydown", checkCaps);
  siPass.addEventListener("keyup", checkCaps);
  siPass.addEventListener("blur", () => { capsHint.hidden = true; });

  const meter = $("#meter");
  const meterText = $("#meter-text");
  const strengthLabels = ["Use 8+ characters with upper and lower case, a number and a symbol.",
                          "Weak. Add more variety.", "Fair. Almost there.", "Good password.", "Strong password."];
  $("#su-pass").addEventListener("input", (e) => {
    const score = e.target.value ? passwordScore(e.target.value) : 0;
    meter.dataset.level = score;
    meterText.textContent = strengthLabels[score];
  });

  /* ---------------------------------------------------------
     Simulated backend
     Replace these functions with real fetch() calls to your API.
     Never store plain-text passwords in the browser.
     --------------------------------------------------------- */
  const registered = new Map([["demo@example.com", { name: "Demo User", password: "Demo@1234" }]]);

  async function apiLogin(email, password) {
    await wait(1300);
    const user = registered.get(email.toLowerCase());
    if (!user || user.password !== password) throw new Error("The email or password is incorrect. Check both and try again.");
    return { name: user.name };
  }

  async function apiRegister(name, email, password) {
    await wait(1400);
    if (registered.has(email.toLowerCase())) throw new Error("An account with this email already exists. Sign in instead.");
    registered.set(email.toLowerCase(), { name, password });
    return { name };
  }

  async function apiReset(email) {
    await wait(1100);
    return true;
  }

  /* ---------------------------------------------------------
     Remember me (stores the email only)
     --------------------------------------------------------- */
  const emailInput = $("#si-email");
  const remember = $("#remember");
  try {
    const saved = localStorage.getItem("vaultly-email");
    if (saved) { emailInput.value = saved; remember.checked = true; }
  } catch (_) { /* storage unavailable, ignore */ }

  /* ---------------------------------------------------------
     Success view
     --------------------------------------------------------- */
  function showSuccess(title, text, btnLabel) {
    $("#success-title").textContent = title;
    $("#success-text").textContent = text;
    $(".btn-label", $("#success-btn")).textContent = btnLabel;
    showView("success");
  }

  $("#success-btn").addEventListener("click", () => {
    $$("form").forEach((f) => f.reset());
    meter.dataset.level = 0;
    meterText.textContent = strengthLabels[0];
    showView("signin");
  });

  /* ---------------------------------------------------------
     Form: sign in
     --------------------------------------------------------- */
  $("#view-signin").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const pass = $("#si-pass");
    const formErr = $("#si-form-err");
    formErr.textContent = "";

    const okEmail = validEmail(emailInput);
    let okPass = true;
    if (!pass.value) { setError(pass, "Enter your password."); okPass = false; }
    if (!okEmail || !okPass) { shakeCard(); return; }

    setLoading(form, true);
    try {
      const user = await apiLogin(emailInput.value.trim(), pass.value);
      try {
        if (remember.checked) localStorage.setItem("vaultly-email", emailInput.value.trim());
        else localStorage.removeItem("vaultly-email");
      } catch (_) { /* ignore */ }
      showSuccess(`Welcome back, ${user.name.split(" ")[0]}`, "You are signed in. Redirecting to your dashboard...", "Sign out");
      // window.location.href = "/dashboard";   // <- enable with a real backend
    } catch (err) {
      formErr.textContent = err.message;
      shakeCard();
    } finally {
      setLoading(form, false);
    }
  });

  /* ---------------------------------------------------------
     Form: sign up
     --------------------------------------------------------- */
  $("#view-signup").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = $("#su-name"), email = $("#su-email"), pass = $("#su-pass"), confirm = $("#su-confirm");
    const terms = $("#terms"), termsErr = $("#su-terms-err");
    termsErr.textContent = "";

    let ok = true;
    if (name.value.trim().length < 2) { setError(name, "Enter your full name."); ok = false; }
    if (!validEmail(email)) ok = false;

    if (pass.value.length < 8) { setError(pass, "Use at least 8 characters."); ok = false; }
    else if (passwordScore(pass.value) < 3) { setError(pass, "Add upper and lower case letters, a number or a symbol."); ok = false; }

    if (!confirm.value) { setError(confirm, "Re-enter your password."); ok = false; }
    else if (confirm.value !== pass.value) { setError(confirm, "The passwords do not match."); ok = false; }

    if (!terms.checked) { termsErr.textContent = "Accept the terms to create your account."; ok = false; }

    if (!ok) { shakeCard(); return; }

    setLoading(form, true);
    try {
      const user = await apiRegister(name.value.trim(), email.value.trim(), pass.value);
      showSuccess(`Account created, ${user.name.split(" ")[0]}`, "Check your inbox to verify your email address.", "Go to sign in");
    } catch (err) {
      setError(email, err.message);
      shakeCard();
    } finally {
      setLoading(form, false);
    }
  });

  /* ---------------------------------------------------------
     Form: forgot password
     --------------------------------------------------------- */
  $("#view-forgot").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = $("#fp-email");
    if (!validEmail(email)) { shakeCard(); return; }

    setLoading(form, true);
    try {
      await apiReset(email.value.trim());
      showSuccess("Check your email", `If an account exists for ${email.value.trim()}, a reset link is on its way.`, "Back to sign in");
    } finally {
      setLoading(form, false);
    }
  });

  /* ---------------------------------------------------------
     Social buttons (hook up your OAuth flow here)
     --------------------------------------------------------- */
  /* ---------------------------------------------------------
     Social sign-in: account chooser
     This is a front-end preview of the Google / GitHub account
     picker. For real sign-in, use Google Identity Services and
     GitHub OAuth with your own client IDs (needs a backend).
     --------------------------------------------------------- */
  const modal      = $("#account-modal");
  const modalBox   = $(".modal-box", modal);
  const accountsEl = $("#accounts");
  const anotherBtn = $("#another");
  const anotherForm = $("#another-form");
  const otEmail    = $("#ot-email");
  const avatarColors = ["#38e1c0", "#ffb454", "#8ab4ff", "#ff9bb3", "#c6e35a"];

  const sampleAccounts = {
    Google: [
      { name: "Demo User",    email: "demo@example.com" },
      { name: "Rahul Sharma", email: "rahul.sharma@gmail.com" },
      { name: "Priya Das",    email: "priya.das@gmail.com" }
    ],
    GitHub: [
      { name: "demo-user",    email: "demo@example.com" },
      { name: "rahul-codes",  email: "rahul.sharma@gmail.com" },
      { name: "priyadas",     email: "priya.das@gmail.com" }
    ]
  };

  let activeProvider = "Google";
  let lastTrigger = null;

  function openAccountModal(provider, trigger) {
    activeProvider = provider;
    lastTrigger = trigger;

    $("#modal-logo").replaceChildren($("svg", trigger).cloneNode(true));
    $("#modal-title").textContent = provider === "Google" ? "Choose an account" : "Choose a GitHub account";
    $("#modal-sub").textContent = "to continue to Vaultly";
    $("#ot-label").textContent = provider === "Google" ? "Email or phone" : "Username or email";
    otEmail.placeholder = provider === "Google" ? "you@gmail.com" : "username or email";

    accountsEl.replaceChildren();
    sampleAccounts[provider].forEach((acc, i) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "account";

      const avatar = document.createElement("span");
      avatar.className = "avatar";
      avatar.textContent = acc.name[0].toUpperCase();
      avatar.style.background = avatarColors[i % avatarColors.length];

      const info = document.createElement("span");
      info.className = "account-info";
      const n = document.createElement("div");
      n.className = "account-name";
      n.textContent = acc.name;
      const m = document.createElement("div");
      m.className = "account-mail";
      m.textContent = acc.email;
      info.append(n, m);

      btn.append(avatar, info);
      btn.addEventListener("click", () => finishSocialLogin(acc.name, acc.email));
      li.append(btn);
      accountsEl.append(li);
    });

    anotherForm.hidden = true;
    anotherBtn.hidden = false;
    clearError(otEmail);
    otEmail.value = "";
    modalBox.classList.remove("is-busy");
    modal.hidden = false;
    $(".account", modal).focus();
  }

  function closeAccountModal() {
    modal.hidden = true;
    if (lastTrigger) lastTrigger.focus();
  }

  async function finishSocialLogin(name, email) {
    modalBox.classList.add("is-busy");
    $("#modal-sub").textContent = `Signing in as ${email}...`;
    await wait(1200);
    modal.hidden = true;
    const first = name.split(/[\s.-]/)[0];
    showSuccess(`Welcome, ${first}`, `Signed in with ${activeProvider} as ${email}.`, "Sign out");
  }

  $$(".social").forEach((b) => b.addEventListener("click", () => openAccountModal(b.dataset.provider, b)));

  anotherBtn.addEventListener("click", () => {
    anotherBtn.hidden = true;
    anotherForm.hidden = false;
    otEmail.focus();
  });

  anotherForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validEmail(otEmail)) return;
    const email = otEmail.value.trim();
    const local = email.split("@")[0].replace(/[._-]+/g, " ");
    const name = local.replace(/\b\w/g, (c) => c.toUpperCase());
    finishSocialLogin(name, email);
  });

  $("#modal-close").addEventListener("click", closeAccountModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeAccountModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeAccountModal(); });

  // Start on the sign-in view
  showView("signin");
})();
