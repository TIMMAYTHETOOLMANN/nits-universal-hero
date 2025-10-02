# NITS - Quick Start Guide

Get up and running in 30 seconds! 🚀

## Step 1: Install Node.js

If you haven't already, download and install Node.js 18+ from https://nodejs.org/

## Step 2: Start Development

Open your terminal and run ONE of these commands:

### Linux/Mac
```bash
./local-dev.sh
```

### Windows
```cmd
local-dev.bat
```

### Any Platform (using npm)
```bash
npm install
npm run dev
```

## That's It!

The application will start automatically at `http://localhost:5173` 🎉

Press `Ctrl+C` in the terminal to stop the server.

---

## Common Commands

| What you want to do | Command |
|---------------------|---------|
| Start developing | `npm run dev` |
| Build for production | `npm run build` |
| Preview production build | `npm run preview` |
| Check code quality | `npm run lint` |

---

## Need More Help?

- 📖 See [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md) for detailed instructions
- 🚀 See [DEPLOYMENT.md](DEPLOYMENT.md) for advanced deployment options
- 📝 See [README.md](README.md) for project overview

---

## Troubleshooting

### "npm: command not found"
→ Install Node.js from https://nodejs.org/

### "Port 5173 is already in use"
→ Run `npm run kill` first, or use a different port: `npm run dev -- --port 3000`

### Dependencies errors
→ Delete `node_modules` and `package-lock.json`, then run `npm install` again

---

**Happy coding! 💻**
