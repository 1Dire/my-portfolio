# dire's room

> An interactive 3D portfolio room built with React Three Fiber.

Explore projects on a laptop and play mini-games on a Game Boy — all inside a cozy little room. Every model in the scene was made from scratch in Blender.

**[Live Demo](https://github.com/1Dire/my-portfolio)** · **[GitHub](https://github.com/1Dire)** · **[X](https://x.com/1Dire_dev)**

---

## Features

### The Interactive Room
- A fully hand-modeled 3D room (desk, laptop, Game Boy, mug, calendar, corkboard, and more)
- Parallax camera that responds to mouse movement
- Smooth scale-up animation on hover
- Gyroscope-based view control on mobile

### Laptop — Project Gallery
- Click the laptop to zoom in and open the project gallery
- Handwritten-diary style sticky-note cards
- Separate Toy / Work project tabs
- Live and GitHub links for each project

### Game Boy — 5 Mini Games
Click the Game Boy to zoom in and play right away.

| Game | Description |
|------|-------------|
| **Dino Run** | Jump over obstacles in this endless runner |
| **Snake** | Eat food and grow longer — the classic |
| **Breakout** | Bounce the ball to break the bricks |
| **Flappy** | Fly through the gaps between pipes |
| **Blocks** | Stack falling blocks, Tetris-style |

- Play with keyboard (arrows + space) or the on-screen pad
- Mobile touch support
- Virtual keypad outside the screen with live input feedback

### Atmosphere & Modes
- Day / Night mode toggle (auto-selected based on the current time)
- Night mode dims the screen and softens the music with a Web Audio low-pass filter
- Background music crossfades between room and game tracks
- Mute toggle

### Performance
- Raycasting disabled on non-clickable meshes (prevents hover lag)
- Game loop runs only while zoomed into the Game Boy (zero cost otherwise)
- Games capped at 30fps to minimize texture uploads
- Per-device DPR and antialiasing (mobile vs desktop)

---

## Tech Stack

- **React** + **Vite**
- **Three.js** / **React Three Fiber** / **@react-three/drei**
- **GSAP** — camera zoom animations
- **Web Audio API** — music filtering / crossfade
- **GLSL** — coffee steam shader
- **Canvas 2D** — Game Boy screen / laptop screen / calendar textures
- **Leva** — debug control panel
- **SCSS** — UI styling
- **Blender** — 3D modeling

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Access from a mobile device on the same Wi-Fi
npm run dev -- --host

# Production build
npm run build
```

### Debug Mode
Append `#debug` to the URL to show the Leva debug panel and FPS stats.

```
http://localhost:5173/#debug
```

---

## Project Structure

```
src/
├── components/
│   ├── Exprience.jsx        # Main (Canvas + state)
│   ├── Room.jsx             # GLB load, interaction, hover scaling
│   ├── CameraController.jsx # Parallax, zoom, roll correction
│   ├── CoffeeSteam.jsx      # Coffee steam GLSL shader
│   ├── GameboyPad.jsx       # Game Boy virtual keypad
│   ├── UIOverlay.jsx        # Controls, links, credits, night tint
│   ├── ProjectGallery.jsx   # Project gallery modal
│   └── LoadingScreen.jsx    # Loading / start screen
├── hooks/
│   ├── useGameboy.jsx           # Game Boy multi-game (menu, routing)
│   ├── useBackgroundMusic.jsx   # 2-track BGM (day/night filter)
│   ├── useLaptopScreenTexture.jsx
│   ├── useCalendarTexture.jsx
│   ├── useSceneControls.jsx     # Leva panel
│   └── useIsMobile.jsx
└── data/
    ├── projects.js          # Project data
    └── gameboyGames.js      # Logic for the 5 games
```

---

## Credits

- **3D Modeling & Design** — sang-woo lee
- **Development** — sang-woo lee
- **Room Music** — [Lofi Chill (Pixabay)](https://pixabay.com/music/beats-lofi-chill-background-music-508269/)
- **Game Music** — [The Console of My Dreams (Pixabay)](https://pixabay.com/music/video-games-the-console-of-my-dreams-301289/)

---

## Contact

- GitHub — [@1Dire](https://github.com/1Dire)
- X — [@1Dire_dev](https://x.com/1Dire_dev)