import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./lib/auth";

const MANAGERS = ["HEAD_ADMIN", "HEAD_BDG", "ADMIN", "SUPER_ADMIN"];
const INTERNAL = [...MANAGERS, "BDG", "CPD", "IMD", "TMD", "IPU", "URDIP", "ICM", "LAB_BD", "PI"];
const USER_ONLY = [];
const LAB_ONLY = ["/lab-dashboard"];
const MANAGER_ONLY = ["/head-admin", "/head-bdg", "/lab-monitoring"];
const INTERNAL_ONLY = ["/governance-dashboard"];
const ADMIN_ONLY = ["/admin"];
const ANY_AUTH = ["/workspace", "/ficci", "/module1", "/ai-intake", "/workflow-tracker", "/co-development", "/mou-repository", "/notifications", "/search", "/projects", "/master-technologies", "/monthly-reporting", "/quarterly-reporting", "/sop-roadmap", "/sop-data-entry", "/raci-access", "/sop-parameters", "/excel-templates", "/queries", "/reports"];
const LAB_PAGE_ACCESS = ["/lab-dashboard", "/sop-data-entry", "/master-technologies", "/module1", "/workflow-tracker", "/queries", "/notifications", "/platform-flow", "/projects", "/module2", "/module3", "/co-development", "/mou-repository", "/commercial-engagements"];
const INDUSTRY_PAGES = ["/industry", "/module2", "/module3", "/notifications"];
LAB_PAGE_ACCESS.push("/monthly-reporting", "/quarterly-reporting", "/lab-profiles");
ANY_AUTH.push("/lab-profiles");
const INDUSTRY_APIS = ["/api/auth", "/api/industry-catalog", "/api/problem-statements", "/api/partnerships", "/api/notifications"];
const PUBLIC_APIS = ["/api/auth/login", "/api/auth/register", "/api/lab-auth/login", "/api/lab-auth/register", "/api/lab-auth/forgot-password", "/api/lab-auth/reset-password"];
const LAB_API_PREFIXES = ["/api/workspace-overview", "/api/lab-auth", "/api/technologies", "/api/technology-revisions", "/api/intake", "/api/change-requests", "/api/documents", "/api/labs", "/api/co-development", "/api/mous", "/api/search", "/api/notifications", "/api/projects", "/api/reports", "/api/queries", "/api/references", "/api/sop", "/api/parameters", "/api/excel", "/api/sop-data", "/api/sop-records", "/api/evidence"];

function matches(pathname, prefixes) { return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)); }
function firstHeaderValue(req, name) { return req.headers.get(name)?.split(",")[0]?.trim() || null; }
function normalizedOrigin(value) {
  try { return new URL(value).origin; } catch { return null; }
}
function requestOrigins(req) {
  const origins = new Set([normalizedOrigin(req.url), normalizedOrigin(req.nextUrl.origin)].filter(Boolean));
  const protocol = firstHeaderValue(req, "x-forwarded-proto") || req.nextUrl.protocol.replace(":", "");
  for (const host of [firstHeaderValue(req, "x-forwarded-host"), firstHeaderValue(req, "host")].filter(Boolean)) {
    const forwardedOrigin = normalizedOrigin(protocol + "://" + host);
    if (forwardedOrigin) origins.add(forwardedOrigin);
  }
  return origins;
}
function isSameRequestOrigin(req) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const normalized = normalizedOrigin(origin);
  if (normalized && requestOrigins(req).has(normalized)) return true;

  // Quick Cloudflare tunnels terminate HTTPS before forwarding to the local
  // development server and may omit the public host from forwarded headers.
  // This exception is intentionally limited to HTTPS TryCloudflare in dev.
  if (process.env.NODE_ENV !== "production" && normalized) {
    const originUrl = new URL(normalized);
    if (originUrl.protocol === "https:" && originUrl.hostname.endsWith(".trycloudflare.com")) return true;
  }

  return false;
}

function secureHeaders(response) {
  response.headers.set("X-Content-Type-Options", "nosniff"); response.headers.set("X-Frame-Options", "DENY"); response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin"); response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Content-Security-Policy", "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"); return response;
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api/") && !["GET", "HEAD", "OPTIONS"].includes(req.method) && !isSameRequestOrigin(req)) return secureHeaders(NextResponse.json({ error: "Cross-site request blocked." }, { status: 403 }));
  const token = req.cookies.get(SESSION_COOKIE)?.value; const session = token ? await verifySessionToken(token) : null; if (session && !session.type) session.type = "user";
  if (pathname.startsWith("/api/") && !matches(pathname, PUBLIC_APIS)) {
    if (session?.type === "lab" && pathname === "/api/lab-profiles") return secureHeaders(NextResponse.next());
    if (!session) return secureHeaders(NextResponse.json({ error: "Login required." }, { status: 401 }));
    if (session.role === "APPLICANT" && !matches(pathname, INDUSTRY_APIS)) return secureHeaders(NextResponse.json({ error: "This area is for CSIR internal users." }, { status: 403 }));
    if (session.type === "lab" && matches(pathname, ["/api/auth/me", "/api/problem-statements", "/api/partnerships", "/api/proposals", "/api/commercial-engagements"])) return secureHeaders(NextResponse.next());
    if (session.type === "lab" && !matches(pathname, LAB_API_PREFIXES)) return secureHeaders(NextResponse.json({ error: "Access denied." }, { status: 403 }));
    return secureHeaders(NextResponse.next());
  }
  if (session?.role === "APPLICANT" && !matches(pathname, [...INDUSTRY_PAGES, "/login", "/governance-login", "/register"]) && !pathname.includes(".")) return secureHeaders(NextResponse.redirect(new URL("/industry", req.url)));
  const protectedPage = matches(pathname, [...USER_ONLY, ...LAB_ONLY, ...MANAGER_ONLY, ...INTERNAL_ONLY, ...ADMIN_ONLY, ...ANY_AUTH, "/module2", "/module3", "/industry", "/commercial-engagements", "/industry-matchmaking"]); if (!protectedPage) return secureHeaders(NextResponse.next());
  if (!session) { const login = new URL(pathname.startsWith("/governance") ? "/governance-login" : "/login", req.url); login.searchParams.set("next", pathname); return secureHeaders(NextResponse.redirect(login)); }
  if (session.type === "lab" && !matches(pathname, LAB_PAGE_ACCESS)) return secureHeaders(NextResponse.redirect(new URL("/lab-dashboard", req.url)));
  if (matches(pathname, LAB_ONLY) && session.type !== "lab") return secureHeaders(NextResponse.redirect(new URL("/workspace", req.url)));
  if (matches(pathname, USER_ONLY) && session.type !== "user") return secureHeaders(NextResponse.redirect(new URL("/workspace", req.url)));
  if (matches(pathname, MANAGER_ONLY) && (session.type !== "user" || !MANAGERS.includes(session.role))) return secureHeaders(NextResponse.redirect(new URL("/workspace", req.url)));
  if (matches(pathname, INTERNAL_ONLY) && (session.type !== "user" || !INTERNAL.includes(session.role))) return secureHeaders(NextResponse.redirect(new URL("/workspace", req.url)));
  if (matches(pathname, ADMIN_ONLY) && (session.type !== "user" || !["ADMIN", "SUPER_ADMIN"].includes(session.role))) return secureHeaders(NextResponse.redirect(new URL("/workspace", req.url)));
  return secureHeaders(NextResponse.next());
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|csir-logo.png).*)"] };
