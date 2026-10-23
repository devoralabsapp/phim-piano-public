import { test, expect } from "../vietnamese-fixture";
const userId = "11111111-1111-4111-8111-111111111111";
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
test("signed-in cloud progress stays separate from guest and imports only on request", async ({
  page,
}) => {
  const user = {
    id: userId,
    aud: "authenticated",
    role: "authenticated",
    email: "piano@example.com",
    created_at: new Date().toISOString(),
    app_metadata: { provider: "google" },
    user_metadata: { full_name: "Piano Learner" },
  };
  const token = [
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
      "base64url",
    ),
    Buffer.from(
      JSON.stringify({
        sub: userId,
        aud: "authenticated",
        role: "authenticated",
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    ).toString("base64url"),
    "test",
  ].join(".");
  await page.addInitScript(
    ({ user, token, guest }) => {
      localStorage.setItem(
        "sb-auth-test-auth-token",
        JSON.stringify({
          access_token: token,
          refresh_token: "test-refresh",
          token_type: "bearer",
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          expires_in: 3600,
          user,
        }),
      );
      localStorage.setItem("phim:sessions:guest", JSON.stringify([guest]));
    },
    { user, token, guest },
  );
  const uploads: unknown[] = [];
  await page.route("https://auth-test.supabase.co/**", async (route) => {
    const request = route.request(),
      path = new URL(request.url()).pathname;
    if (path === "/rest/v1/practice_sessions") {
      if (request.method() === "GET")
        await route.fulfill({ json: [{ ...record, user_id: userId }] });
      else {
        uploads.push(request.postDataJSON());
        await route.fulfill({ status: 201, json: [] });
      }
    } else if (path === "/auth/v1/settings")
      await route.fulfill({ json: { external: { google: true } } });
    else if (path === "/auth/v1/user") await route.fulfill({ json: user });
    else if (path === "/auth/v1/logout") await route.fulfill({ status: 204 });
    else await route.fulfill({ json: {} });
  });
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
  await expect(page.getByText("piano@example.com")).toBeVisible();
  await page
    .getByRole("button", { name: "Nhập tiến độ đã học ở chế độ khách" })
    .click();
  await expect
    .poll(async () =>
      page.evaluate(
        () =>
          JSON.parse(
            localStorage.getItem(
              "phim:sessions:11111111-1111-4111-8111-111111111111",
            ) || "[]",
          ).length,
      ),
    )
    .toBe(2);
  expect(uploads.length).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Đăng xuất", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Tiếp tục với Google" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Lộ trình học", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /Làm quen với phím đàn.*Đã hoàn thành/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Ode to Joy.*Đã hoàn thành/ }),
  ).toHaveCount(0);
});
test("Google login creates PKCE redirect rather than a fake session", async ({
  page,
}) => {
  await page.route("https://auth-test.supabase.co/auth/v1/settings", (route) =>
    route.fulfill({ json: { external: { google: true } } }),
  );
  let authURL = "";
  await page.route(
    "https://auth-test.supabase.co/auth/v1/authorize**",
    async (route) => {
      authURL = route.request().url();
      await route.fulfill({
        contentType: "text/html",
        body: "<h1>Google OAuth destination (test stub)</h1>",
      });
    },
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "Tài khoản & kết nối", exact: true })
    .click();
  await page.getByRole("button", { name: "Tiếp tục với Google" }).click();
  await expect(
    page.getByRole("heading", { name: "Google OAuth destination (test stub)" }),
  ).toBeVisible();
  const url = new URL(authURL);
  expect(url.searchParams.get("provider")).toBe("google");
  expect(url.searchParams.get("code_challenge_method")?.toLowerCase()).toBe(
    "s256",
  );
  expect(url.searchParams.get("code_challenge")).toBeTruthy();
  expect(url.searchParams.get("redirect_to")).toBe(
    "http://127.0.0.1:5174/auth/callback",
  );
});

test("disabled Google provider keeps guest learning available and can be checked again", async ({
  page,
}) => {
  let enabled = false;
  await page.route("https://auth-test.supabase.co/auth/v1/settings", (route) =>
    route.fulfill({ json: { external: { google: enabled } } }),
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "Tài khoản & kết nối", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Tiếp tục với Google", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByText(
      "Đăng nhập Google chưa được bật. Bạn vẫn có thể học ở chế độ khách.",
    ),
  ).toBeVisible();
  enabled = true;
  await page
    .getByRole("button", { name: "Kiểm tra lại đăng nhập", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Tiếp tục với Google", exact: true }),
  ).toBeEnabled();
});
test("sign-in service failures are recoverable without losing guest progress", async ({
  page,
}) => {
  let failing = true;
  await page.route(
    "https://auth-test.supabase.co/auth/v1/settings",
    async (route) => {
      if (failing) await route.abort();
      else await route.fulfill({ json: { external: { google: true } } });
    },
  );
  await page.addInitScript(
    (guest) =>
      localStorage.setItem("phim:sessions:guest", JSON.stringify([guest])),
    guest,
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "Tài khoản & kết nối", exact: true })
    .click();
  await expect(
    page.getByText("Chưa kết nối được dịch vụ đăng nhập. Hãy thử lại."),
  ).toBeVisible();
  failing = false;
  await page
    .getByRole("button", { name: "Kiểm tra lại đăng nhập", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Tiếp tục với Google", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Lộ trình học", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /Làm quen với phím đàn.*Đã hoàn thành/ }),
  ).toBeVisible();
});
