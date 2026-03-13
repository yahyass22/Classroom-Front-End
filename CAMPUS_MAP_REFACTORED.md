# Campus Map Refactoring - Design Specification

**Date:** March 12, 2026  
**Status:** ✅ Complete  
**Reference:** United Isometric University Campus Map

---

## 🎨 Design Overview

### Visual Style
- **Style:** Clean architectural isometric visualization
- **Aesthetic:** Professional, modern, minimalist
- **Perspective:** 30° isometric projection (2:1 ratio)
- **Mood:** Academic, sophisticated, easy to navigate

### Color Palette

| Category | Color | Hex | Usage |
|----------|-------|-----|-------|
| **Background** | Warm Beige | `#F5F2EB` | Main background |
| **Panel** | Light Cream | `#FFFBF5` | Sidebar, UI panels |
| **Grid** | Soft Gray | `#E5E1D8` | Isometric grid lines |
| **Buildings** | Neutral Gray | `#E8E4DC` | Main building faces |
| **Building Light** | Light Gray | `#F0EDE6` | Highlight faces |
| **Building Dark** | Dark Gray | `#D4D0C8` | Shadow faces |
| **Roads** | Medium Gray | `#C8C4BC` | Road surfaces |
| **Markers** | Yellow-Gold | `#E5C84A` | Numbered badges, accents |
| **Text Primary** | Dark Gray | `#2D2D2D` | Main text |
| **Text Muted** | Medium Gray | `#6B6B6B` | Secondary text |
| **Trees** | Sage Green | `#A8B8A0` | Landscape elements |

---

## 🏛️ Building Catalog

### STEM Innovation Core (Left Side)

| # | Building | Type | Dimensions | Height | Features |
|---|----------|------|------------|--------|----------|
| 1 | Physics | Modern Block | 5×3 | 3 | Main STEM anchor |
| 2 | Computer Science | Modern Tower | 2×2 | 6 | Antenna on roof |
| 3 | Engineering | Modern Block | 4×2 | 3 | Connected complex |
| 4 | Mathematics | Modern Block | 2.5×2 | 3.5 | Mid-rise |
| 5 | Chemistry | Modern Block | 2×2 | 3 | Research labs |
| 6 | Biology | Modern Block | 3×2.5 | 2 | Low profile |

### Humanities & Life Sciences (Right Side)

| # | Building | Type | Dimensions | Height | Features |
|---|----------|------|------------|--------|----------|
| 7 | Psychology | Modern Block | 3×2 | 3 | Behavioral sciences |
| 8 | Humanities | Classical | 4×2 | 2.5 | Liberal arts |
| 9 | History | Classical | 2.5×2.5 | 2 | Central courtyard |
| 10 | English | Classical | 2.5×2 | 2 | Literature dept |

### Creative & Business District (Bottom)

| # | Building | Type | Dimensions | Height | Features |
|---|----------|------|------------|--------|----------|
| 11 | Fine Arts | Arts | 4×3 | 1.5 | Wavy modern design |
| 12 | Business School | Modern Tower | 2×2 | 7 | Tallest building |

---

## 🗺️ Map Infrastructure

### Road Network

```
CAMPUS BLVD (Main diagonal artery)
├─ Runs from southwest to northeast
├─ Width: 80px
├─ Center dashed marking
└─ Connects all major zones

TECH WAY
├─ Branches north from CAMPUS BLVD
├─ Leads to STEM buildings
└─ Width: 50px

ARTS AVE
├─ Runs east-west in southern district
├─ Connects Creative & Business zones
└─ Width: 50px
```

### Landmarks

**Main Library (Center)**
- Position: Campus center (0, 0)
- Feature: Circular dome structure
- Surrounded by roundabout
- Acts as campus focal point

**Main Visitor Parking**
- Location: Southwest corner
- Features: Parking lot with cars
- Access from ARTS AVE

**University Metro**
- Location: Southeast corner
- Feature: Train station icon
- Public transport access

---

## 🎯 UI Components

### 1. Legend Sidebar (Left)

**Dimensions:** 256px (16rem) width, full height

**Sections:**
```
┌─────────────────────────┐
│ [U] Logo               │
│ UNITED ISOMETRIC       │
│ UNIVERSITY CAMPUS MAP  │
├─────────────────────────┤
│ CAMPUS BUILDINGS       │
│ ● 1 Physics            │
│ ● 2 Computer Science   │
│ ● 3 Engineering        │
│ ... (12 total)         │
├─────────────────────────┤
│ DISTRICTS              │
│ ● STEM Innovation      │
│ ● Humanities           │
│ ● Creative & Business  │
└─────────────────────────┘
```

**Interactions:**
- Hover: Light beige background `#F5F2EB`
- Selected: Yellow-gold background `rgba(229, 200, 74, 0.2)`
- Click: Select building, show info card

