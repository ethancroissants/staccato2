Prompt for Staccato App

You are an expert Svelte 6 developer and UI/UX designer. Your task is to design and implement a comprehensive music education app called 'Staccato' with two core modules: a Music Notation Learner and a Fingering Trainer. The app must be visually stunning, using the provided color system, and feel handcrafted (not AI-generated).

Core Requirements
1. Music Notation Learner
Adaptive Learning Path: Start with an intro quiz to assess the user's current knowledge (e.g., 'Do you know what a staff is?', 'Can you identify a treble clef?'). Based on results, customize the learning journey.
Comprehensive Coverage: Teach notes on the staff for all clefs (treble, bass, alto, tenor, soprano, etc.), including sharps, flats, and naturals.
Learning Mode: Interactive lessons that explain concepts (e.g., 'This is middle C on the treble clef'). Use visual aids, animations, and audio.
Quiz Mode: Randomized quizzes where users identify notes on the staff. Include multiple-choice, fill-in-the-blank, and timed challenges.
Points System: Award points for correct answers, streaks, and completing lessons. Display a leaderboard or progress bar.
Customization: Users can select which clefs to focus on, difficulty level (e.g., only natural notes, then add sharps/flats), and note range.
2. Fingering Trainer
Instrument Selection: Support multiple brass instruments (trumpet, trombone, French horn, tuba, etc.). For each, allow customization of:
Clef (treble, bass, etc.)
Instrument sound (MIDI or sampled)
Fingering chart display
Keyboard Controls: Use keys 1, 2, 3 on the keyboard to simulate valve presses (for brass). Map these to correct fingerings for each note.
Modes:
Free Play Mode: User presses keys to hear notes and see fingerings. No guidance, just exploration.
Learn Mode: The app shows a note on the staff, and the user must press the correct key combination. Provides visual/audio feedback (correct/incorrect). Gradually increases difficulty.
Association Mode: Shows a note and its fingering simultaneously, then quizzes the user to reinforce the connection.
Guidance System: For beginners, show a visual overlay of the instrument with highlighted valves. Include tooltips and hints.
3. User Experience & Onboarding
Zero-Knowledge Assumption: Assume the user knows nothing about music. Use plain language, avoid jargon without explanation.
Intro Quiz: A short, friendly quiz (5-10 questions) to gauge knowledge. Example questions:
'Have you ever read sheet music before?' (Yes/No)
'Can you name this note?' (with image)
'What clef is this?' (multiple choice)
Personalized Dashboard: After the quiz, show a recommended learning path. Allow users to skip ahead if they're confident.
4. Visual Design & Theming
Color System: Use the provided 'Spark Family' palette strictly. Apply colors as follows:
Spark Orange (#FF5B14): Primary buttons, links, interactive elements, the
Deep Spark (#E0470A): Hover states, pressed buttons.
Tangerine (#FF7A2D): Gradients, warm highlights.
Amber (#FB8B00): Secondary accents, warnings.
Gold (#F59E0B): small icons.
Rust Orange (#C2410C): Text on light backgrounds.
Soft Spark (#FFEDE0): Tinted backgrounds, callout boxes.
Paper (#FFFDF9): Page background.
Soft Paper (#FBF5EC): Alternate sections.
Surface (#FFF): Cards, modals.
Ink (#17120E): Headings, near-black text.
Soft Ink (#443B33): Body text.
Muted Ink (#8A7E72): Secondary text.
Faint Ink (#B6ABA0): Hints, footnotes.
Semantic Colors: Success (#4D9E3F), Danger (#E04F35), Warning (#FB8B00), Info (#3B76C4).
Typography: Use a clean, readable sans-serif font (e.g., Inter, system-ui). Headings should be bold and large.
Layout: Responsive design (mobile-first). Use generous whitespace, rounded corners (8px-12px), subtle shadows for depth.
Animations: Smooth transitions (0.2s-0.3s ease), micro-interactions (button press, card hover). Avoid flashy or distracting effects.
Anti-AI Look: Ensure the design feels human-crafted. Use organic shapes, hand-drawn icons (if possible), and avoid overly symmetrical layouts. Add subtle texture to backgrounds.
5. Technical Implementation (Svelte 6)
State Management: Use Svelte stores for user progress, quiz state, points.
Audio: Use Web Audio API or Tone.js for instrument sounds. Preload samples for low latency.
Accessibility: Ensure keyboard navigation, screen reader support, high contrast mode.
Performance: Lazy load components, use Svelte's built-in animations, optimize images.
Data Persistence: Save user progress in localStorage or IndexedDB (no backend required).
6. Output Format
Provide a complete Svelte 6 project structure with:
src/ directory containing components, stores, utilities.
App.svelte as the root component.
public/ for static assets (fonts, sounds).
package.json with dependencies.
A README.md explaining setup and usage.
Write clean, well-commented code. Use Svelte 6's latest features (runes, snippets, etc.).
Constraints
Keep the bundle size under 500KB (excluding audio samples).
Ensure the app is fully responsive (mobile, tablet, desktop).

