export const workCategories = [
  { id: "embedded-iot", title: "Embedded Systems & IoT", intro: "Firmware, custom electronics, PCB design, and connected hardware systems from signal to portal.", style: "embedded", categories: ["Engineering & IoT"] },
  { id: "robotics", title: "Robotics", intro: "Physical autonomous builds that sense, actuate, and respond in real environments.", style: "robotics", categories: ["Robotics", "Robotics / AMIT Graduation Project"] },
  { id: "apps-ui", title: "Apps & UI Design", intro: "Companion mobile apps, Flutter interfaces, and control surfaces built for hardware products.", style: "apps", categories: ["AI & Mobile", "UI/UX & Design"] },
  { id: "web-development", title: "B2B Technical Modernization", intro: "Enterprise web architecture, searchable product catalogs, and infrastructure migrations for industrial firms.", style: "web", categories: ["Web Development", "Website Design"] },
  { id: "video-media", title: "Video & Media", intro: "Editing, motion graphics, and visual documentation for engineering communities.", style: "media", categories: ["Video"] }
];

export function groupWork(projects) {
  return workCategories.map(group => ({ ...group, projects: projects.filter(project => group.categories.includes(project.category)) }));
}
