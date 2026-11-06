#!/usr/bin/env node

import https from 'https';
import http from 'http';
import { performance } from 'perf_hooks';
import { URL } from 'url';

class LoadTestScenarios {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.results = [];
  }

  async makeRequest(path, method = 'GET', headers = {}) {
    const startTime = performance.now();
    
    return new Promise((resolve) => {
      const url = new URL(path, this.baseUrl);
      const client = url.protocol === 'https:' ? https : http;
      
      const req = client.request(url, { method, headers }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const endTime = performance.now();
          resolve({
            path,
            status: res.statusCode,
            time: endTime - startTime,
            size: data.length,
            headers: res.headers
          });
        });
      });

      req.on('error', (err) => {
        resolve({
          path,
          status: 0,
          time: performance.now() - startTime,
          error: err.message
        });
      });

      req.setTimeout(30000, () => {
        req.destroy();
        resolve({
          path,
          status: 0,
          time: 30000,
          error: 'timeout'
        });
      });

      req.end();
    });
  }

  async testStaticAssets() {
    console.log('🌐 Testing Static Assets & Core Pages');
    console.log('-'.repeat(40));

    const staticEndpoints = [
      '/',
      '/seller-dashboard',
      '/local-events', 
      '/tax-documents',
      '/membership-dashboard',
      '/revenue-dashboard',
      '/shipping-tools',
      '/product-form'
    ];

    for (const endpoint of staticEndpoints) {
      const result = await this.makeRequest(endpoint);
      const status = result.status >= 200 && result.status < 400 ? '✅' : '❌';
      console.log(`${status} ${endpoint}: ${result.status} (${result.time.toFixed(2)}ms)`);
    }
  }

  async testAPIEndpoints() {
    console.log('\n🔌 Testing API Endpoints');
    console.log('-'.repeat(40));

    const apiEndpoints = [
      '/api/products',
      '/api/categories', 
      '/api/events/today/Miami/FL',
      '/api/events/external/Miami/FL',
      '/api/user/balance',
      '/api/auth/user',
      '/api/cart'
    ];

    for (const endpoint of apiEndpoints) {
      const result = await this.makeRequest(endpoint);
      const status = result.status >= 200 && result.status < 500 ? '✅' : '❌';
      console.log(`${status} ${endpoint}: ${result.status} (${result.time.toFixed(2)}ms)`);
    }
  }

  async testDatabasePerformance() {
    console.log('\n🗄️ Testing Database Performance');
    console.log('-'.repeat(40));

    // Test multiple product queries
    const times = [];
    for (let i = 0; i < 5; i++) {
      const result = await this.makeRequest('/api/products');
      times.push(result.time);
      console.log(`Products Query ${i+1}: ${result.time.toFixed(2)}ms`);
    }

    const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
    console.log(`📊 Average DB Query Time: ${avgTime.toFixed(2)}ms`);
  }

  async testConcurrentLoad() {
    console.log('\n⚡ Testing Concurrent Load Handling');
    console.log('-'.repeat(40));

    const promises = [];
    const startTime = performance.now();

    // Simulate 20 concurrent requests
    for (let i = 0; i < 20; i++) {
      promises.push(this.makeRequest('/'));
      promises.push(this.makeRequest('/api/products'));
    }

    const results = await Promise.all(promises);
    const totalTime = performance.now() - startTime;
    const successful = results.filter(r => r.status >= 200 && r.status < 400).length;

    console.log(`📈 Concurrent Requests: 40`);
    console.log(`✅ Successful: ${successful}/40`);
    console.log(`⏱️ Total Time: ${totalTime.toFixed(2)}ms`);
    console.log(`🏃 Requests/Second: ${(40 / (totalTime / 1000)).toFixed(2)}`);
  }

  async testMemoryIntensiveOperations() {
    console.log('\n🧠 Testing Memory-Intensive Operations');
    console.log('-'.repeat(40));

    // Test operations that might consume more memory
    const intensiveEndpoints = [
      '/api/products', // Large product list
      '/api/events/external/Miami/FL', // External API calls
      '/tax-documents', // Document generation
    ];

    for (const endpoint of intensiveEndpoints) {
      const result = await this.makeRequest(endpoint);
      const memoryIntensive = result.time > 100 ? '🟡' : '🟢';
      console.log(`${memoryIntensive} ${endpoint}: ${result.time.toFixed(2)}ms (${result.size} bytes)`);
    }
  }

  async runFullTestSuite() {
    console.log('🚀 COMPREHENSIVE LOAD TEST SUITE');
    console.log('='.repeat(50));
    console.log(`📍 Target: ${this.baseUrl}\n`);

    await this.testStaticAssets();
    await this.testAPIEndpoints(); 
    await this.testDatabasePerformance();
    await this.testConcurrentLoad();
    await this.testMemoryIntensiveOperations();

    console.log('\n✅ Load Test Suite Complete!');
  }
}

// Main execution
async function main() {
  const baseUrl = process.argv[2] || 'http://localhost:5000';
  const tester = new LoadTestScenarios(baseUrl);
  
  try {
    await tester.runFullTestSuite();
  } catch (error) {
    console.error('❌ Load test failed:', error.message);
    process.exit(1);
  }
}

main();