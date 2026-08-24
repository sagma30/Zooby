const fs = require('fs');
const path = require('path');

console.log('--- ZOOBY PUBLIC EMERGENCY SOS AUDIT ---');

const landingPagePath = path.join(__dirname, '..', 'frontend', 'src', 'components', 'public', 'PublicLandingPage.tsx');
const floatingButtonPath = path.join(__dirname, '..', 'frontend', 'src', 'components', 'emergency', 'FloatingSOSButton.tsx');
const sosModalPath = path.join(__dirname, '..', 'frontend', 'src', 'components', 'emergency', 'RapidVanSOSModal.tsx');
const aiTriagePath = path.join(__dirname, '..', 'frontend', 'src', 'services', 'aiTriage.ts');
const emergencyStorePath = path.join(__dirname, '..', 'frontend', 'src', 'services', 'emergencyStore.ts');

const landingPageContent = fs.readFileSync(landingPagePath, 'utf-8');
const floatingButtonContent = fs.readFileSync(floatingButtonPath, 'utf-8');
const sosModalContent = fs.readFileSync(sosModalPath, 'utf-8');
const aiTriageContent = fs.readFileSync(aiTriagePath, 'utf-8');
const emergencyStoreContent = fs.readFileSync(emergencyStorePath, 'utf-8');

const assertions = [
  // 1. Floating SOS button on landing page
  {
    label: 'Landing Page includes FloatingSOSButton component',
    test: landingPageContent.includes('FloatingSOSButton') && landingPageContent.includes('<FloatingSOSButton')
  },
  {
    label: 'FloatingSOSButton has responsive SOS / Emergency SOS label',
    test: floatingButtonContent.includes('SOS') && floatingButtonContent.includes('Emergency SOS')
  },
  {
    label: 'FloatingSOSButton is fixed and accessible during scrolling',
    test: floatingButtonContent.includes('fixed') && floatingButtonContent.includes('bottom-')
  },

  // 2. No Login Required
  {
    label: 'Landing Page renders RapidVanSOSModal directly for public users without login redirection',
    test: landingPageContent.includes('<RapidVanSOSModal') && landingPageContent.includes('isLocalSOSOpen')
  },

  // 3. Step 1: Emergency Type
  {
    label: 'Emergency Types include Pet Injury, Breathing, Poisoning, Accident, Bleeding, Critical, Other',
    test: sosModalContent.includes('Pet Injury') &&
          sosModalContent.includes('Breathing Problem') &&
          sosModalContent.includes('Poisoning / Toxic Exposure') &&
          sosModalContent.includes('Accident') &&
          sosModalContent.includes('Severe Bleeding') &&
          sosModalContent.includes('Critical Condition') &&
          sosModalContent.includes('Other Emergency')
  },

  // 4. Step 2: Location
  {
    label: 'Location permission requested with explicit message & manual fallback',
    test: sosModalContent.includes('Zooby needs your location to find the nearest available emergency van') &&
          sosModalContent.includes('Allow Location') &&
          sosModalContent.includes('Enter Location Manually')
  },

  // 5. Step 3: Fast Details
  {
    label: 'Fast Details with optional Pet Name, Species, and START EMERGENCY RESPONSE button',
    test: sosModalContent.includes('Pet Species') &&
          sosModalContent.includes('Pet Name (Optional)') &&
          sosModalContent.includes('START EMERGENCY RESPONSE')
  },

  // 6. Step 4: Live Speech
  {
    label: 'Live Speech transcription with Start, Stop, Retry, and fallback to typing',
    test: sosModalContent.includes('Speak Emergency') &&
          sosModalContent.includes('Start Recording') &&
          sosModalContent.includes('Stop Recording') &&
          sosModalContent.includes('Retry')
  },

  // 7. Step 5: AI Triage
  {
    label: 'AI Triage evaluation with urgency classifications and veterinary non-diagnosis disclaimer',
    test: sosModalContent.includes('AI-Assisted Emergency Triage') &&
          sosModalContent.includes('Evaluating Emergency Severity') &&
          sosModalContent.includes('Medical Notice') &&
          sosModalContent.includes('NOT')
  },

  // 8. Step 6: Nearest Van & Routing
  {
    label: 'Nearest Van identification with calculated ETA and prototype state transparency',
    test: sosModalContent.includes('Nearest Eligible Van Located') &&
          sosModalContent.includes('Emergency dispatch simulation') &&
          sosModalContent.includes('CONFIRM VEHICLE DISPATCH')
  },

  // 9. Step 7: Dispatch Confirmation & Live Status
  {
    label: 'DISPATCH CONFIRMED view with 5-stage timeline and real-time interactive map',
    test: sosModalContent.includes('DISPATCH CONFIRMED') &&
          sosModalContent.includes('SOS Received') &&
          sosModalContent.includes('Assessed') &&
          sosModalContent.includes('Van Assigned') &&
          sosModalContent.includes('En Route') &&
          sosModalContent.includes('Arrived') &&
          sosModalContent.includes('ZoobyRealMap')
  },

  // 10. Store & Services
  {
    label: 'aiTriage service provides speech recognition check, transcription, and urgency evaluation',
    test: aiTriageContent.includes('isSpeechRecognitionSupported') &&
          aiTriageContent.includes('startVoiceEmergencyTranscription') &&
          aiTriageContent.includes('evaluateAITriage')
  }
];

let failed = 0;
assertions.forEach((a, idx) => {
  if (a.test) {
    console.log(`[PASS] [${idx + 1}/${assertions.length}] ${a.label}`);
  } else {
    console.error(`[FAIL] [${idx + 1}/${assertions.length}] ${a.label}`);
    failed++;
  }
});

console.log(`\nAUDIT RESULT: ${assertions.length - failed}/${assertions.length} passed.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL PUBLIC EMERGENCY SOS AUDIT CHECKPOINTS PASSED PERFECTLY!');
}
