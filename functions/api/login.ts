interface Env {
  ADMIN_USER: string;
  ADMIN_PASS: string;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const { request, env } = context;
    const body = await request.json() as { username?: string; pass?: string };

    if (!env.ADMIN_USER || !env.ADMIN_PASS) {
      return new Response(JSON.stringify({ success: false, message: "Server misconfiguration" }), { status: 500 });
    }

    if (body.username === env.ADMIN_USER && body.pass === env.ADMIN_PASS) {
      // Return a simple success response. In a more complex app, you'd set a HttpOnly cookie here.
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ success: false, message: "Invalid credentials" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    return new Response(JSON.stringify({ success: false, message: "Error processing request" }), { status: 500 });
  }
}