<div align="center">
  <img src="https://raw.githubusercontent.com/Naveenkm07/Dayvault/main/public/favicon.ico" alt="Dayvault Logo" width="80" height="80" />
  <h1>DAYVAULT</h1>
  <p><strong>Your days. Your memories. Your plans.</strong></p>
  <p>
    <a href="https://github.com/Naveenkm07/Dayvault/commits/main"><img src="https://img.shields.io/github/last-commit/Naveenkm07/Dayvault?style=flat-square" alt="Last Commit"></a>
    <a href="https://github.com/Naveenkm07/Dayvault/issues"><img src="https://img.shields.io/github/issues/Naveenkm07/Dayvault?style=flat-square" alt="Issues"></a>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js"></a>
    <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-DB-3ECF8E?style=flat-square&logo=supabase" alt="Supabase"></a>
  </p>
</div>

## 📖 Overview

**Dayvault** is a comprehensive, production-ready personal daily journal, activity tracker, memory vault, and future planner. Built with modern web technologies, it features a sleek and fully responsive UI that supports dark mode seamlessly. Keep your thoughts secure, plan your tasks efficiently, and visualize your history in one beautifully crafted application.

---

## ✨ Key Features

- **🔐 Secure Authentication:** Complete email/password authentication backed by Supabase.
- **📔 Daily Journaling:** Create and edit memories with mood and location tracking.
- **📷 Memory Vault:** Upload photos directly to your journal entries via Supabase Storage.
- **✅ Future Planning:** Manage tasks with priority levels (Low, Medium, High) and categorize them.
- **📅 Visual Timeline & Calendar:** Browse your past entries in an interactive chronological timeline or monthly calendar view.
- **🔍 Global Search:** Instantly find past journal entries and plans.
- **🎨 Beautiful UI & Dark Mode:** Designed with Tailwind CSS v4 and `shadcn/ui` for a premium, accessible interface.
- **⬇️ Data Export:** Download all your memories and plans securely as a JSON file.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Actions)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL + RLS + Storage)
- **Form Management:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Testing:** [Playwright](https://playwright.dev/) for End-to-End coverage

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or pnpm
- A [Supabase](https://supabase.com/) account and project

### 1. Clone the repository

```bash
git clone https://github.com/Naveenkm07/Dayvault.git
cd Dayvault
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Supabase

1. Navigate to your Supabase project dashboard.
2. Under **SQL Editor**, run the SQL scripts found in `supabase/migrations/20240101000000_init.sql` to generate the database schema and RLS policies.
3. Next, run `docs/setup-storage.sql` to configure the Storage buckets for photos.

### 4. Setup Environment Variables

Create a `.env.local` file in the root of the project and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application!

---

## 🧪 Testing

This project utilizes Playwright for end-to-end testing.
To run the test suite:

```bash
# Run tests in headless mode
npx playwright test

# Run tests with UI
npx playwright test --ui
```

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
