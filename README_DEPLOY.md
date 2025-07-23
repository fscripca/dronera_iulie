
# 🚀 Deployment with Docker + GitHub Actions

### GitHub Actions
- Auto-generates .env during CI using `scripts/generateEnv.js`.
- Injects secrets from GitHub into the .env file.
- Builds and deploys using Netlify.

### Docker
- Dockerfile copies `.env` inside the container.
- `docker-compose.yml` uses `env_file: .env`.
- Run with:
```
docker-compose up --build
```

✅ Make sure to generate `.env` before `docker-compose` if running locally.
