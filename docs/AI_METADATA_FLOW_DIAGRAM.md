# AI Metadata Generation Flow Diagram

## User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘

1. CREATE CD (Private by default)
   ┌──────────────┐
   │ User uploads │
   │ files to CD  │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ CD is PRIVATE│
   │ No AI analysis│
   └──────┬───────┘
          │
          ▼
2. TOGGLE TO PUBLIC
   ┌──────────────┐
   │ User clicks  │
   │ Public toggle│
   └──────┬───────┘
          │
          ▼
   ┌──────────────────┐
   │ Confirmation     │
   │ "Make CD Public?"│
   │ + AI notice      │
   └──────┬───────────┘
          │
          ▼
3. CD BECOMES PUBLIC (Instant)
   ┌──────────────────┐
   │ CD visibility    │
   │ updated in       │
   │ Firestore        │
   └──────┬───────────┘
          │
          ▼
4. AI ANALYSIS STARTS (Background)
   ┌──────────────────┐
   │ Progress modal   │
   │ appears          │
   │ "Analyzing..."   │
   └──────┬───────────┘
          │
          ▼
5. FILES PROCESSED ONE-BY-ONE
   ┌──────────────────┐
   │ File 1/10 (10%)  │
   │ File 2/10 (20%)  │
   │ ...              │
   │ File 10/10 (100%)│
   └──────┬───────────┘
          │
          ▼
6. COMPLETION
   ┌──────────────────┐
   │ "Analysis        │
   │  Complete!"      │
   │ Modal auto-closes│
   └──────┬───────────┘
          │
          ▼
7. ENHANCED SEARCH AVAILABLE
   ┌──────────────────┐
   │ CD now searchable│
   │ by AI tags and   │
   │ descriptions     │
   └──────────────────┘
```

## Technical Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      TECHNICAL ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────────┘

USER ACTION: Toggle CD to Public
    │
    ▼
┌─────────────────────────────────┐
│ PublicToggle Component          │
│ - Shows confirmation modal      │
│ - User confirms                 │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ publicCDService.toggleCDPublic()│
│ - Updates CD.isPublic = true    │
│ - Sets CD.publicAt timestamp    │
│ - Syncs to publicCDs collection │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ shouldGenerateMetadata() check  │
│ - Is CD public? ✓               │
│ - Already generated? ✗          │
│ → Trigger generation            │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ useMetadataGeneration hook      │
│ - Sets isGenerating = true      │
│ - Shows progress modal          │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ cdMetadataService               │
│ .generateCDMetadata()           │
│ - Fetches all files for CD      │
│ - Calls batch generation        │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ aiService.generateBatchMetadata()│
│ - Processes files sequentially  │
│ - 100ms delay between files     │
└────────────┬────────────────────┘
             │
             ▼
FOR EACH FILE:
┌─────────────────────────────────┐
│ aiService.generateFileMetadata()│
│ 1. Get file download URL        │
│ 2. Build prompt for file type   │
│ 3. Call Gemini API              │
│ 4. Parse response               │
│ 5. Return AIMetadata            │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ Gemini API Call                 │
│ POST /generateContent           │
│ - Send file data (images)       │
│ - Send prompt                   │
│ - Receive structured response   │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ Parse AI Response               │
│ DESCRIPTION: "A sunset photo..."│
│ TAGS: sunset, nature, landscape │
│ CATEGORY: photo                 │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ fileService                     │
│ .updateFileAIMetadata()         │
│ - Updates file document         │
│ - Adds aiMetadata field         │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ Progress Update                 │
│ - onProgress(current, total)    │
│ - Modal shows percentage        │
└────────────┬────────────────────┘
             │
             ▼
AFTER ALL FILES:
┌─────────────────────────────────┐
│ cdService                       │
│ .markAIMetadataGenerated()      │
│ - Sets aiMetadataGenerated=true│
│ - Sets aiMetadataGeneratedAt    │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ Progress Modal                  │
│ - Shows "Complete!"             │
│ - Auto-closes after 1.5s        │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ DONE                            │
│ CD now has AI metadata          │
│ Enhanced search available       │
└─────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      ERROR HANDLING                              │
└─────────────────────────────────────────────────────────────────┘

API Call to Gemini
    │
    ▼
┌─────────────────┐
│ Success?        │
└────┬────────┬───┘
     │ YES    │ NO
     │        │
     ▼        ▼
┌─────────┐  ┌──────────────────┐
│ Store   │  │ Catch Error      │
│ AI      │  │ - Log to console │
│ metadata│  │ - Don't throw    │
└─────────┘  └────────┬─────────┘
                      │
                      ▼
             ┌──────────────────┐
             │ Create Fallback  │
             │ Metadata         │
             │ - Use filename   │
             │ - Use file type  │
             │ - Low confidence │
             └────────┬─────────┘
                      │
                      ▼
             ┌──────────────────┐
             │ Store Fallback   │
             │ Metadata         │
             └────────┬─────────┘
                      │
                      ▼
             ┌──────────────────┐
             │ Continue with    │
             │ Next File        │
             └──────────────────┘

Result: All files get metadata (AI or fallback)
```

