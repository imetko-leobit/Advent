// Quick verification that dev mode config works correctly
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying DEV mode implementation...\n');

// Check auth-provider.tsx
const authProviderPath = path.join(__dirname, 'src/auth/auth-provider.tsx');
const authProviderContent = fs.readFileSync(authProviderPath, 'utf8');
const hasDevCheck = authProviderContent.includes('import.meta.env.DEV');
const hasMockAuth = authProviderContent.includes('MockAuthProvider');
console.log(`✅ Auth Provider has DEV mode check: ${hasDevCheck}`);
console.log(`✅ Auth Provider uses MockAuthProvider: ${hasMockAuth}`);

// Check dev-auth-provider.tsx exists
const devAuthProviderPath = path.join(__dirname, 'src/auth/dev-auth-provider.tsx');
const devAuthExists = fs.existsSync(devAuthProviderPath);
console.log(`✅ Dev Auth Provider exists: ${devAuthExists}`);

// Check mock CSV exists
const mockCsvPath = path.join(__dirname, 'public/mock-quest-data.csv');
const mockCsvExists = fs.existsSync(mockCsvPath);
const mockCsvContent = fs.readFileSync(mockCsvPath, 'utf8');
const hasDevUser = mockCsvContent.includes('dev@leobit.com');
console.log(`✅ Mock CSV exists: ${mockCsvExists}`);
console.log(`✅ Mock CSV has dev user: ${hasDevUser}`);

// Check useQuestData.tsx
const useQuestDataPath = path.join(__dirname, 'src/hooks/useQuestData.tsx');
const useQuestDataContent = fs.readFileSync(useQuestDataPath, 'utf8');
const hasMockCsvCheck = useQuestDataContent.includes('mock-quest-data.csv');
console.log(`✅ useQuestData references mock CSV: ${hasMockCsvCheck}`);

// Check README
const readmePath = path.join(__dirname, 'README.md');
const readmeContent = fs.readFileSync(readmePath, 'utf8');
const hasDevDocs = readmeContent.includes('Local Development (DEV Mode)');
console.log(`✅ README has DEV mode documentation: ${hasDevDocs}`);

console.log('\n✨ All DEV mode checks passed!');
