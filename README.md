# WebCalc 🧮

A lightweight, dark-themed web calculator served in a Docker container. Minimal footprint, maximum style.

## Quick Start

```bash
docker run -d --name webcalc -p 8080:80 ghcr.io/andyghc/webcalc:latest
```

Open **http://localhost:8080** in your browser. That's it.

### Run on a remote Docker server

```bash
# Pull and run on any Docker host
ssh user@your-server
docker run -d --name webcalc -p 8080:80 ghcr.io/andyghc/webcalc:latest
```

## Available Tags

| Tag | Description |
|-----|-------------|
| `latest` | Latest stable build from `main` |
| `sha-<commit>` | Pinned to a specific commit |
| `v<semver>` | Tagged releases |

## Features

- ➕ Addition, subtraction, multiplication, division
- ⌨️ Keyboard input support (numbers, operators, Enter, Escape, Backspace)
- 🖱️ Click or tap interface
- 🌙 Dark theme, easy on the eyes
- 🐳 Tiny Docker image (~15 MB, nginx:alpine based)

## Build Locally

```bash
git clone https://github.com/andyghc/webcalc.git
cd webcalc
docker build -t webcalc .
docker run -d --name webcalc -p 8080:80 webcalc
```

## CI/CD

- **Pull Requests:** Automatically builds the image and runs a smoke test (HTTP 200 + content validation)
- **Push to `main`:** Builds, smoke-tests, then pushes to GHCR with `latest` and `sha-<commit>` tags

## License

MIT
