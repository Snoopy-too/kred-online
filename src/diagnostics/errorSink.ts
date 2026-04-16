type Handler = (err: { message: string; stack?: string; source?: string }) => void;

let currentHandler: Handler = () => {};

export function setErrorHandler(h: Handler) {
  currentHandler = h;
}

export function reportDiagnosticError(err: { message: string; stack?: string; source?: string }) {
  try {
    currentHandler(err);
  } catch {
    // never let the sink itself throw
  }
}
