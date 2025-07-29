# Grega Play

This repository contains the code for **Grega Play**, an application for creating short collaborative videos to celebrate special events.

## Directory overview

- **frontend/** – React application built with Vite. It handles the user interface and authentication. Detailed instructions are available in [frontend/README.md](frontend/README.md).
- **backend/** – Node.js/Express server used for video processing tasks.
- **supabase/** – Supabase configuration files and edge functions.
- **email/** – HTML email templates.
- **sql/** – SQL scripts for initializing the database schema.

## Quick start

This project requires [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) installed.

### Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

### Backend

```bash
cd backend
pnpm install
pnpm run start
```

For configuration details and more usage information, refer to the documentation in [frontend/README.md](frontend/README.md).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for the full text.
