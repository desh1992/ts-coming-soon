'use client';

import { useEffect, useMemo, useState } from 'react';

import BlurText from '@/components/ui/blur-text';

type CountdownTimerProps = {
  target: string;
  className?: string;
  label?: string;
};

type CountdownState = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  expired: boolean;
};

const pad = (value: number) => value.toString().padStart(2, '0');

const calculateTimeLeft = (targetDate: Date): CountdownState => {
  const now = new Date();
  const difference = targetDate.getTime() - now.getTime();

  if (difference <= 0) {
    return {
      days: '00',
      hours: '00',
      minutes: '00',
      seconds: '00',
      expired: true,
    };
  }

  const totalSeconds = Math.floor(difference / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days: pad(days),
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
    expired: false,
  };
};

export default function CountdownTimer({ target, className = '', label }: CountdownTimerProps) {
  const targetDate = useMemo(() => new Date(target), [target]);
  const [timeLeft, setTimeLeft] = useState<CountdownState>(() => calculateTimeLeft(targetDate));
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const tick = () => {
      setTimeLeft(calculateTimeLeft(targetDate));
    };

    const timer = window.setInterval(tick, 1000);
    tick();

    return () => {
      window.clearInterval(timer);
    };
  }, [targetDate]);

  if (!isMounted) {
    return (
      <div className={`flex flex-col items-center gap-3 sm:gap-4 ${className}`}>
        {label && (
          <span className="text-xs font-semibold uppercase tracking-[0.5em] text-white/70 sm:text-sm">
            {label}
          </span>
        )}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[#6a4dfc] sm:gap-6">
          {['days', 'hours', 'minutes', 'seconds'].map((unit, index) => (
            <div key={unit} className="flex items-center gap-2 sm:gap-3">
              <span className="text-3xl font-semibold tabular-nums opacity-70 sm:text-4xl md:text-5xl">
                --
              </span>
              <span className="text-xs uppercase tracking-[0.35em] opacity-50 sm:text-sm">{unit}</span>
              {index < 3 && (
                <span className="text-2xl font-semibold opacity-40 sm:text-3xl md:text-4xl">:</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-3 sm:gap-4 ${className}`}>
      {label && (
        <span className="text-xs font-semibold uppercase tracking-[0.5em] text-white/70 sm:text-sm">
          {label}
        </span>
      )}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        {(['days', 'hours', 'minutes', 'seconds'] as const).map((unit, index, units) => (
          <div key={unit} className="flex items-center gap-2 sm:gap-3">
            <BlurText
              key={`${unit}-${timeLeft[unit]}`}
              text={timeLeft[unit]}
              direction="top"
              triggerOnMount
              valueKey={timeLeft[unit]}
              stepDuration={0.3}
              className="text-3xl font-semibold tabular-nums bg-gradient-to-r from-[#4f46e5] to-[#9333ea] bg-clip-text text-transparent sm:text-4xl md:text-5xl"
            />
            <span className="text-xs uppercase tracking-[0.35em] text-[#6a4dfc] sm:text-sm">
              {unit}
            </span>
            {index < units.length - 1 && (
              <span className="text-2xl font-semibold text-[#6a4dfc] sm:text-3xl md:text-4xl">
                :
              </span>
            )}
          </div>
        ))}
      </div>
      {timeLeft.expired && (
        <span className="text-sm font-medium uppercase tracking-widest text-white/80">
          It&apos;s time!
        </span>
      )}
    </div>
  );
}

