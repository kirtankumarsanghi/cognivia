# 📱 Mobile UI Test Checklist

## Device Testing Matrix

### Required Test Devices
- [ ] **iPhone 14 Pro** (iOS 17+) - 6.1" with notch
- [ ] **iPhone SE** (iOS 15+) - 4.7" small screen
- [ ] **Samsung Galaxy S23** (Android 13+) - 6.1"
- [ ] **Google Pixel 7** (Android 13+) - 6.3"
- [ ] **iPad Air** (iPadOS 16+) - 10.9" tablet
- [ ] **Android Tablet** (Android 12+) - 10"

### Browsers to Test
- [ ] Safari Mobile (iOS)
- [ ] Chrome Mobile (iOS)
- [ ] Chrome Mobile (Android)
- [ ] Samsung Internet (Android)
- [ ] Firefox Mobile (Optional)

---

## 🎨 Visual Testing

### Layout & Responsiveness
- [ ] **Landing page** displays correctly on all screen sizes
- [ ] **Dashboard** cards stack properly on mobile
- [ ] **Navigation drawer** slides in/out smoothly
- [ ] **Bottom navigation** visible and functional on mobile
- [ ] **Modals** use bottom sheet on mobile, centered on desktop
- [ ] **Forms** don't cause horizontal scroll
- [ ] **Images** scale appropriately
- [ ] **Text** is readable without zooming (min 14px body text)
- [ ] **No horizontal scroll** on any page
- [ ] **Safe areas** respected on notched devices (iPhone X+)

### Typography
- [ ] Headlines scale down appropriately (2xl → xl → lg)
- [ ] Body text is 14-16px (prevents iOS zoom)
- [ ] Line height is comfortable (1.5-1.75)
- [ ] Labels are uppercase and trackable
- [ ] No text overflow or wrapping issues
- [ ] Icons scale with text (20px → 16px on mobile)

### Spacing & Padding
- [ ] Padding reduces on mobile (6 → 4 → 3)
- [ ] Margins are comfortable but not wasteful
- [ ] Gaps between elements are appropriate
- [ ] Cards have breathing room
- [ ] No elements touching screen edges

### Colors & Contrast
- [ ] Text passes WCAG AA contrast (4.5:1)
- [ ] Interactive elements are clearly visible
- [ ] Hover states work on desktop
- [ ] Active states provide touch feedback
- [ ] Dark mode looks good (pure black for OLED)
- [ ] Gradients render correctly

---

## 👆 Touch & Interaction Testing

### Touch Targets
- [ ] All buttons are **minimum 44x44px**
- [ ] Navigation items are easy to tap
- [ ] Form inputs are easy to tap
- [ ] Links have sufficient padding
- [ ] No accidental taps on nearby elements

### Gestures
- [ ] **Tap** works on all interactive elements
- [ ] **Long press** context menus don't interfere
- [ ] **Scroll** is smooth (no jank)
- [ ] **Pull to refresh** doesn't conflict (if implemented)
- [ ] **Swipe gestures** don't trigger browser navigation

### Haptic Feedback (iOS only)
- [ ] Button taps feel responsive
- [ ] Success actions provide feedback
- [ ] Error states provide feedback (if implemented)

### Custom Cursor
- [ ] **Does NOT appear** on mobile/touch devices
- [ ] Falls back to native cursor
- [ ] No performance issues

---

## 📝 Form Testing

### Input Fields
- [ ] Tapping inputs **doesn't zoom** (16px minimum)
- [ ] Keyboard appears correctly
- [ ] Input type matches purpose:
  - [ ] `type="email"` for emails
  - [ ] `type="password"` for passwords
  - [ ] `type="number"` for numbers
- [ ] Autocomplete works correctly
- [ ] Auto-capitalization is appropriate

### Selects & Dropdowns
- [ ] Native select menus on mobile
- [ ] Dropdowns don't overflow screen
- [ ] Selected value is visible
- [ ] Can close without selecting

### Textareas
- [ ] Resize correctly on mobile
- [ ] Scrollable when content exceeds height
- [ ] No horizontal scroll

### Buttons
- [ ] Large enough to tap (44px minimum)
- [ ] Provide visual feedback (active state)
- [ ] Loading states are clear
- [ ] Disabled states are clear
- [ ] Text is readable

---

## 🚀 Performance Testing

### Load Time
- [ ] First Contentful Paint (FCP) < 1.8s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Time to Interactive (TTI) < 3.8s
- [ ] First Input Delay (FID) < 100ms
- [ ] Cumulative Layout Shift (CLS) < 0.1

### Animations
- [ ] Run at 60fps on modern devices
- [ ] No jank during transitions
- [ ] Reduced on `prefers-reduced-motion`
- [ ] Don't cause battery drain
- [ ] Can be disabled in accessibility settings

### Images
- [ ] Optimized for mobile (WebP format)
- [ ] Load progressively
- [ ] Have appropriate dimensions
- [ ] Use lazy loading for below-fold content

### Network
- [ ] Works on 3G connection
- [ ] Graceful degradation on slow network
- [ ] Loading states while fetching
- [ ] Error states for failed requests
- [ ] Retry mechanisms for failed API calls

---

## 🔐 Functionality Testing

### Authentication
- [ ] **Sign up** works on mobile
- [ ] **Login** works on mobile
- [ ] **Password visibility toggle** works
- [ ] **Remember me** persists correctly
- [ ] **Logout** works
- [ ] Session persists after closing browser

