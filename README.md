# PDF.co Integration for Resume Analysis

This project uses [PDF.co](https://pdf.co) to extract text from PDF resumes before sending them to the AI for analysis.

## Setup

1. **Get a PDF.co API Key:**
   - Sign up at [PDF.co](https://pdf.co) and obtain your API key.

2. **Set the API Key:**
   - Add the following to your `.env.local` file:
     ```env
     PDFCO_API_KEY=your_pdfco_api_key_here
     ```

3. **How it works:**
   - When a PDF resume is uploaded, the backend sends it to PDF.co for text extraction.
   - The extracted text is then analyzed by the AI as before.

No client-side changes are needed for this integration. 