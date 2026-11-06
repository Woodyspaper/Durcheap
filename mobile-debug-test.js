#!/usr/bin/env node

/**
 * Mobile Web Access Debug Test
 * Tests various mobile scenarios to identify 404 issues
 */

import http from 'http';
import https from 'https';

const BASE_URL = 'http://localhost:5000';
const MOBILE_USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1';

console.log('🔍 Mobile Web Access Debug Test\n');

// Test scenarios that might cause 404 errors
const testScenarios = [
  // Basic page access
  { method: 'GET', path: '/', description: 'Home page access' },
  { method: 'GET', path: '/auth', description: 'Auth page access' },
  
  // API endpoints
  { method: 'GET', path: '/api/auth/user', description: 'Auth status check' },
  { method: 'GET', path: '/api/categories', description: 'Categories API' },
  { method: 'GET', path: '/api/products', description: 'Products API' },
  
  // Common mobile navigation paths
  { method: 'GET', path: '/search', description: 'Search page' },
  { method: 'GET', path: '/cart', description: 'Cart page' },
  { method: 'GET', path: '/account', description: 'Account page' },
  
  // Potential problematic paths
  { method: 'GET', path: '/mobile', description: 'Mobile-specific route (should 404)' },
  { method: 'GET', path: '/app', description: 'App route (should 404)' },
  { method: 'GET', path: '/signin', description: 'Alternative signin route' },
  { method: 'GET', path: '/login', description: 'Alternative login route' },
];

async function testRequest(method, path, description) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'User-Agent': MOBILE_USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const status = res.statusCode;
        const contentType = res.headers['content-type'] || 'unknown';
        const hasError = data.toLowerCase().includes('404') || 
                        data.toLowerCase().includes('not found') || 
                        data.toLowerCase().includes('error');
        
        resolve({
          path,
          description,
          status,
          contentType,
          hasError,
          dataPreview: data.substring(0, 100).replace(/\n/g, ' ')
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        path,
        description,
        status: 'ERROR',
        contentType: 'error',
        hasError: true,
        dataPreview: err.message
      });
    });

    req.setTimeout(5000, () => {
      req.abort();
      resolve({
        path,
        description,
        status: 'TIMEOUT',
        contentType: 'timeout',
        hasError: true,
        dataPreview: 'Request timed out'
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('Testing mobile web access scenarios...\n');
  
  const results = [];
  
  for (const scenario of testScenarios) {
    const result = await testRequest(scenario.method, scenario.path, scenario.description);
    results.push(result);
    
    const statusIcon = result.status === 200 ? '✅' : 
                      result.status === 404 ? '🔴' : 
                      result.hasError ? '⚠️' : '🟡';
    
    console.log(`${statusIcon} ${result.description}`);
    console.log(`   ${scenario.method} ${result.path} → ${result.status}`);
    if (result.hasError && result.status !== 404) {
      console.log(`   ⚠️ Potential issue detected: ${result.dataPreview}`);
    }
    console.log('');
  }
  
  // Summary
  console.log('📊 Test Summary:');
  const errors = results.filter(r => r.hasError && r.status !== 404);
  const notFound = results.filter(r => r.status === 404);
  const successful = results.filter(r => r.status === 200);
  
  console.log(`✅ Successful: ${successful.length}`);
  console.log(`🔴 404 Not Found: ${notFound.length}`);
  console.log(`⚠️ Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n🚨 Issues that need attention:');
    errors.forEach(error => {
      console.log(`- ${error.description} (${error.path}): ${error.dataPreview}`);
    });
  }
  
  if (notFound.length > 0) {
    console.log('\n📋 404 Not Found (expected for some):');
    notFound.forEach(nf => {
      console.log(`- ${nf.description} (${nf.path})`);
    });
  }
  
  console.log('\n✅ Mobile debug test completed!');
}

runTests().catch(console.error);