### Navigation
- [ ] **Hamburger menu** opens/closes smoothly
- [ ] **Bottom tabs** switch correctly
- [ ] **Back button** behavior is correct
- [ ] **Deep links** work (if implemented)
- [ ] **Browser back/forward** works

### Dashboard
- [ ] **Loads with real data**
- [ ] **Confusion button** is accessible (bottom-right)
- [ ] **Refresh button** updates data
- [ ] **Learning score** animates correctly
- [ ] **Charts** render on mobile (Recharts)

### Confusion Signal
- [ ] **Button is accessible** (not hidden by keyboard)
- [ ] **Modal opens** as bottom sheet on mobile
- [ ] **Course/lesson/concept** selectors work
- [ ] **Signal submission** works
- [ ] **Success feedback** is clear
- [ ] **Can dismiss modal** easily

### AI Tutor
- [ ] **Input field** is accessible
- [ ] **Send button** works
- [ ] **Responses render** correctly
- [ ] **Code blocks** are readable
- [ ] **Can scroll** through long responses
- [ ] **Markdown** renders correctly

### Revision Plan
- [ ] **Loads correctly**
- [ ] **Cards are tappable**
- [ ] **Complete button** works
- [ ] **Start Learning** navigates correctly

---

## 🌐 Browser-Specific Testing

### Safari (iOS)
- [ ] Viewport meta tag works
- [ ] Forms don't zoom on focus
- [ ] Animations are smooth
- [ ] Custom cursor doesn't appear
- [ ] Date pickers work correctly
- [ ] File uploads work (if implemented)

### Chrome (Android)
- [ ] Viewport meta tag works
- [ ] Pull-to-refresh doesn't conflict
- [ ] Animations are smooth
- [ ] Custom cursor doesn't appear
- [ ] Back button behavior is correct

### Samsung Internet
- [ ] All features work
- [ ] Dark mode works
- [ ] Animations render correctly

---

## 📐 Orientation Testing

### Portrait Mode
- [ ] All layouts work correctly
- [ ] Navigation is accessible
- [ ] Bottom nav is visible
- [ ] Modals fit on screen
- [ ] Forms are usable

### Landscape Mode
- [ ] Layouts adapt appropriately
- [ ] Navigation remains accessible
- [ ] Bottom nav hidden (or adapted)
- [ ] Sidebar is visible (tablet)
- [ ] Content doesn't overflow

---

## ♿ Accessibility Testing

### Screen Reader
- [ ] All interactive elements have labels
- [ ] Images have alt text
- [ ] Headings are hierarchical (h1 → h2 → h3)
- [ ] Skip to content link (optional)
- [ ] Focus indicators are visible

### Voice Control
- [ ] Can navigate with voice commands (iOS/Android)
- [ ] All buttons are voice-activatable
- [ ] Forms can be filled with voice

### Keyboard Navigation (Bluetooth keyboard)
- [ ] Can tab through all interactive elements
- [ ] Focus indicators are visible
- [ ] Enter/Space activate buttons
- [ ] Escape closes modals

### Zoom & Large Text
- [ ] Layout doesn't break at 200% zoom
- [ ] Text remains readable
- [ ] Buttons remain tappable
- [ ] No horizontal scroll

---

## 🔋 Battery & Data Usage

### Battery Life
- [ ] App doesn't drain battery excessively
- [ ] Animations don't cause overheating
- [ ] Background tasks are minimal (if implemented)

### Data Usage
- [ ] Images are optimized
- [ ] API calls are minimal
- [ ] Caching is effective
- [ ] Works offline (if PWA implemented)

---

## 🐛 Bug Testing

### Edge Cases
- [ ] Works with no internet connection (offline mode)
- [ ] Handles long usernames/text gracefully
- [ ] No content exceeds screen boundaries
- [ ] Emoji render correctly
- [ ] Special characters don't break layout

### Error Handling
- [ ] 404 pages are mobile-friendly
- [ ] Error messages are clear
- [ ] Can recover from errors
- [ ] Doesn't crash on bad data

---

## 📊 Performance Metrics

### Tools to Use
- [ ] **Lighthouse Mobile** (Chrome DevTools)
- [ ] **WebPageTest** (mobile profile)
- [ ] **Safari Responsive Design Mode**
- [ ] **Chrome Device Toolbar**

### Target Metrics
- **Performance**: > 90
- **Accessibility**: > 90
- **Best Practices**: > 90
- **SEO**: > 90
- **PWA** (if implemented): > 90

---

## ✅ Sign-Off Checklist

### Before Deploying to Production
- [ ] All critical paths tested on real devices
- [ ] Performance metrics meet targets
- [ ] No console errors
- [ ] All forms work correctly
- [ ] Authentication is secure
- [ ] Custom cursor disabled on mobile
- [ ] Safe areas respected
- [ ] Touch targets meet minimum size
- [ ] No horizontal scroll anywhere
- [ ] Loading states are clear
- [ ] Error states are clear
- [ ] Success feedback is clear

---

## 📝 Testing Notes Template

```
Date: _____________
Device: _____________
OS: _____________
Browser: _____________
Tester: _____________

Issues Found:
1. 
2. 
3. 

Positive Notes:
1. 
2. 
3. 

Overall Rating: __/10
```

---

## 🎉 Testing Complete!

Once all items are checked:
- [ ] Document any issues found
- [ ] Create tickets for bugs
- [ ] Prioritize fixes (critical, high, medium, low)
- [ ] Retest after fixes
- [ ] Get stakeholder approval
- [ ] Deploy to production

**Mobile-first is not just responsive—it's a mindset! 📱✨**
