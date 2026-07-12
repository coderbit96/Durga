import { handleApiError, okJson } from "@/server/api/responses";
import { listSuggestedRoutes } from "@/server/repositories/pujas";

function searchParamsToObject(searchParams: URLSearchParams) {
  return Object.fromEntries(searchParams.entries());
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const result = await listSuggestedRoutes(searchParamsToObject(url.searchParams));
    return okJson(result);
  } catch (error) {
    return handleApiError(error);
  }
}
