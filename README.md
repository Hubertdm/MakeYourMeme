# MakeYourMeme

> **Make Your Meme** is a multiplayer online party game where players create and share memes with friends. Each round, players receive a meme template and must come up with the funniest caption. Everyone then votes on the most entertaining memes, and the creators of the top-voted memes earn the most points.

The game is accessible directly from a browser (PWA - Progressive Web App) with no downloads required, and offers multiple modes (random, themed, same image for all, etc.) as well as public or private lobbies for playing with friends or other online players.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [PNPM](https://pnpm.io/) (recommended) or [Yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Hubertdm/MakeYourMeme.git
   cd MakeYourMeme
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env` in the `apps/server` directory and update the values.
   - For Supabase, create a project at [supabase.com](https://supabase.com/) and add your credentials.

4. **Start the development servers:**
   ```bash
   # Start all apps (frontend + backend)
   pnpm dev
   
   # Or start individually
   cd apps/web && pnpm dev
   cd apps/server && pnpm dev
   ```

5. **Open the app:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:3001](http://localhost:3001)

## 📁 Project Structure

```
MakeYourMeme/
├── apps/
│   ├── web/                  # Frontend (Next.js 14)
│   │   ├── src/
│   │   │   ├── app/          # Next.js App Router
│   │   │   ├── components/   # React components
│   │   │   ├── lib/          # Utilities and hooks
│   │   │   └── styles/       # CSS/Tailwind styles
│   │   └── package.json
│   │
│   └── server/               # Backend (Node.js + Express + Socket.io)
│       ├── src/
│       │   ├── controllers/  # Route controllers
│       │   ├── routes/       # Express routes
│       │   ├── sockets/      # Socket.io handlers
│       │   ├── models/       # Data models
│       │   └── services/     # Business logic
│       └── package.json
│
├── packages/
│   └── shared/               # Shared types and utilities
│       └── src/
│           └── types/        # TypeScript interfaces
│
├── package.json              # Root package.json (workspaces)
├── pnpm-workspace.yaml       # PNPM workspace configuration
├── turbo.json                # Turbo build configuration
├── .gitignore
├── .prettierrc
└── README.md
```

## 🛠 Tech Stack

### Frontend
- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **UI:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Real-time:** [Socket.io Client](https://socket.io/docs/v4/client-api/)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express](https://expressjs.com/)
- **Real-time:** [Socket.io](https://socket.io/)
- **Database:** [Supabase](https://supabase.com/)

### Tooling
- **Package Manager:** [PNPM](https://pnpm.io/)
- **Build Tool:** [Turbo](https://turbo.build/)
- **TypeScript:** [TypeScript](https://www.typescriptlang.org/)
- **Linting:** [ESLint](https://eslint.org/)
- **Formatting:** [Prettier](https://prettier.io/)

## 🎮 Game Features

- **Lobby System:** Create or join public/private lobbies
- **Meme Creation:** Receive templates and create captions
- **Real-time Voting:** Vote on memes in real-time
- **Scoring System:** Earn points for top-voted memes
- **Multiple Modes:** Random, themed, same image for all
- **Chat:** In-game chat for lobbies
- **PWA Support:** Installable on mobile devices

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/lobbies` | Create a new lobby |
| GET | `/api/lobbies` | Get all public lobbies |
| GET | `/api/lobbies/:id` | Get a specific lobby |
| POST | `/api/lobbies/:id/join` | Join a lobby |
| POST | `/api/lobbies/:id/leave` | Leave a lobby |
| DELETE | `/api/lobbies/:id` | Delete a lobby |

## 🔌 Socket.io Events

### Client to Server
| Event | Data | Description |
|-------|------|-------------|
| `joinLobby` | `{ lobbyId, player }` | Join a lobby |
| `leaveLobby` | `{ lobbyId, playerId }` | Leave a lobby |
| `createMeme` | `{ lobbyId, meme }` | Create a new meme |
| `voteMeme` | `{ lobbyId, memeId, voterId }` | Vote for a meme |
| `changeLobbyStatus` | `{ lobbyId, status }` | Change lobby status |
| `setTemplate` | `{ lobbyId, template }` | Set current meme template |
| `sendMessage` | `{ lobbyId, playerId, message }` | Send chat message |

### Server to Client
| Event | Data | Description |
|-------|------|-------------|
| `lobbyUpdated` | `Lobby` | Lobby state updated |
| `lobbyStatusChanged` | `{ lobbyId, status }` | Lobby status changed |
| `templateChanged` | `{ lobbyId, template }` | Template changed |
| `newMeme` | `Meme` | New meme created |
| `memeVoted` | `Meme` | Meme received a vote |
| `message` | `{ type, playerId, playerName, content, timestamp }` | Chat/system message |
| `error` | `{ message }` | Error message |

## 📦 Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps for production |
| `pnpm lint` | Run linting on all apps |
| `pnpm start` | Start all apps in production mode |

### App-specific Scripts

#### Frontend (`apps/web`)
| Script | Description |
|--------|-------------|
| `pnpm dev` | Start Next.js development server |
| `pnpm build` | Build Next.js for production |
| `pnpm start` | Start Next.js production server |
| `pnpm lint` | Run Next.js linting |

#### Backend (`apps/server`)
| Script | Description |
|--------|-------------|
| `pnpm dev` | Start server with hot reload (tsx) |
| `pnpm build` | Compile TypeScript to JavaScript |
| `pnpm start` | Start compiled server |
| `pnpm lint` | Run ESLint on source files |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
