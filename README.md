# GetSign Flow Service

A Node.js/TypeScript service that provides PDF signing capabilities via REST API and processes signing jobs via SQS.

## Features

- **Express API** running on port 9999
- **PDF Signing API** with streaming support
- **Watermark functionality** with clickable links
- **SQS Job Processing** for background signing tasks
- **Health Check** endpoint

## API Endpoints

### Health Check

```
GET /health
```

Returns server status and timestamp.

**Response:**

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Sign PDF (Pure Stream)

```
POST /api/sign-pdf-stream
```

Signs a PDF file using pure stream processing. No file parsing, no buffering - just direct stream processing.

**Request:**

- Content-Type: `application/octet-stream` or `application/pdf`
- Body: PDF file stream
- Headers:
  - `workername`: Worker name for signing (required)
  - `watermarkurl`: URL to open when watermark is clicked (optional)

**Example using curl:**

```bash
curl -X POST \
  http://localhost:9999/api/sign-pdf-stream \
  -H "Content-Type: application/pdf" \
  -H "workername: 6282336" \
  -H "watermarkurl: https://example.com" \
  --data-binary @document.pdf \
  --output signed-document.pdf
```

**Example using your client code:**

```javascript
// Convert your FormData approach to direct stream
const fileStream = fs.createReadStream("document.pdf");
const res = await axios.post(
  "http://localhost:9999/api/sign-pdf-stream",
  fileStream,
  {
    headers: {
      "Content-Type": "application/pdf",
      workername: customerId,
      watermarkurl: "https://example.com", // optional
    },
    responseType: "arraybuffer",
  }
);
```

**Features:**

- **Pure Streaming:** No file parsing, no buffering, no size limits
- **Watermark:** Adds clickable watermark on the last page (right side, bottom)
- **Clickable:** Watermark opens the specified URL when clicked
- **Efficient:** Ideal for large PDF files
- **Simple:** Direct stream processing only

## Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables (see `.env` file)

3. Start the server:

```bash
npm start
```

## Environment Variables

Required environment variables:

- `ENVIRONMENT`: development or production
- `AWS_REGION`: AWS region
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `SQS_SIGNING_QUEUE_URL`: SQS queue URL
- `DB_URL`: Database connection string
- `SOME_32BYTE_BASE64_STRING`: Encryption key
- `SOME_64BYTE_BASE64_STRING`: Signature key

## Development

- **Start development server**: `npm start`
- **Build for production**: `npm run build`
- **Start production server**: `npm run serve`

## File Processing

- **Streaming:** No file size limits - processes PDFs as streams
- **File types:** PDF only
- **No temporary files:** Processes directly in memory
- **Watermark support:** Optional clickable watermark on last page
