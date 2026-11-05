"use client";

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";

interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionResultItem;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface ISpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => ISpeechRecognitionInstance;

interface WindowWithSpeech extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

export interface UseSpeechRecognitionOptions {
  onTranscriptChange?: (transcript: string) => void;
  onFinalTranscript?: (finalText: string) => void;
  onError?: (errorMessage: string) => void;
  lang?: string;
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  resetTranscript: () => void;
}

function checkSpeechSupported(): boolean {
  if (typeof window === "undefined") return false;
  const win = window as unknown as WindowWithSpeech;
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

function subscribeToNothing(): () => void {
  return () => {};
}

export function useSpeechRecognition(options?: UseSpeechRecognitionOptions): UseSpeechRecognitionReturn {
  // Use useSyncExternalStore to evaluate browser support safely on client vs server
  const isSupported = useSyncExternalStore(
    subscribeToNothing,
    checkSpeechSupported,
    () => false
  );

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<ISpeechRecognitionInstance | null>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const win = window as unknown as WindowWithSpeech;
    const SpeechConstructor = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechConstructor) return;

    try {
      const recognition = new SpeechConstructor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = optionsRef.current?.lang || "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentTranscript = "";
        let finalTranscriptPiece = "";

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result && result[0]) {
            currentTranscript += result[0].transcript;
            if (result.isFinal) {
              finalTranscriptPiece += result[0].transcript;
            }
          }
        }

        setTranscript(currentTranscript);
        optionsRef.current?.onTranscriptChange?.(currentTranscript);

        if (finalTranscriptPiece) {
          optionsRef.current?.onFinalTranscript?.(finalTranscriptPiece.trim());
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        let userFriendlyMessage = "Speech recognition error.";
        switch (event.error) {
          case "not-allowed":
          case "service-not-allowed":
            userFriendlyMessage = "Microphone access was denied. Please allow microphone permission in your browser.";
            break;
          case "no-speech":
            userFriendlyMessage = "No speech detected. Please speak into your microphone.";
            break;
          case "audio-capture":
            userFriendlyMessage = "No microphone was found. Please check your audio input device.";
            break;
          case "network":
            userFriendlyMessage = "Speech recognition network error. Please check your connection.";
            break;
          case "aborted":
            return;
          default:
            userFriendlyMessage = `Speech error: ${event.error}`;
        }

        setError(userFriendlyMessage);
        setIsListening(false);
        optionsRef.current?.onError?.(userFriendlyMessage);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err: unknown) {
      console.warn("Failed to initialize SpeechRecognition:", err);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore abort errors
        }
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    setTranscript("");

    try {
      recognitionRef.current.start();
    } catch {
      try {
        recognitionRef.current.abort();
        setTimeout(() => {
          recognitionRef.current?.start();
        }, 100);
      } catch (e) {
        console.warn("SpeechRecognition start failed:", e);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      // Ignore stop errors
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
  };
}
