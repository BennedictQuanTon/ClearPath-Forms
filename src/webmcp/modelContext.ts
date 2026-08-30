export function getModelContext(): ModelContext | null {
  const fromDocument = document.modelContext;
  if (fromDocument && "registerTool" in fromDocument) {
    return fromDocument;
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
