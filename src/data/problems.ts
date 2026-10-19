// The RFC 9457 problem types of the qyl API contract (`contracts/common/errors.tsp` in the
// qyl repository). A problem body's `type` member is `https://qyl.at/problems/<name>`, and
// this file is what that URI dereferences to: `src/pages/problems/[name].astro` renders one
// page per entry and `/problems/` lists them. A type added to the contract is added here
// before it is released, so a URI a server sends never 404s; a type the contract drops is
// deleted here.
export const problemTypeBase = "https://qyl.at/problems/";

export interface ProblemMember {
  name: string;
  type: string;
  description: string;
}

export interface ProblemType {
  /** Last segment of the `type` URI, and of the page route. */
  name: string;
  /** The `code` extension member: the same problem type as a short string. */
  code: string;
  /** The `title` member the contract declares. */
  title: string;
  /** The HTTP status the contract declares, repeated in the `status` member. */
  status: number;
  /** When a server reports this type. */
  summary: string;
  /** Members this type adds beyond the common ones. */
  members: readonly ProblemMember[];
  /** What the caller does with it. */
  action: string;
  /** A representative body. */
  example: Record<string, unknown>;
}

export function problemTypeUri(name: string): string {
  return `${problemTypeBase}${name}`;
}

// The members every problem carries, whatever its type.
export const commonMembers: readonly ProblemMember[] = [
  { name: "type", type: "string (URI)", description: "The problem type: one of the URIs on this page." },
  { name: "title", type: "string", description: "Short summary of the problem, written for people." },
  { name: "status", type: "integer", description: "The HTTP status of the response, repeated for a reader of the body." },
  { name: "detail", type: "string, optional", description: "Explanation specific to this occurrence, written for people." },
  { name: "instance", type: "string (URI reference), optional", description: "Identifies this occurrence." },
  { name: "code", type: "string", description: "Stable code of the problem type; names the same type as the URI." },
];

