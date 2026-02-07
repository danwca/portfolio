---
title: Simple Single Page Test
template: portfolio
layout: hero-split
data:
  firstName: Daniel
  lastName: Wang
  greeting: "Welcome to my portfolio!"
components:
  - Avatar
  - SocialLinks
---

::: section hero-left
# {{greeting}}

## I'm {{firstName}} {{lastName}}

This is a simple single-page markdown file to test the basic functionality.

{{SocialLinks}}
:::

::: section hero-right
{{Avatar src="logo.png" size="large"}}
:::

::: section main
## Features Being Tested

1. **Frontmatter parsing** - Title, template, layout, data
2. **Section syntax** - Using `:::section` blocks
3. **Variable interpolation** - {{firstName}}, {{lastName}}, {{greeting}}
4. **Component injection** - Avatar and SocialLinks components
5. **Standard markdown** - Headers, lists, bold text

### Next Steps

- Test multi-page files
- Test settings page inheritance
- Test more complex component props
:::
