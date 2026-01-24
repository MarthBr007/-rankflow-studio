# Post Preview Verbeteringen - Adobe Express Stijl

**Datum:** 24 Januari 2026  
**Status:** ✅ Geïmplementeerd

---

## 🎨 Wat Is Er Verbeterd?

### Huidige Situatie (Voor)
- Basic preview in kleine modals
- Geen thumbnail gallery
- Geen real-time preview tijdens bewerken
- Beperkte visualisatie van engagement

### Nieuwe Implementatie (Na - Adobe Express Stijl)
- ✅ **Split View Layout**: Form links, grote preview rechts
- ✅ **Thumbnail Gallery**: Nummering en selecteerbare thumbnails
- ✅ **Real-time Preview**: Live preview terwijl je bewerkt
- ✅ **Full-screen Preview**: Modal voor volledige preview
- ✅ **Platform-specifieke Styling**: Instagram en LinkedIn look-alike
- ✅ **Engagement Buttons**: Like, comment, share icons
- ✅ **Carousel Support**: Indicators en navigatie voor multi-image posts
- ✅ **Reel Support**: Play button en verticale aspect ratio

---

## 📁 Nieuwe Componenten

### `EnhancedPostPreview.tsx`
**Locatie:** `app/components/EnhancedPostPreview.tsx`

**Features:**
- Instagram Feed Preview (exact zoals Instagram)
- LinkedIn Post Preview (exact zoals LinkedIn)
- Thumbnail gallery met nummering
- Full-screen preview modal
- Carousel indicators
- Engagement buttons
- Real-time updates

**Props:**
```typescript
interface EnhancedPostPreviewProps {
  post: Post;
  images?: Array<{ id: string; url: string; alt?: string }>;
  onImageSelect?: (imageId: string) => void;
  selectedImageId?: string | null;
  showFullPreview?: boolean;
  onCloseFullPreview?: () => void;
}
```

---

## 🎯 Gebruik

### In Create/Edit Modal

De modal heeft nu een **split view layout**:

**Links (Form):**
- Platform & Type selectie
- Titel input
- Image gallery selector
- Caption textarea
- Hashtags
- Scheduling
- Save/Cancel buttons

**Rechts (Preview):**
- Grote live preview van de post
- Thumbnail gallery onderaan (als meerdere images)
- "Volledige preview" button voor full-screen

### Thumbnail Gallery

- Toont alle geselecteerde images
- Nummering (1, 2, 3, etc.)
- Blauwe border voor geselecteerde image
- Klik om image te selecteren
- Checkmark op geselecteerde image

### Full-Screen Preview

- Klik op "Volledige preview" button
- Opent in full-screen modal
- Donkere achtergrond
- Sluit met X button of klik buiten preview

---

## 🎨 Preview Features Per Platform

### Instagram Preview
- ✅ Exacte Instagram styling
- ✅ Profile header met avatar
- ✅ Square of 9:16 aspect ratio (voor Reels)
- ✅ Engagement buttons (like, comment, share, save)
- ✅ Likes counter
- ✅ Caption met username
- ✅ Hashtags styling
- ✅ Timestamp
- ✅ Carousel indicators (dots)
- ✅ Carousel navigation arrow
- ✅ Play button voor Reels

### LinkedIn Preview
- ✅ Exacte LinkedIn styling
- ✅ Company profile header
- ✅ Post content met hook, body, value block
- ✅ Image gallery (grid voor meerdere images)
- ✅ Engagement buttons (Leuk, Opmerking, Verzenden)
- ✅ Hashtags styling
- ✅ Timestamp

---

## 📸 Multi-Image Support

### Carousel Posts
- Thumbnail gallery toont alle images
- Nummering per thumbnail
- Carousel indicators (dots) op main preview
- Navigatie arrow om door images te scrollen
- Counter (1/3, 2/3, etc.) op preview

### Image Gallery (LinkedIn)
- Grid layout voor meerdere images
- Max 6 thumbnails zichtbaar
- "+X" indicator als er meer images zijn
- Klik op thumbnail om te selecteren

---

## 🔄 Real-Time Updates

De preview update automatisch wanneer je:
- Platform wijzigt
- Content type wijzigt
- Caption bewerkt
- Hashtags toevoegt
- Images selecteert
- Titel wijzigt

---

## 🎯 Vergelijking Met Adobe Express

### Adobe Express Features → Onze Implementatie

| Adobe Express | Onze Implementatie | Status |
|--------------|-------------------|--------|
| Split view (form + preview) | ✅ Split view layout | ✅ |
| Thumbnail gallery met nummering | ✅ Thumbnail gallery | ✅ |
| Grote preview rechts | ✅ Grote preview rechts | ✅ |
| Full-screen preview button | ✅ "Volledige preview" button | ✅ |
| Platform-specifieke styling | ✅ Instagram/LinkedIn styling | ✅ |
| Engagement buttons | ✅ Like, comment, share icons | ✅ |
| Carousel indicators | ✅ Dots + navigation | ✅ |
| Real-time updates | ✅ Live preview | ✅ |
| Image selection | ✅ Thumbnail click | ✅ |

---

## 🚀 Gebruik Instructies

### 1. Nieuwe Post Aanmaken
1. Klik "Nieuwe Post" in planner
2. Modal opent met split view
3. Links: Vul formulier in
4. Rechts: Zie live preview
5. Selecteer images → zie thumbnails onderaan preview
6. Klik "Volledige preview" voor full-screen view

### 2. Post Bewerken
1. Klik op een post in feed/calendar/list
2. Klik "Bewerken"
3. Zelfde split view met huidige content
4. Preview update real-time bij wijzigingen

### 3. Multi-Image Posts
1. Selecteer meerdere images in ImageGallery
2. Thumbnail gallery verschijnt onder preview
3. Klik op thumbnail om image te selecteren
4. Carousel indicators tonen positie
5. Gebruik arrow om door images te navigeren

---

## 💡 Tips

1. **Preview Size**: Preview past zich aan aan content type (Reel = verticaal, Post = vierkant)
2. **Thumbnail Selection**: Klik op thumbnail nummer om image te selecteren
3. **Full-Screen**: Gebruik voor betere preview op grote schermen
4. **Real-Time**: Preview update automatisch - geen save nodig

---

## 🔧 Technische Details

### Component Structuur
```
EnhancedPostPreview
├── InstagramPreview
│   ├── Header (profile)
│   ├── Image/Video (with carousel support)
│   ├── Engagement buttons
│   ├── Likes counter
│   ├── Caption
│   └── Timestamp
├── LinkedInPreview
│   ├── Header (company)
│   ├── Content (hook, post, value block)
│   ├── Image gallery
│   └── Engagement buttons
└── ThumbnailGallery
    └── Numbered thumbnails
```

### State Management
- `selectedImageIndex`: Huidige image in carousel
- `showFullScreen`: Full-screen preview state
- `selectedImages`: Array van geselecteerde images

---

## 📋 Toekomstige Uitbreidingen (Optioneel)

- [ ] Facebook preview styling
- [ ] Twitter/X preview styling
- [ ] Story preview
- [ ] Video preview met player
- [ ] Drag & drop in thumbnail gallery (reorder images)
- [ ] Image editing (crop, filters) in preview
- [ ] Mobile responsive preview
- [ ] Export preview als image

---

**De preview is nu op Adobe Express niveau! 🎉**
