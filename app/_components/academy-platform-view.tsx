"use client";
import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlatformViewShell } from "./platform-view-shell";
import styles from "./platform-views.module.css";
import { Check, Play } from "lucide-react";

export function AcademyPlatformView() {
  const [course, setCourse] = useState(0);
  return (
    <PlatformViewShell
      name="Academy"
      title={
        <>
          Stay curious.
          <br />
          <span>Go further.</span>
        </>
      }
      controls={
        <>
          {["Design", "Business"].map((n, i) => (
            <Button
              key={n}
              variant="ghost"
              aria-pressed={course === i}
              onClick={() => setCourse(i)}
            >
              {n}
            </Button>
          ))}
        </>
      }
    >
      <div className={styles.course}>
        <div className={styles.courseCover}>
          <Image
            src="/assets/images/academy-course.jpg"
            alt="Course cover"
            fill
            sizes="320px"
            className={styles.cover}
          />
          <strong>
            {course ? "Build your next idea" : "The art of visual stories"}
          </strong>
        </div>
        <div className={`${styles.panel} ${styles.lessons}`}>
          <span className={styles.accent}>Your learning</span>
          <div
            className={styles.learningRing}
            role="progressbar"
            aria-label="Sample course progress"
            aria-valuenow={course ? 40 : 67}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{ "--progress": course ? "40%" : "67%" } as CSSProperties}
          >
            <strong>{course ? "40%" : "67%"}</strong>
          </div>
          <p>Lesson {course ? "4 of 10" : "8 of 12"}</p>
          <div className={`${styles.lesson} ${styles.compactHide}`}>
            <Check size={20} />
            {course ? "Find your audience" : "Shape the story"}
          </div>
          <div className={styles.lesson}>
            <Play size={20} />
            {course ? "Test your idea" : "Colour & mood"}
          </div>
        </div>
      </div>
    </PlatformViewShell>
  );
}
