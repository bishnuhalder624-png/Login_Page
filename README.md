# Vaultly – 3D Login Page

A modern, interactive login page built with plain **HTML, CSS and JavaScript**. No frameworks, no build step, no dependencies. A rotating 3D cube reacts to your mouse, the login card tilts in 3D space, and the whole flow (sign in, sign up, password reset, social sign-in) works out of the box.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green)
![Dependencies](https://img.shields.io/badge/dependencies-none-38e1c0)

<!--
  Add a screenshot or GIF here after you run the project:
  1. Save it as assets/preview.png (or .gif)
  2. Replace this comment with:  ![Preview](assets/preview.png)
-->

---

## Features

**Look and feel**
- Interactive **3D cube** built with CSS 3D transforms. It spins on its own and follows the pointer.
- **Tilting glass card** with a moving light glare and elements that float above the card surface.
- Perspective grid floor, soft glowing background orbs, and a dark ocean-and-aqua colour palette.
- Smooth tab switching, animated success checkmark, and a shake animation on failed submits.

**Authentication flow**
- **Sign in** with email and password, "Keep me signed in" (remembers the email only), and a Caps Lock warning.
- **Create account** with full name, email, password, confirm password and a terms checkbox.
- **Password strength meter** (weak, fair, good, strong).
- **Forgot password** screen with a reset-link confirmation.
- **Google and GitHub account chooser** popup (front-end preview, see [Social sign-in](#social-sign-in)).
- Show/hide password toggle on every password field.

**Quality**
- Inline validation with clear, specific error messages.
- Loading spinner and disabled button while a request is running.
- Fully **responsive**, from phones to wide desktops.
- **Accessible**: labelled inputs, `aria-live` error messages, visible keyboard focus, `Esc` closes the popup.
- Respects `prefers-reduced-motion`. Tilt is switched off on touch devices.

---

## Quick start

No installation needed.

```bash
git clone https://github.com/<your-username>/vaultly-login.git
cd vaultly-login
```

Then either open `index.html` in your browser, or serve it locally:

```bash
# Python
python3 -m http.server 5500

# or Node
npx serve .
```

Open `http://localhost:5500`.

**Demo login**

| Email | Password |
|-------|----------|
| `demo@example.com` | `Demo@1234` |

> The Google Fonts stylesheet needs an internet connection. Offline, the page falls back to system fonts.

---

## Project structure

```
vaultly-login/
├── index.html    # Page structure: cube scene, login card, account popup
├── style.css     # Theme variables, 3D effects, layout, responsive rules
├── script.js     # 3D motion, validation, view switching, simulated API
└── README.md
```

---

## Customisation

**Colours and fonts.** Everything lives in the `:root` block at the top of `style.css`:

```css
:root {
  --bg: #0b1724;
  --aqua: #38e1c0;   /* primary accent */
  --amber: #ffb454;  /* secondary accent */
  --font-head: "Sora", sans-serif;
  --font-body: "Manrope", sans-serif;
}
```

**Brand name and logo.** Search for `Vaultly` in `index.html` and replace the text and the logo SVG inside `.logo`.

**Cube speed and size.**
- Speed: change `cubeState.spin += 0.35` in `script.js`.
- Size: change `--size` on `.scene` in `style.css`.

**Card tilt strength.** Change `const max = 14;` inside `tiltCard()` in `script.js`.

---

## Connecting a real backend

The page currently uses a **simulated** backend so you can try every screen without a server. Three functions in `script.js` stand in for your API:

| Function | Purpose |
|----------|---------|
| `apiLogin(email, password)` | Sign in |
| `apiRegister(name, email, password)` | Create account |
| `apiReset(email)` | Send reset link |

Replace the body of each with a real request, for example:

```js
async function apiLogin(email, password) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error("The email or password is incorrect.");
  return res.json(); // { name: "..." }
}
```

Then uncomment the redirect line in the sign-in handler:

```js
// window.location.href = "/dashboard";
```

### Social sign-in

The Google and GitHub buttons open an account chooser populated with **sample accounts**. It shows the flow and design only. A web page cannot read the accounts a person has signed in to on their device, so real sign-in needs:

- **Google:** [Google Identity Services](https://developers.google.com/identity/gsi/web) with your own OAuth client ID.
- **GitHub:** a [GitHub OAuth App](https://docs.github.com/en/apps/oauth-apps) and a small server endpoint to exchange the code for a token.

Hook these into the `.social` button click handler in `script.js`, and remove the sample accounts.

---

## Security notes

This is a front-end template. Before using it in production:

- Do all authentication and password checks **on the server**. Client-side validation is only for convenience.
- Always serve the page over **HTTPS**.
- Hash passwords on the server with a modern algorithm (Argon2id or bcrypt). Never store passwords in the browser.
- Use `HttpOnly`, `Secure`, `SameSite` cookies for sessions, and add CSRF protection.
- Add rate limiting and lockouts on login and password-reset endpoints.
- "Keep me signed in" only stores the **email address** in `localStorage`. Never put tokens or passwords there.

---

## Browser support

Works in current versions of Chrome, Edge, Firefox and Safari. It relies on CSS 3D transforms, CSS variables, `backdrop-filter` and ES6 JavaScript.

---

## Deploy to GitHub Pages

1. Push the project to a GitHub repository.
2. Go to **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. Your page will be live at `https://<your-username>.github.io/<repo-name>/` after a minute or two.

---

## Roadmap

- [ ] Light theme and theme toggle
- [ ] One-time code (OTP) screen for two-step verification
- [ ] "Sign in with passkey" option
- [ ] Multi-language support
- [ ] Real Google and GitHub OAuth example with a Node.js server

---

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push the branch: `git push origin feature/your-feature`
5. Open a pull request

Please keep the project dependency-free and test on both desktop and mobile.

---

## License

Released under the [MIT License](LICENSE). Add a `LICENSE` file to your repository (GitHub can create one for you when you add a new file named `LICENSE`).

---

If this project helped you, consider giving it a star on GitHub.
