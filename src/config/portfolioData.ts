// Portfolio data configuration
// Edit this file to update your portfolio information displayed in buildings

export interface Project {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface PortfolioSection {
  title: string;
  content: string[];
  projects?: Project[];
}

export const portfolioData: { [key: string]: PortfolioSection } = {
  // Building 0: About & Skills
  about: {
    title: "About Me & Skills",
    content: [
      "Mykola Mykhaliuk",
      "Senior .NET Full Stack Developer",
      "",
      "With background of more than 12 years experience in",
      "planning, developing, and maintaining scalable, robust,",
      "and secure software systems written in Microsoft and",
      "open source technologies.",
      "",
      "SKILLS:",
      "• C# ASP.NET + Core",
      "• Angular, JavaScript, TypeScript",
      "• Microservices (RabbitMQ, SignalR)",
      "• SQL Server, MongoDB, EntityFramework",
      "• Jenkins, Docker, CI/CD",
      "• Azure Cloud Solutions",
      "• Agile/Scrum",
      "",
      "Based in Mainz, Germany"
    ]
  },

  // Building 1: Projects
  projects: {
    title: "Featured Projects",
    content: [],
    projects: [
      {
        title: "Prexello - AI Cloud Solution",
        description: "AI Cloud solution for monitoring industrial systems and process quality. Highly scalable cloud architecture with multi-layer services.",
        technologies: ["ASP.NET Core", ".NET 5", "MongoDB", "MSSQL", "Jenkins", "Docker", "IdentityServer"]
      },
      {
        title: "Timeboard - Time Management",
        description: "ASP.NET time management system for temporary workers with mobile hybrid app support.",
        technologies: ["ASP.NET", "C#", "Apache Cordova", "Ionic", "AngularJS", "WebApi"]
      },
      {
        title: "Panoptix Carbon Reporter",
        description: "Energy accounting and emissions management web portal with XML-based workflow engine.",
        technologies: ["ASP.NET MVC", "NHibernate", "JavaScript", "jQuery", "Bootstrap"]
      }
    ]
  },

  // Building 2: Experience
  experience: {
    title: "Work Experience",
    content: [
      "SENIOR DEVELOPER - TEAM LEAD",
      "mi Solutions & Consulting GmbH",
      "April 2018 - Present | Hochheim, Germany",
      "• Built entire agile development team",
      "• Designed highly scalable cloud solutions",
      "• Implemented CI/CD automation with Jenkins",
      "• Security with IdentityServer3/4 + 2FA",
      "",
      "SENIOR FULL STACK ASP.NET DEVELOPER",
      "JobFrame GmbH",
      "October 2014 - March 2018 | Mainz, Germany",
      "• Developed time management system",
      "• Created hybrid mobile app (Cordova + Ionic)",
      "• WCAG 2.0 accessibility implementation",
      "",
      "MIDDLE ASP.NET DEVELOPER",
      "GlobalLogic Ukraine - Johnson Controls",
      "September 2012 - February 2014 | Kyiv",
      "• Energy accounting web portal development",
      "• XML-based workflow engine design"
    ]
  },

  // Building 3: Education & Certifications
  education: {
    title: "Education & Certifications",
    content: [
      "EDUCATION",
      "National Technical University of Ukraine",
      "\"Kyiv Polytechnic Institute\"",
      "",
      "Master of Computer Systems",
      "Flexible Computerized Systems and Robotics",
      "2008 - 2010",
      "",
      "Bachelor of Computerized System,",
      "Automation and Management",
      "2004 - 2008",
      "",
      "CERTIFICATIONS",
      "• Zertifikat telc Deutsch B1 \"Gut\"",
      "• MS: Programming in HTML5 with JS & CSS3",
      "• Microsoft Certified Professional (MCPS)"
    ]
  },

  // Building 4: Contact
  contact: {
    title: "Get In Touch",
    content: [
      "CONTACT INFORMATION",
      "",
      "Email: mykola.mykhaliuk@gmail.com",
      "Phone: +49 157 55968525",
      "",
      "LinkedIn: linkedin.com/in/mykola-mykhaliuk",
      "GitHub: github.com/mykolaMykhaliuk",
      "XING: xing.com/profile/Mykola_Mykhaliuk",
      "",
      "Web CV: webcv.azurewebsites.net",
      "Blog: mmblog.azurewebsites.net",
      "",
      "LOCATION",
      "55122 Mainz, Germany",
      "",
      "Open to opportunities!"
    ]
  },
};

// Get portfolio data for a specific building
export function getPortfolioForBuilding(buildingId: number): PortfolioSection {
  const sections = Object.values(portfolioData);
  const index = buildingId % sections.length;
  return sections[index];
}

// Get section keys for reference
export function getPortfolioSectionKeys(): string[] {
  return Object.keys(portfolioData);
}
