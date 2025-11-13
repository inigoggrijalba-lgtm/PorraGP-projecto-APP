// api/proxy.js

// This function acts as a simple CORS proxy.
// It's designed to be deployed as a serverless function (e.g., on Vercel, Netlify).
// It takes a `targetUrl` query parameter and forwards the request to that URL.

export default async (req, res) => {
  // Set CORS headers to allow requests from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const targetUrl = searchParams.get('targetUrl');

  if (!targetUrl) {
    res.status(400).json({ error: 'targetUrl query parameter is required' });
    return;
  }

  try {
    const response = await fetch(targetUrl);
    
    if (!response.ok) {
        // Forward the error status from the target API
        res.status(response.status).send(await response.text());
        return;
    }

    const data = await response.text();
    
    // Check if the response is JSON and send it with the correct content type
    try {
        JSON.parse(data);
        res.setHeader('Content-Type', 'application/json');
    } catch (e) {
        // If it's not JSON (e.g., XML for the news feed), send as plain text
        res.setHeader('Content-Type', 'text/plain');
    }

    res.status(200).send(data);

  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: 'Failed to fetch from the target URL' });
  }
};
