# AI-Based Smart Parking and Route Optimization System Using A* Search Algorithm

**AI Lab | BCA Semester V | Group C1 | Lachoo Memorial College of Science and Technology**

**Group members:** Siddharth Lohiya (243501198); Parineeta Singh (243501144); Priyanshu Lakhara (243501163)  
**Faculty guide:** Ms Sakshi Nankani

## Project overview

This is an offline interactive browser-based smart parking and A* search demonstration. It simulates 8 parking bays (P1-P8), occupied/available states, obstacles, a parking entrance and automatic shortest-route parking allocation. The project **does not** connect to real parking sensors.

## Files

- `index.html`: all 9 presentation sections and the interface markup
- `styles.css`: theme, layout, animation, responsive UI and reactive cursor styles
- `app.js`: A* search, parking allocation, slot selection, UI interactions and visual effects

**This is an HTML/CSS/JavaScript project.** It is not a Python-powered website. The A* algorithm runs in JavaScript in the browser.

## Running it

1. Download or clone this repository.
2. Open `index.html` in **Chrome or Edge**. No internet connection or installation is required.
3. Press `4` to open the interactive parking simulation ("Don't imagine it. Try it.").
4. Click **Find Parking** to allocate the nearest available reachable parking slot. The shortest route is highlighted and the car is simulated.
5. Click **Park Next Car** to run allocation for the next vehicle; the previous space stays occupied.
6. Change occupancy by clicking slots, select a destination manually, use Balanced / Busy / Quiet presets, or click **Reset**.

Other interactions: arrow keys to navigate; `F` fullscreen; `Ctrl+K` section menu; clickable A* explanation; formula sliders; three-question quiz; animated pixel field around cursor and FX toggle.

## Algorithm and data

The parking area is a **14 x 9 grid** with **8 named bays** and a single entry. Legal moves are horizontal and vertical only, each costing one step. The map includes walls. Other parking bays cannot be used as through-roads.

A* uses `f(n) = g(n) + h(n)` where `g(n)` is travelled cost and `h(n) = |x_goal - x| + |y_goal - y|` is the Manhattan distance estimate. The algorithm checks reachable free bays, compares their shortest-route move counts and selects the minimum. After allocation, the chosen bay is marked occupied so the next car is allocated afresh.

## Limits

- Simulated data and occupancy; not live sensors or GPS.
- Fixed parking layout and unit-cost four-way movements.
- Designed for interactive demonstration and teaching, not actual parking-garage deployment.

## GitHub publishing

Create a repository named `smart-parking-ai-lab` and upload **these four source/documentation files** (and `.gitignore` if desired). Once it is published, copy its **real URL** to Chapter 8 of the report. Do not use an invented URL. GitHub Pages can optionally host this site from the `main` branch root.

## Team and oral presentation

Project introduction: define the simulated parking problem. Methodology: explain A* and Manhattan heuristic. Implementation: show `app.js`, `styles.css`, `index.html`. Output: demonstrate two successive allocations plus a manually selected slot. Limitations: state that occupancy is simulated.


## Screenshots

Screenshots from the actual code and browser demo are available in the [`screenshots/`](screenshots/) directory.

- `01_AStar_Algorithm.png` — A* in `app.js`.
- `02_Parking_Allocation.png` — parking allocation in `app.js`.
- `03_Interactive_CSS.png` — UI styling in `styles.css`.
- `04_Homepage_Output.png` — homepage.
- `05_Parking_Map_Output.png` — parking map.
- `06_Route_Allocation_Output.png` — allocated route.
