# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/145efd50-0636-41b8-90ec-c77d258c3b82

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/145efd50-0636-41b8-90ec-c77d258c3b82) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Environment Configuration

This project uses environment variables to configure different environments (development, production, etc.).

### Environment Files

- `.env` - Default environment variables (loaded in all environments)
- `.env.development` - Development-specific variables
- `.env.production` - Production-specific variables
- `.env.example` - Template file showing available variables

### Key Environment Variables

- `BACKEND_API_URL` - URL of the backend API server
  - Development: `http://localhost:5000` (default)
  - Production: Set to your deployed backend URL (e.g., `https://api.your-domain.com`)
- `PORT` - Port for the development server (default: 8080)

### Setting up for Different Environments

1. **Development**: Copy `.env.example` to `.env` and update values as needed
2. **Production**: Update `BACKEND_API_URL` in `.env.production` with your production backend URL

### Build Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build with development configuration
- `npm run preview` - Preview production build locally

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/145efd50-0636-41b8-90ec-c77d258c3b82) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
