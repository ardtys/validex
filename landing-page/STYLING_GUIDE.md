# 🎨 VALIDEX Styling Guide

## Overview

This guide documents the **Cyan Glow & Glassmorphism** design system for VALIDEX. The design features dark mode with neon cyan effects, glassmorphism, and gradient text to match the logo's aesthetic.

---

## 🎯 Design Philosophy

1. **Dark Mode Only** - No light mode. Dark background with subtle blue undertones.
2. **Cyan Neon Glow** - Primary accent color matching the logo.
3. **Glassmorphism** - Semi-transparent elements with backdrop blur.
4. **Gradient Text** - White to cyan gradients for headlines.
5. **Subtle Animation** - Pulse effects, hover glows, and smooth transitions.

---

## 🎨 Color Palette

### Background Colors
```css
cyber-dark-blue: #0d1117     /* Main background */
cyber-dark: #0f0f1a          /* Secondary background */
cyber-darker: #1a1a2e        /* Card backgrounds */
cyber-black: #0a0a0f         /* Input backgrounds */
```

### Cyan Accent Colors
```css
cyber-cyan: #38bdf8          /* Primary cyan */
cyber-cyan-light: #67e8f9    /* Lighter cyan */
cyber-cyan-neon: #22d3ee     /* Neon cyan (glow) */
cyber-cyan-glow: #7dd3fc     /* Subtle glow */
cyber-cyan-bright: #0ea5e9   /* Bright cyan */
```

### Blue Support Colors
```css
cyber-blue: #3b82f6          /* Primary blue */
cyber-blue-light: #60a5fa    /* Lighter blue */
cyber-blue-neon: #2563eb     /* Neon blue */
cyber-blue-glow: #93c5fd     /* Subtle glow */
```

### Status Colors
```css
cyber-green-neon: #34d399    /* Success/Check */
cyber-red-neon: #f87171      /* Error/Warning */
```

---

## ✨ Glow Effects

### Text Glow
```css
/* Cyan glow (main) */
.glow-text {
  text-shadow: 0 0 15px rgba(56, 189, 248, 0.6),
               0 0 30px rgba(56, 189, 248, 0.4),
               0 0 45px rgba(56, 189, 248, 0.2);
}

/* Blue glow */
.glow-text-blue {
  text-shadow: 0 0 15px rgba(59, 130, 246, 0.6),
               0 0 30px rgba(59, 130, 246, 0.4);
}
```

### Box Shadow Glow
```css
/* Neon glow (subtle) */
shadow-neon-cyan: 0 0 20px rgba(56, 189, 248, 0.5)

/* Strong glow */
shadow-glow-cyan: 0 0 40px rgba(56, 189, 248, 0.8),
                  0 0 60px rgba(56, 189, 248, 0.4)

/* Glass shadow */
shadow-glass: 0 8px 32px 0 rgba(31, 38, 135, 0.37)
shadow-glass-hover: 0 8px 32px 0 rgba(56, 189, 248, 0.5)
```

---

## 🪟 Glassmorphism

### Glass Variants

#### Default Glass
```tsx
<div className="glass">
  {/* Semi-transparent white */}
</div>
```
```css
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.1);
```

#### Glass Cyan
```tsx
<div className="glass-cyan">
  {/* Cyan-tinted glass */}
</div>
```
```css
background: rgba(56, 189, 248, 0.08);
backdrop-filter: blur(12px);
border: 1px solid rgba(56, 189, 248, 0.2);
```

#### Glass Dark
```tsx
<div className="glass-dark">
  {/* Dark glass with strong blur */}
</div>
```
```css
background: rgba(13, 17, 23, 0.7);
backdrop-filter: blur(16px);
border: 1px solid rgba(56, 189, 248, 0.15);
```

### GlassCard Component
```tsx
import GlassCard from '@/components/GlassCard'

<GlassCard variant="default|cyan|dark" hoverGlow={true}>
  <p>Content here</p>
</GlassCard>
```

---

## 📝 Gradient Text

### Gradient Utilities

#### White to Cyan Gradient
```tsx
<h1 className="text-gradient">
  Gradient Text
</h1>
```
```css
background: linear-gradient(to right, white, #67e8f9, #22d3ee);
-webkit-background-clip: text;
color: transparent;
```

#### Cyan to Blue Gradient
```tsx
<span className="text-gradient-cyan">
  Cyan Gradient
</span>
```
```css
background: linear-gradient(to right, #67e8f9, #2563eb);
-webkit-background-clip: text;
color: transparent;
```

