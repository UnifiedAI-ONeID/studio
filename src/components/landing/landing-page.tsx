import LandingHero from './landing-hero';
import ThisWeekendSection from './this-weekend-section';
import PopularPlacesSection from './popular-places-section';
import HotThreadsSection from './hot-threads-section';
import LandingFooter from './landing-footer';

export default function LandingPage() {
  return (
    <>
      <LandingHero />
      <ThisWeekendSection />
      <PopularPlacesSection />
      <HotThreadsSection />
      <LandingFooter />
    </>
  );
}
