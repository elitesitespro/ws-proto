"use client"

import { Fragment, useRef, type ReactNode } from "react"
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react"
import { PlatformIconGroup } from "@/components/ui/platform-icon-group"

const statement = "WorldStreet isn't one platform trying to do everything. It's a network of purpose-built platforms designed to work together."
const words = statement.split(" ")

function RevealWord({ children, index, progress, reducedMotion }: {
  children: ReactNode
  index: number
  progress: MotionValue<number>
  reducedMotion: boolean | null
}) {
  const opacity = useTransform(progress, [index / words.length, (index + 1) / words.length], [0.25, 1])

  return (
    <motion.span className="motion-reduce:opacity-100!" style={{ opacity: reducedMotion ? 1 : opacity }}>
      {children}
    </motion.span>
  )
}

export function EcosystemIntroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })
  // Finish before the sticky section releases, leaving a short fully lit pause.
  const highlightProgress = useTransform(scrollYProgress, [0, 0.9], [0, 1])

  return (
    <section
      ref={sectionRef}
      aria-labelledby="ecosystem-intro-heading"
      className="relative min-h-[200svh] bg-[#070405] text-white motion-reduce:min-h-0"
    >
      <div className="sticky top-0 mx-auto flex min-h-svh w-full max-w-7xl items-center px-4 py-8 motion-reduce:static motion-reduce:min-h-0 md:px-6 md:py-12 lg:py-14">
        <h1
          id="ecosystem-intro-heading"
          className="text-xl leading-[44px] font-medium tracking-tight md:text-3xl md:leading-[56px] md:tracking-tighter xl:text-4xl xl:leading-[68px]"
        >
          {words.map((word, index) => (
            <Fragment key={`${index}-${word}`}>
              {index > 0 ? " " : null}
              <RevealWord index={index} progress={highlightProgress} reducedMotion={reducedMotion}>
                {word === "platforms" ? (
                  <span className="inline-flex items-center whitespace-nowrap align-baseline">
                    {word}
                    <PlatformIconGroup className="ml-1" />
                  </span>
                ) : word}
              </RevealWord>
            </Fragment>
          ))}
        </h1>
      </div>
    </section>
  );
}
