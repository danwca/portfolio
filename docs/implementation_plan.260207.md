# Implementation Plan: Markdown-Driven Web Pages

> **Status**: ✅ **COMPLETED** - v0.3.0 (2026-02-07)
> 
> All core features have been successfully implemented and tested. The system now supports multi-page markdown files with component injection, variable interpolation, section-based layouts, and configurable navigation.

---

## Overview Implementation Plan

## Goal

Transform the portfolio application from hardcoded React components to a flexible markdown-driven system where entire web pages can be created and extended using markdown files with custom component injection capabilities.

## User Review Required

> [!IMPORTANT]
> **Backward Compatibility**: The existing portfolio template and pages will remain functional during the transition.
>
> **Component Injection**: We'll introduce a special markdown syntax to inject React components (like typewriter effects, social links, image galleries) into markdown pages.
>
> **Data-Driven Approach**: Personal data (name, email, social links) will be configurable via frontmatter or separate data files, eliminating hardcoded values.

> [!WARNING]
> **Breaking Change**: Pages currently using hardcoded components (Home, AboutMe) will need to be migrated to markdown format. We can maintain both systems during transition.

## Proposed Changes

### Core System Architecture

#### [MODIFY] [App.js](file:///x:/github/portfolio/src/App.js)
Enhance the markdown parser to support:
- **Component injection syntax**: `{{ComponentName param1="value" param2="value"}}`
- **Data variable interpolation**: `${data.firstName}` or `{{firstName}}`
- **Section-based rendering**: Parse markdown into logical sections for layout control

---

### Markdown Format Specification

#### [NEW] Markdown Page Format

Create a new markdown format that supports:

**1. Enhanced Frontmatter**
```yaml
---
title: Home Page
template: portfolio
layout: hero-split  # Layout variant within template
components:
  - Typewriter
  - SocialLinks
  - ContactForm
data:
  firstName: Daniel
  lastName: Wang
  role: Full Stack Developer
  autoTypeItems:
    - "MERN Stack Developer"
    - "Flutter App Developer"
---
```

**2. Component Injection Syntax**
```markdown
# Hi There!

I'm {{firstName}} {{lastName}}

{{Typewriter items=autoTypeItems prefix="I am a " }}

Feel free to {{highlight text="connect" color="primary"}} with me.

{{SocialLinks className="home-links"}}
```

**3. Layout Sections**
```markdown
::: section hero-left
# Welcome
Content for left side
:::

::: section hero-right
{{Avatar src="logo.png" animated=true}}
:::
```

---

### Component Registry System

#### [NEW] [src/components/registry/ComponentRegistry.js](file:///x:/github/portfolio/src/components/registry/ComponentRegistry.js)
Central registry for all injectable components:
- Maps component names to React components
- Validates component props
- Provides component documentation

#### [NEW] [src/components/markdown/](file:///x:/github/portfolio/src/components/markdown/)
New markdown-compatible components:
- `Typewriter.js` - Animated typing effect
- `Avatar.js` - Profile image with animations
- `SocialLinks.js` - Social media links
- `Highlight.js` - Highlighted text spans
- `Button.js` - Call-to-action buttons
- `ImageGallery.js` - Image galleries
- `ContactForm.js` - Contact forms

---

### Parser Enhancements

#### [NEW] [src/utils/markdownParser.js](file:///x:/github/portfolio/src/utils/markdownParser.js)
Enhanced markdown parser with:
- Component injection parser
- Variable interpolation
- Section/layout parser
- Data binding system

**Key Functions**:
```javascript
parseComponentSyntax(markdown, componentRegistry, data)
parseVariables(markdown, data)
parseSections(markdown)
renderMarkdownWithComponents(markdown, options)
```

---

### Example Markdown Pages

#### [NEW] [docs/home.md](file:///x:/github/portfolio/docs/home.md)
Replace hardcoded Home component:

