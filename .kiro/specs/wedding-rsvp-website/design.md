# Wedding RSVP Website Design Document

## Overview

The wedding RSVP website is a NextJS application that provides an elegant, user-friendly interface for wedding guests to view event information and submit RSVP responses. The system integrates with Google Sheets API to manage invitation codes, guest data, and RSVP responses, providing real-time synchronization between the web interface and spreadsheet backend.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Guest Browser │◄──►│  NextJS Website  │◄──►│  Google Sheets  │
│                 │    │                  │    │      API        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Vercel/Host    │
                       │   (Deployment)   │
                       └──────────────────┘
```

### Technology Stack

- **Frontend**: NextJS 14+ with App Router
- **Styling**: Tailwind CSS for responsive design
- **API Integration**: Google Sheets API v4
- **Authentication**: Google Service Account for API access
- **Deployment**: Vercel (recommended for NextJS)
- **State Management**: React hooks and context for form state
- **Validation**: Zod for form and data validation

## Components and Interfaces

### Core Components

#### 1. Layout Components
- **MainLayout**: Primary layout wrapper with navigation and footer
- **Header**: Wedding couple names, date, and navigation
- **Footer**: Contact information and social links

#### 2. Page Components
- **HomePage**: Wedding information and invitation code entry
- **RSVPPage**: RSVP form with guest details and preferences
- **ConfirmationPage**: Success message after RSVP submission
- **ErrorPage**: Graceful error handling for invalid codes or API issues

#### 3. Form Components
- **InvitationCodeForm**: Input field with validation for invitation codes
- **RSVPForm**: Multi-step form for guest responses and preferences
- **GuestCard**: Individual guest RSVP component for multiple guests per code
- **LoadingSpinner**: Consistent loading indicator across the application

#### 4. UI Components
- **Button**: Styled button component with variants
- **Input**: Form input with validation states
- **Card**: Content container with elegant styling
- **Modal**: Overlay component for confirmations and errors

### API Interfaces

#### Google Sheets Integration

```typescript
interface GuestEntry {
  invitationCode: string;
  guestNames: string[];
  rsvpStatus: 'pending' | 'attending' | 'not_attending';
  dietaryRestrictions: string[];
  personalMessage: string;
  submissionDate: string;
}

interface SheetsService {
  validateInvitationCode(code: string): Promise<GuestEntry | null>;
  updateRSVPResponse(code: string, response: RSVPResponse): Promise<boolean>;
  getGuestsByCode(code: string): Promise<string[]>;
}
```

#### API Routes

- **GET /api/guests/[code]**: Validate invitation code and retrieve guest information
- **POST /api/rsvp**: Submit RSVP response and update Google Sheets
- **GET /api/health**: Health check for Google Sheets API connection

## Data Models

### Google Sheets Structure

**Sheet: "Guest_List"**
| Column A | Column B | Column C | Column D | Column E | Column F | Column G |
|----------|----------|----------|----------|----------|----------|----------|
| Invitation_Code | Guest_Names | RSVP_Status | Dietary_Restrictions | Personal_Message | Submission_Date | Email |

### Form Data Models

```typescript
interface RSVPFormData {
  invitationCode: string;
  guests: {
    name: string;
    attending: boolean;
    dietaryRestrictions: string;
  }[];
  personalMessage: string;
  contactEmail: string;
}
```

## User Experience Flow

### 1. Initial Landing
1. Guest visits website homepage
2. Views wedding information (date, venue, schedule)
3. Enters invitation code in prominent form field
4. System validates code against Google Sheets

### 2. RSVP Process
1. Valid code displays personalized RSVP form
2. Pre-populated guest names from spreadsheet
3. Individual RSVP for each guest (attending/not attending)
4. Dietary restrictions collection
5. Optional personal message field
6. Form validation and submission

### 3. Confirmation
1. Success message with RSVP summary
2. Option to modify response (if needed)
3. Contact information for questions

## Error Handling

### Client-Side Error Handling
- Form validation with real-time feedback
- Network error recovery with retry mechanisms
- Graceful degradation for API failures
- User-friendly error messages

### Server-Side Error Handling
- Google Sheets API rate limiting and retry logic
- Invalid invitation code handling
- Duplicate submission prevention
- Comprehensive logging for debugging

### Error States
- **Invalid Code**: Clear message with suggestion to check code
- **API Unavailable**: Temporary error with retry option
- **Submission Failed**: Error message with contact information
- **Network Issues**: Offline indicator with retry capability

## Testing Strategy

### Unit Testing
- Component rendering and interaction tests
- Form validation logic testing
- API service function testing
- Utility function validation

### Integration Testing
- Google Sheets API integration tests
- End-to-end RSVP flow testing
- Cross-browser compatibility testing
- Mobile responsiveness testing

### Performance Testing
- Page load speed optimization
- Google Sheets API response time monitoring
- Image optimization and lazy loading
- Bundle size analysis and optimization

## Security Considerations

### API Security
- Google Service Account with minimal required permissions
- Environment variable protection for API credentials
- Rate limiting on API endpoints
- Input sanitization and validation

### Data Privacy
- Minimal data collection (only necessary RSVP information)
- Secure transmission over HTTPS
- No client-side storage of sensitive data
- Clear privacy policy for guests

## Deployment and Configuration

### Environment Variables
```
GOOGLE_SHEETS_PRIVATE_KEY=<service_account_private_key>
GOOGLE_SHEETS_CLIENT_EMAIL=<service_account_email>
GOOGLE_SHEETS_SPREADSHEET_ID=<target_spreadsheet_id>
NEXT_PUBLIC_WEDDING_DATE=<wedding_date>
NEXT_PUBLIC_VENUE_NAME=<venue_name>
```

### Google Sheets Setup
1. Create Google Cloud Project
2. Enable Google Sheets API
3. Create Service Account with Sheets access
4. Share target spreadsheet with service account email
5. Configure spreadsheet with required column structure

### Deployment Pipeline
1. Development environment with test spreadsheet
2. Staging environment for final testing
3. Production deployment with live spreadsheet
4. Monitoring and error tracking setup