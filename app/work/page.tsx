import React from "react";
import { JsonLd } from "@/components/JsonLd";
import { WorkHub } from "@/components/WorkHub";
import { WorkResearchAndTeaching } from "@/components/WorkResearchAndTeaching";
import { LegacyWorkLinks } from "@/components/LegacyWorkLinks";
import { projects, publications } from "@/data/portfolio";
import { workCategories } from "@/data/work-categories";
import { createPageMetadata, createPublicationsJsonLd } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Embedded Systems, IoT, Robotics & Product Engineering Work",
  description:
    "Explore Ahmed Asl’s hardware prototypes, custom PCBs, ESP32/STM32 firmware, robotics, companion apps, and B2B technical modernization.",
  pathname: "/work/"
});

export default function WorkPage() {
  const destinations: Record<string, string> = { recognition: "/work/recognition/", "agribot-award": "/work/recognition/#agribot-award", "dead-code-award": "/work/recognition/#dead-code-award" };
  workCategories.forEach(group => {
    destinations[group.id] = `/work/${group.id}/`;
    projects.filter(project => group.categories.includes(project.category)).forEach(project => { destinations[project.slug] = `/work/${group.id}/${project.slug}/`; });
  });
  return (
    <div className="asl-page">
      <JsonLd data={createPublicationsJsonLd(publications)} />
      <LegacyWorkLinks destinations={destinations} />
      <section className="page-intro shell asl-page-intro">
        <p className="eyebrow">Work log / verified builds</p>
        <h1>Selected work</h1>
        <p className="page-lede">
          Explore verified work across custom PCB design, ESP8266/ESP32 firmware,
          IoT telemetry, autonomous robotics, Flutter control apps, and B2B technical
          modernization.
        </p>
      </section>

      <WorkHub />
      <WorkResearchAndTeaching />
    </div>
  );
}
