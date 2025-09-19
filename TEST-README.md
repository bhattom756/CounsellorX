# Gemini API Test Script

This is a simple JavaScript test file to verify your Google Gemini API implementation.

## Setup

1. **Set your API key** (choose one method):

   **Method 1: Environment Variable**
   ```bash
   export GOOGLE_API_KEY="your_actual_api_key_here"
   node test-gemini.js
   ```

   **Method 2: Direct in file**
   ```javascript
   const API_KEY = 'your_actual_api_key_here';
   ```

2. **Install dependencies** (if using fetch):
   ```bash
   npm install node-fetch
   ```

## Running Tests

```bash
# Run all tests
node test-gemini.js

# Run with environment variable
GOOGLE_API_KEY=your_key node test-gemini.js
```

## What It Tests

### ✅ Basic Functionality
- Simple greeting prompts
- Legal case analysis prompts
- Document requirements generation

### ✅ Error Handling
- Empty prompts
- Very long prompts (token limits)
- Invalid model names
- API errors

### ✅ Performance
- Concurrent requests
- Response times
- Throughput metrics

## Expected Output

```
🚀 Starting Gemini API Tests...

📝 Testing: Simple greeting
Prompt: "Hello, how are you today?"
──────────────────────────────────────────────────
🔍 API Response Debug:
Finish Reason: STOP
Usage Metadata: { promptTokenCount: 8, totalTokenCount: 25 }
✅ Success!
Response: Hello! I'm doing well, thank you for asking. How can I help you today?
──────────────────────────────────────────────────

📝 Testing: Legal case analysis
...
```

## Troubleshooting

### Common Issues

1. **"Please set GOOGLE_API_KEY"**
   - Set your API key as an environment variable
   - Or edit the file directly

2. **"API Error: 400"**
   - Check if your API key is valid
   - Verify the API key has proper permissions

3. **"No response generated"**
   - Check the finish reason in debug output
   - May be due to content policy or token limits

4. **"fetch is not defined"**
   - Install node-fetch: `npm install node-fetch`
   - Or use Node.js 18+ (has built-in fetch)

### Debug Information

The script provides detailed debug information:
- Finish reasons (STOP, MAX_TOKENS, SAFETY, etc.)
- Token usage statistics
- Response structure analysis
- Error details

## Customization

You can modify the test cases in the `testPrompts` array:

```javascript
const testPrompts = [
  {
    name: "Your test name",
    prompt: "Your test prompt",
    maxTokens: 500
  }
];
```

## Integration with Your App

This test uses the same API structure as your main application, so if these tests pass, your app should work correctly too.
