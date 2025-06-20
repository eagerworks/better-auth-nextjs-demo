// Shared form action initial states
export const FORM_INITIAL_STATE = {
  success: false,
  error: "",
  fieldErrors: {},
} as const;

// For actions that don't have field errors (like simple operations)
export const SIMPLE_ACTION_INITIAL_STATE = {
  success: false,
  error: "",
} as const;
