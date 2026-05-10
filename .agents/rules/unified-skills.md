# SYSTEM DIRECTIVE: AUTO-LOAD SKILLS

For EVERY prompt and BEFORE taking any action, writing code, or answering a question, you MUST perform the following steps:

1. Scan the `./.skills` directory in the root of this project.
2. Read the YAML descriptions (frontmatter) of the available `SKILL.md` files.
3. Identify the most relevant skill for the user's current request.
4. Read the entire `SKILL.md` file into your context.
5. Strictly follow the step-by-step instructions, constraints, and playbooks defined in that skill.

Do not bypass the skill library. Rely on these local playbooks before generating standard responses.