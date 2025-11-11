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
      <div className="pointer-events-auto absolute inset-0 z-10">
        <ImageTrail items={galleryItems} variant={1} />
      </div>
      <div className="pointer-events-none relative z-20 flex min-h-screen flex-col items-center justify-center gap-12 px-6 py-16 text-center md:px-10">
        <div className="flex flex-col items-center gap-6">
          <img
            src="/svg/ts-logo-wide.svg"
            alt="TalentShare"
            className="h-48 w-auto opacity-90"
            loading="lazy"
          />
          <h1 className="whitespace-pre-wrap text-7xl font-semibold">
            <span className="text-6xl italic font-thin">
              Coming Soon
              <br />
            </span>
          </h1>
        </div>
        <div className="flex w-full max-w-3xl flex-col items-center gap-12 text-center md:gap-12">
          <CountdownTimer
            target={launchDate}
            className="text-white text-lg md:text-xl"
          />
          <p className="text-lg text-primary/60 md:text-xl">
            Launching November 15, 2025 • 11:00 AM EST
          </p>
          <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 text-xl leading-relaxed text-primary/70 md:text-2xl normal-case">
            <VerticalCutReveal
              splitBy="words"
              staggerDuration={0.12}
              staggerFrom="first"
              containerClassName="inline-flex flex-wrap items-baseline gap-y-1"
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

