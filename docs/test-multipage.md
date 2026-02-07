---
type: settings
defaultTemplate: portfolio
defaultLayout: hero-split
showNavigation: false  
sharedData:
  firstName: Daniel
  lastName: Wang
  email: danw.ca@gmail.com
  role: Full Stack Developer
  socialLinks:
    github: https://github.com/danwca
    linkedin: https://linkedin.com/in/danwca
components:
  - Typewriter
  - SocialLinks
  - Avatar
  - Button
---

# Settings Page

This is a settings page that configures defaults for all pages in this file.
The content here is ignored, but the frontmatter applies to all subsequent pages.

====

---
title: Home - Daniel Wang Portfolio
id: home
data:
  autoTypeItems:
    - "MERN Stack Developer"
    - "Flutter App Developer"
    - "Open Source Contributor"
    - "Full Stack Engineer"
---

::: section hero-left
# Hi There! 👋

## I'm {{firstName}} {{lastName}}

### {{role}}

{{Typewriter items=autoTypeItems prefix="I am a " loop=true}}

Feel free to **connect** with me.

{{SocialLinks className="home-links"}}
:::

::: section hero-right
{{Avatar src="logo.png" animated=true size="large"}}
:::

::: section main
## About This Portfolio

This is a demonstration of the markdown-driven web page system.
Everything you see here is generated from a single markdown file!

### Features:
- ✅ Multi-page support in one file
- ✅ Settings page for shared configuration
- ✅ Component injection
- ✅ Variable interpolation
- ✅ Section-based layouts
:::

====

---
title: About Me
id: about
showNavigation: true 
layout: about-card
data:
  aboutMe: "Hi Everyone, I am Daniel Wang from Toronto, Canada. I have worked with libraries & frameworks like ReactJS, NodeJS, and have keen knowledge of databases like MySQL, MongoDB and Firebase. Eager to contribute to innovative projects and gain hands-on experience in a dynamic and collaborative environment."
  resumeLink: "https://drive.google.com/file/d/1vfnzDcN4uATaNZ7cc9kdKvep9ZBUN_be/view?usp=sharing"
---

::: section avatar
{{Avatar src="dp.jpeg" size="large" border="primary"}}
:::

::: section content
# About Me

{{aboutMe}}

## Connect With Me

{{SocialLinks className="about-links" size="large"}}

{{Button href=resumeLink target="_blank" variant="primary"}}See My Resume{{/Button}}
:::

====

---
title: Skills & Technologies
id: skills
template: portfolio
layout: full-width
---

# Professional Skillset

## Programming Languages
- JavaScript / TypeScript
- Python
- Java
- C++

## Frameworks & Libraries
- React.js
- Node.js
- Express.js
- Flutter

## Databases
- MongoDB
- MySQL
- Firebase
- PostgreSQL

## Tools & Platforms
- Git & GitHub
- Docker
- AWS
- VS Code

---

**Contact**: {{email}}

{{SocialLinks size="small"}}

====

---
title: Contact
id: contact
template: contact
layout: form-center
---

# Get In Touch

I'm always open to discussing new projects, creative ideas, or opportunities to be part of your visions.

## Reach Out

Email: {{email}}

Or connect via social media:

{{SocialLinks size="large"}}

---

*This page was generated using the markdown-driven web page system.*
