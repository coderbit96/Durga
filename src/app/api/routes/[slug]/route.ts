import { handleApiError, okJson } from "@/server/api/responses";
import { getSuggestedRouteBySlug } from "@/server/repositories/pujas";

function searchParamsToObject(searchParams: URLSearchParams) {
  return Object.fromEntries(searchParams.entries());
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const url = new URL(request.url);
    const result = await getSuggestedRouteBySlug(
      slug,
      searchParamsToObject(url.searchParams),
    );
    return okJson(result);
  } catch (error) {
    return handleApiError(error);
  }
}
