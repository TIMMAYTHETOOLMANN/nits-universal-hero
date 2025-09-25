# NITS Universal Forensic Intelligence System

A comprehensive web-based forensic document analysis platform that performs cross-document triangulation on SEC regulatory filings and public corporate communications to identify potential compliance violations, insider trading patterns, ESG greenwashing, and litigation risks.

**Experience Qualities**:
1. Professional - Serious forensic analysis tool with cyberpunk visual design that conveys technical expertise
2. Intuitive - Complex functionality presented through clear visual hierarchy and immediate feedback
3. Comprehensive - Complete forensic intelligence pipeline from upload to export with detailed analysis

**Complexity Level**: Complex Application (advanced functionality, accounts)
- Multi-phase document analysis with 6 specialized detection modules requiring sophisticated state management and real-time processing feedback

## Essential Features

### Dual-Zone File Upload System
- **Functionality**: Two distinct upload zones for SEC regulatory filings vs public communications
- **Purpose**: Segregate document types for cross-document triangulation analysis
- **Trigger**: Drag-and-drop, click upload buttons, or zone clicking
- **Progression**: File selection → validation → visual feedback → counter updates → ready for analysis
- **Success criteria**: Files properly categorized, visual feedback immediate, size/format validation working

### Universal Forensic Analysis Engine
- **Functionality**: 6 specialized detection modules analyzing documents for compliance violations
- **Purpose**: Identify insider trading patterns, ESG greenwashing, litigation risks across any company
- **Trigger**: Analysis button click after files uploaded
- **Progression**: Document ingestion → triangulation → risk scoring → pattern detection → results compilation
- **Success criteria**: All modules execute, risk scores calculated, cross-references identified

### Comprehensive Results Display
- **Functionality**: Collapsible sections showing analysis summary, anomalies, module results, recommendations
- **Purpose**: Present complex forensic findings in organized, actionable format
- **Trigger**: Analysis completion
- **Progression**: Results generation → section population → color-coded risk display → interactive expansion
- **Success criteria**: All findings displayed, risk color-coding accurate, sections expand/collapse smoothly

### Multi-Format Export System
- **Functionality**: Export results as forensic report, discrepancy matrix, executive analysis, complete package
- **Purpose**: Enable further analysis and reporting in various professional formats
- **Trigger**: Export button clicks
- **Progression**: Format selection → data compilation → file generation → download trigger
- **Success criteria**: All 4 formats generate correctly, files download properly, data structured appropriately

## Edge Case Handling
- **File Size Limits**: 500MB maximum with graceful rejection and clear messaging
- **Invalid Formats**: Format validation with user-friendly error explanations
- **Empty Uploads**: Clear guidance when no files selected for analysis
- **Analysis Interruption**: Proper cleanup if user navigates away during processing
- **Memory Management**: Efficient handling of large file processing without browser crashes

## Design Direction
The design should feel like a high-tech forensic investigation tool with cyberpunk aesthetics - serious, professional, and cutting-edge while maintaining clarity and usability through a rich interface that showcases the platform's sophisticated capabilities.

## Color Selection
Custom palette - Cyberpunk forensic theme with dark backgrounds and neon accents to convey technical sophistication and investigative precision.

- **Primary Color**: Neon Green (#00ff41) - Commands attention for critical findings and primary actions
- **Secondary Colors**: Dark Blues (#1a1a2e to #0a0a0a) - Professional background gradients that don't compete with content
- **Accent Color**: Electric Purple (#8a2be2) - Critical risk indicators and high-priority alerts
- **Foreground/Background Pairings**: 
  - Background (Dark #0a0a0a): Neon Green text (#00ff41) - Ratio 12.8:1 ✓
  - Card (Dark Blue #1a1a2e): White text (#ffffff) - Ratio 8.9:1 ✓
  - Primary (Neon Green #00ff41): Black text (#000000) - Ratio 12.8:1 ✓
  - Accent (Electric Purple #8a2be2): White text (#ffffff) - Ratio 6.2:1 ✓

## Font Selection
Typography should convey technical precision and forensic professionalism using monospace fonts that enhance the cyberpunk aesthetic while ensuring excellent readability for complex data analysis.

- **Typographic Hierarchy**:
  - H1 (System Title): Courier New Bold/32px/tight letter spacing
  - H2 (Section Headers): Courier New Bold/24px/normal spacing
  - H3 (Subsections): Courier New Semibold/18px/normal spacing  
  - Body (Analysis Text): Courier New Regular/14px/relaxed line height
  - Code (Metrics): Courier New Regular/12px/monospace alignment

## Animations
Animations should enhance the forensic investigation experience with subtle, purposeful transitions that guide attention and provide satisfying feedback without distracting from the serious analytical work.

- **Purposeful Meaning**: Smooth transitions reinforce the high-tech forensic theme while maintaining professional focus
- **Hierarchy of Movement**: Upload zones get priority animation focus, followed by analysis progress, then results expansion

## Component Selection
- **Components**: Cards for upload zones and results sections, Buttons for primary actions, Progress bars for analysis phases, Badges for risk indicators, Collapsible sections for results organization
- **Customizations**: Custom upload zones with glow effects, specialized progress indicators for forensic analysis phases, risk-colored badges for findings classification
- **States**: Upload zones with hover glow, buttons with cyberpunk styling, inputs with neon focus states, results with expand/collapse animations
- **Icon Selection**: Upload arrows, analysis gears, warning triangles for risks, download arrows for exports
- **Spacing**: Generous padding using 4px base unit, consistent gaps between sections, breathing room around complex data displays
- **Mobile**: Responsive layout with stacked upload zones on mobile, collapsible navigation, touch-friendly interactive elements with progressive enhancement for desktop features