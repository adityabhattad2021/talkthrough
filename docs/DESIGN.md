# Talkthrough — Design System v1

**Direction:** Studio Calm
**Last updated:** April 10, 2026
**Replaces:** PRD Section 7

---

## Philosophy

The product is a tool, not a toy. It respects the user as an adult who is genuinely trying to learn something hard. The interface gets out of the way so the conversation can happen.

Three principles shape every decision:

**Restraint as personality.** Most language apps try to motivate you with mascots and confetti. This app trusts you to be motivated already. The interface's character comes from what it doesn't do — no streaks-screaming-at-you, no celebratory animations on simple taps, no gamification overlays. When something does animate, it means something.

**One color does one thing.** Sage is the only chromatic color in the app. It marks the AI's voice, the active node on the Pathway, success states, and the user's progress ring. Nothing else uses color. This is the discipline that makes the app feel like a tool instead of a poster.

**Motion is the playfulness.** The "playful with serious tone" requirement lives entirely in motion design. A pulse that breathes at 0.5Hz instead of strobing. A score ring that overshoots slightly before settling. A spring on every navigation transition with carefully tuned tension. The app is calm at rest and confident in motion.

---

## Color tokens

### Surfaces

| Token | Hex | Use |
|---|---|---|
| `bone` | `#F4F4F1` | App background, primary surface |
| `paper` | `#FFFFFF` | Cards, sheets, elevated surfaces |
| `stone` | `#DDDDD8` | Disabled surfaces, locked nodes, skeleton states |
| `mist` | `#EAEAE6` | Subtle dividers, secondary borders |

### Ink

| Token | Hex | Use |
|---|---|---|
| `ink` | `#1A1A1A` | Primary text, headings, user transcript |
| `slate` | `#4A4A4A` | Secondary text, body copy on cards |
| `fog` | `#6B6B6B` | Tertiary text, captions, transliteration |
| `ash` | `#A0A09C` | Disabled text, placeholder text |

### Accent — sage

The only chromatic ramp in the system. Used for: AI voice in transcripts, active state on the Pathway, success indicators, the score ring.

| Token | Hex | Use |
|---|---|---|
| `sage-50` | `#F0F4F0` | Sage-tinted backgrounds, subtle highlights |
| `sage-200` | `#C5D4C6` | Sage borders, ring backgrounds |
| `sage-500` | `#6A8A6C` | Primary accent — AI text, active nodes, score |
| `sage-700` | `#4A6B4C` | Pressed states, dark sage text |

### Functional

Used sparingly, only when meaning is unambiguous. Never decorative.

| Token | Hex | Use |
|---|---|---|
| `error` | `#A8483D` | Error states, destructive confirmations |
| `error-bg` | `#F5E8E5` | Error message backgrounds |

Notice what's missing: no warning yellow, no info blue, no success green-that-isn't-sage. If a state needs to be communicated, it uses ink + the right copy, not a new color.

---

## Typography

One typeface, two weights, four sizes. The restraint is the point.

### Family

**Inter** for everything. Available via Expo Google Fonts. Rationale: neutral, premium, excellent multilingual support including Kannada via fallback. No serif, no display face, no second family.

For Kannada script specifically, the rendering falls through to the system Kannada font (Noto Sans Kannada on Android, system Kannada on iOS). Inter handles the Latin/transliteration; the OS handles ಕನ್ನಡ. This is fine — don't try to ship a custom Kannada font in v0.

### Scale

| Role | Size | Weight | Line height | Letter spacing |
|---|---|---|---|---|
| Display | 32px | 500 | 1.15 | -0.02em |
| Heading | 22px | 500 | 1.25 | -0.015em |
| Title | 17px | 500 | 1.35 | -0.01em |
| Body | 16px | 400 | 1.5 | 0 |
| Caption | 13px | 400 | 1.4 | 0 |
| Micro | 11px | 500 | 1.3 | 0.06em (uppercase) |

Body text always 16px — never smaller, even on captions. Captions use 13px only for hierarchy under a Body line. Micro is for labels like "RAVI" under the pulse — uppercase and tracked, used sparingly.

**Tabular numerals** on anything that animates or counts: timers, score percentages, durations. `font-variant-numeric: tabular-nums`. Otherwise digits jitter as values change.

