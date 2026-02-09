# Stage 1: Build frontend
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build backend
FROM golang:1.22-alpine AS backend
WORKDIR /app
# Copy go.mod and go.sum first for better caching
COPY backend/go.mod backend/go.sum ./
RUN go mod download
# Copy the rest of the backend code
COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o kb-server

# Stage 3: Runtime
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=backend /app/kb-server .
COPY --from=frontend /app/frontend/dist ./static
EXPOSE 8080
CMD ["./kb-server"]
