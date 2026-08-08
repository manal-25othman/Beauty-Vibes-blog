import "server-only";

/**
 * طبقة تجريد لمزوّد النشرة البريدية.
 *
 * المشتركون يُحفظون دائمًا في قاعدة البيانات — وهي مصدر الحقيقة —
 * ثم تُحاول المزامنة مع المزوّد الخارجي. فشل المزامنة لا يُفشل الاشتراك،
 * لأن العنوان محفوظ ويمكن إعادة المزامنة لاحقًا.
 *
 * لإضافة مزوّد جديد: أضيفي حالة إلى `syncSubscriber` وحدّثي .env.example.
 */

export type EmailProvider = "none" | "mailchimp" | "brevo" | "convertkit";

export type SyncResult =
  | { ok: true; provider: EmailProvider; skipped?: boolean }
  | { ok: false; provider: EmailProvider; error: string };

function currentProvider(): EmailProvider {
  const raw = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (raw === "mailchimp" || raw === "brevo" || raw === "convertkit") return raw;
  return "none";
}

export async function syncSubscriber(email: string): Promise<SyncResult> {
  const provider = currentProvider();
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY?.trim();
  const listId = process.env.EMAIL_PROVIDER_LIST_ID?.trim();

  if (provider === "none" || !apiKey) {
    return { ok: true, provider, skipped: true };
  }

  try {
    switch (provider) {
      case "brevo":
        return await syncBrevo(email, apiKey, listId);
      case "convertkit":
        return await syncConvertKit(email, apiKey, listId);
      case "mailchimp":
        return await syncMailchimp(email, apiKey, listId);
      default:
        return { ok: true, provider, skipped: true };
    }
  } catch (error) {
    return {
      ok: false,
      provider,
      error: error instanceof Error ? error.message : "خطأ غير معروف",
    };
  }
}

async function syncBrevo(
  email: string,
  apiKey: string,
  listId?: string,
): Promise<SyncResult> {
  const response = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      updateEnabled: true,
      ...(listId ? { listIds: [Number(listId)] } : {}),
    }),
  });

  // 204 يعني أن العنوان موجود مسبقًا وتم تحديثه — وهي حالة نجاح لا فشل.
  if (!response.ok && response.status !== 204) {
    return { ok: false, provider: "brevo", error: `HTTP ${response.status}` };
  }
  return { ok: true, provider: "brevo" };
}

async function syncConvertKit(
  email: string,
  apiKey: string,
  formId?: string,
): Promise<SyncResult> {
  if (!formId) {
    return {
      ok: false,
      provider: "convertkit",
      error: "EMAIL_PROVIDER_LIST_ID مطلوب (معرّف النموذج)",
    };
  }

  const response = await fetch(
    `https://api.convertkit.com/v3/forms/${encodeURIComponent(formId)}/subscribe`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey, email }),
    },
  );

  if (!response.ok) {
    return { ok: false, provider: "convertkit", error: `HTTP ${response.status}` };
  }
  return { ok: true, provider: "convertkit" };
}

async function syncMailchimp(
  email: string,
  apiKey: string,
  listId?: string,
): Promise<SyncResult> {
  if (!listId) {
    return {
      ok: false,
      provider: "mailchimp",
      error: "EMAIL_PROVIDER_LIST_ID مطلوب (معرّف الجمهور)",
    };
  }

  // مفتاح Mailchimp ينتهي بلاحقة المنطقة، مثل: abc123-us21
  const datacenter = apiKey.split("-")[1];
  if (!datacenter) {
    return {
      ok: false,
      provider: "mailchimp",
      error: "صيغة مفتاح Mailchimp غير صحيحة",
    };
  }

  const response = await fetch(
    `https://${datacenter}.api.mailchimp.com/3.0/lists/${encodeURIComponent(listId)}/members`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email_address: email, status: "subscribed" }),
    },
  );

  if (!response.ok && response.status !== 400) {
    return { ok: false, provider: "mailchimp", error: `HTTP ${response.status}` };
  }
  return { ok: true, provider: "mailchimp" };
}
