type SessionContext = {
  resumeText: string;
  jdText: string;
};

const store = new Map<string, SessionContext>();

export const setSessionContext = (sessionId: string, resumeText: string, jdText: string) => {
  store.set(sessionId, { resumeText, jdText });
};

export const getSessionContext = (sessionId: string): SessionContext => {
  return store.get(sessionId) || { resumeText: "", jdText: "" };
};