### 2. Building Markers

**Design:**
- Circle: 24px diameter (12px radius)
- Fill: Yellow-gold `#E5C84A`
- Stroke: White 2px
- Number: 10px, bold, dark `#1A1A1A`

**States:**
- Default: 24px circle
- Hover: 28px circle
- Selected: 28px circle, elevated -5px, pulse animation

### 3. Info Card (Floating)

**Dimensions:** 200×120px

**Design:**
```
┌──────────────────────────┐
│              [×] Close   │
│ Physics                  │
│ Core Innovation Cluster  │
│ 📍 STEM Zone             │
│ View Details ›           │
└──────────────────────────┘
       ↑ pointer arrow
```

**Features:**
- White background
- Rounded corners (8px)
- Drop shadow
- Pointer arrow (bottom center)
- Framer Motion entrance/exit

### 4. Compass Widget (Bottom Right)

**Design:**
- 64×64px circular widget
- Cream background `#FFFBF5`
- Border: 2px `#E0DCD4`
- Cardinal directions: N, S, W, E
- Compass rose icon (rotated -45°)
- Label: "Isometric View"

---

## 📐 Technical Implementation

### Isometric Projection

```typescript
const ISO_ANGLE = 30; // degrees
const GRID_SIZE = 50;

const toIso = (x: number, y: number, z: number = 0) => {
  const rad = (ISO_ANGLE * Math.PI) / 180;
  const isoX = (x - y) * Math.cos(rad) * GRID_SIZE;
  const isoY = ((x + y) * Math.sin(rad) - z) * GRID_SIZE;
  return { x: isoX, y: isoY };
};
```

### SVG ViewBox

```
viewBox="-600 -400 1200 800"
```

- Center: (0, 0) at Main Library
- Width: 1200 units
- Height: 800 units
- Aspect ratio: 3:2

### Grid Pattern

```xml
<pattern id="isometricGrid" width="60" height="30" 
         patternUnits="userSpaceOnUse" 
         patternTransform="rotate(30)">
  <path d="M 30 0 L 60 15 L 30 30 L 0 15 Z" 
        fill="none" stroke="#E5E1D8" strokeWidth="0.5"/>
</pattern>
```

---

## 🎭 Animation Specifications

### Marker Selection

```typescript
animate={{
  scale: isSelected ? 1.2 : 1,
  y: isSelected ? -5 : 0,
}}
transition={{
  type: "spring",
  stiffness: 400,
  damping: 25,
}}
```

### Info Card Entrance

```typescript
initial={{ opacity: 0, scale: 0.9, y: 10 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.9 }}
```

### Building Highlight

- Stroke: `#FFD700` (gold)
- Width: 3px
- Pattern: `strokeDasharray="5,3"`
- Animation: `animate-pulse` (CSS)

---

## 📱 Responsive Behavior

### Breakpoints

| Screen Size | Sidebar | Map View | Markers |
|-------------|---------|----------|---------|
| Desktop (>1024px) | Full | Full | 24px |
| Tablet (768-1024px) | Collapsible | Full | 20px |
| Mobile (<768px) | Hidden (drawer) | Full | 16px |

### Mobile Considerations

- Sidebar becomes slide-out drawer
- Touch-friendly markers (min 44px touch target)
- Pinch-to-zoom support (future enhancement)
- Pan gestures for navigation

---

## ♿ Accessibility Features

### Keyboard Navigation

- `Tab`: Navigate through buildings
- `Enter/Space`: Select building
- `Escape`: Deselect / Close card
- Arrow keys: Pan map (future)

### ARIA Labels

```html
<g role="button" aria-label="Physics Building, Department of Core Innovation Cluster" aria-pressed="false">
<button aria-label="Select Physics building">
<div role="dialog" aria-label="Physics building information" aria-modal="true">
```

### Screen Reader Support

- Building names announced
- Zone information included
- Selection state communicated
- Instructions provided

---

## 🔧 Building Type Specifications

### Modern Tower (Buildings 2, 12)

```
Height: 6-7 units
Footprint: 2×2
Features: 
  - Vertical emphasis
  - Antenna (CS only)
  - Minimal roof details
  - Clean geometric lines
```

### Modern Block (Buildings 1, 3-7)

```
Height: 2-3.5 units
Footprint: Variable
Features:
  - Horizontal emphasis
  - Flat roof
  - Subtle face differentiation
  - Functional design
```

### Classical (Buildings 8-10)

```
Height: 2-2.5 units
Footprint: 2.5-4 width
Features:
  - Traditional proportions
  - Courtyard (History only)
  - Ornamental details
  - Symmetrical design
```

### Arts (Building 11)

```
Height: 1.5 units
Footprint: 4×3
Features:
  - Organic wavy roof
  - Low profile
  - Sculptural elements
  - Modern artistic design
```

---

## 🌳 Landscape Elements

