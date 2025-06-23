import {
  mobile,
  backend,
  creator,
  web,
  javascript,
  typescript,
  reactjs,
  nodejs,
  nextjs,
  cogent,
  adacell,
  fillip,
  innovovision,
  paypines,
  self,
  threads,
  healthcare,
  portfolio,
  aditya,
  santosh,
  school,
} from "../assets";

export const navLinks = [
  {
    id: "about",
    title: "About",
  },
  {
    id: "work",
    title: "Work",
  },
  {
    id: "technology",
    title: "Technology",
  },
  {
    id: "project",
    title: "Project",
  },
  {
    id: "activities",
    title: "Activities",
  },
  {
    id: "contact",
    title: "Contact",
  },
];

const services = [
  {
    title: "Web Developer",
    icon: web,
  },
  {
    title: "React Developer",
    icon: mobile,
  },
  {
    title: "Full-Stack Developer",
    icon: backend,
  },
  {
    title: "Fronted Developer",
    icon: creator,
  },
];

const technologies = [
  {
    name: "JavaScript",
    icon: javascript,
  },
  {
    name: "TypeScript",
    icon: typescript,
  },
  {
    name: "React JS",
    icon: reactjs,
  },
  {
    name: "Node JS",
    icon: nodejs,
  },
  {
    name: "nextjs",
    icon: nextjs,
  },
];

const activities = [
  {
    name: "JavaScript",
    icon: javascript,
  },
  {
    name: "TypeScript",
    icon: typescript,
  },
  {
    name: "React JS",
    icon: reactjs,
  },
  {
    name: "Node JS",
    icon: nodejs,
  },
  {
    name: "nextjs",
    icon: nextjs,
  },
];

const experiences = [
  {
    title: "Freelance Full Stack Engineer",
    company_name: "Freelance",
    icon: self,
    iconBg: "#E6DEDD",
    date: "April 2022 - Present",
    points: [
      "File-based Routing to simplify navigation and ensure scalability across different application pages.",
      "Ensured that web applications were fully responsive across a range of devices and screen sizes, using modern CSS frameworks like Tailwind CSS, Shadcn-UI and Material-UI for styling and design consistency.",
      "Developed RESTful APIs and integrated GraphQL APIs to handle dynamic data requests between the front-end and back-end. By using Node.js, I ensured that these APIs were scalable, modular, and easy to maintain.",
      "Integrated NextAuth.js and Clerk into Next.js applications for seamless authentication and user management. Leveraged built-in authentication providers (Google, GitHub, etc.) and custom email/password authentication for user login.",
      "Collaborated with design teams to translate static designs into functional, interactive user interfaces using React.js and Next.js. By leveraging reusable components, I maintained a consistent design language across the application, enhancing both usability and user experience.",
      "Implemented server-side rendering (SSR) in Next.js to optimize page load times and improve SEO, ensuring that web pages are indexed efficiently by search engines. Additionally, I used static site generation (SSG) to pre-render pages at build time for faster delivery and enhanced performance.",
    ],
  },
  {
    title: "PHP Developer",
    company_name: "PayPines Financial Services",
    icon: paypines,
    iconBg: "#E6DEDD",
    date: "August 2021 - February 2022",
    points: [
      "Assisted in database design and optimization, focusing on data integrity and query performance.",
      "Collaborated with front-end developers to integrate APIs and deliver a seamless user experience.",
      "Integrated third-party APIs and services, improving application functionality and user experience.",
      "Engaged in troubleshooting and debugging complex issues to improve application stability and security.",
      "Optimized database queries and managed large-scale database systems (MySQL), achieving significant performance improvements.",
    ],
  },
  {
    title: "Software Developer",
    company_name: "Innovovision Technology",
    icon: innovovision,
    iconBg: "#E6DEDD",
    date: "February 2019 - July 2021",
    points: [
      "Created reusable components and libraries, improving development efficiency and consistency across projects.",
      "Mentored junior developers, providing guidance on best practices and fostering a collaborative team environment.",
      "Conducted performance optimization and debugging of applications, ensuring smooth functionality and user experience.",
      "Integrated authentication and authorization systems, including session management, user roles, and permissions for enhanced security.",
      "Worked closely with cross-functional teams including UI/UX designers, QA engineers, and project managers to deliver high-quality software solutions.",
    ],
  },
  {
    title: "Software Engineer",
    company_name: "Fillip Technologies",
    icon: fillip,
    iconBg: "#E6DEDD",
    date: "February 2018 - January 2019",
    points: [
      "Implementing responsive design and ensuring cross-browser compatibility.",
      "Participating in code reviews and providing constructive feedback to other developers.",
      "Designed, developed, and maintained websites and web applications using PHP, ensuring high performance and responsiveness.",
      "Collaborating with cross-functional teams including designers, product managers, and other developers to create high-quality products.",
      "Engaged directly with clients to understand and document requirements, delivering tailored software solutions that met client specifications and expectations.",
    ],
  },
  {
    title: "Telecommunications Engineer",
    company_name: "Adacell Technology",
    icon: adacell,
    iconBg: "#E6DEDD",
    date: "April 2017 - January 2018",
    points: [
      "The radio transmitter, receiver and transceiver were installed and tested for proper functioning.",
      "Aligned with project budgets to minimize costs and delays, meeting timely deadlines and quality standards.",
      "Advanced simulation software was used for predictive analysis of RF system performance, leading to strategic improvements.",
      "Streamlined operational processes by automating routine telecommunications tasks, freeing up resources for strategic projects.",
      "Delivered training sessions on RF engineering principles to junior staff, fostering a culture of continuous learning and development.",
    ],
  },
  {
    title: "Customer Support Associate",
    company_name: "Cogent E Services",
    icon: cogent,
    iconBg: "#E6DEDD",
    date: "January 2017 - March 2017",
    points: [
      "Worked with energy and determination to maintain efficient customer service during peak business hours.",
      "Handled customer complaints calmly and professionally, providing positive solutions to uphold company reputation.",
      "Responded to live chat rooms to answer and resolve customer queries, elevating customer satisfaction with immediate support.",
      "Participated in weekly team meetings to discuss challenges and share best practices. Monitored email to promptly collect and respond to complaints.",
      "The primary point of contact for customer questions, complaints, and assistance and respond to customers through various channels, such as phone, email, live chat, and social media.",
    ],
  },
];

