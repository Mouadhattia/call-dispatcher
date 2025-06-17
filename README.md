# Twilio Call Manager

A Node.js backend application for managing phone calls using Twilio's Programmable Voice API. This application handles incoming calls, places them in a queue, and allows for manual or automated transfer to agents or other phone numbers.

## Features

- Handle multiple simultaneous incoming calls
- Queue management with hold music
- Manual and automated call transfer
- Support for Twilio virtual numbers and SIP endpoints
- Call event logging
- Dashboard API for queue management

## Prerequisites

- Node.js (v14 or higher)
- A Twilio account with:
  - Account SID
  - Auth Token
  - A Twilio phone number
  - (Optional) SIP domain and credentials

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd twilio-call-manager
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and add your configuration:

```bash
cp .env.example .env
```

4. Edit the `.env` file with your Twilio credentials and other settings.

## Configuration

The following environment variables need to be set in your `.env` file:

- `TWILIO_ACCOUNT_SID`: Your Twilio Account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token
- `TWILIO_PHONE_NUMBER`: Your Twilio phone number
- `PORT`: Application port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `QUEUE_NAME`: Name for the call queue
- `HOLD_MUSIC_URL`: URL for hold music
- `AUTO_DISPATCH_ENABLED`: Enable/disable automated dispatch
- `DEFAULT_DESTINATION`: Default transfer destination

## Running the Application

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## API Endpoints

### Voice Webhooks

- `POST /voice/incoming`: Handle incoming calls
- `POST /voice/transfer`: Handle call transfers

### Dashboard API

- `GET /api/queue`: Get current queue status
- `POST /api/transfer/:callSid`: Transfer a specific call

## Setting up Twilio

1. Log in to your Twilio Console
2. Go to Phone Numbers > Manage > Active Numbers
3. Select your Twilio number
4. Under "Voice & Fax" configuration:
   - Set the webhook URL for "A Call Comes In" to: `https://your-domain.com/voice/incoming`
   - Set the webhook method to HTTP POST

## Security Considerations

- Keep your `.env` file secure and never commit it to version control
- Use HTTPS in production
- Implement proper authentication for the dashboard API
- Regularly rotate your Twilio Auth Token

## Logging

The application uses Winston for logging. Logs are stored in:

- `error.log`: Error-level logs
- `combined.log`: All logs

## License

MIT
