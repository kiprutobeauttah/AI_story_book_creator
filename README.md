
# 📖 AI Storybook Creator
## Beauttah

A powerful AI-driven storybook generator built with **Next.js 15**, **Tailwind CSS**, and **OpenAI** APIs. It allows users to generate children’s stories and illustrations based on input like character names, themes, and age groups.

---

## 🗂️ Project Structure

```

ai-storybook-creator/
├── .next/                 # Production build output (generated after build)
├── app/                  # App directory for Next.js 13+ routing
├── components/           # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # API clients, utilities, config, services
├── node\_modules/         # Installed packages
├── public/               # Static files (images, icons, etc.)
├── styles/               # Tailwind and global styles
├── .gitignore
├── components.json
├── middleware.ts         # Middleware for route handling
├── next-env.d.ts
├── next.config.js        # Next.js configuration (with CORS header)
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json           # Vercel deployment config (if used)

````

---

## 🚀 Getting Started

### ✅ Prerequisites

- Node.js (v18+ recommended)
- pnpm (or npm/yarn)
- OpenAI API Key (for story/image generation)

### 📦 Install Dependencies

```bash
pnpm install
````

### 💻 Start Development Server

```bash
pnpm dev
```

* Local: [http://localhost:3000](http://localhost:3000)
* Network: [http://172.16.55.26:3000](http://172.16.55.26:3000)

> ℹ️ Your dev environment supports CORS for `172.16.55.26` using custom headers in `next.config.js`.

### 🏗️ Build for Production

```bash
pnpm build
pnpm start
```

> ❗ Make sure `.next` is generated by running `build` before `start`.

---

## 🔌 Environment Variables

Create a `.env.local` file:

```
OPENAI_API_KEY=your_openai_key_here
```

---

## 🧠 API Routes

> Located in `/app/api/` using the App Router system.

### 🔮 POST `/api/generate-story`

**Request:**

```json
{
  "title": "The Brave Bunny",
  "character": "Bunny",
  "theme": "Kindness",
  "ageGroup": "3-6"
}
```

**Response:**

```json
{
  "story": "Once upon a time, Bunny helped all the animals in the forest..."
}
```

---

### 🖼️ POST `/api/generate-image`

**Request:**

```json
{
  "description": "A cute bunny helping forest animals"
}
```

**Response:**

```json
{
  "imageUrl": "https://cdn.site.com/images/bunny-forest.png"
}
```

---

### 💾 POST `/api/save-story`

**Request:**

```json
{
  "title": "Brave Bunny",
  "pages": [
    { "text": "Once upon a time...", "image": "https://..." }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Story saved successfully",
  "id": "abc123"
}
```

---

## 🎨 Styling

TailwindCSS is configured via:

* `tailwind.config.ts`
* `postcss.config.mjs`
* Global styles are under `/styles/`

---

## 🔐 Middleware

`middleware.ts` enables advanced routing features, authentication, or analytics logic.

---

## ⚙️ Custom Headers (`next.config.js`)

Your project includes CORS support with:

```js
headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: 'http://172.16.55.26',
        },
      ],
    },
  ];
}
```

---

## 🌍 Deployment

To deploy with **Vercel**, make sure `vercel.json` is configured properly.

Or deploy manually after building:

```bash
pnpm build
pnpm start
```

---

## 🤝 Contribution

Contributions, issues and feature requests are welcome!

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes
4. Push to the branch
5. Open a pull request

---

## 🧑‍💻 Maintainer

**Author**: Beauttah
**Email**: [kiprutobeauttah@gmail.com](mailto:kiprutobeauttah@gmail.com)

---

## 📌 Notes

* You’re using **PNPM** with a lock file (`pnpm-lock.yaml`)
* Consider adding:

  * Story export as PDF
  * Voice narration
  * Multi-language support

---


