import Image from "next/image";
import { WidgetCard as Card } from "./widget-card";

export function AcademyWidget() {
  return (
    <Card data-hue="academy" aria-label="Academy learning progress" role="group" className="w-full gap-0! p-1! text-xs">
      <div className="relative h-[144px] w-full overflow-hidden rounded-icon p-1">
        <Image
          src="/assets/images/academy-course.jpg"
          alt=""
          fill
          sizes="300px"
          className="object-cover"
        />
        <span className="relative inline-flex h-4 items-center rounded-pill bg-overlay px-2 font-medium text-white">
          Design
        </span>
      </div>
      <div className="flex flex-col gap-1 p-2">
        <p className="font-medium">The art of visual stories</p>
        <div className="flex items-center justify-between text-muted">
          <span>Lesson 8 of 12</span>
          <span className="font-medium tabular-nums">67%</span>
        </div>
        <div
          role="progressbar"
          aria-label="Course progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={67}
          aria-valuetext="Lesson 8 of 12, 67% complete"
          className="h-[4px] overflow-hidden rounded-pill bg-surface-3"
        >
          <div data-widget-motion="course-fill" className="h-full w-[67%] rounded-pill bg-(--hue)" />
        </div>
      </div>
    </Card>
  );
}