const testimonials = [
  {
    testimonial:
      "I thought it was impossible to create a website that could truly match the beauty of our product, but Abej proved me wrong. The website he designed not only captures the essence of our brand but enhances it in ways I didn’t think were possible. It’s truly a work of art.",
    name: "Santosh Sing",
    designation: "CFO",
    company: "Jindalco Metal",
    image: santosh,
  },
  {
    testimonial:
      "I've never worked with a web developer who is as genuinely invested in their clients' success as Abej. He goes above and beyond to ensure not just a beautiful website, but one that truly drives results. His dedication is unmatched from another designer and developer.",
    name: "Aditya Kumar",
    designation: "SE",
    company: "CSM Technologies",
    image: aditya,
  },
  {
    testimonial:
      "Abej is unlike any web developer I’ve ever worked with. He truly cares about his clients' success, going the extra mile to create a website that not only looks amazing but also helps our business thrive. His commitment and attention to detail are exceptional with client.",
    name: "Chandan Singh",
    designation: "CTO",
    company: "Mount Carmel School",
    image: school,
  },
];

const projects = [
  {
    name: "Threads Application",
    description:
      "Building a full-stack clone of Threads (a social media platform) with Next.js 14+ involves several stages, including user interface design, backend API development, real-time features, user authentication, notifications, and community management. The platform should support various features like nested comments, real-time search, and notifications.",
    tags: [
      {
        name: "nextjs",
        color: "blue-text-gradient",
      },
      {
        name: "mongodb",
        color: "green-text-gradient",
      },
      {
        name: "tailwind",
        color: "pink-text-gradient",
      },
    ],
    image: threads,
    source_code_link: "https://github.com/Abej-Rijwi/threads",
  },
  {
    name: "Health Application",
    description:
      "Building a healthcare platform that streamlines patient registration, appointment scheduling, medical record management, complex forms, and SMS notifications is a large-scale project that involves both front-end and back-end components, integration with third-party services, and security measures to protect sensitive health data.",
    tags: [
      {
        name: "nextjs",
        color: "blue-text-gradient",
      },
      {
        name: "appwrite",
        color: "green-text-gradient",
      },
      {
        name: "tailwind",
        color: "pink-text-gradient",
      },
    ],
    image: healthcare,
    source_code_link: "https://github.com/Abej-Rijwi/healthcare",
  },
  {
    name: "Portfolio Application",
    description:
      "Building a personal portfolio website with react.js and three.js involves creating a visually appealing and responsive design that showcases your skills, projects, and experiences. The website should include sections for an introduction, project showcases, testimonials, and contact information. 3D graphics design  for amazing view using threejs.",
    tags: [
      {
        name: "reactjs",
        color: "blue-text-gradient",
      },
      {
        name: "threejs",
        color: "green-text-gradient",
      },
      {
        name: "tailwind",
        color: "pink-text-gradient",
      },
    ],
    image: portfolio,
    source_code_link: "https://github.com/Abej-Rijwi/portfolio",
  },
];

export {
  services,
  technologies,
  experiences,
  testimonials,
  projects,
  activities,
};
