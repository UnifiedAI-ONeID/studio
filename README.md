# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Development

To run the local development server:

```bash
npm run dev
```

This will start the Next.js development server on `http://localhost:9002`.

## Deployment

This project is configured for deployment to Firebase Hosting.

1.  **Build the application:**

    ```bash
    npm run build
    ```

    This command creates a production-ready build in the `out/` directory.

2.  **Deploy to Firebase:**

    Make sure you have the Firebase CLI installed and are logged in. Then, run:

    ```bash
    firebase deploy --only hosting
    ```

    This will deploy the contents of the `out/` directory to your Firebase Hosting site.
