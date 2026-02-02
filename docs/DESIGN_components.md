# Design Description: Component System

## 1. Design Overview
The Component System allows embedding rich, interactive React UI elements directly into Markdown content. Components serve as the "Blocks" of the portfolio, enabling features like Contact Forms, Project Galleries, and Timelines that are impossible with standard Markdown.

## 2. Component Interface
All components embedded via the Markdown Parser receive two standard props:

```javascript
const MyComponent = ({ content, params }) => {
   // content: The raw string content inside the <!-- Comment --> block
   // params:  The global page parameters (JSON) merged from all sources
   ...
}
```

## 3. Data Handling Patterns
There are currently two competing patterns in the codebase for how components get their data:

### Pattern A: Self-Parsing (The "Dynamic" Way)
The component receives raw Markdown/Text via the `content` prop and parses it internally to extract data. This is the **recommended** pattern as it keeps content in the Markdown file.

*   **Example**: `Projects.js`, `Certifications.js`
*   **Logic**:
    1.  Split `content` by newlines.
    2.  Scan for Markup markers (e.g., `### Title`, `- **Key**: Value`).
    3.  Build a data array and render.

### Pattern B: Static Data (The "Legacy" Way)
The component completely ignores the `content` prop and imports a static JS file from `src/components/Data/`.

*   **Example**: `Education.js`, `Home.js`
*   **Logic**: `import Data from '../Data/EducationData';`
*   **Drawback**: Changing content requires a code commit/rebuild, defeating the purpose of the CMS-like Markdown system.

## 4. Component Catalog

### Content Components (Dynamic)
| Component | Function | Parsing Logic |
| :--- | :--- | :--- |
| **`AboutMe`** | Displays specific "About" text and resume link. | Parses Key:Value pairs (e.g., `aboutMe: ...`, `resumeLink: ...`). |
| **`Project.Projects`** | Gallery of project cards. | Custom Parser: `### Title` starts a new item; `- **Key**:` defines attributes. |
| **`Certifications`** | List of certificates. | Custom Parser: `## Title` starts item; `- **Key**:` defines attributes. |

### Static Components (Legacy)
| Component | Function | Data Source |
| :--- | :--- | :--- |
| **`Home`** | Landing page hero section. | `src/components/Data/PersonalData.js` |
| **`Education`** | Timeline of degrees and skills. | `src/components/Data/EducationData.js` |
| **`Get In Touch`** | Contact info cards. | `src/components/Data/PersonalData.js` |
| **`ProfessionalSkillset`** | Grid of tech icons. | *Hardcoded / Static Data* |

### System Components
| Component | Function | Usage |
| :--- | :--- | :--- |
| **`Get In Touch.ContactForm`** | Interactive email form. | Accepts params (email config) or renders default form. |
| **`SocialLinks`** | Row of social icons. | Uses `SocialData.js`. |
| **`Navbar`** | Top navigation bar. | Part of the `default` template. |
| **`Footer`** | Bottom footer. | Part of the `default` template. |
| **`UI.Button`** | Styled themed button. | Generic UI primitive. |

## 5. Extension Guide

### Creating a New Parser Component
To create a component that reads data from Markdown (e.g., a "Testimonial" slider):

1.  **Define the Component**:
    ```javascript
    // src/components/Testimonials.js
    const Testimonials = ({ content }) => {
        // 1. Parse
        const items = content.split('---').map(block => {
            const lines = block.split('\n');
            return {
                name: lines.find(l => l.startsWith('Name:'))?.split(':')[1],
                text: lines.find(l => !l.includes(':')) // Assume plain text is the quote
            };
        });

        // 2. Render
        return <div>{items.map(...)}</div>;
    };
    export default Testimonials;
    ```

2.  **Use in Markdown**:
    ```markdown
    <!-- Testimonials -->
    Name: John Doe
    This developer is great!
    ---
    Name: Jane Smith
    Amazing work.
    <!-- /Testimonials -->
    ```

### Best Practices
*   **Avoid Static Data**: Try to avoid creating new components that depend on `src/components/Data`. Always try to drive content via the `content` prop.
*   **Robust Parsing**: Ensure your parser handles empty lines, extra spaces, and missing fields gracefully.
*   **Theming**: Use `useSelector` to access `state.uiColor` and `state.nonThemeColor` to ensure the component respects the user's selected theme.
