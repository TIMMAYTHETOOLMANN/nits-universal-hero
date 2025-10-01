# NITS Universal Forensic Intelligence System - Product Requirements Document

## Core Purpose & Success

**Mission Statement**: Create a comprehensive web-based forensic document analysis platform that performs cross-document triangulation on SEC regulatory filings and public corporate communications to identify potential compliance violations, insider trading patterns, ESG greenwashing, and litigation risks with surgical accuracy and autonomous AI enhancement.

**Success Indicators**: 
- Zero-variance penalty calculations across identical document sets
- Autonomous pattern training that improves detection accuracy over time
- Direct downloadable evidence packages with specific violation locations
- Real-time penalty calculations tied to current SEC statutory amounts

**Experience Qualities**: Professional, Precise, Powerful

## Project Classification & Approach

**Complexity Level**: Complex Application (advanced functionality, AI enhancement, multi-format analysis)

**Primary User Activity**: Creating (forensic intelligence) and Acting (generating evidence packages)

## Thought Process for Feature Selection

**Core Problem Analysis**: Legal professionals need a system that can:
- Analyze multiple document types simultaneously 
- Detect sophisticated compliance violations with surgical precision
- Calculate exact penalties based on current SEC statutes
- Generate court-ready evidence packages
- Continuously improve detection through autonomous AI training

**User Context**: Legal teams, forensic accountants, and compliance officers analyzing corporate documents for violations, preparing for litigation, or conducting due diligence.

**Critical Path**: Upload → Analyze → Detect Violations → Calculate Penalties → Export Evidence

**Key Moments**: 
1. Document upload with real-time validation
2. AI-enhanced violation detection with exact location references
3. SEC penalty calculation with current statutory amounts
4. Evidence package generation for legal proceedings

## Essential Features

### 1. Dual-Zone Document Upload System
- **Functionality**: Separate zones for SEC regulatory files vs public communications
- **Purpose**: Enable cross-document comparison and detect disclosure inconsistencies
- **Success Criteria**: Support for PDF, HTML, XLSX, XLS, XML, PPTX, DOCX up to 500MB per file

### 2. Autonomous AI Pattern Training
- **Functionality**: Self-improving ML system that generates new detection patterns
- **Purpose**: Continuously enhance violation detection accuracy without manual intervention
- **Success Criteria**: Pattern performance tracking, autonomous optimization, training logs

### 3. Six-Module Forensic Analysis Engine
- **Functionality**: Specialized detectors for insider trading, ESG greenwashing, financial engineering, etc.
- **Purpose**: Comprehensive violation detection across all major compliance areas
- **Success Criteria**: Risk scoring, confidence levels, exact violation locations

### 4. SEC Penalty Matrix Integration
- **Functionality**: Real-time calculation of exact penalties using current SEC statutory amounts
- **Purpose**: Provide accurate financial exposure assessments for litigation/settlement
- **Success Criteria**: Exact penalty amounts, not ranges or estimates

### 5. Evidence Package Export System
- **Functionality**: Generate court-ready documents with specific violation references
- **Purpose**: Streamline legal proceedings with documented evidence
- **Success Criteria**: Multiple formats (JSON, CSV, TXT), downloadable to local machine

### 6. Financial Matrix Dashboard
- **Functionality**: Comprehensive violation breakdown with penalty calculations
- **Purpose**: Provide detailed financial exposure analysis for decision-making
- **Success Criteria**: Per-violation details, statutory references, total exposure

## Design Direction

### Visual Tone & Identity
**Emotional Response**: Professional confidence, technological sophistication, forensic precision
**Design Personality**: Cyberpunk forensic - high-tech but professional
**Visual Metaphors**: Matrix/terminal aesthetics, forensic investigation, legal documentation
**Simplicity Spectrum**: Rich interface with organized complexity

### Color Strategy
**Color Scheme Type**: Custom cyberpunk forensic palette
**Primary Color**: Neon green (oklch(0.75 0.25 145)) - represents active scanning/detection
**Secondary Colors**: 
- Cyber blue (oklch(0.1 0.02 240)) - background depth
- Electric purple (oklch(0.65 0.3 300)) - accent for AI features
**Accent Color**: Warning orange (oklch(0.7 0.15 60)) - for violations and alerts
**Color Psychology**: Green conveys active analysis, blue provides professional depth, purple indicates AI enhancement, orange signals warnings

### Typography System
**Font Pairing Strategy**: Monospace primary (Courier Prime) for technical/forensic feel
**Typographic Hierarchy**: Clear size/weight distinctions for data vs navigation
**Font Personality**: Technical precision, legal documentation aesthetics
**Which fonts**: Courier Prime from Google Fonts
**Legibility Check**: Monospace ensures consistent data alignment and technical readability

### Visual Hierarchy & Layout
**Attention Direction**: Risk scores and violation counts as primary focus points
**White Space Philosophy**: Generous spacing for clarity in dense data presentation
**Grid System**: 12-column responsive grid with specialized panels
**Responsive Approach**: Tab-based navigation that works across devices
**Content Density**: High information density organized through collapsible sections

### Animations
**Purposeful Meaning**: Progress indicators for analysis phases, glow effects for active elements
**Hierarchy of Movement**: Analysis progress > pattern training > general interactions
**Contextual Appropriateness**: Subtle but informative - enhances functionality without distraction

### UI Elements & Component Selection
**Component Usage**: 
- Cards for module organization
- Tabs for main navigation
- Progress bars for analysis tracking
- Badges for status indicators
- Collapsible sections for detailed results

**Component Customization**: Custom cyberpunk styling with glow effects and gradients
**Component States**: Clear hover/active states with color-coded feedback
**Icon Selection**: Phosphor icons for technical precision
**Mobile Adaptation**: Tab layout collapses appropriately, upload zones remain functional

### Accessibility & Readability
**Contrast Goal**: WCAG AA compliance with high contrast ratios for cyberpunk theme

## Implementation Considerations

**Scalability Needs**: Support for multiple document sets, pattern library growth
**Testing Focus**: Penalty calculation accuracy, download functionality, cross-browser compatibility
**Critical Questions**: How to ensure consistent violation detection across runs

## Reflection

This approach uniquely combines AI-enhanced detection with forensic precision and current legal requirements. The autonomous training system ensures continuous improvement while maintaining surgical accuracy in penalty calculations.