### Combined Gradient + Glow
```tsx
<h1 className="text-gradient glow-text">
  Glowing Gradient Text
</h1>
```

---

## 🔘 Buttons

### GlowButton Component
```tsx
import GlowButton from '@/components/GlowButton'

{/* Primary Button (Cyan gradient) */}
<GlowButton variant="primary" onClick={handleClick}>
  <div className="flex items-center gap-2">
    <Icon size={20} />
    Button Text
  </div>
</GlowButton>

{/* Secondary Button (Glass with cyan border) */}
<GlowButton variant="secondary">
  Secondary Action
</GlowButton>

{/* Ghost Button */}
<GlowButton variant="ghost">
  Ghost Button
</GlowButton>
```

### Button Variants

#### Primary (Cyan Gradient)
- Background: `linear-gradient(to right, cyan, blue, cyan)`
- Shadow: `shadow-neon-cyan`
- Hover: `shadow-glow-cyan` + shimmer effect

#### Secondary (Glass)
- Background: `glass-cyan`
- Border: `border-cyan/50`
- Hover: Stronger glow

#### Ghost (Transparent)
- Background: `transparent`
- Border: `border-cyan/30`
- Hover: `bg-cyan/10`

---

## 🎴 Feature Cards

### FeatureCard Component
```tsx
import FeatureCard from '@/components/FeatureCard'
import { Shield } from 'lucide-react'

<FeatureCard
  icon={Shield}
  title="Security Feature"
  description="Description text here"
/>
```

### Features
- **Glass-dark background** with backdrop blur
- **Cyan glow on hover** (`shadow-glow-cyan`)
- **Icon glow** with neon-cyan shadow
- **Title gradient** on hover (`text-gradient-cyan`)
- **Pulse animation** on icon

---

## 🧭 Navigation

### GlassNav Component
```tsx
import GlassNav from '@/components/GlassNav'

<GlassNav />
```

### Features
- **Sticky navbar** that appears on scroll
- **Glassmorphism** with backdrop blur
- **Underline animation** on hover
- **Logo with glow** effect

---

## 🌟 Background Effects

### Animated Glow Spots
```tsx
<div className="fixed inset-0 z-0">
  {/* Top left cyan glow */}
  <div className="absolute top-20 left-10 w-[500px] h-[500px]
                  bg-cyber-cyan/10 rounded-full blur-3xl animate-pulse" />

  {/* Bottom right blue glow */}
  <div className="absolute bottom-20 right-10 w-[500px] h-[500px]
                  bg-cyber-blue/10 rounded-full blur-3xl animate-pulse"
       style={{ animationDelay: '1s' }} />
</div>
```

### Tech Grid Overlay
```tsx
{/* Subtle grid with radial fade */}
<div className="absolute inset-0
                bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),
                    linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)]
                bg-[size:100px_100px]
                [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]" />
```

---

## 📏 Spacing & Layout

### Container
```tsx
<div className="container mx-auto px-6">
  {/* Content */}
</div>
```

### Section Padding
```tsx
<section className="py-20">  {/* 80px top/bottom */}
<section className="py-32">  {/* 128px top/bottom (hero) */}
```

### Card Padding
```tsx
<div className="p-6">   {/* 24px all sides */}
<div className="p-12">  {/* 48px all sides */}
<div className="p-16">  {/* 64px all sides (CTA) */}
```

---

## 🎬 Animations

### Built-in Animations

#### Pulse (Glow breathing)
```tsx
<div className="animate-pulse">
  {/* Fades in/out */}
</div>
```

#### Float (Icon bounce)
```tsx
<Icon className="animate-float" />
```

#### Slide Up (Entrance)
```tsx
<h1 className="animate-slide-up">
  Title
</h1>
```

### Custom Animation Example
```css
@keyframes glow {
  0% { box-shadow: 0 0 5px rgba(56, 189, 248, 0.5); }
  100% { box-shadow: 0 0 20px rgba(56, 189, 248, 0.8); }
}

.animate-glow {
  animation: glow 2s ease-in-out infinite alternate;
}
```

---

## 📱 Responsive Design

### Breakpoints (Tailwind)
```
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

### Example Usage
```tsx
<h1 className="text-4xl md:text-6xl lg:text-7xl">
  {/* 4xl mobile, 6xl tablet, 7xl desktop */}
</h1>

<div className="flex-col md:flex-row">
  {/* Stack on mobile, row on tablet+ */}
