# Web Creator Spreadsheet

A modern, interactive spreadsheet-like web app built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Lucide React** icons.

This project demonstrates:
- Editable cells with keyboard navigation
- Sortable & hideable columns
- CSV import & export
- Inline dropdowns for `Status` & `Priority`
- A clean, responsive UI with a smart toolbar
- Example AI action buttons (placeholders)

---

## 📂 Project Structure

.
├── public/
│ ├── icons/
│ │ ├── down-split-arrow.png
│ │ ├── dots.png
│ │ └── logo.png
├── src/
│ ├── App.tsx
│ ├── main.tsx
│ ├── icons/ # Local icon images
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.ts

yaml
Copy
Edit

---

## 🚀 Getting Started

### 1️⃣ Clone this repository

```bash
git clone https://github.com/your-username/web-creator-spreadsheet.git
cd web-creator-spreadsheet
2️⃣ Install dependencies
bash
Copy
Edit
npm install
3️⃣ Start the development server
bash
Copy
Edit
npm run dev
Open http://localhost:5173 in your browser.

✅ Available Scripts
Command	Description
npm run dev	Start Vite dev server
npm run build	Build for production
npm run preview	Preview the production build locally
npm run lint	Run ESLint checks
npm run type-check	Check TypeScript types

🗂️ Features
Cell editing: Click or navigate with keyboard to edit.

Keyboard navigation: Use Arrow keys, Enter, Escape to edit cells.

Dropdowns: Status & Priority are inline <select> dropdowns.

Sorting: Click column headers to sort ascending/descending.

Show/hide columns: Use the toolbar Hide fields toggle.

Toolbar actions: Import/Export (CSV/JSON) and placeholder AI buttons.

Add rows: Use the floating + button.

Import CSV: Drag & drop or click to upload a .csv file.

Export: Download spreadsheet data as .csv or .json.

Lucide icons: Modern icon set for clear UI visuals.

Responsive: Clean styling with Tailwind CSS.

📦 Dependencies
React

TypeScript

Vite

Tailwind CSS

Lucide React

🖼️ Local Images
Make sure you have:

down-split-arrow.png

dots.png

logo.png

inside your src/icons/ folder. Update import paths in App.tsx if needed.

⚙️ Lint & Type Check
Run ESLint:

bash
Copy
Edit
npm run lint
Check TypeScript types:

bash
Copy
Edit
npm run type-check
✏️ Customization
Edit initialData in App.tsx to change default rows.

Extend toolbar actions to connect real AI or server-side features.

Style more deeply with Tailwind or your preferred design system.

Connect to a database or API for persistent storage.

📜 License
This project is for demonstration and educational purposes only.

🤝 Contributing
Open issues, fork this repo, and submit PRs if you’d like to improve it!

Built with ❤️ using React, TypeScript & Tailwind CSS
