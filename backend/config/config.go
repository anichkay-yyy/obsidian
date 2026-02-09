package config

import (
	"os"
)

type Config struct {
	VaultPath string
	Port      string
	AuthUser  string
	AuthPass  string
	StaticDir string
}

func Load() *Config {
	return &Config{
		VaultPath: getEnv("KB_VAULT_PATH", "./vault"),
		Port:      getEnv("KB_PORT", "8080"),
		AuthUser:  getEnv("KB_AUTH_USER", "admin"),
		AuthPass:  getEnv("KB_AUTH_PASS", "changeme"),
		StaticDir: getEnv("KB_STATIC_DIR", "./static"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
