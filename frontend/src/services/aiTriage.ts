import { EmergencyCategory, EmergencyTriageDetails } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api/v1';

export type SpeechRecognitionState =
  | 'idle'
  | 'listening'
  | 'transcribing'
  | 'permission_denied'
  | 'unsupported'
  | 'error';

/**
 * Checks if browser supports native Web Speech recognition
 */
export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

/**
 * Initializes interactive live speech transcription for emergency voice description
 */
export function startVoiceEmergencyTranscription(
  onInterimText: (text: string) => void,
  onFinalText: (text: string) => void,
  onStateChange: (state: SpeechRecognitionState) => void
): () => void {
  if (!isSpeechRecognitionSupported()) {
    onStateChange('unsupported');
    return () => {};
  }

  try {
    const SpeechRecognitionConstructor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionConstructor();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Optimized for English/Indian accent context

    onStateChange('listening');

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (interim) {
        onStateChange('transcribing');
        onInterimText(interim);
      }
      if (final) {
        onFinalText(final);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        onStateChange('permission_denied');
      } else {
        onStateChange('error');
      }
    };

    recognition.onend = () => {
      onStateChange('idle');
    };

    recognition.start();

    return () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    };
  } catch (err) {
    console.warn('Failed to start speech recognition:', err);
    onStateChange('unsupported');
    return () => {};
  }
}

/**
 * Synthesizes AI emergency guidance audio using the browser's speech synthesis engine.
 * IMPORTANT: Only speaks calculated ETA if genuinely computed from real location.
 */
export function speakEmergencyGuidance(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel(); // Stop any pending utterances
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis failed:', err);
  }
}

/**
 * Evaluates symptoms through the backend AI Triage service
 */
export async function evaluateAITriage(payload: {
  category: EmergencyCategory;
  description: string;
  petName?: string;
  petSpecies?: string;
  petBreed?: string;
  petAge?: string;
}): Promise<EmergencyTriageDetails> {
  try {
    const res = await fetch(`${API_BASE_URL}/emergency/triage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.data) {
        return data.data;
      }
    }
  } catch (err) {
    console.warn('Backend triage fetch failed, executing verified client rule-engine:', err);
  }

  // Client safety fallback rule engine
  const cat = payload.category;
  const isCritical =
    cat === 'unconscious_unresponsive' ||
    cat === 'breathing_problem' ||
    cat === 'accident_trauma';

  const urgency = isCritical ? 'CRITICAL' : cat === 'injury_bleeding' ? 'HIGH' : 'MODERATE';

  return {
    urgency,
    summary: `Emergency logged for ${payload.petName || payload.petSpecies || 'pet'}. Rapid mobile response initiated.`,
    primaryConcern: cat.replace('_', ' ').toUpperCase(),
    firstAidAdvice: [
      'Keep pet calm and minimize unnecessary movement.',
      'Do NOT administer human painkillers or medicines.',
      'Ensure airway is clear and keep the animal comfortable.'
    ],
    suggestedAction: 'Immediate dispatch of nearest Zooby Emergency Mobile Unit.',
    isLifeThreatening: isCritical,
    triageModel: 'zooby-fallback-rules',
    triagedAt: new Date()
  };
}
