interface Env {
  GAS_API_URL: string;
}

export const onRequest = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  
  if (!env.GAS_API_URL) {
    return new Response(JSON.stringify({ status: 'error', message: 'GAS_API_URL not configured' }), { status: 500 });
  }

  const url = new URL(request.url);

  // Validation: If it's a GET request, require an 'action' parameter.
  // This prevents direct browser access to /api/proxy from returning a generic success from GAS
  // or confusing the frontend.
  if (request.method === 'GET' && !url.searchParams.has('action')) {
     return new Response(JSON.stringify({ status: 'error', message: 'Missing action parameter' }), { 
       status: 400,
       headers: { "Content-Type": "application/json" }
     });
  }
  
  // Prepare the target URL (Google Apps Script)
  const targetUrl = new URL(env.GAS_API_URL);

  // Forward all query parameters from the client request to GAS
  url.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  const init: RequestInit = {
    method: request.method,
    headers: {
      // GAS requires specific content types sometimes, but generally follows redirects
    },
  };

  if (request.method === 'POST') {
    // Read the JSON body sent from Frontend
    const body = await request.json() as Record<string, any>;
    
    // Convert JSON back to URLSearchParams (x-www-form-urlencoded)
    // because GAS doPost(e) works best with form data to populate e.parameter
    const formData = new URLSearchParams();
    Object.keys(body).forEach(key => {
      const value = body[key];
      if (typeof value === 'object' && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    init.body = formData;
    
    // Important: Do not force Content-Type to json, fetch will set form-urlencoded automatically with URLSearchParams
  }

  try {
    const response = await fetch(targetUrl.toString(), init);
    const data = await response.text(); // Get text first to safely debug if needed

    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // Adjust if strict CORS needed
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ status: 'error', message: String(error) }), { status: 500 });
  }
}