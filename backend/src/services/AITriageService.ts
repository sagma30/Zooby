import { EmergencyCategory, EmergencyTriageDetails, EmergencyUrgency } from '../models/EmergencyIncident';

export interface TriageInput {
  category: EmergencyCategory;
  description: string;
  petName?: string;
  petSpecies?: string;
  petBreed?: string;
  petAge?: string;
}

export class AITriageService {
  /**
   * Evaluates veterinary emergency symptoms and determines rapid triage category.
   * STRICT SAFETY RULE: Does not diagnose diseases or prescribe medication.
   * Categorizes urgency and provides immediate general pet stabilization safety guidance.
   */
  async evaluateTriage(input: TriageInput): Promise<EmergencyTriageDetails> {
    const text = (input.description || '').toLowerCase();
    const category = input.category;
    const species = input.petSpecies || 'Pet';

    // 1. Check for Critical life-threatening emergency cues
    const isCritical =
      category === 'unconscious_unresponsive' ||
      category === 'breathing_problem' ||
      category === 'accident_trauma' ||
      text.includes('unconscious') ||
      text.includes('not breathing') ||
      text.includes('hit by car') ||
      text.includes('hit by vehicle') ||
      text.includes('heavy bleeding') ||
      text.includes('seizure') ||
      text.includes('choking') ||
      text.includes('collapsed') ||
      text.includes('poison');

    // 2. Determine Urgency
    let urgency: EmergencyUrgency = 'MODERATE';
    let isLifeThreatening = false;

    if (isCritical) {
      urgency = 'CRITICAL';
      isLifeThreatening = true;
    } else if (
      category === 'injury_bleeding' ||
      category === 'possible_poisoning' ||
      category === 'severe_pain' ||
      text.includes('bleeding') ||
      text.includes('pain') ||
      text.includes('vomit') ||
      text.includes('fracture')
    ) {
      urgency = 'HIGH';
    } else if (category === 'severe_illness' || category === 'lost_injured_animal') {
      urgency = 'MODERATE';
    } else {
      urgency = 'LOW';
    }

    // 3. Formulate Safe First Aid Advice & Summary
    const firstAidAdvice: string[] = [];
    let summary = '';
    let primaryConcern = '';
    let suggestedAction = '';

    switch (category) {
      case 'injury_bleeding':
        primaryConcern = 'Active bleeding or laceration';
        firstAidAdvice.push('Apply gentle, steady pressure with a clean cloth or sterile gauze.');
        firstAidAdvice.push('Do NOT apply a tight tourniquet unless instructed by a veterinarian.');
        firstAidAdvice.push(`Keep ${species} calm, warm, and minimize movement.`);
        suggestedAction = 'Immediate dispatch of Zooby Emergency Mobile Unit with trauma kit.';
        summary = `Reported wound with bleeding on ${species}. Urgent stabilization and mobile dispatch prioritized.`;
        break;

      case 'breathing_problem':
        primaryConcern = 'Respiratory distress / airway compromise';
        firstAidAdvice.push('Ensure neck is straight and gently check for visible foreign objects in the mouth if safe.');
        firstAidAdvice.push('Do NOT compress the chest or throat area.');
        firstAidAdvice.push('Keep the environment cool and well-ventilated.');
        suggestedAction = 'Highest priority emergency van dispatch equipped with oxygen concentrator.';
        summary = `Respiratory distress reported for ${species}. High-flow oxygen readiness requested.`;
        break;

      case 'unconscious_unresponsive':
        primaryConcern = 'Unconsciousness / neurological collapse';
        firstAidAdvice.push('Gently place pet on their right side on a soft, flat surface.');
        firstAidAdvice.push('Keep the airway straight and clear of vomit or saliva.');
        firstAidAdvice.push('Cover with a light blanket to prevent hypothermia; avoid sudden movements.');
        suggestedAction = 'Emergency van dispatch with critical vitals telemetry unit.';
        summary = `Unresponsive ${species}. Immediate paramedic response initiated.`;
        break;

      case 'accident_trauma':
        primaryConcern = 'Trauma / vehicular impact';
        firstAidAdvice.push('Handle with extreme gentleness using a flat blanket or board as a stretcher.');
        firstAidAdvice.push('Avoid moving the spine or bending limbs with suspected fractures.');
        firstAidAdvice.push('Keep pet wrapped and warm to counter potential shock.');
        suggestedAction = 'Rapid mobile unit dispatch with stretcher and immobilization gear.';
        summary = `Physical trauma/accident reported. Dispatching nearest equipped mobile unit.`;
        break;

      case 'possible_poisoning':
        primaryConcern = 'Toxic ingestion / chemical exposure';
        firstAidAdvice.push('Do NOT induce vomiting unless explicitly directed by a poison specialist.');
        firstAidAdvice.push('Safely collect or photograph any packaging or suspected toxin substance.');
        firstAidAdvice.push('Prevent pet from accessing further substances and keep hydrated if swallowing normally.');
        suggestedAction = 'Emergency van dispatch with toxicology stabilization supplies.';
        summary = `Suspected poisoning reported. Rapid decontamination readiness signaled.`;
        break;

      case 'severe_pain':
      case 'severe_illness':
      default:
        primaryConcern = 'Acute discomfort or rapid health deterioration';
        firstAidAdvice.push('Keep the animal in a quiet, dark, and comfortable space.');
        firstAidAdvice.push('Do NOT administer human painkillers (paracetamol/ibuprofen are toxic to pets).');
        firstAidAdvice.push('Monitor breathing rate and gum color.');
        suggestedAction = 'Priority mobile veterinary van dispatch for doorstep assessment.';
        summary = `Acute symptoms logged for ${species}. Rapid evaluation scheduled.`;
        break;
    }

    // Try Gemini API if API key is present in environment
    if (process.env.GEMINI_API_KEY) {
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        const promptText = `You are the Zooby Pet Care Emergency Dispatch Triage Engine.
Evaluate this pet emergency:
Category: ${category}
Pet Species: ${species}
Pet Name: ${input.petName || 'Pet'}
User Report: "${input.description}"

Strict rules:
1. Do NOT make a formal medical diagnosis (say "Potential trauma/distress symptoms observed" instead of "Diagnosed with...").
2. Output JSON ONLY matching this format:
{
  "urgency": "${urgency}",
  "summary": "1-2 sentence emergency dispatch summary",
  "primaryConcern": "Concise primary concern",
  "firstAidAdvice": ["Tip 1", "Tip 2", "Tip 3"],
  "suggestedAction": "1 sentence action for dispatch"
}`;

        const apiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: { responseMimeType: 'application/json' }
            })
          }
        );

        if (apiRes.ok) {
          const data = (await apiRes.json()) as any;
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            if (parsed && parsed.urgency) {
              return {
                urgency: ['CRITICAL', 'HIGH', 'MODERATE', 'LOW'].includes(parsed.urgency)
                  ? parsed.urgency
                  : urgency,
                summary: parsed.summary || summary,
                primaryConcern: parsed.primaryConcern || primaryConcern,
                firstAidAdvice:
                  Array.isArray(parsed.firstAidAdvice) && parsed.firstAidAdvice.length > 0
                    ? parsed.firstAidAdvice
                    : firstAidAdvice,
                suggestedAction: parsed.suggestedAction || suggestedAction,
                isLifeThreatening: parsed.urgency === 'CRITICAL',
                triageModel: 'gemini-2.5-flash',
                triagedAt: new Date()
              };
            }
          }
        }
      } catch (err) {
        console.warn('Gemini AI online triage failed, using verified clinical safety ruleset:', err);
      }
    }

    return {
      urgency,
      summary,
      primaryConcern,
      firstAidAdvice,
      suggestedAction,
      isLifeThreatening,
      triageModel: 'zooby-clinical-triage-v1',
      triagedAt: new Date()
    };
  }
}
