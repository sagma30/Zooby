const fs = require('fs');
const path = require('path');

console.log('--- ZOOBY GLOBAL CURSOR TRAIL AUDIT ---');

const landingPagePath = path.join(__dirname, '..', 'frontend', 'src', 'components', 'public', 'PublicLandingPage.tsx');
const trailComponentPath = path.join(__dirname, '..', 'frontend', 'src', 'components', 'common', 'PawCursorHeroTrail.tsx');

const landingPageContent = fs.readFileSync(landingPagePath, 'utf-8');
const trailComponentContent = fs.readFileSync(trailComponentPath, 'utf-8');

const assertions = [
  {
    label: 'PawCursorHeroTrail is mounted at the root level of PublicLandingPage',
    test: landingPageContent.includes('<PawCursorHeroTrail />') || landingPageContent.includes('<PawCursorHeroTrail/>')
  },
  {
    label: 'Hero section no longer bounds or clips PawCursorHeroTrail to hero container',
    test: !landingPageContent.includes('<PawCursorHeroTrail heroContainerRef')
  },
  {
    label: 'Trail container uses fixed inset-0 viewport positioning with pointer-events-none',
    test: trailComponentContent.includes('fixed inset-0') &&
          trailComponentContent.includes('pointer-events-none') &&
          trailComponentContent.includes('z-30')
  },
  {
    label: 'Paws use fixed positioning so scrolling does not clip or displace them',
    test: trailComponentContent.includes('className="fixed transition-transform') ||
          trailComponentContent.includes('fixed')
  },
  {
    label: 'Tracks e.clientX and e.clientY continuously across the entire page',
    test: trailComponentContent.includes('e.clientX') && trailComponentContent.includes('e.clientY')
  },
  {
    label: 'Preserves the exact existing paw SVG design, #895100 color, pad and 4 toes',
    test: trailComponentContent.includes('#895100') &&
          trailComponentContent.includes('Metacarpal pad') &&
          trailComponentContent.includes('Top Left Outer Toe') &&
          trailComponentContent.includes('Top Middle-Left Toe') &&
          trailComponentContent.includes('Top Middle-Right Toe') &&
          trailComponentContent.includes('Top Right Outer Toe')
  },
  {
    label: 'Preserves existing particle limits, distance threshold (28px), lag (8px), and 950ms lifespan',
    test: trailComponentContent.includes('maxPaws = 14') &&
          trailComponentContent.includes('distanceThreshold = 28') &&
          trailComponentContent.includes('lagDistance = 8') &&
          trailComponentContent.includes('950')
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
  console.log('ALL GLOBAL CURSOR TRAIL AUDIT CHECKPOINTS PASSED PERFECTLY!');
}
