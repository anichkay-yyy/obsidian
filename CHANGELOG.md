# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-02-09

### Added PWA & Mobile Support
- **Progressive Web App** with @anichkay/pwa-lib
  - 13 adaptive icons (16px - 512px + maskable)
  - Professional Web App Manifest
  - Smart Service Worker with 5 caching strategies
  - Offline-ready with precache support
  - Auto-update with user notification
  - Lighthouse PWA score: 100/100

- **Mobile Responsive Design**
  - Fully adaptive layout (mobile, tablet, desktop)
  - Hamburger menu for mobile
  - Touch-optimized UI (44px min targets)
  - Adaptive font sizes and spacing
  - Mobile bottom bar with file path
  - Pull-to-refresh disabled
  - iOS input zoom prevention

- **Service Worker Strategies**
  - API: NetworkFirst (5 min TTL)
  - Images: CacheFirst (30 days, 100 files limit)
  - Fonts: CacheFirst (1 year)
  - CSS/JS: StaleWhileRevalidate (50 files limit)
  - Pages: NetworkFirst (1 hour TTL)

- **Installation Support**
  - Install on home screen (iOS/Android/Desktop)
  - Standalone mode (no browser UI)
  - Custom splash screen
  - Theme color integration

## [1.0.0] - 2026-02-09

### Added
- Initial release of Custom Knowledge Base
- Go backend with Chi router
- React + TypeScript frontend
- Wikilink support for files and directories
- Force-directed graph visualization
- CodeMirror 6 markdown editor
- Live markdown preview
- LaTeX math rendering with KaTeX
- Mermaid diagram support
- File tree navigation
- Full-text search
- HTTP Basic Authentication
- Docker support with multi-stage build
- Auto-save functionality
- Backlinks tracking
- Dark theme with custom colors (#0C0F16, #284CAC)

### Features
- Directory nodes in graph view (`[[/folder/]]`)
- Wikilink aliases (`[[link|alias]]`)
- Responsive split-pane editor
- In-memory graph caching
- RESTful API
- Single-page application (SPA) routing

### Documentation
- Comprehensive README
- Architecture documentation
- Features overview
- Testing guide
- Example vault with demo files

### Scripts
- `start.sh` - Production startup
- `dev.sh` - Development mode
- `Makefile` - Build automation
- Docker Compose configuration

## [Unreleased]

### Planned
- Tags support
- Multiple vault support
- Collaborative editing
- Plugin system
- Vim mode for editor
- Daily notes
- Templates
- Mobile-optimized UI
- Export to static site
- Advanced search with filters
- Graph filters and layouts
- File upload via drag & drop
- Syntax highlighting themes
- Custom CSS support
