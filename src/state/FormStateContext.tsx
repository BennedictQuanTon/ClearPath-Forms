import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import type { FormAction, FormState } from "../types/form";
import { formReducer, loadPersistedState, persistState } from "./formReducer";

interface FormContextValue {
  state: FormState;
  dispatch: Dispatch<FormAction>;
}

const FormStateContext = createContext<FormContextValue | null>(null);

export function FormStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(formReducer, undefined, loadPersistedState);

  useEffect(() => {
    persistState(state);
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <FormStateContext.Provider value={value}>{children}</FormStateContext.Provider>;
}

export function useFormState(): FormContextValue {
  const context = useContext(FormStateContext);
  if (!context) {
    throw new Error("useFormState must be used inside FormStateProvider");
  }
  return context;
}
