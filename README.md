# jutge-web-prof

Web application for instructors of [Jutge.org](https://jutge.org). It lets you manage courses, exams, problem lists, documents, and students, and integrates with the Jutge API.

## Development

```bash
bun install
bun run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Commands

- `bun run dev` — Start the development server
- `bun run build` — Build for production
- `bun run start` — Start the production server (run after `build`)
- `bun run lint` — Run ESLint
- `bun run format` — Format code with Prettier
- `bun run depcheck` — Check for unused dependencies
- `bun run update-jutge-client` — Download and update the Jutge API TypeScript client
- `bun run deploy` — Deploy to production (push Docker image and run on Jutge.org)
- `bun run docker-build` — Build the Docker image locally
- `bun run docker-build-amd64` — Build the Docker image for linux/amd64
- `bun run docker-run` — Run the app in Docker (port 8011)
- `bun run clean` — Remove `.next` and `node_modules`

## Authors

- [Pau Fernández](https://github.com/pauek/)
- [Jordi Petit](https://github.com/jordi-petit/)

## License

Copyright © Universitat Politècnica de Catalunya. All rights reserved.