## Search Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      SEARCH WITH AI METADATA                     │
└─────────────────────────────────────────────────────────────────┘

User enters search query: "sunset beach"
    │
    ▼
┌─────────────────────────────────┐
│ searchService                   │
│ .searchPublicCDsWithAI()        │
│ - Fetch all public CDs          │
│ - Fetch files for each CD       │
└────────────┬────────────────────┘
             │
             ▼
FOR EACH CD:
┌─────────────────────────────────┐
│ calculateMatchScore()           │
│                                 │
│ Check CD name: "Beach Vacation" │
│ → "beach" matches! +10 points   │
│                                 │
│ Check file AI tags:             │
│ → ["sunset", "beach", "ocean"]  │
│ → "sunset" matches! +8 points   │
│ → "beach" matches! +8 points    │
│                                 │
│ Check AI description:           │
│ → "Beautiful sunset over beach" │
│ → "sunset" matches! +7 points   │
│ → "beach" matches! +7 points    │
│                                 │
│ Total Score: 40 points          │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ Sort Results by Score           │
│ 1. Beach Vacation (40 pts)      │
│ 2. Summer Photos (25 pts)       │
│ 3. Random Pics (5 pts)          │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ Return Ranked Results           │
│ - CD info                       │
│ - Match score                   │
│ - Matched files                 │
│ - Match reason                  │
└─────────────────────────────────┘
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA STORAGE                                │
└─────────────────────────────────────────────────────────────────┘

Firestore Structure:

cds/{cdId}
├── name: "Beach Vacation"
├── isPublic: true
├── publicAt: Timestamp
├── aiMetadataGenerated: true ← NEW
├── aiMetadataGeneratedAt: Timestamp ← NEW
└── files/{fileId}
    ├── filename: "sunset.jpg"
    ├── originalName: "IMG_1234.jpg"
    ├── fileType: "image"
    └── aiMetadata: { ← NEW
        ├── description: "Beautiful sunset over the beach"
        ├── tags: ["sunset", "beach", "ocean", "nature"]
        ├── category: "photo"
        ├── confidence: 0.85
        └── generatedAt: Timestamp
        }

publicCDs/{cdId}
├── name: "Beach Vacation"
├── username: "john_doe"
├── fileCount: 10
├── viewCount: 42
└── publicAt: Timestamp
```

## Component Interaction

```
┌─────────────────────────────────────────────────────────────────┐
│                   COMPONENT ARCHITECTURE                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┐
│ CDDetailPage                    │
│ - Displays CD details           │
│ - Shows PublicToggle            │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ PublicToggle Component          │
│ - Toggle switch UI              │
│ - Confirmation modal            │
│ - Uses useMetadataGeneration    │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ useMetadataGeneration Hook      │
│ - isGenerating state            │
│ - progress state                │
│ - generateMetadata()            │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ MetadataGenerationModal         │
│ - Shows progress bar            │
│ - Displays percentage           │
│ - Auto-closes on complete       │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ MarketplacePage                 │
│ - Search input                  │
│ - Uses searchService            │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ searchService                   │
│ - Searches with AI metadata     │
│ - Returns ranked results        │
└─────────────────────────────────┘
```

## Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│                      TYPICAL TIMELINE                            │
└─────────────────────────────────────────────────────────────────┘

t=0s    User clicks "Make Public"
        ↓
t=0.1s  Confirmation modal appears
        ↓
t=1s    User confirms
        ↓
t=1.1s  CD becomes public (Firestore update)
        ↓
t=1.2s  Progress modal appears
        ↓
t=1.3s  First file analysis starts
        ↓
t=2.5s  First file complete (1/10 = 10%)
        ↓
t=2.6s  Second file starts (100ms delay)
        ↓
t=3.8s  Second file complete (2/10 = 20%)
        ↓
        ... (repeat for all files)
        ↓
t=15s   All files complete (10/10 = 100%)
        ↓
t=15.1s CD marked as aiMetadataGenerated
        ↓
t=16.5s Modal auto-closes (1.5s delay)
        ↓
t=16.5s DONE - Enhanced search available

Total Time: ~15-20 seconds for 10 files
User Wait Time: 0 seconds (non-blocking)
```

## Key Takeaways

### For Users
- ✅ CD becomes public instantly
- ✅ AI analysis happens in background
- ✅ Progress shown in friendly modal
- ✅ Can continue using app immediately
- ✅ Enhanced search available after completion

### For Developers
- ✅ Clean separation of concerns
- ✅ Async processing with progress tracking
- ✅ Graceful error handling
- ✅ Fallback metadata ensures reliability
- ✅ Rate limiting prevents API issues

### For Operations
- ✅ Cost-effective (~$0.0001 per CD)
- ✅ Scalable (handles any CD size)
- ✅ Monitorable (logs and progress)
- ✅ Disableable (remove API key)
- ✅ Secure (API key restrictions)