---

## Motion

This is where the playfulness lives. Three motion primitives cover everything:

### Spring (transitions, navigation)

```
{ damping: 22, stiffness: 280, mass: 0.8 }
```

Confident, slight overshoot, settles fast. Use for: screen transitions, sheet presentation, button press release, score ring fill.

### Breath (sustained ambient states)

```
{ duration: 2000ms, easing: easeInOut, loop: true }
```

The pulse when the AI is listening or speaking scales between 1.0 and 1.06 over 2 seconds — slow enough to feel alive, never anxious. This is the only loop animation in the app.

### Snap (immediate feedback)

```
{ duration: 120ms, easing: easeOut }
```

Tap state changes, haptic-paired feedback. Fast enough to feel direct, slow enough to be perceptible.

### What never animates

- Numerical text changes (counters update instantly).
- Loading skeletons (use a steady dim state, not shimmer).
- Decorative elements (there are none).

---

## Components

### Buttons

Three variants. No more.

**Primary** — sage-500 fill, ink text, 56px height, full-width on bottom CTAs. The only sage-filled element in the app.

**Secondary** — bone fill, ink-1px border, ink text. For non-primary actions in the same view.

**Ghost** — no fill, no border, sage-500 text. For tertiary actions like "Skip" or "End Conversation."

All buttons: 12px border radius (radius-md). Press state: scale to 0.97 with snap motion, return on release.

### Cards

Single style. White surface (paper), 0.5px ink border at 8% opacity, 16px border radius (radius-lg), 20px padding. No shadows. Elevation is conveyed through border, not shadow.

### Input fields

48px height, bone fill, 0.5px ink border at 12% opacity, 8px radius. On focus: border becomes sage-500, no glow, no shadow. On error: border becomes error.

### The pulse

The defining element of the Active Roleplay screen. 120px circle, sage-500 when AI speaks, ink when AI listens. Surrounded by two soft halos: 8px outer ring at sage-500/14% opacity, 16px outer ring at sage-500/8% opacity. Halos are static; only the inner circle breathes.

### The score ring

160px circular gauge on the After-Action Review. 4px stroke width, sage-200 track, sage-500 fill. Fills with spring motion on screen entry. Percentage text inside: Display size, ink, tabular numerals.

### Pathway nodes

48px circles on a 1px stone vertical timeline.
- **Locked:** stone fill, no border, ash icon.
- **Active:** bone fill, sage-500 1.5px border, ink icon.
- **Completed:** sage-500 fill, paper checkmark.

The transition from active to completed is a spring scale + color crossfade. This is the closest the app comes to a celebration.

---

## Spacing

Multiples of 4. No exceptions.

| Token | Value | Use |
|---|---|---|
| `space-1` | 4px | Tight pairs (icon + label) |
| `space-2` | 8px | Inline elements |
| `space-3` | 12px | Component-internal gaps |
| `space-4` | 16px | Default vertical rhythm |
| `space-6` | 24px | Section gaps |
| `space-8` | 32px | Major section breaks |
| `space-12` | 48px | Screen margins |

---

## What this system does not include

Worth naming explicitly so you don't waste time later:

- **No illustration system.** No mascots, no scenario hero illustrations, no decorative graphics. The Briefing screen's "hero" is the scenario title in Heading size on bone — that's the entire visual.
- **No icon library beyond the basics.** Mic, X, checkmark, chevron, flame (for streak). Lucide icons at 24px stroke 1.5. That's the whole set.
- **No dark mode in v0.** It's tempting and it's wrong for v0. Dark mode doubles your design surface area; ship light first, prove the loop, add dark in v1 if users ask.
- **No marketing surfaces.** No splash screen branding, no logo. The app opens directly into the Pathway. The brand is the experience.

---

## Migration from the old PRD section 7

The original section 7 used terracotta + saffron + amber as a deliberately India-coded palette. This system replaces it entirely. The two tokens that stay roughly equivalent:

- Old `--color-primary` (#D9534F terracotta) → new `sage-500` (#6A8A6C). Different hue, same role.
- Old `--color-background` (#F9F9F8) → new `bone` (#F4F4F1). Slightly cooler, similar warmth.

Old saffron/amber accents have no replacement. The system is intentionally cooler.