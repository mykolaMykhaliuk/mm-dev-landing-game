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
      "Full Stack Developer",
      "",
      "SKILLS:",
      "• JavaScript/TypeScript",
      "• React, Node.js",
      "• Phaser 3 Game Development",
      "• Python, Java",
      "• Database Design (SQL/NoSQL)",
      "• Cloud Services (AWS/Azure)",
      "",
      "Add your skills here!"
    ]
  },

  // Building 1: Projects
  projects: {
    title: "Featured Projects",
    content: [],
    projects: [
      {
        title: "Isometric RPG Demo",
        description: "Browser-based RPG with procedural generation, dual weapon system, and dynamic difficulty",
        technologies: ["Phaser 3", "TypeScript", "Vite"]
      },
      {
        title: "Project 2",
        description: "Add your project description here",
        technologies: ["Tech1", "Tech2"]
      },
      {
        title: "Project 3",
        description: "Add your project description here",
        technologies: ["Tech1", "Tech2"]
      }
    ]
  },

  // Building 2: Experience
  experience: {
    title: "Work Experience",
    content: [
      "CURRENT POSITION",
      "Company Name | 2023 - Present",
      "• Achievement or responsibility",
      "• Another achievement",
      "",
      "PREVIOUS POSITION",
      "Company Name | 2021 - 2023",
      "• Your accomplishments here",
      "",
      "Edit with your experience!"
    ]
  },

  // Building 3: Education & Certifications
  education: {
    title: "Education & Certifications",
    content: [
      "EDUCATION",
      "University Name",
      "Degree in Computer Science",
      "Graduated: Year",
      "",
      "CERTIFICATIONS",
      "• Certification Name",
      "• Another Certification",
      "",
      "Add your credentials here!"
    ]
  },

  // Building 4: Contact
  contact: {
    title: "Get In Touch",
    content: [
      "CONTACT INFORMATION",
      "",
      "Email: your.email@example.com",
      "LinkedIn: linkedin.com/in/mykola-mykhaliuk",
      "GitHub: github.com/yourusername",
      "Portfolio: yourwebsite.com",
      "",
      "LOCATION",
      "Your City, Country",
      "",
      "Open to opportunities!",
      "",
      "Update with your contact info"
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
