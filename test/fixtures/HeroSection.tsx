import React from 'react';

/* -------------------------------------------------------------------------- */
/*                               Type Definitions                             */
/* -------------------------------------------------------------------------- */
interface HeroProps {
  title?: string;
  subtitle?: string;
  align?: 'left' | 'center';
  ctaText?: string;
  secondaryCtaText?: string;
  onCtaClick?: () => void;
  onSecondaryClick?: () => void;
}

/* -------------------------------------------------------------------------- */
/*                           Hero Section Component                           */
/* -------------------------------------------------------------------------- */
const HeroSection: React.FC<HeroProps> = ({
  title = 'Welcome to Artemis',
  subtitle = 'Build faster with plugins.',
  align = 'center',
  ctaText = 'Get Started',
  secondaryCtaText = 'Learn more',
  onCtaClick,
  onSecondaryClick,
}) => {
  // Dynamic dark mode check
  const isDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Alignment classes
  const alignmentClasses =
    align === 'left' ? 'text-left items-start' : 'text-center items-center';

  // Conditional styles based on dark mode
  const sectionBg = isDark
    ? 'bg-[#141419]'
    : 'bg-gradient-to-br from-gray-50 via-white to-gray-50';

  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const subtitleColor = isDark ? 'text-gray-300' : 'text-gray-600';
  const borderColor = isDark ? 'border-white/5' : 'border-gray-200';

  // Primary action button styling
  const primaryBtnClasses = isDark
    ? 'bg-[rgba(168,85,247,0.18)] border border-[rgba(192,132,252,0.35)] text-white hover:bg-[rgba(168,85,247,0.26)] focus-visible:outline-purple-500'
    : 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600 border border-indigo-400';

  // Secondary action button styling
  const secondaryBtnClasses = isDark
    ? 'bg-white/[0.03] border border-white/10 text-gray-300 hover:bg-white/[0.06] hover:text-white focus-visible:outline-purple-500/50'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 focus-visible:outline-gray-500';

  // Metric text colors
  const statValueColor = isDark ? 'text-white' : 'text-gray-900';
  const statLabelColor = isDark ? 'text-gray-400' : 'text-gray-500';

  return (
    <section
      className={`w-full relative overflow-hidden isolate transition-all duration-700 py-32 sm:py-40 lg:py-48 ${sectionBg} ${textColor} border-b ${borderColor}`}
    >
      {/* Background visual accents - Dark */}
      {isDark && (
        <>
          <div className="absolute top-0 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -z-10 animate-pulse" />
          <div className="absolute bottom-0 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -z-10 animate-pulse" />
          <div
            className="absolute inset-0 -z-10 opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </>
      )}

      {/* Background visual accents - Light */}
      {!isDark && (
        <>
          <div className="absolute top-0 -right-40 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 -left-40 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl -z-10" />
          <div
            className="absolute inset-0 -z-10 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </>
      )}

      {/* Main container */}
      <div
        className={`mx-auto max-w-7xl px-8 lg:px-12 flex flex-col ${alignmentClasses}`}
      >
        {/* Title */}
        <h1
          className={`text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 ${textColor} transition-colors duration-300`}
        >
          {title}
        </h1>

        {/* Subtitle */}
        <p
          className={`text-lg sm:text-xl leading-relaxed max-w-3xl ${subtitleColor} ${
            align === 'center' ? 'mx-auto' : ''
          }`}
        >
          {subtitle}
        </p>

        {/* Call to action buttons */}
        <div className="mt-12 flex flex-wrap items-center gap-6">
          <button
            type="button"
            onClick={onCtaClick}
            className={`inline-flex items-center rounded-xl px-8 py-4 text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${primaryBtnClasses}`}
          >
            {ctaText}
          </button>

          <button
            type="button"
            onClick={onSecondaryClick}
            className={`inline-flex items-center gap-2 rounded-xl px-6 py-4 text-base font-semibold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${secondaryBtnClasses}`}
          >
            {secondaryCtaText}
            <span
              aria-hidden="true"
              className="text-lg transition-transform group-hover:translate-x-1"
            >
              &rarr;
            </span>
          </button>
        </div>

        {/* Trust & Metrics Bar */}
        <div className={`mt-20 pt-8 border-t ${borderColor}`}>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16">
            <div className="text-center group">
              <div className={`text-2xl font-bold ${statValueColor} transition-colors`}>
                99.9%
              </div>
              <div className={`text-sm mt-1 ${statLabelColor}`}>
                Uptime SLA
              </div>
              <div className={`text-xs mt-1 ${statLabelColor} opacity-60`}>
                Guaranteed
              </div>
            </div>

            <div className="text-center group">
              <div className={`text-2xl font-bold ${statValueColor} transition-colors`}>
                24/7
              </div>
              <div className={`text-sm mt-1 ${statLabelColor}`}>
                Support
              </div>
              <div className={`text-xs mt-1 ${statLabelColor} opacity-60`}>
                Enterprise
              </div>
            </div>

            <div className="text-center group">
              <div className={`text-2xl font-bold ${statValueColor} transition-colors`}>
                50ms
              </div>
              <div className={`text-sm mt-1 ${statLabelColor}`}>
                Plugin Load
              </div>
              <div className={`text-xs mt-1 ${statLabelColor} opacity-60`}>
                Average
              </div>
            </div>

            <div className="text-center group">
              <div className={`text-2xl font-bold ${statValueColor} transition-colors`}>
                Unlimited
              </div>
              <div className={`text-sm mt-1 ${statLabelColor}`}>
                Scale
              </div>
              <div className={`text-xs mt-1 ${statLabelColor} opacity-60`}>
                No limits
              </div>
            </div>
          </div>

          <p className={`mt-6 text-center text-xs ${statLabelColor} opacity-50 tracking-wider uppercase`}>
            Trusted by developers | Deployed globally | Zero-downtime plugin delivery
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
