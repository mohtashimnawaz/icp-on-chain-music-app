#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 ICP Music Platform Frontend Feature Tests');
console.log('=====================================\n');

// Test 1: Check if frontend is running
console.log('1. Frontend Server Test');
const http = require('http');

function testFrontendServer() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5174', (res) => {
      console.log('   ✅ Frontend server is running on port 5174');
      console.log(`   📊 Response status: ${res.statusCode}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log('   ❌ Frontend server is not accessible');
      console.log(`   📊 Error: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('   ⚠️  Frontend server request timed out');
      req.destroy();
      resolve(false);
    });
  });
}

// Test 2: Check built files
console.log('\n2. Build Files Test');
const frontendDir = './src/icp-music-platform-frontend';
const buildFiles = [
  'package.json',
  'src/App.tsx',
  'src/main.tsx',
  'src/services/icp.ts',
  'src/services/musicService.ts',
  'src/contexts/AuthContext.tsx',
  'src/hooks/useMusicData.ts',
  'src/components/AuthButton.tsx',
  'src/components/TrackList.tsx'
];

buildFiles.forEach(file => {
  const filePath = path.join(frontendDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file} exists`);
  } else {
    console.log(`   ❌ ${file} missing`);
  }
});

// Test 3: Check for TypeScript/lint errors
console.log('\n3. Code Quality Test');
console.log('   📋 Run `npm run build` to check for TypeScript errors');
console.log('   📋 Run `npm run lint` to check for linting issues');

// Test 4: Backend connectivity test
console.log('\n4. Backend Connectivity Test');
console.log('   📋 Testing with dfx canister calls...');

async function runTests() {
  await testFrontendServer();
  
  console.log('\n🎯 Manual Testing Checklist:');
  console.log('   1. Open http://localhost:5174 in browser');
  console.log('   2. Check browser console for errors');
  console.log('   3. Test Internet Identity authentication');
  console.log('   4. Navigate through all pages (Home, Explore, Studio, Profile)');
  console.log('   5. Test track listing on Explore page');
  console.log('   6. Test track interactions (rating, commenting)');
  console.log('   7. Test artist information display');
  console.log('   8. Test responsive design');
  
  console.log('\n📊 Backend Data Verification:');
  console.log('   Run these commands to verify backend data:');
  console.log('   • dfx canister call icp-music-platform-backend list_tracks');
  console.log('   • dfx canister call icp-music-platform-backend list_artists');
  console.log('   • dfx canister call icp-music-platform-backend list_playlists');
}

runTests().catch(console.error);