```markdown
---
title: Home - Daniel Wang
template: portfolio
layout: hero-split
data:
  firstName: Daniel
  lastName: Wang
  nickName: "< Doctor Dan >"
  role: Full Stack Developer
  autoTypeItems:
    - "3rd Year IT Grad"
    - "MERN Stack Developer"
    - "Flutter App Developer"
    - "Open Source Contributor"
---

::: section hero-content
# Hi There!

## I'm {{firstName}} {{lastName}}

### {{nickName}}

{{Typewriter items=autoTypeItems prefix="I am a " loop=true}}

Feel free to {{highlight text="connect" color="primary"}} with me.

{{SocialLinks}}
:::

::: section hero-image
{{Avatar src="logo.png" animated=true}}
:::
```

#### [NEW] [docs/about.md](file:///x:/github/portfolio/docs/about.md)
Replace hardcoded AboutMe component:

```markdown
---
title: About Me
template: portfolio
layout: about-card
data:
  aboutMe: "Hi Everyone, I am Daniel Wang from Toronto, Canada..."
  resumeLink: "https://drive.google.com/..."
---

::: section avatar
{{Avatar src="dp.jpeg" size="large" border="primary"}}
:::

::: section content
# About Me

{{aboutMe}}

{{SocialLinks className="about-links"}}

{{Button href=resumeLink target="_blank"}}See My Resume{{/Button}}
:::
```

---

### Template System Updates

#### [MODIFY] [src/templates/portfolio.js](file:///x:/github/portfolio/src/templates/portfolio.js)
Enhance to support:
- Layout variants (hero-split, about-card, etc.)
- Section-based rendering
- Component injection

#### [NEW] [src/templates/layouts/](file:///x:/github/portfolio/src/templates/layouts/)
Layout components:
- `HeroSplit.js` - Two-column hero layout
- `AboutCard.js` - About page card layout
- `FullWidth.js` - Full-width content layout
- `Grid.js` - Grid-based layout

---

### Configuration System

#### [MODIFY] [public/config.json](file:///x:/github/portfolio/public/config.json)
Add markdown page mappings:

```json
{
  "sections": {
    "": {
      "folder": "docs",
      "template": "portfolio",
      "pages": {
        "/": "home.md",
        "/about": "about.md",
        "/skills": "skills.md",
        "/projects": "projects.md",
        "/contact": "contact.md"
      }
    }
  },
  "personalData": {
    "firstName": "Daniel",
    "lastName": "Wang",
    "email": "danw.ca@gmail.com",
    "socialLinks": {
      "github": "https://github.com/danwca",
      "linkedin": "https://linkedin.com/in/danwca"
    }
  }
}
```

---

### Migration Strategy

#### Phase 1: Component Registry
1. Create component registry system
2. Register existing components (SocialLinks, Button, etc.)
3. Create new markdown-compatible components

#### Phase 2: Parser Enhancement
1. Implement component injection parser
2. Add variable interpolation
3. Add section/layout parser

#### Phase 3: Template Updates
1. Update portfolio template for layouts
2. Create layout components
3. Test with sample markdown pages

#### Phase 4: Page Migration
1. Convert Home page to markdown
2. Convert About page to markdown
3. Create additional pages (Skills, Projects, Contact)

#### Phase 4: Documentation
1. Create markdown format guide
2. Document available components
3. Provide migration examples

## Verification Plan

### Automated Tests
1. **Parser Tests**: Test component injection, variable interpolation, section parsing
   ```bash
   npm test -- markdownParser.test.js
   ```

2. **Component Registry Tests**: Verify component registration and validation
   ```bash
   npm test -- ComponentRegistry.test.js
   ```

### Manual Verification
1. **Home Page**: Verify markdown-driven home page matches original design
2. **About Page**: Verify markdown-driven about page matches original
3. **Component Injection**: Test all injectable components render correctly
4. **Variable Interpolation**: Verify data binding works
5. **Layouts**: Test different layout variants
6. **Extensibility**: Create a new page using markdown to verify ease of use

### Browser Testing
- Navigate to `/` and verify home page renders correctly
- Navigate to `/about` and verify about page renders correctly
- Test responsive design on mobile/tablet/desktop
- Verify animations and interactive components work
