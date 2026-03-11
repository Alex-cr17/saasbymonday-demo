import { fail, ok } from "@/lib/api/responses";

type DemoConvertPayload = {
  method?: "email" | "google";
  email?: string;
};

function getEmailDomain(email?: string): string | null {
  if (!email) return null;
  const idx = email.indexOf("@");
  if (idx === -1 || idx === email.length - 1) return null;
  return email.slice(idx + 1).toLowerCase();
}

export async function POST(req: Request) {
  let payload: DemoConvertPayload = {};

  try {
    payload = (await req.json()) as DemoConvertPayload;
  } catch {
    return fail("BAD_REQUEST", "Invalid JSON body", 400, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  console.info("[demo-convert-to-signup]", {
    method: payload.method ?? "unknown",
    emailDomain: getEmailDomain(payload.email),
  });

  return ok(
    { tracked: true },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
