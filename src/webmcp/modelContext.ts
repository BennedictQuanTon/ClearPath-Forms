export function getModelContext(): ModelContext | null {
  if (document.modelContext && "registerTool" in document.modelContext) {
    return document.modelContext;
  }
  const fromNavigator = navigator.modelContext;
  if (fromNavigator && "registerTool" in fromNavigator) {
    return fromNavigator;
  }
  return null;
}

export function toolResult(payload: unknown): string {
  return typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
}

/** Imperative WebMCP registration. Official Rules require this call in the repo. */
export async function registerToolWithWebMcp(
  tool: ModelContextTool,
  options?: { signal?: AbortSignal },
): Promise<void> {
  if (document.modelContext && "registerTool" in document.modelContext) {
    await document.modelContext.registerTool(tool, options);
    return;
  }
  const fallback = navigator.modelContext;
  if (fallback && "registerTool" in fallback) {
    await fallback.registerTool(tool, options);
  }
}
