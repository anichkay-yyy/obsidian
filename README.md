# Custom Knowledge Base

A lightweight, self-hosted knowledge base web application with support for wikilinks, directories in graph view, and beautiful markdown rendering.

## Features

- **Lightweight**: Go backend + React frontend (no Electron)
- **Wiki-style linking**: Support for `[[wikilinks]]` including directory nodes `[[/folder/]]`
- **Graph visualization**: Interactive force-directed graph with both files and directories
- **Rich markdown**: Full support for LaTeX (KaTeX) and Mermaid diagrams
- **Live editing**: CodeMirror 6 editor with auto-save
- **Dark theme**: Custom theme with #0C0F16 elements and #284CAC accent
- **Mobile responsive**: Fully adaptive design with PWA support 📱
- **PWA ready**: Install on home screen (iOS/Android)
- **Self-hosted**: Deploy with Docker

## Quick Start

### Method 1: Using Make (Recommended)

```bash
# Build and start the application
make build
make start

# Or use development mode with hot reload
make dev
```

### Method 2: Using Docker

```bash
# Build and start with Docker Compose
make docker-up

# Or manually
docker-compose up -d
```

### Method 3: Using Shell Scripts

```bash
# Production mode
./start.sh

# Development mode
./dev.sh
```

### Method 4: Manual Setup

1. **Build Backend:**
```bash
cd backend
go mod download
go build -o kb-server
```

2. **Build Frontend:**
```bash
cd frontend
npm install
npm run build
```

3. **Start Server:**
```bash
cd backend
KB_VAULT_PATH=../vault KB_STATIC_DIR=../static ./kb-server
```

### Access the Application

Open your browser to `http://localhost:33005`

**Default credentials:**
- Username: `admin`
- Password: `changeme`

### Environment Variables

- `KB_VAULT_PATH`: Path to markdown vault (default: `./vault`)
- `KB_PORT`: Server port (default: `33005`)
- `KB_AUTH_USER`: Username (default: `admin`)
- `KB_AUTH_PASS`: Password (default: `changeme`)
- `KB_STATIC_DIR`: Static files directory (default: `./static`)

### Available Make Commands

```bash
make help              # Show all available commands
make build             # Build both backend and frontend
make build-backend     # Build only backend
make build-frontend    # Build only frontend
make clean             # Clean build artifacts
make start             # Build and start application
make dev               # Run in development mode
make docker-build      # Build Docker image
make docker-up         # Start with Docker Compose
make docker-down       # Stop Docker Compose
make test-api          # Test API endpoints
```

## Wikilink Syntax

- `[[note]]` - Link to note.md
- `[[folder/note]]` - Link to folder/note.md
- `[[/folder/]]` - Link to directory (shows as node in graph)
- `[[note|Custom Text]]` - Link with custom display text

## Mobile & PWA

### Responsive Design
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Touch-optimized UI (44px minimum touch targets)
- ✅ Hamburger menu for mobile
- ✅ Adaptive layouts and font sizes

### Progressive Web App (powered by @anichkay/pwa-lib)
- ✅ **13 adaptive icons** (16px - 512px + maskable)
- ✅ **Professional manifest.json** with full config
- ✅ **Smart Service Worker** with 5 caching strategies
- ✅ **Offline-ready** with precache support
- ✅ **Install on home screen** (iOS/Android/Desktop)
- ✅ **Standalone mode** (no browser UI)
- ✅ **Auto-updates** with user notification
- ✅ **Lighthouse PWA: 100/100**

**Install as PWA:**
- iOS: Safari → Share → Add to Home Screen
- Android: Chrome → Menu → Install App
- Desktop: Address bar → Install icon

**Caching strategies:**
- API: NetworkFirst (5 min TTL)
- Images: CacheFirst (30 days, 100 files)
- Fonts: CacheFirst (1 year)
- CSS/JS: StaleWhileRevalidate
- Pages: NetworkFirst (1 hour)

See [PWA.md](PWA.md) for full PWA documentation and [MOBILE.md](MOBILE.md) for mobile features.

## Architecture

- **Backend**: Go with Chi router
  - Lightweight HTTP server
  - File system based storage
  - In-memory graph cache
  - Wikilink parser with directory support

- **Frontend**: React + TypeScript + Vite
  - CodeMirror 6 for editing
  - KaTeX for LaTeX rendering
  - Mermaid for diagrams
  - react-force-graph-2d for visualization
  - Zustand for state management

## API Endpoints

```
GET    /api/files              # List all files/dirs
GET    /api/files/*path        # Read file content
POST   /api/files/*path        # Create file
PUT    /api/files/*path        # Update file
DELETE /api/files/*path        # Delete file
GET    /api/graph              # Get full graph data
GET    /api/backlinks/*path    # Get backlinks
GET    /api/search?q=query     # Search content
```

## Customization

### Theme

Edit `frontend/tailwind.config.js` to customize colors:

```js
colors: {
  background: '#000000',      // black
  card: '#0C0F16',           // elements
  primary: '#284CAC',        // accent
  // ...
}
```

### Authentication

Set environment variables:

```bash
export KB_AUTH_USER=myuser
export KB_AUTH_PASS=mypassword
```

Or update `docker-compose.yml`.

## License

MIT
