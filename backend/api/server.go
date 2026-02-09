package api

import (
	"log"
	"net/http"
	"path/filepath"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func SetupRouter(s *Server, authUser, authPass, staticDir string) *chi.Mux {
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(Logger)

	// CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	// API routes (protected)
	r.Route("/api", func(r chi.Router) {
		r.Use(BasicAuth(authUser, authPass))

		// Files
		r.Get("/files", s.HandleListFiles)
		r.Get("/files/*", s.HandleReadFile)
		r.Post("/files/*", s.HandleWriteFile)
		r.Put("/files/*", s.HandleWriteFile)
		r.Delete("/files/*", s.HandleDeleteFile)

		// Graph
		r.Get("/graph", s.HandleGetGraph)
		r.Get("/backlinks/*", s.HandleGetBacklinks)

		// Search
		r.Get("/search", s.HandleSearch)
	})

	// Serve static files (frontend)
	fileServer := http.FileServer(http.Dir(staticDir))
	r.Get("/*", func(w http.ResponseWriter, r *http.Request) {
		// Check if file exists
		if _, err := http.Dir(staticDir).Open(r.URL.Path); err != nil {
			// If file doesn't exist, serve index.html (SPA fallback)
			http.ServeFile(w, r, filepath.Join(staticDir, "index.html"))
			return
		}
		fileServer.ServeHTTP(w, r)
	})

	return r
}

func Start(s *Server, port, authUser, authPass, staticDir string) error {
	log.Println("Initializing graph...")
	if err := s.Initialize(); err != nil {
		return err
	}

	r := SetupRouter(s, authUser, authPass, staticDir)

	log.Printf("Starting server on port %s...", port)
	log.Printf("Vault path: %s", s.vaultPath)
	log.Printf("Static dir: %s", staticDir)

	return http.ListenAndServe(":"+port, r)
}
