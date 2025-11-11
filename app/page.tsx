import { Metadata } from 'next';

import CountdownTimer from '@/components/CountdownTimer';
import { GLSLHills } from '@/components/ui/glsl-hills';
import ImageTrail from '@/components/ui/image-trail';
import { VerticalCutReveal } from '@/components/ui/vertical-cut-reveal';
import { motionGridItems } from '@/lib/data/motion-grid-items';

export const metadata: Metadata = {
  title: 'Coming Soon',
  description: 'A preview of our upcoming experience.',
};

export default function ComingSoonPage() {
  const galleryItems = motionGridItems.map((item) => ({
    url: item.image,
    label: item.text,
  }));
  const launchDate = '2025-11-15T11:00:00-05:00';

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-20">
        <GLSLHills />
      </div>
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="pointer-events-auto h-full w-full">
          <ImageTrail items={galleryItems} variant={1} />
        </div>
      </div>
      <div className="pointer-events-none relative z-20 flex min-h-screen flex-col items-center justify-center gap-10 px-4 py-12 text-center sm:gap-12 sm:px-6 sm:py-16 lg:px-10">
        <div className="flex flex-col items-center gap-5 sm:gap-6">
          <img
            src="/svg/ts-logo-wide.svg"
            alt="TalentShare"
            className="h-24 w-auto opacity-90 sm:h-32 lg:h-48"
            loading="lazy"
          />
          <h1 className="whitespace-pre-wrap text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="text-3xl italic font-thin sm:text-4xl md:text-5xl lg:text-6xl">
              Coming Soon
              <br />
            </span>
          </h1>
        </div>
        <div className="flex w-full max-w-3xl flex-col items-center gap-8 px-2 text-center sm:gap-10 sm:px-0 md:gap-12">
          <CountdownTimer
            target={launchDate}
            className="w-full max-w-3xl text-white text-base sm:text-lg md:text-xl"
          />
          <p className="px-2 text-base text-primary/70 sm:px-0 sm:text-lg md:text-xl">
            Launching November 15, 2025 • 11:00 AM EST
          </p>
          <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 text-base leading-relaxed text-primary/70 sm:text-lg md:text-xl">
            <VerticalCutReveal
              splitBy="words"
              staggerDuration={0.12}
              staggerFrom="first"
              containerClassName="inline-flex max-w-3xl flex-wrap items-baseline justify-center gap-y-1"
              elementLevelClassName="px-[2px]"
              highlightWords={{ 'Talent-Share': 'font-black tracking-[0.05em] text-[#6a4dfc]' }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 28,
                delay: 0.2,
              }}
            >
              {`Talent-Share is weaving a playground for experts, dreamers, and curious minds. Where live sessions, collaborative studios, and glowing reviews all meet in one orbit.`}
            </VerticalCutReveal>
          </div>
        </div>
      </div>
    </div>
  );
}