### Trees

- Count: 6 clusters
- Style: Simplified circular canopies
- Colors: Sage green `#A8B8A0`
- Opacity: 0.6-0.8
- Placement: Along roads, near buildings

### Parking Lot

- Location: Southwest
- Features: Parking spaces, cars
- Surface: `#D8D4CC`
- Access: From ARTS AVE

---

## 📊 Zone Districts

### STEM Innovation Core

- **Location:** Left/West side
- **Buildings:** 1-6
- **Color Accent:** Sage green `#A8B8A0`
- **Character:** Modern, technical, research-focused

### Humanities & Life Sciences

- **Location:** Right/East side
- **Buildings:** 7-10
- **Color Accent:** Warm taupe `#B8A8A0`
- **Character:** Classical, traditional, people-focused

### Creative & Business District

- **Location:** Bottom/South
- **Buildings:** 11-12
- **Color Accent:** Cool gray `#A8A8B8`
- **Character:** Modern, dynamic, innovation-focused

---

## 🎯 Future Enhancements

### Phase 2 (Recommended)

1. **Search Functionality**
   - Find buildings by name
   - Filter by department
   - Quick navigation

2. **Pathfinding**
   - "You are here" marker
   - Route visualization
   - Distance/direction indicators

3. **Building Interiors**
   - Click to view floor plans
   - Room availability
   - Department locations

4. **Real-time Data**
   - Class schedules
   - Event locations
   - Occupancy status

5. **Mobile Gestures**
   - Pinch to zoom
   - Two-finger pan
   - Tap to select

### Phase 3 (Advanced)

6. **Dark Mode**
   - Alternative color palette
   - Reduced brightness
   - Better night viewing

7. **AR Integration**
   - Camera overlay
   - Real-time navigation
   - Building information overlay

8. **Accessibility Plus**
   - High contrast mode
   - Larger text option
   - Voice navigation

---

## 🧪 Testing Checklist

### Visual Verification

- [ ] All 12 buildings visible
- [ ] Correct building positions
- [ ] Road network matches reference
- [ ] Street labels readable
- [ ] Zone labels positioned correctly
- [ ] Library dome centered
- [ ] Markers aligned with buildings
- [ ] Colors match reference palette

### Functional Testing

- [ ] Click building → selects
- [ ] Click again → deselects
- [ ] Info card appears/disappears
- [ ] Legend items clickable
- [ ] Close button works
- [ ] Keyboard navigation works
- [ ] Escape key closes card

### Browser Testing

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

### Performance

- [ ] Smooth animations (60fps)
- [ ] No lag on interactions
- [ ] Fast initial load
- [ ] No memory leaks

---

## 📁 File Structure

```
src/pages/
├── campus-map-refactored.tsx    # ✅ New refactored version (active)
├── campus-map-new.tsx           # Old 2D isometric (backup)
└── campus-map.tsx               # Old 3D WebGL (backup)

src/App.tsx                      # Updated to use refactored version
```

---

## 🚀 How to Use

### Development

```bash
cd classroom-frontend
npm run dev
# Navigate to /campus-map
```

### Customization

**Change building positions:**
```typescript
// Edit BUILDINGS array in campus-map-refactored.tsx
{ id: 1, name: "Physics", gx: -3, gy: -2, width: 5, depth: 3, height: 3 }
```

**Update colors:**
```typescript
// Edit PALETTE object
const PALETTE = {
  marker: "#E5C84A",  // Change marker color
  building: "#E8E4DC", // Change building color
}
```

**Add new building:**
```typescript
{ 
  id: 13, 
  name: "New Building", 
  department: "Department Name", 
  zone: "STEM",
  gx: 5, gy: 5, 
  width: 3, depth: 3, height: 4, 
  type: "modern-block" 
}
```

---

## ✅ Comparison: Before vs After

| Feature | Old Map | New Map (Refactored) |
|---------|---------|---------------------|
| **Style** | Generic isometric | Professional architectural |
| **Color Palette** | Bright, varied | Neutral, sophisticated |
| **Buildings** | 12 generic | 12 distinct architectures |
| **Roads** | Simple grid | Labeled network |
| **Zones** | Text labels only | Visual districts |
| **Sidebar** | None | Full legend panel |
| **Markers** | Basic circles | Polished yellow-gold |
| **Info Cards** | SVG foreignObject | Clean floating cards |
| **Compass** | Basic icon | Professional widget |
| **Library** | Simple dome | Detailed roundabout |
| **Trees** | None | Landscape clusters |
| **Street Labels** | None | CAMPUS BLVD, etc. |

---

## 📞 Support

For questions or issues:
1. Check this specification document
2. Review the reference image
3. Compare with implementation
4. Test in browser DevTools

---

**Last Updated:** March 12, 2026  
**Version:** 1.0  
**Status:** Production Ready ✅
