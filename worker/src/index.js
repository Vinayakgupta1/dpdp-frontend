export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/submissions" && request.method === "OPTIONS") {
      return cors(new Response(null, { status: 204 }));
    }

    if (url.pathname !== "/api/submissions" || request.method !== "POST") {
      return json({ error: "Not found" }, { status: 404 });
    }

    try {
      const form = await request.formData();
      const name = String(form.get("name") || "").trim();
      const email = String(form.get("email") || "").trim();
      const file = form.get("apk");

      if (!name || !email) {
        return json({ error: "Name and email are required" }, { status: 400 });
      }

      if (!(file instanceof File) || file.size === 0) {
        return json({ error: "An APK file is required" }, { status: 400 });
      }

      const MAX_SIZE = 100 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        return json({ error: "APK exceeds the 100 MB limit" }, { status: 413 });
      }

      const id = crypto.randomUUID();
      const prefix = `submissions/${id}`;
      const apkName = file.name || "app.apk";

      await env.SUBMISSIONS_BUCKET.put(
        `${prefix}/metadata.json`,
        JSON.stringify({
          id,
          name,
          email,
          apkName,
          apkSize: file.size,
          apkKey: `${prefix}/${apkName}`,
          status: "queued",
          createdAt: new Date().toISOString(),
        }),
        { httpMetadata: { contentType: "application/json" } }
      );

      await env.SUBMISSIONS_BUCKET.put(`${prefix}/${apkName}`, file.stream(), {
        httpMetadata: { contentType: file.type || "application/vnd.android.package-archive" },
      });

      return json({
        id,
        status: "queued",
        createdAt: new Date().toISOString(),
        apkName,
        apkSize: file.size,
        apkKey: `${prefix}/${apkName}`,
      }, { status: 201 });
    } catch (err) {
      return json({ error: "Submission failed" }, { status: 500 });
    }
  },
};

function cors(response) {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Access-Control-Max-Age", "86400");
  return new Response(response.body, { status: response.status, headers });
}

function json(body, init = {}) {
  return cors(
    new Response(JSON.stringify(body), {
      status: init.status ?? 200,
      headers: { "Content-Type": "application/json" },
    })
  );
}