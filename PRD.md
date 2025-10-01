# NITS Forensic Intelligence System - Production Ready

A clean, production-ready legal document analysis platform with no placeholder data or misleading indicators.

**Experience Qualities**:
1. **Professional Authenticity** - Every indicator reflects actual system state with no fake progress bars or placeholder violations
2. **Progressive Disclosure** - Interface elements appear only when relevant, creating a focused user experience
3. **Forensic Precision** - Clean, cyberpunk-inspired design that projects technical competence and legal authority

**Complexity Level**: Light Application (multiple features with basic state)
- Real file handling and analysis workflow
- State-driven UI that adapts to actual data
- Professional empty states and loading indicators

## Essential Features

### Document Upload System
**Functionality**: Drag-and-drop file upload for SEC and public documents  
**Purpose**: Secure document intake for forensic analysis  
**Trigger**: User drags files or clicks upload zones  
**Progression**: File selection → Upload confirmation → File count display → Analysis enablement  
**Success criteria**: Files properly stored with accurate count display

### Analysis Engine
**Functionality**: Multi-module document analysis with real progress tracking  
**Purpose**: Detect potential legal violations and compliance issues  
**Trigger**: User clicks analysis buttons after uploading files  
**Progression**: Analysis start → Module activation → Progress tracking → Results generation  
**Success criteria**: Analysis completes with accurate violation detection or clean bill

### Evidence Package Generation
**Functionality**: Export analysis results in prosecution-ready formats  
**Purpose**: Provide actionable legal documentation  
**Trigger**: Analysis completion with violations detected  
**Progression**: Violation detection → Recovery calculation → Export option activation → Document generation  
**Success criteria**: Professional legal documents generated for enforcement actions

## Edge Case Handling

**Empty System State**: Professional "no data" messaging instead of fake placeholders
**Analysis with No Violations**: Clear "all clear" indication rather than zero counters
**File Upload Errors**: Graceful error handling with specific guidance
**Browser Memory Limits**: Real memory monitoring with performance warnings
**Network Interruptions**: Analysis state preservation and recovery options

## Design Direction

The interface projects serious forensic authority through a cyberpunk aesthetic that feels both cutting-edge and courtroom-appropriate. Clean, minimal design that emphasizes data clarity over visual flourishes.

## Color Selection

**Triadic** color scheme using forensic green, electric cyan, and warning red to communicate different system states and violation severities.

- **Primary Color**: Forensic Green (oklch(0.75 0.25 145)) - Communicates system readiness and successful operations
- **Secondary Colors**: Electric Cyan (oklch(0.7 0.2 200)) for information states, Warning Orange (oklch(0.7 0.15 60)) for caution
- **Accent Color**: Critical Red (oklch(0.6 0.25 25)) for violations and dangerous actions
- **Foreground/Background Pairings**: 
  - Background (Deep Black #000000): Green text(oklch(0.75 0.25 145)) - Ratio 11.2:1 ✓
  - Card (Dark Gray oklch(0.1 0.02 240)): White text(oklch(0.95 0 0)) - Ratio 14.8:1 ✓
  - Primary (Forensic Green): Black text(oklch(0.05 0 0)) - Ratio 15.1:1 ✓

## Font Selection

Monospace typography (Courier Prime) to emphasize the technical, forensic nature of the platform while maintaining excellent readability for legal document review.

- **Typographic Hierarchy**: 
  - H1 (System Title): Courier Prime Bold/24px/normal letter spacing
  - H2 (Section Headers): Courier Prime Bold/16px/normal letter spacing  
  - Body (Interface Text): Courier Prime Regular/14px/normal letter spacing
  - Caption (Status Text): Courier Prime Regular/12px/normal letter spacing

## Animations

Purposeful, subtle animations that enhance functionality without distraction. All motion serves to guide attention to important state changes or provide visual feedback for user actions.

- **Purposeful Meaning**: Rotating activity indicators signal active processing, pulse effects highlight system readiness
- **Hierarchy of Movement**: Critical violations get stronger animation emphasis than informational updates

## Component Selection

- **Components**: Cards for information grouping, Buttons with distinct states for actions, Progress bars for real operations only, Badges for status indicators
- **Customizations**: Custom upload zones with drag-and-drop feedback, violation display cards with expandable evidence sections
- **States**: Clear disabled/enabled states for all interactive elements, loading states only during actual processing
- **Icon Selection**: Lucide icons for professional appearance - Shield for security, Activity for processing, AlertTriangle for violations
- **Spacing**: Consistent 16px base unit with 8px subdivisions for tight layouts
- **Mobile**: Single-column layout on mobile with collapsible sections for document upload and results