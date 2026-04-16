# WhatsApp Chat Viewer

A complete, modern, single-page web application to parse, view, and export WhatsApp chat `.txt` exports.
Built with Vite, React 18, TypeScript, Tailwind CSS, and Shadcn UI components.

## Features

- **Local Parsing**: Drag and drop your `.txt` files directly into the browser. All parsing and processing happens locally, ensuring privacy.
- **Identical WhatsApp Interface**: Features a dark mode UI closely resembling WhatsApp Web, including green/gray conversational bubbles and correct timestamp placements.
- **Search & Highlight**: Real-time message filtering with highlighted text and next/prev matching arrows.
- **Owner Selection**: Simply select "Who are you?" upon chat load to map messages to the correct side of the interface.
- **HTML Export**: Download your rendered chat as a single standalone HTML file completely styled and easily shareable.

## Getting Started

### Prerequisites

You need Node.js installed on your machine.

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

The app will be accessible at `http://localhost:5173`.

## Deployment

### Vercel
The easiest way to deploy this application is using [Vercel](https://vercel.com).
1. Push your code to a GitHub repository.
2. Import the project in Vercel.
3. The framework settings (Vite) will automatically configure properly. Deploy!

### GitHub Pages
To deploy to GitHub Pages:
1. Update `vite.config.ts` to include the base path:
   ```js
   export default defineConfig({
     base: '/repository-name/',
     //...
   })
   ```
2. Build the project:
   ```bash
   npm run build
   ```
3. Deploy the `dist` folder to your `gh-pages` branch (you can use actions like `actions/deploy-pages`).

## How to export a chat from WhatsApp

1. Open a WhatsApp chat on your phone.
2. Tap on the contact's name or group subject.
3. Scroll down and tap **Export Chat**.
4. Choose **Without Media**.
5. Save or send the generated `.txt` to your computer.
