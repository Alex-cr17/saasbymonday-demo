# Design / UI Discovery

This step is performed **after** collecting functional requirements and **before** creating the PRD and generating code. It helps clarify how the app should look and gives the AI and developer enough context for UI/UX.

Users do not always have a clear design vision — the questions are phrased so you can suggest options or propose typical solutions.

---

## When to run it

- After the user has said **what** they want (features, entities, app type).
- Before finalizing the PRD and writing/generating UI code.

---

## Block 1: Overall feeling

1. **What mood/atmosphere should the app create?**  
   (calm, energetic, business-like, soft, minimalist, “like a notes app”, etc.)

2. **Is there a preference for light or dark theme by default?**  
   (light / dark / system / no preference — then you can suggest system)

3. **Is mobile or desktop more important initially?**  
   (mobile-first / desktop-first / equal)

---

## Block 2: Interface style

4. **Which interface style feels closer?**  
   - Minimalist (lots of “air”, few elements)  
   - Dense / information-rich (a lot of data on screen)  
   - Card-based (blocks, cards, sections)  
   - List-based (tables, lists)  
   - Not sure — you can propose minimalist + cards as a starting point

5. **Colors: any brand colors or preferences?**  
   (for example, one accent color, “neutral tones”, “like in app X”)

6. **Fonts: any preferences?**  
   (serious / rounded / mono / no preference — then use system or template defaults)

---

## Block 3: References

7. **Can they send 1–3 screenshots or links to apps/sites whose look they like?**  
   (rough descriptions are fine: “something like Notion”, “like Apple Reminders”, “similar to [link]”)

8. **What should we avoid?**  
   (e.g. “no bright colors”, “no heavy animation”, “not like social media”)

---

## Block 4: Key screens

9. **Which screen/block is most important for the user?**  
   (home, list view, create form, dashboard, etc.) — this should get extra attention when proposing the layout.

10. **Do they need tips/onboarding on first login?**  
    (yes / no / not sure — you can propose minimal onboarding)

---

## How to use the answers

- **Tone and atmosphere** → choice of colors, spacing, font sizes, theme defaults (light/dark).
- **Style (minimalist, cards, lists)** → page structure, components (cards, tables, lists), content density.
- **References** → concrete patterns: button placement, sidebar, headings, forms.
- **What to avoid** → constraints on colors, animations, complexity.
- **Main screen** → priority when describing the layout and order of elements.

If the user is unsure, suggest one or two options (for example: “we can go with a minimalist layout with cards and system theme”) before moving on to PRD and code.

---

## For the template author

Recommendation: add this step to **project-generation.md** as a separate step between “Clarifying Questions (functional)” and “Create PRD”, and in the AI instructions say: after collecting functional answers, run Design Discovery (using this document), capture a short summary (for example in the PRD as `designNotes` or a separate section), and only then generate the UI.

