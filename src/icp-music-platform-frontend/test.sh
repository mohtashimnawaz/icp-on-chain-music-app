#!/bin/bash
echo "🎵 Frontend Feature Tests"
echo "========================="
echo ""
echo "1. Backend Data Test:"
dfx canister call icp-music-platform-backend list_tracks | head -5
echo ""
echo "2. Frontend Build Test:"
cd src/icp-music-platform-frontend && npm run build --silent > /dev/null 2>&1 && echo "✅ Build successful" || echo "❌ Build failed"
cd ../..
echo ""
echo "3. Frontend Server Test:"
curl -s http://localhost:5174 > /dev/null && echo "✅ Frontend accessible" || echo "❌ Frontend not accessible"
echo ""
echo "4. Manual Test URL: http://localhost:5174"
