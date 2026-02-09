package api

import (
	"encoding/json"
	"io"
	"kb/parser"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

type Server struct {
	vaultPath    string
	graphBuilder *GraphBuilder
}

func NewServer(vaultPath string) *Server {
	return &Server{
		vaultPath:    vaultPath,
		graphBuilder: NewGraphBuilder(vaultPath),
	}
}

// Initialize builds the initial graph
func (s *Server) Initialize() error {
	_, err := s.graphBuilder.Build()
	return err
}

// Rebuild rebuilds the graph
func (s *Server) Rebuild() error {
	_, err := s.graphBuilder.Build()
	return err
}

// HandleListFiles returns all files and directories
func (s *Server) HandleListFiles(w http.ResponseWriter, r *http.Request) {
	type FileInfo struct {
		Path  string `json:"path"`
		Name  string `json:"name"`
		IsDir bool   `json:"isDir"`
	}

	files := make([]FileInfo, 0)

	err := filepath.WalkDir(s.vaultPath, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}

		// Skip hidden files
		if strings.HasPrefix(d.Name(), ".") {
			if d.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}

		relPath, err := filepath.Rel(s.vaultPath, path)
		if err != nil {
			return err
		}

		if relPath == "." {
			return nil
		}

		files = append(files, FileInfo{
			Path:  relPath,
			Name:  d.Name(),
			IsDir: d.IsDir(),
		})

		return nil
	})

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(files)
}

// HandleReadFile reads a file's content
func (s *Server) HandleReadFile(w http.ResponseWriter, r *http.Request) {
	// Extract path from URL
	urlPath := strings.TrimPrefix(r.URL.Path, "/api/files/")
	if urlPath == "" {
		http.Error(w, "Path required", http.StatusBadRequest)
		return
	}

	fullPath := filepath.Join(s.vaultPath, urlPath)

	// Security check: ensure path is within vault
	if !strings.HasPrefix(fullPath, s.vaultPath) {
		http.Error(w, "Invalid path", http.StatusForbidden)
		return
	}

	content, err := os.ReadFile(fullPath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	response := map[string]interface{}{
		"path":    urlPath,
		"content": string(content),
	}

	// If markdown, also return rendered HTML
	if strings.HasSuffix(urlPath, ".md") {
		html, err := parser.RenderMarkdown(content)
		if err == nil {
			response["html"] = string(html)
		}

		// Extract wikilinks
		links := parser.ExtractWikilinks(string(content))
		response["links"] = links
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// HandleWriteFile creates or updates a file
func (s *Server) HandleWriteFile(w http.ResponseWriter, r *http.Request) {
	urlPath := strings.TrimPrefix(r.URL.Path, "/api/files/")
	if urlPath == "" {
		http.Error(w, "Path required", http.StatusBadRequest)
		return
	}

	fullPath := filepath.Join(s.vaultPath, urlPath)

	// Security check
	if !strings.HasPrefix(fullPath, s.vaultPath) {
		http.Error(w, "Invalid path", http.StatusForbidden)
		return
	}

	// Read request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var req struct {
		Content string `json:"content"`
	}
	if err := json.Unmarshal(body, &req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Ensure directory exists
	dir := filepath.Dir(fullPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Write file
	if err := os.WriteFile(fullPath, []byte(req.Content), 0644); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Rebuild graph
	s.Rebuild()

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// HandleDeleteFile deletes a file
func (s *Server) HandleDeleteFile(w http.ResponseWriter, r *http.Request) {
	urlPath := strings.TrimPrefix(r.URL.Path, "/api/files/")
	if urlPath == "" {
		http.Error(w, "Path required", http.StatusBadRequest)
		return
	}

	fullPath := filepath.Join(s.vaultPath, urlPath)

	// Security check
	if !strings.HasPrefix(fullPath, s.vaultPath) {
		http.Error(w, "Invalid path", http.StatusForbidden)
		return
	}

	if err := os.Remove(fullPath); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Rebuild graph
	s.Rebuild()

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// HandleGetGraph returns the full graph
func (s *Server) HandleGetGraph(w http.ResponseWriter, r *http.Request) {
	graph := s.graphBuilder.GetGraph()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(graph)
}

// HandleGetBacklinks returns backlinks for a path
func (s *Server) HandleGetBacklinks(w http.ResponseWriter, r *http.Request) {
	urlPath := strings.TrimPrefix(r.URL.Path, "/api/backlinks/")
	if urlPath == "" {
		http.Error(w, "Path required", http.StatusBadRequest)
		return
	}

	backlinks := s.graphBuilder.GetBacklinks(urlPath)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"path":      urlPath,
		"backlinks": backlinks,
	})
}

// HandleSearch searches for files containing the query
func (s *Server) HandleSearch(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		http.Error(w, "Query required", http.StatusBadRequest)
		return
	}

	type SearchResult struct {
		Path    string `json:"path"`
		Title   string `json:"title"`
		Snippet string `json:"snippet"`
	}

	results := make([]SearchResult, 0)
	query = strings.ToLower(query)

	err := filepath.WalkDir(s.vaultPath, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if strings.HasPrefix(d.Name(), ".") {
			if d.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}

		if !d.IsDir() && strings.HasSuffix(d.Name(), ".md") {
			content, err := os.ReadFile(path)
			if err != nil {
				return nil
			}

			contentLower := strings.ToLower(string(content))
			if strings.Contains(contentLower, query) {
				relPath, _ := filepath.Rel(s.vaultPath, path)
				title := strings.TrimSuffix(filepath.Base(relPath), ".md")

				// Extract snippet
				idx := strings.Index(contentLower, query)
				start := max(0, idx-50)
				end := min(len(content), idx+len(query)+50)
				snippet := string(content[start:end])

				results = append(results, SearchResult{
					Path:    relPath,
					Title:   title,
					Snippet: snippet,
				})
			}
		}

		return nil
	})

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}
