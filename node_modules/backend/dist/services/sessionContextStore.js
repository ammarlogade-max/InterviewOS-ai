"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionContext = exports.setSessionContext = void 0;
const store = new Map();
const setSessionContext = (sessionId, resumeText, jdText) => {
    store.set(sessionId, { resumeText, jdText });
};
exports.setSessionContext = setSessionContext;
const getSessionContext = (sessionId) => {
    return store.get(sessionId) || { resumeText: "", jdText: "" };
};
exports.getSessionContext = getSessionContext;
