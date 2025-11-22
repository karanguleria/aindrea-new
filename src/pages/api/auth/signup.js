// Example API endpoint for user signup
// This is a proxy to your actual backend API

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (!baseUrl) {
      return res.status(500).json({ 
        message: 'API base URL not configured' 
      });
    }

    // Forward the request to your actual backend
    const response = await fetch(`${baseUrl}/api/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Return the response from your backend
    res.status(response.status).json(data);

  } catch (error) {
    console.error('Signup proxy error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}
