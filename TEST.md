# Testing Guide

## Quick Test Checklist

### 1. Backend Build
```bash
cd backend
go build -o kb-server
# Should complete without errors
```

### 2. Frontend Build
```bash
cd frontend
npm install
npm run build
# Should create dist/ directory
```

### 3. Start Server
```bash
# From project root
./start.sh
# Or
make start
```

### 4. Test Web Interface
1. Open browser to `http://localhost:33005`
2. Login with `admin` / `changeme`
3. You should see:
   - File tree in sidebar
   - Welcome page in editor
   - Preview pane on right

### 5. Test Core Features

#### File Navigation
- [ ] Click on files in sidebar
- [ ] File content loads in editor
- [ ] Preview updates automatically

#### Wikilinks
- [ ] Click on `[[link]]` in preview
- [ ] Should navigate to target file
- [ ] Links are highlighted in editor

#### Graph View
- [ ] Click graph icon in header
- [ ] Should see nodes and edges
- [ ] Files are circles (gray)
- [ ] Directories are squares (blue)
- [ ] Can click nodes to navigate
- [ ] Can zoom and pan

#### Editor
- [ ] Type in editor
- [ ] Content auto-saves after 1 second
- [ ] Preview updates live

#### LaTeX
- [ ] Math renders: $E = mc^2$
- [ ] Block math displays correctly

#### Mermaid
- [ ] Diagrams render in preview
- [ ] No errors in console

#### Search (if implemented)
- [ ] Enter search query
- [ ] Results appear
- [ ] Can click to open file

### 6. API Tests

```bash
# List files
curl -u admin:changeme http://localhost:33005/api/files

# Read file
curl -u admin:changeme http://localhost:33005/api/files/index.md

# Get graph
curl -u admin:changeme http://localhost:33005/api/graph

# Search
curl -u admin:changeme "http://localhost:33005/api/search?q=knowledge"
```

Expected: JSON responses with file data, graph structure, etc.

### 7. Docker Build Test

```bash
# Build image
docker build -t knowledge-base .

# Should complete all stages:
# - Frontend build
# - Backend build
# - Final runtime image

# Run container
docker run -p 8080:8080 \
  -v $(pwd)/vault:/data/vault \
  -e KB_AUTH_USER=admin \
  -e KB_AUTH_PASS=changeme \
  knowledge-base

# Test access
curl http://localhost:33005
```

### 8. Docker Compose Test

```bash
# Start
docker-compose up -d

# Check logs
docker-compose logs -f

# Test
curl http://localhost:33005

# Stop
docker-compose down
```

## Performance Tests

### Graph Performance
```bash
# Create many test files
for i in {1..100}; do
  echo "# Test $i" > vault/test-$i.md
  echo "[[test-$((i+1))]]" >> vault/test-$i.md
done

# Restart server
# Graph should still load quickly
```

### Large File Test
```bash
# Create large markdown file
yes "Lorem ipsum dolor sit amet" | head -10000 > vault/large.md

# Open in editor
# Should load and edit smoothly
```

## Troubleshooting

### Backend won't start
- Check Go version: `go version` (need 1.22+)
- Check port: `lsof -i :8080`
- Check logs: `./kb-server` (foreground)

### Frontend won't build
- Check Node version: `node --version` (need 18+)
- Clear cache: `rm -rf node_modules && npm install`
- Check for TypeScript errors

### Docker build fails
- Check Docker version: `docker --version`
- Clean build: `docker build --no-cache -t knowledge-base .`
- Check disk space: `df -h`

### Graph not showing
- Open browser console (F12)
- Check for JavaScript errors
- Verify API returns data: `curl -u admin:changeme http://localhost:33005/api/graph`

### Authentication issues
- Check credentials
- Check browser network tab for 401 errors
- Verify env vars: `echo $KB_AUTH_USER`

## Browser Compatibility

### Supported Browsers
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ⚠️ Mobile browsers (basic support)

### Known Issues
- Graph performance drops with >1000 nodes
- Large files (>1MB) may be slow to render
- Mobile UI not fully optimized

## Load Testing

### Using Apache Bench
```bash
# Test API performance
ab -n 1000 -c 10 -A admin:changeme \
  http://localhost:33005/api/files

# Expected: >100 req/s
```

### Using curl-loader
```bash
# Concurrent file reads
for i in {1..10}; do
  curl -u admin:changeme \
    http://localhost:33005/api/files/index.md &
done
wait

# All should complete successfully
```

## Automated Testing

### Backend Unit Tests (Future)
```bash
cd backend
go test ./...
```

### Frontend Tests (Future)
```bash
cd frontend
npm test
```

### E2E Tests (Future)
```bash
npm run test:e2e
```

## Success Criteria

A successful test run should verify:
- [x] Backend compiles and runs
- [x] Frontend builds and serves
- [x] Login works
- [x] File tree displays
- [x] Editor works
- [x] Preview renders markdown
- [x] Wikilinks are parsed
- [x] Graph displays nodes and edges
- [x] Directory nodes appear in graph
- [x] LaTeX renders
- [x] Mermaid renders
- [x] API endpoints respond
- [x] Docker builds successfully
- [x] Authentication required for API

## Next Steps After Testing

1. Customize theme in `frontend/tailwind.config.js`
2. Add your own markdown files to `vault/`
3. Configure authentication in `.env`
4. Set up reverse proxy for HTTPS
5. Configure backup for vault directory
6. Star the repo! ⭐
