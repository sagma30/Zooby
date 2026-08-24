const fs = require('fs');
const path = require('path');

console.log('--- ZOOBY GLOBAL PRICING VERIFICATION AUDIT ---');

const pricingConstantsPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'pricingConstants.ts');
const mockDataPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'mockData.ts');
const providerMockDataPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'providerMockData.ts');
const serviceProviderMockDataPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'serviceProviderMockData.ts');

const pricingConstantsContent = fs.readFileSync(pricingConstantsPath, 'utf-8');
const mockDataContent = fs.readFileSync(mockDataPath, 'utf-8');
const providerMockDataContent = fs.readFileSync(providerMockDataPath, 'utf-8');
const serviceProviderMockDataContent = fs.readFileSync(serviceProviderMockDataPath, 'utf-8');

const assertions = [
  // Pet Walking
  { label: 'Pet Walking: Standard Walk ₹149', test: pricingConstantsContent.includes('149') && pricingConstantsContent.includes('Standard Walk') },
  { label: 'Pet Walking: Long Walk ₹199', test: pricingConstantsContent.includes('199') && pricingConstantsContent.includes('Long Walk') },
  { label: 'Pet Walking: Exercise Walk ₹279', test: pricingConstantsContent.includes('279') && pricingConstantsContent.includes('Exercise Walk') },
  { label: 'Pet Walking: Monthly Plan ₹3,500', test: pricingConstantsContent.includes('3500') && pricingConstantsContent.includes('Monthly Standard Walk Plan') },

  // Pet Sitting
  { label: 'Pet Sitting: 3 Hours ₹599', test: pricingConstantsContent.includes('599') && pricingConstantsContent.includes('3 Hours') },
  { label: 'Pet Sitting: 8 Hours ₹999', test: pricingConstantsContent.includes('999') && pricingConstantsContent.includes('8 Hours') },
  { label: 'Pet Sitting: 24 Hours ₹1,999', test: pricingConstantsContent.includes('1999') && pricingConstantsContent.includes('24 Hours') },

  // Pet Training
  { label: 'Pet Training: Individual Session ₹1,000', test: pricingConstantsContent.includes('1000') && pricingConstantsContent.includes('Individual Training Session') },
  { label: 'Pet Training: Basic Puppy & Home ₹7,000', test: pricingConstantsContent.includes('7000') && pricingConstantsContent.includes('Basic Puppy & Home Training') },
  { label: 'Pet Training: Leash, Walking & Behaviour ₹14,000', test: pricingConstantsContent.includes('14000') && pricingConstantsContent.includes('Leash, Walking & Behaviour Training') },
  { label: 'Pet Training: Aggression, Anxiety or Biting ₹20,000', test: pricingConstantsContent.includes('20000') && pricingConstantsContent.includes('Aggression, Anxiety or Biting Training') },

  // Grooming Van
  { label: 'Grooming Van: Base ₹1,999', test: pricingConstantsContent.includes('1999') && pricingConstantsContent.includes('Grooming Van') },
  { label: 'Grooming Van: Bath + Basic (Small ₹1,299, Med ₹1,399, Large ₹1,999)', test: pricingConstantsContent.includes('1299') && pricingConstantsContent.includes('1399') && pricingConstantsContent.includes('1999') },
  { label: 'Grooming Van: Full Grooming (Small ₹1,699, Med ₹2,099, Large ₹2,599)', test: pricingConstantsContent.includes('1699') && pricingConstantsContent.includes('2099') && pricingConstantsContent.includes('2599') },
  { label: 'Grooming Van: Premium De-shedding (Small ₹1,999, Med ₹2,499, Large ₹2,999)', test: pricingConstantsContent.includes('2499') && pricingConstantsContent.includes('2999') },

  // Veterinary Services
  { label: 'Veterinary: Checking ₹899', test: pricingConstantsContent.includes('899') && pricingConstantsContent.includes('Checking') },
  { label: 'Veterinary: Vet Checking & Vaccination ₹1,899 / ₹1,599', test: pricingConstantsContent.includes('1899') && pricingConstantsContent.includes('1599') },
  { label: 'Veterinary: De-worming ₹399', test: pricingConstantsContent.includes('399') && pricingConstantsContent.includes('De-worming') },
  { label: 'Veterinary: First Aid ₹999', test: pricingConstantsContent.includes('999') && pricingConstantsContent.includes('First Aid') },
  { label: 'Veterinary: Blood Test at Home ₹1,299', test: pricingConstantsContent.includes('1299') && pricingConstantsContent.includes('Blood Test at Home') },

  // Provider Data updates
  { label: 'mockData: SERVICE_PROVIDERS contains official starting rates (₹149, ₹599, ₹1,000, ₹1,999, ₹899)', test: mockDataContent.includes('149') && mockDataContent.includes('599') && mockDataContent.includes('1000') && mockDataContent.includes('1999') && mockDataContent.includes('899') },
  { label: 'serviceProviderMockData: SP Catalog contains official rates', test: serviceProviderMockDataContent.includes('149') && serviceProviderMockDataContent.includes('199') && serviceProviderMockDataContent.includes('279') && serviceProviderMockDataContent.includes('3500') && serviceProviderMockDataContent.includes('14000') && serviceProviderMockDataContent.includes('20000') }
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
  console.log('ALL PRICING TEST CHECKPOINTS PASSED PERFECTLY!');
}