</div>
```

---

## 🎯 Common Patterns

### Hero Section
```tsx
<section className="container mx-auto px-6 pt-32 pb-32 text-center">
  {/* Badge */}
  <div className="inline-flex items-center gap-2 px-5 py-2.5
                  rounded-full glass-cyan border border-cyber-cyan/40
                  shadow-neon-cyan">
    <Icon className="text-cyber-cyan-neon" size={18} />
    <span className="text-sm font-semibold text-gradient-cyan">
      Feature Badge
    </span>
  </div>

  {/* Headline */}
  <h1 className="text-6xl md:text-8xl font-bold leading-tight">
    <span className="text-gradient glow-text">Highlighted</span> Text
  </h1>
</section>
```

### Input with Glass
```tsx
<GlassCard variant="dark" className="p-3 shadow-glow-cyan">
  <input
    type="text"
    className="px-6 py-5 bg-cyber-black/50 rounded-xl
               border border-cyber-cyan/20
               focus:border-cyber-cyan focus:outline-none
               focus:ring-2 focus:ring-cyber-cyan/30
               text-white placeholder-gray-500 transition-all"
    placeholder="Enter text..."
  />
</GlassCard>
```

### Trust Badge
```tsx
<div className="flex items-center gap-2 px-4 py-2 rounded-lg glass">
  <CheckCircle className="text-cyber-green-neon" size={20} />
  <span className="text-gray-300 font-medium">Verified</span>
</div>
```

---

## 🎨 Color Usage Guidelines

### When to Use Each Color

| Color | Use Case | Example |
|-------|----------|---------|
| **Cyan Neon** | Primary actions, headlines, icons | Buttons, gradient text |
| **Blue Neon** | Secondary actions, support elements | Links, badges |
| **Green Neon** | Success states, checkmarks | Status icons |
| **Red Neon** | Errors, warnings, alerts | Warning messages |
| **White** | Body text | Paragraphs, descriptions |
| **Gray-300** | Secondary text | Subtitles, captions |
| **Gray-500** | Tertiary text | Hints, placeholders |

---

## 🚀 Quick Start Example

Here's a complete component using the design system:

```tsx
import GlowButton from '@/components/GlowButton'
import GlassCard from '@/components/GlassCard'
import { Shield } from 'lucide-react'

export default function Example() {
  return (
    <section className="container mx-auto px-6 py-20">
      <GlassCard variant="dark" className="p-12 shadow-glow-cyan">
        <div className="text-center">
          {/* Icon with glow */}
          <div className="inline-block p-4 rounded-xl
                          bg-cyber-cyan/15 border border-cyber-cyan/30
                          shadow-neon-cyan mb-6">
            <Shield className="text-cyber-cyan-neon" size={48} />
          </div>

          {/* Headline with gradient */}
          <h2 className="text-4xl font-bold mb-4">
            <span className="text-gradient glow-text">Amazing</span> Feature
          </h2>

          {/* Description */}
          <p className="text-xl text-gray-300 mb-8">
            Description with <span className="text-cyber-cyan-neon">highlighted</span> text.
          </p>

          {/* Button */}
          <GlowButton variant="primary">
            <div className="flex items-center gap-2">
              <Shield size={20} />
              Get Started
            </div>
          </GlowButton>
        </div>
      </GlassCard>
    </section>
  )
}
```

---

## 📚 Component Library

### Available Components
- `<GlowButton />` - Animated button with glow effects
- `<GlassCard />` - Glassmorphism card container
- `<GlassNav />` - Sticky navigation with glass effect
- `<FeatureCard />` - Feature showcase card with hover effects
- `<AuditResultCard />` - Audit results display

---

## 💡 Best Practices

1. **Don't Overuse Glow** - Use glows sparingly for emphasis
2. **Maintain Contrast** - Ensure text is readable on glass backgrounds
3. **Consistent Spacing** - Use Tailwind's spacing scale (4, 6, 8, 12, 16)
4. **Animate Purposefully** - Animations should enhance, not distract
5. **Test Responsiveness** - Always check mobile layouts

---

## 🔧 Customization

### Adding New Colors
Edit `tailwind.config.ts`:
```ts
colors: {
  cyber: {
    // Add new color
    'new-color': '#hexcode',
  }
}
```

### Adding New Glow Effect
Edit `globals.css`:
```css
.glow-text-custom {
  text-shadow: 0 0 15px rgba(R, G, B, 0.6),
               0 0 30px rgba(R, G, B, 0.4);
}
```

---

## 📖 Resources

- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev/
- **Glassmorphism Generator**: https://hype4.academy/tools/glassmorphism-generator

---

**Built with 💙 for VALIDEX**
