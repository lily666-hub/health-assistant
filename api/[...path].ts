export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  // 后端 API 根地址（应包含 /api 前缀），例如：https://your-backend.example.com/api
  const backend = process.env.BACKEND_URL;
  if (!backend) {
    return new Response(
      JSON.stringify({ success: false, error: { message: 'BACKEND_URL 未配置' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const incomingUrl = new URL(req.url);
  const path = incomingUrl.pathname.replace(/^\/api/, '');
  const targetUrl = backend.replace(/\/$/, '') + path + (incomingUrl.search || '');

  // 处理预检请求（CORS）
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      },
    });
  }

  const headers = new Headers(req.headers);
  headers.delete('host');

  const init: RequestInit = {
    method: req.method,
    headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
    redirect: 'manual',
  };

  const upstream = await fetch(targetUrl, init);
  const upstreamHeaders = new Headers(upstream.headers);
  upstreamHeaders.set('Access-Control-Allow-Origin', '*');

  // 将响应透传（适配 JSON / 二进制 / 流）
  const body = await upstream.arrayBuffer();
  return new Response(body, {
    status: upstream.status,
    headers: upstreamHeaders,
  });
}