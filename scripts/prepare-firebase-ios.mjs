import { existsSync, copyFileSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const path = "ios/App/App/GoogleService-Info.plist";
if (!existsSync(path)) {
  copyFileSync("ios/App/App/GoogleService-Info.example.plist", path);
  console.log(
    "Using demo Firebase iOS config for guest builds. Supply your own plist for Google login.",
  );
}
// Add Google's scheme alongside the intentionally preserved com.phim.piano scheme.
const reversed = readFileSync(path, "utf8").match(
  /<key>REVERSED_CLIENT_ID<\/key>\s*<string>([^<]+)<\/string>/,
)?.[1];
if (
  !reversed ||
  !/^com\.googleusercontent\.apps\.[a-zA-Z0-9-]+$/.test(reversed)
)
  throw new Error("Missing or invalid Firebase reversed client ID");
const info = "ios/App/App/Info.plist";
function plist(command) {
  return execFileSync("/usr/libexec/PlistBuddy", ["-c", command, info], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}
try {
  plist("Print :CFBundleURLTypes:1");
} catch {
  plist("Add :CFBundleURLTypes:1 dict");
  plist("Add :CFBundleURLTypes:1:CFBundleURLName string firebase.google");
  plist("Add :CFBundleURLTypes:1:CFBundleURLSchemes array");
  plist("Add :CFBundleURLTypes:1:CFBundleURLSchemes:0 string placeholder");
}
plist(`Set :CFBundleURLTypes:1:CFBundleURLSchemes:0 ${reversed}`);
console.log(
  "Firebase Google URL scheme prepared; existing auth scheme preserved.",
);
