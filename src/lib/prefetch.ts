import type { FetchQueryOptions, QueryClient, QueryKey } from "@tanstack/react-query";

export async function prefetchForSSR<
  TQueryFnData,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryClient: QueryClient,
  options: FetchQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): Promise<TData | undefined> {
  try {
    return await queryClient.ensureQueryData(options);
  } catch {
    queryClient.removeQueries({ queryKey: options.queryKey, exact: true });
    return undefined;
  }
}
