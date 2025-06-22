# Hanasu Backend

Express.js backend with EasyOCR integration for manga text extraction.

## Setup

### 1. Install Node.js Dependencies

```bash
npm install
```

### 2. Install Python Dependencies

Make sure you have Python 3.7+ installed, then:

```bash
pip install -r requirements.txt
```

### 3. Start the Server

```bash
npm run dev
```

## API Endpoints

### POST /ocr

Upload an image to extract text using EasyOCR.

**Request:**

- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `image`: Image file (jpg, png, gif, bmp, webp)
  - `languages`: Optional comma-separated language codes (default: "en,ja")

**Response:**

```json
{
  "success": true,
  "filename": "test.jpg",
  "text_extracted": "Extracted text from the image",
  "confidence_scores": [0.95, 0.87],
  "processing_time": 2.3
}
```

### GET /health

Health check endpoint.
