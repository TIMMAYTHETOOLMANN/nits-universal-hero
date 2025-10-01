#!/usr/bin/env node

const API_KEY = 'WI9hQX86aSPojGmSu2C64FYRnBWe71v3EridMBg5';
const BASE_URL = 'https://api.govinfo.gov';

async function testAPI() {
  console.log('🔍 Testing GovInfo API...');
  
  try {
    const response = await fetch(
      `${BASE_URL}/search?api_key=${API_KEY}&query=test&pageSize=1`
    );
    
    if (response.ok) {
      console.log('✅ API Key is valid!');
      const data = await response.json();
      console.log('📄 Sample response:', {
        count: data.count || 0,
        nextPage: data.nextPage || null,
        resultsFound: data.results?.length || 0
      });
    } else {
      console.error('❌ API Key invalid or request failed:', response.status);
      console.error('Response:', await response.text());
    }
  } catch (error) {
    console.error('🚫 Connection error:', error.message);
  }
}

testAPI();