export const problems: readonly ProblemType[] = [
  {
    name: "validation-failed",
    code: "validation_failed",
    title: "Validation Failed",
    status: 400,
    summary: "The request failed validation.",
    members: [
      { name: "errors", type: "array", description: "Each rule the request broke." },
      { name: "errors[].field", type: "string", description: "The field or parameter that failed validation." },
      { name: "errors[].message", type: "string", description: "What is wrong with it." },
      { name: "errors[].code", type: "string", description: "The validation rule that failed, a dotted code such as limit.out_of_range." },
      { name: "errors[].rejected_value", type: "string, optional", description: "The rejected value, when it is safe to repeat." },
    ],
    action: "Correct the fields named in errors and send the request again. Repeating it unchanged yields the same answer.",
    example: {
      type: "https://qyl.at/problems/validation-failed",
      title: "Validation Failed",
      status: 400,
      detail: "Limit must be between 1 and 1000.",
      code: "validation_failed",
      errors: [{ field: "limit", message: "Limit must be between 1 and 1000.", code: "limit.out_of_range", rejected_value: "5000" }],
    },
  },
  {
    name: "unauthorized",
    code: "unauthorized",
    title: "Unauthorized",
    status: 401,
    summary: "The request carries no valid credential.",
    members: [],
    action: "Supply the credential the server expects and retry.",
    example: {
      type: "https://qyl.at/problems/unauthorized",
      title: "Unauthorized",
      status: 401,
      detail: "The request carries no valid credential.",
      code: "unauthorized",
    },
  },
  {
    name: "forbidden",
    code: "forbidden",
    title: "Forbidden",
    status: 403,
    summary: "The credential is valid but not allowed to do this.",
    members: [
      { name: "required_permission", type: "string, optional", description: "The permission the credential lacks: the Collector names the API-key role (read, write or delete)." },
    ],
    action: "Retrying with the same credential yields the same answer. Use a key that carries the role named in required_permission.",
    example: {
      type: "https://qyl.at/problems/forbidden",
      title: "Forbidden",
      status: 403,
      detail: "The API key lacks the delete role.",
      code: "forbidden",
      required_permission: "delete",
    },
  },
  {
    name: "not-found",
    code: "not_found",
    title: "Not Found",
    status: 404,
    summary: "The addressed resource does not exist.",
    members: [
      { name: "resource_type", type: "string, optional", description: "The kind of resource that was not found." },
      { name: "resource_id", type: "string, optional", description: "The identifier that was not found." },
    ],
    action: "Check the identifier. resource_type and resource_id, when present, name what was looked up.",
    example: {
      type: "https://qyl.at/problems/not-found",
      title: "Not Found",
      status: 404,
      code: "not_found",
      resource_type: "trace",
      resource_id: "4bf92f3577b34da6a3ce929d0e0e4736",
    },
  },
  {
    name: "conflict",
    code: "conflict",
    title: "Conflict",
    status: 409,
    summary: "The request conflicts with the current state of a resource.",
    members: [
      { name: "conflicting_resource", type: "string, optional", description: "What conflicts: a saved-query name already in use, a reused Idempotency-Key, or a metric." },
    ],
    action: "For a saved-query name, choose another name or update the existing query. For a reused Idempotency-Key with a different body, send a new key. For a metric, narrow the query to one instrument.",
    example: {
      type: "https://qyl.at/problems/conflict",
      title: "Conflict",
      status: 409,
      detail: "A saved query with this name already exists in the project.",
      code: "conflict",
      conflicting_resource: "checkout errors",
    },
  },
  {
    name: "precondition-failed",
    code: "precondition_failed",
    title: "Precondition Failed",
    status: 412,
    summary: "The If-Match entity tag is no longer current.",
    members: [
      { name: "current_etag", type: "string, optional", description: "Entity tag of the current version, when the caller may read it." },
    ],
    action: "The resource changed since you read it. Read it again, take its current entity tag (also in current_etag when the server may reveal it) and resubmit with that tag in If-Match.",
    example: {
      type: "https://qyl.at/problems/precondition-failed",
      title: "Precondition Failed",
      status: 412,
      detail: "If-Match does not name the current version. Read the resource again and retry with its etag.",
      code: "precondition_failed",
      current_etag: '"7c1d9e"',
    },
  },
  {
    name: "precondition-required",
    code: "precondition_required",
    title: "Precondition Required",
    status: 428,
    summary: "The request must send If-Match.",
    members: [
      { name: "required_header", type: '"If-Match", optional', description: "The header the request must carry." },
    ],
    action: "Read the resource first, then repeat the request with its entity tag in If-Match.",
    example: {
      type: "https://qyl.at/problems/precondition-required",
      title: "Precondition Required",
      status: 428,
      detail: "Send the etag of the version being changed in If-Match.",
      code: "precondition_required",
      required_header: "If-Match",
    },
  },
  {
    name: "internal-error",
    code: "internal_error",
    title: "Internal Server Error",
    status: 500,
    summary: "The server failed while handling the request.",
    members: [],
    action: "Retry later. When the Collector fails unexpectedly, its 500 carries an X-Trace-Id header; quote it when you report the failure.",
    example: {
      type: "https://qyl.at/problems/internal-error",
      title: "Internal Server Error",
      status: 500,
      code: "internal_error",
    },
  },
  {
    name: "service-unavailable",
    code: "service_unavailable",
    title: "Service Unavailable",
    status: 503,
    summary: "The server cannot take the request at present.",
    members: [
      { name: "reason", type: "string, optional", description: "Why, as a dotted code: collector.log_stream_capacity, analysis.scan_budget_exceeded or runner.shutting_down." },
    ],
    action: "Retry later; for analysis.scan_budget_exceeded, narrow the window or filters first. The Collector also sends this type with HTTP 504 and the title Analysis deadline exceeded when an analysis runs out of time.",
    example: {
      type: "https://qyl.at/problems/service-unavailable",
      title: "Service Unavailable",
      status: 503,
      detail: "The collector cannot accept this operation at present. Retry later.",
      code: "service_unavailable",
      reason: "analysis.scan_budget_exceeded",
    },
  },
] as const;
