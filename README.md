# Tea & Timeline Shifts

Personal hypnosis tools, events, and recordings.

## Local Development

```bash
npm install
npm run dev
```

## Deploy

Connected to Netlify — pushes to `main` auto-deploy.

## Structure

```
src/
├── App.jsx                    # Router — all routes defined here
├── main.jsx                   # Entry point
├── layouts/
│   └── SiteLayout.jsx         # Shared nav + footer wrapper
├── pages/
│   ├── Home.jsx               # Landing page
│   ├── Events.jsx             # Upcoming events
│   ├── Products.jsx           # Products & recordings
│   └── Generator.jsx          # Hypnosis audio generator (full-screen, no nav)
└── components/                # Shared components (empty for now)

public/
└── audio/
    └── alpha-theta-backing.mp3
```

## Adding a New Page

1. Create `src/pages/YourPage.jsx`
2. Add a route in `src/App.jsx`
3. Add a nav link in `src/layouts/SiteLayout.jsx`
