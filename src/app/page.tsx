import LandingPage from '@/components/landing/landing-page';

export default function RootPage() {
  // This page now directly renders the public landing page.
  // The logic to redirect logged-in users is handled within the AppLayout or a similar higher-order component.
  return <LandingPage />;
}
