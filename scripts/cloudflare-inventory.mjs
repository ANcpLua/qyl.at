import { mkdir, writeFile } from "node:fs/promises";

// Read only. Credentials stay in the deployment environment; the report contains
// resource identifiers and capability results, never headers or secret values.
const token = process.env.CLOUDFLARE_API_TOKEN;
const account = process.env.CLOUDFLARE_ACCOUNT_ID;
if (!token || !account) throw new Error("Cloudflare deployment credentials are required");

async function get(path) {
  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(20_000),
    redirect: "error",
  });
  const body = await response.json();
  return {
    status: response.status,
    success: body.success === true,
    errorCodes: (body.errors ?? []).map((error) => error.code),
    result: body.success === true ? body.result : undefined,
    resultInfo: body.result_info,
  };
}

function summarize(response, select) {
  return {
    status: response.status,
    success: response.success,
    errorCodes: response.errorCodes,
    ...(response.success ? { resources: select(response.result) } : {}),
    ...(response.resultInfo ? { pagination: response.resultInfo } : {}),
  };
}

const prefix = `/accounts/${encodeURIComponent(account)}`;
const [scripts, domains, apps, organization, buckets, ...zones] = await Promise.all([
  get(`${prefix}/workers/scripts`),
  get(`${prefix}/workers/domains`),
  get(`${prefix}/access/apps?per_page=100`),
  get(`${prefix}/access/organizations`),
  get(`${prefix}/r2/buckets`),
  ...["qyl.at", "otel.cc"].map((name) => get(`/zones?name=${name}&account.id=${account}`)),
]);

const dns = [];
for (const zone of zones) {
  if (!zone.success) continue;
  for (const item of zone.result) {
    const names = item.name === "qyl.at" ? ["mcp.qyl.at", "api.qyl.at"] : ["logs.otel.cc"];
    for (const name of names) {
      const records = await get(`/zones/${item.id}/dns_records?name=${name}`);
      dns.push({ name, ...summarize(records, (items) => items.map(({ id, type, content, proxied }) => ({ id, type, content, proxied }))) });
    }
  }
}

const report = {
  checkedAt: new Date().toISOString(),
  workers: summarize(scripts, (items) => items.map(({ id }) => ({ name: id }))),
  workerDomains: summarize(domains, (items) => items.map(({ hostname, service, environment }) => ({ hostname, service, environment }))),
  accessApplications: summarize(apps, (items) => items.map(({ id, name, type, domain, aud, oauth_configuration: oauth }) => ({
    id, name, type, domain, aud,
    oauth: oauth ? {
      enabled: oauth.enabled,
      allowLoopback: oauth.dynamic_client_registration?.allow_any_on_loopback,
      allowLocalhost: oauth.dynamic_client_registration?.allow_any_on_localhost,
      allowedRedirectUris: oauth.dynamic_client_registration?.allowed_uris,
      accessTokenLifetime: oauth.grant?.access_token_lifetime,
      sessionDuration: oauth.grant?.session_duration,
    } : undefined,
  }))),
  accessOrganization: summarize(organization, ({ auth_domain }) => ({ authDomain: auth_domain })),
  buckets: summarize(buckets, (result) => (result.buckets ?? []).map(({ name }) => ({ name }))),
  zones: zones.map((zone) => summarize(zone, (items) => items.map(({ id, name, status }) => ({ id, name, status })))),
  dns,
};
await mkdir("evidence", { recursive: true });
await writeFile("evidence/cloudflare-inventory.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
