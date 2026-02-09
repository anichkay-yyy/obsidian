package api

import (
	"crypto/subtle"
	"log"
	"net/http"
	"time"
)

// BasicAuth middleware for HTTP basic authentication
func BasicAuth(user, pass string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			username, password, ok := r.BasicAuth()

			if !ok || subtle.ConstantTimeCompare([]byte(username), []byte(user)) != 1 ||
				subtle.ConstantTimeCompare([]byte(password), []byte(pass)) != 1 {
				w.Header().Set("WWW-Authenticate", `Basic realm="Knowledge Base"`)
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// Logger middleware for request logging
func Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.RequestURI, time.Since(start))
	})
}
