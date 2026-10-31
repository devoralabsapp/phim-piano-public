import { test, expect } from "../vietnamese-fixture";
const record = {
  id: "22222222-2222-4222-8222-222222222222",
  lesson_id: "joy",
  started_at: new Date().toISOString(),
  active_seconds: 120,
  correct_notes: 15,
  wrong_notes: 0,
  completed: true,
  input_mode: "midi",
};
const guest = {
  ...record,
  id: "33333333-3333-4333-8333-333333333333",
  lesson_id: "keys",
};
async function createAccount(
  request: import("@playwright/test").APIRequestContext,
  sub: string,
) {
  const jwt = [
    Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url"),
    Buffer.from(
      JSON.stringify({
        sub,
        email: `${sub}@example.com`,
        email_verified: true,
        name: "Piano Learner",
        iss: "https://accounts.google.com",
        aud: "demo-client",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    ).toString("base64url"),
    "",
  ].join(".");
  const response = await request.post(
    "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=demo-key",
    {
      data: {
        postBody: `id_token=${jwt}&providerId=google.com`,
        requestUri: "http://localhost",
        returnSecureToken: true,
      },
    },
  );
  expect(response.ok()).toBe(true);
  return response.json();
}
async function restore(
  page: import("@playwright/test").Page,
  account: Record<string, string>,
) {
  await page.addInitScript(
    ({ account, guest }) => {
      localStorage.setItem(
        "firebase:authUser:demo-key:[DEFAULT]",
        JSON.stringify({
          uid: account.localId,
          isAnonymous: false,
          email: account.email,
          emailVerified: true,
          displayName: "Piano Learner",
          providerData: [
            {
              providerId: "google.com",
              uid: account.localId,
              isAnonymous: false,
              email: account.email,
              displayName: "Piano Learner",
            },
          ],
          stsTokenManager: {
            refreshToken: account.refreshToken,
            accessToken: account.idToken,
            expirationTime: Date.now() + 3600000,
          },
          apiKey: "demo-key",
          appName: "[DEFAULT]",
        }),
      );
      localStorage.setItem("phim:sessions:guest", JSON.stringify([guest]));
    },
    { account, guest },
  );
}
test("Firebase cloud progress is isolated; guest import is explicit and idempotent", async ({
  page,
  request,
}) => {
  const account = await createAccount(request, "piano-a");
  const uid = account.localId;
  const fields = Object.fromEntries(
    Object.entries(record).map(([k, v]) => [
      k,
      typeof v === "boolean"
        ? { booleanValue: v }
        : typeof v === "number"
          ? { integerValue: String(v) }
          : k === "started_at"
            ? { timestampValue: v }
            : { stringValue: v },
    ]),
  );
  const saved = await request.patch(
    `http://127.0.0.1:8080/v1/projects/demo-piano-sprout/databases/(default)/documents/users/${uid}/sessions/${record.id}`,
    { headers: { Authorization: "Bearer owner" }, data: { fields } },
  );
  expect(saved.ok()).toBe(true);
  await restore(page, account);
  await page.goto("/");
  await page.getByRole("button", { name: "Lộ trình học", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /Ode to Joy.*Đã hoàn thành/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Làm quen với phím đàn.*Đã hoàn thành/ }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Tài khoản & kết nối", exact: true })
    .click();
  await expect(page.getByText("piano-a@example.com")).toBeVisible();
  for (let i = 0; i < 2; i++) {
    await page
      .getByRole("button", { name: "Nhập tiến độ đã học ở chế độ khách" })
      .click();
    await expect(
      page.locator(".settings-layout").getByText("Đã đồng bộ", { exact: true }),
    ).toBeVisible();
  }
  await expect
    .poll(
      async () =>
        JSON.parse(
          await page.evaluate(
            (k) => localStorage.getItem(k) || "[]",
            `phim:sessions:${uid}`,
          ),
        ).length,
    )
    .toBe(2);
  await expect
    .poll(async () => {
      const cloud = await request.get(
        `http://127.0.0.1:8080/v1/projects/demo-piano-sprout/databases/(default)/documents/users/${uid}/sessions`,
        { headers: { Authorization: "Bearer owner" } },
      );
      return (await cloud.json()).documents?.length ?? 0;
    })
    .toBe(2);
  await page.getByRole("button", { name: "Đăng xuất", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Tiếp tục với Google", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Lộ trình học", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /Làm quen với phím đàn.*Đã hoàn thành/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Ode to Joy.*Đã hoàn thành/ }),
  ).toHaveCount(0);
});
test("another Firebase account does not inherit local guest or previous account history", async ({
  page,
  request,
}) => {
  const account = await createAccount(request, "piano-b");
  await restore(page, account);
  await page.goto("/");
  await page.getByRole("button", { name: "Lộ trình học", exact: true }).click();
  await expect(page.getByRole("button", { name: /Đã hoàn thành/ })).toHaveCount(
    0,
  );
  await page
    .getByRole("button", { name: "Tài khoản & kết nối", exact: true })
    .click();
  await expect(page.getByText("piano-b@example.com")).toBeVisible();
  await expect(
    page.locator(".settings-layout").getByText("Đã đồng bộ", { exact: true }),
  ).toBeVisible();
});
test("Google login opens Firebase OAuth popup; closing it never creates a session", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Tài khoản & kết nối", exact: true })
    .click();
  const popupPromise = page.waitForEvent("popup");
  await page
    .getByRole("button", { name: "Tiếp tục với Google", exact: true })
    .click();
  const popup = await popupPromise;
  await expect.poll(() => popup.url()).toContain("9099");
  await popup.close();
  await expect(
    page.getByRole("button", { name: "Tiếp tục với Google", exact: true }),
  ).toBeEnabled({ timeout: 15000 });
  await expect(
    page.getByRole("button", { name: "Đăng xuất", exact: true }),
  ).toHaveCount(0);
});
