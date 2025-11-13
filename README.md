# 🧩 React Extension Slot System

A lightweight, plugin-style **extension–slot mechanism** built with **React + TypeScript + Zustand**.  
This architecture allows you to dynamically register reusable UI components (“extensions”) and render them in specific placeholder areas (“slots”).

---

## 🚀 Features

- 🧠 Built on [Zustand](https://github.com/pmndrs/zustand) for simple, global state.
- 🧩 Clean separation between **slots** (where content goes) and **extensions** (what content appears).
- ⚡ Dynamically register extensions at runtime — no recompilation needed.
- 🔗 Attach extensions to multiple slots.
- 💡 Designed for extensible dashboards, microfrontends, or modular UIs.

---

## 🏗️ Core Concepts

| Concept | Description |
|----------|--------------|
| **Extension** | A reusable React component registered globally, e.g., `<UserBadge />`, `<BillingSummary />`. |
| **Slot** | A placeholder in the UI that can host one or more extensions. |
| **Attachment** | The mapping between slots and extensions, managed via store actions. |

---

## 📦 Local setup

Installation 
```bash
npm install
```

Start locally
```bash
npm run dev
```

## Architecture
<img width="1034" height="643" alt="Screenshot 2025-11-13 at 8 35 59 PM" src="https://github.com/user-attachments/assets/4852577e-6f1e-452a-a7a2-4f118642e0fc" />
