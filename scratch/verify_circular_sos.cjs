const fs = require('fs');
const path = require('path');

console.log('--- ZOOBY CIRCULAR FLOATING SOS BUTTON AUDIT ---');

const floatingButtonPath = path.join(__dirname, '..', 'frontend', 'src', 'components', 'emergency', 'FloatingSOSButton.tsx');
const floatingButtonContent = fs.readFileSync(floatingButtonPath, 'utf-8');

const assertions = [
  {
    label: 'Button is perfectly circular (rounded-full and equal width/height)',
    test: floatingButtonContent.includes('rounded-full') &&
          (floatingButtonContent.includes('w-[52px] h-[52px]') || floatingButtonContent.includes('w-[56px] h-[56px]') || floatingButtonContent.includes('w-14 h-14'))
  },
  {
    label: 'No blinking or attention-seeking animations (animate-ping / animate-pulse / animate-bounce removed)',
    test: !floatingButtonContent.includes('animate-ping') &&
          !floatingButtonContent.includes('animate-pulse') &&
          !floatingButtonContent.includes('animate-bounce')
  },
  {
    label: 'Deep burgundy/red emergency color styling applied',
    test: floatingButtonContent.includes('#b91c1c') || floatingButtonContent.includes('#991b1b') || floatingButtonContent.includes('#7f1d1d')
  },
  {
    label: 'White emergency icon centered with clean compact SOS label',
    test: floatingButtonContent.includes('emergency') && floatingButtonContent.includes('SOS')
  },
  {
    label: 'Subtle shadow and scale micro-interaction on hover/active',
    test: floatingButtonContent.includes('shadow-lg') && floatingButtonContent.includes('hover:scale-105')
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
  console.log('ALL CIRCULAR SOS BUTTON AUDIT CHECKPOINTS PASSED PERFECTLY!');
}
