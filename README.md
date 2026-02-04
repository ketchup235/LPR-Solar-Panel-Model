# Solar Universe 340 Wp - 3D Viewer

A professional 3D solar panel viewer built with vanilla HTML, CSS, and JavaScript using Three.js. No build tools or Node.js required - just open in a browser!

## Features

- ✅ **Fully Fixed Issues:**
  - Single-color backsheet (no more glitching between grays)
  - Lighter blue solar cells (more visible and realistic)
  - Stand properly attached to the panel
  - Panel tilted at 25° angle for realistic presentation
  - Pure HTML/JS/CSS - no TypeScript or Node.js needed

- 🎨 **High-Quality 3D Model:**
  - Realistic monocrystalline solar panel with PERC cells
  - Anodized aluminum frame with proper detailing
  - Tempered glass layer with realistic refraction
  - Junction box with cable glands
  - Ground-mount rack system at 25° tilt

- 🎮 **Interactive Controls:**
  - Drag to rotate the model
  - Scroll/pinch to zoom in and out
  - Reset button to return to default view
  - Touch-optimized for mobile devices

- 💼 **Professional UI:**
  - Product specifications panel
  - Zoom controls
  - Interactive hints
  - Responsive design for all screen sizes

## How to Use

### Option 1: Open Locally
1. Download all files to a folder:
   - `index.html`
   - `styles.css`
   - `app.js`

2. Open `index.html` in any modern web browser:
   - Chrome (recommended)
   - Firefox
   - Safari
   - Edge

3. That's it! The viewer will load automatically.

### Option 2: Use a Local Server (Optional, for best performance)
If you have Python installed, you can run a simple local server:

```bash
# Python 3
python -m http.server 8000

# Then open: http://localhost:8000
```

Or use any other simple HTTP server.

## Browser Requirements

- Modern browser with WebGL support (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Recommended: Hardware acceleration enabled for best performance

## File Structure

```
solar-panel-viewer/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── app.js             # 3D model and interactivity
└── README.md          # This file
```

## Dependencies

All dependencies are loaded from CDN:
- Three.js (r128) - 3D rendering library
- OrbitControls - Camera controls

No installation needed!

## Controls

### Desktop:
- **Left Mouse Drag**: Rotate the model
- **Mouse Wheel**: Zoom in/out
- **Reset Button**: Return to default view
- **Zoom Buttons**: Fine control over zoom level

### Mobile/Tablet:
- **One Finger Swipe**: Rotate the model
- **Pinch**: Zoom in/out
- **Reset Button**: Return to default view
- **Zoom Buttons**: Fine control over zoom level

## Customization

You can easily customize the solar panel by editing `app.js`:

- **Panel dimensions**: Change `PANEL_WIDTH`, `PANEL_HEIGHT`, `PANEL_DEPTH`
- **Cell count**: Modify `CELLS_X` and `CELLS_Y`
- **Colors**: Adjust the color values in the material definitions
- **Tilt angle**: Change `PANEL_TILT` and `TILT_ANGLE` values
- **Camera position**: Modify the camera settings in `init()` function

## Technical Details

### Solar Panel Specifications:
- **Model**: Solar Universe 340 Wp
- **Type**: Monocrystalline PERC
- **Efficiency**: 21.2%
- **Dimensions**: 1700 × 1000 mm
- **Cell Count**: 60 cells (6 × 10)
- **Frame**: Anodized Aluminum
- **Glass**: 3.2mm Tempered
- **Weight**: 18.5 kg
- **Tilt Angle**: 25°
- **Mount Type**: Ground-mount Rack

### 3D Model Components:
1. Aluminum frame with realistic brushed finish
2. 60 monocrystalline solar cells with busbar details
3. Tempered glass layer with proper transparency
4. Backsheet (single color, no glitching)
5. Junction box with cable connections
6. Ground-mount rack system (properly attached)
7. Mounting holes and clamps

## Troubleshooting

**Problem**: Model doesn't load
- **Solution**: Make sure you're opening from `index.html` and JavaScript is enabled

**Problem**: Performance is slow
- **Solution**: Try a different browser or enable hardware acceleration in browser settings

**Problem**: Controls don't work on mobile
- **Solution**: Make sure you're touching the 3D canvas area, not the UI buttons

**Problem**: Model looks dark
- **Solution**: The lighting is designed for the dark background. This is intentional for a professional look.

## Demo-Ready Features

This viewer is completely ready for client presentations:
- Professional dark theme
- Smooth animations and transitions
- Responsive design works on any device
- No loading screens or dependencies to install
- High-quality materials and lighting
- Detailed specifications panel

## License

This project uses Three.js which is licensed under the MIT License.

## Support

For questions or issues, please check:
1. Browser console for any error messages
2. Ensure all three files are in the same directory
3. Use a modern browser with WebGL support

---

**Note**: This is a static 3D viewer. No server-side code or database is required. Perfect for presentations, websites, or local demonstrations!
