// The RFC 9457 problem types a qyl server reports. Every problem body's `type`
// member is `https://qyl.at/problems/<name>`, and this file is what that URI
// dereferences to: `src/pages/problems/[name].astro` renders one page per entry
// and `/problems/` lists them. The qyl API contract fixes the same names, codes,
// titles and statuses in `contracts/common/errors.tsp` in the qyl repository; a type
// added there is added here before it is released, so a URI a server sends never 404s.
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
  /** The `title` member, the same for every occurrence. */
  title: string;
  /** The HTTP status, repeated in the `status` member. */
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
  { name: "title", type: "string", description: "Short summary of the problem type, the same for every occurrence." },
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
      { name: "errors[].code", type: "string", description: "The validation rule that failed." },
      { name: "errors[].rejected_value", type: "string, optional", description: "The rejected value, when it is safe to repeat." },
    ],
    action: "Correct the fields named in errors and send the request again. Repeating it unchanged yields the same answer.",
    example: {
      type: "https://qyl.at/problems/validation-failed",
      title: "Validation Failed",
      status: 400,
      detail: "limit must be between 1 and 1000.",
      code: "validation_failed",
      errors: [{ field: "limit", message: "must be between 1 and 1000", code: "range", rejected_value: "5000" }],
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
      { name: "required_permission", type: "string, optional", description: "The permission the credential lacks." },
    ],
    action: "Retrying with the same credential yields the same answer. Obtain one that carries the permission named in required_permission, when it is present.",
    example: {
      type: "https://qyl.at/problems/forbidden",
      title: "Forbidden",
      status: 403,
      detail: "Deleting an annotation requires qyl:delete.",
      code: "forbidden",
      required_permission: "qyl:delete",
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
      detail: "No trace with this id is recorded.",
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
      { name: "conflicting_resource", type: "string, optional", description: "The identifier of the conflicting resource." },
    ],
    action: "Read the current state of the resource named in conflicting_resource and resubmit against it.",
    example: {
      type: "https://qyl.at/problems/conflict",
      title: "Conflict",
      status: 409,
      detail: "A saved query with this name already exists.",
      code: "conflict",
      conflicting_resource: "sq_01j9x4k7m2",
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
      detail: "The annotation was updated after the version you sent.",
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
      detail: "Updates require If-Match with the entity tag you read.",
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
    action: "Retry later. The collector's 500 carries an X-Trace-Id header when a trace of the failure was recorded; quote it when you report the failure.",
    example: {
      type: "https://qyl.at/problems/internal-error",
      title: "Internal Server Error",
      status: 500,
      code: "internal_error",
    },
  },
  {
    name: "bad-gateway",
    code: "bad_gateway",
    title: "Bad Gateway",
    status: 502,
    summary: "An upstream dependency failed while the server handled the request.",
    members: [
      { name: "dependency", type: "string, optional", description: "Stable dependency category; never raw exception text." },
    ],
    action: "Retry later. dependency is a stable category of the failing dependency, not a message to parse.",
    example: {
      type: "https://qyl.at/problems/bad-gateway",
      title: "Bad Gateway",
      status: 502,
      code: "bad_gateway",
      dependency: "storage",
    },
  },
  {
    name: "service-unavailable",
    code: "service_unavailable",
    title: "Service Unavailable",
    status: 503,
    summary: "The server cannot take the request at present.",
    members: [
      { name: "reason", type: '"maintenance" | "overloaded" | "dependency_failure", optional', description: "Why the server is unavailable." },
    ],
    action: "Retry later. reason says whether the server is in maintenance, overloaded or waiting on a dependency.",
    example: {
      type: "https://qyl.at/problems/service-unavailable",
      title: "Service Unavailable",
      status: 503,
      code: "service_unavailable",
      reason: "overloaded",
    },
  },
] as const;
