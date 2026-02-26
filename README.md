## Gradus Frontend (React + Tailwind)

This frontend consumes the existing Django API under:

- `GET/POST /api/v1/accounts/register/`
- `POST /api/v1/accounts/login/`
- `POST /api/v1/accounts/logout/`
- `GET/PATCH /api/v1/accounts/users/me`
- `GET/PATCH /api/v1/accounts/profile/me`
- `GET/POST /api/v1/classrooms/`
- `POST /api/v1/classrooms/join/`
- `GET /api/v1/classrooms/<id>/`

### Run (dev)

1. Start the Django backend on `http://127.0.0.1:8000`
2. In `frontend/`:

```bash
npm install
npm run dev
```

The Vite dev server proxies `/api/*` and `/admin/*` to `127.0.0.1:8000` to keep auth cookies/CSRF working during development.

