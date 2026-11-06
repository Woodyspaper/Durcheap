#!/usr/bin/env node

import https from 'https';
import http from 'http';
import { performance } from 'perf_hooks';
import { URL } from 'url';

class StressTester {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.results = [];
    this.concurrent = 0;
    this.maxConcurrent = 0;
  }

  async makeRequest(path, method = 'GET') {
    const startTime = performance.now();
    this.concurrent++;
    this.maxConcurrent = Math.max(this.maxConcurrent, this.concurrent);

    return new Promise((resolve) => {
      const url = new URL(path, this.baseUrl);
      const client = url.protocol === 'https:' ? https : http;
      
      const req = client.request(url, { method }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const endTime = performance.now();
          const result = {
            path,
            status: res.statusCode,
            time: endTime - startTime,
            size: data.length,
            timestamp: new Date().toISOString()
          };
          this.results.push(result);
          this.concurrent--;
          resolve(result);
        });
      });

      req.on('error', (err) => {
        const endTime = performance.now();
        const result = {
          path,
          status: 0,
          time: endTime - startTime,
          size: 0,
          error: err.message,
          timestamp: new Date().toISOString()
        };
        this.results.push(result);
        this.concurrent--;
        resolve(result);
      });

      req.setTimeout(10000, () => {
        req.destroy();
        const result = {
          path,
          status: 0,
          time: 10000,
          size: 0,
          error: 'timeout',
          timestamp: new Date().toISOString()
        };
        this.results.push(result);
        this.concurrent--;
        resolve(result);
      });

      req.end();
    });
  }

  async runConcurrentTest(endpoints, concurrency = 10, duration = 30000) {
    console.log(`🚀 Starting stress test with ${concurrency} concurrent users for ${duration/1000}s`);
    console.log(`📍 Target: ${this.baseUrl}`);
    console.log(`🎯 Endpoints: ${endpoints.join(', ')}\n`);

    const startTime = performance.now();
    const promises = [];

    // Create concurrent users
    for (let i = 0; i < concurrency; i++) {
      promises.push(this.simulateUser(endpoints, duration));
    }

    await Promise.all(promises);

    const totalTime = performance.now() - startTime;
    this.generateReport(totalTime);
  }

  async simulateUser(endpoints, duration) {
    const endTime = performance.now() + duration;
    
    while (performance.now() < endTime) {
      const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      await this.makeRequest(randomEndpoint);
      
      // Random delay between requests (50-200ms)
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 150));
    }
  }

  generateReport(totalTime) {
    const successful = this.results.filter(r => r.status >= 200 && r.status < 400);
    const failed = this.results.filter(r => r.status >= 400 || r.status === 0);
    const avgResponseTime = this.results.reduce((sum, r) => sum + r.time, 0) / this.results.length;
    const totalRequests = this.results.length;
    const requestsPerSecond = (totalRequests / (totalTime / 1000)).toFixed(2);

    console.log('\n📊 STRESS TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`⏱️  Total Test Duration: ${(totalTime / 1000).toFixed(2)}s`);
    console.log(`📈 Total Requests: ${totalRequests}`);
    console.log(`✅ Successful Requests: ${successful.length} (${((successful.length/totalRequests)*100).toFixed(2)}%)`);
    console.log(`❌ Failed Requests: ${failed.length} (${((failed.length/totalRequests)*100).toFixed(2)}%)`);
    console.log(`🏃 Requests/Second: ${requestsPerSecond}`);
    console.log(`⚡ Max Concurrent: ${this.maxConcurrent}`);
    console.log(`⏳ Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);

    // Response time percentiles
    const sortedTimes = this.results.map(r => r.time).sort((a, b) => a - b);
    const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
    const p90 = sortedTimes[Math.floor(sortedTimes.length * 0.9)];
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];

    console.log('\n📈 RESPONSE TIME PERCENTILES');
    console.log('-'.repeat(30));
    console.log(`50th percentile: ${p50?.toFixed(2)}ms`);
    console.log(`90th percentile: ${p90?.toFixed(2)}ms`);
    console.log(`95th percentile: ${p95?.toFixed(2)}ms`);
    console.log(`99th percentile: ${p99?.toFixed(2)}ms`);

    // Status code breakdown
    const statusCodes = {};
    this.results.forEach(r => {
      const status = r.status || 'error';
      statusCodes[status] = (statusCodes[status] || 0) + 1;
    });

    console.log('\n📋 STATUS CODE BREAKDOWN');
    console.log('-'.repeat(30));
    Object.entries(statusCodes).forEach(([status, count]) => {
      const percentage = ((count/totalRequests)*100).toFixed(2);
      console.log(`${status}: ${count} (${percentage}%)`);
    });

    // Endpoint performance
    const endpointStats = {};
    this.results.forEach(r => {
      if (!endpointStats[r.path]) {
        endpointStats[r.path] = { times: [], errors: 0, total: 0 };
      }
      endpointStats[r.path].total++;
      if (r.status >= 200 && r.status < 400) {
        endpointStats[r.path].times.push(r.time);
      } else {
        endpointStats[r.path].errors++;
      }
    });

    console.log('\n🎯 ENDPOINT PERFORMANCE');
    console.log('-'.repeat(50));
    Object.entries(endpointStats).forEach(([endpoint, stats]) => {
      const avgTime = stats.times.length > 0 ? 
        (stats.times.reduce((sum, t) => sum + t, 0) / stats.times.length).toFixed(2) : 'N/A';
      const errorRate = ((stats.errors / stats.total) * 100).toFixed(2);
      console.log(`${endpoint}:`);
      console.log(`  📊 Requests: ${stats.total}`);
      console.log(`  ⏱️  Avg Time: ${avgTime}ms`);
      console.log(`  ❌ Error Rate: ${errorRate}%`);
    });

    // Performance assessment
    console.log('\n🎯 PERFORMANCE ASSESSMENT');
    console.log('-'.repeat(30));
    if (avgResponseTime < 200) {
      console.log('🟢 EXCELLENT: Very fast response times');
    } else if (avgResponseTime < 500) {
      console.log('🟡 GOOD: Acceptable response times');
    } else if (avgResponseTime < 1000) {
      console.log('🟠 FAIR: Slow response times, consider optimization');
    } else {
      console.log('🔴 POOR: Very slow response times, optimization needed');
    }

    const errorRate = (failed.length / totalRequests) * 100;
    if (errorRate < 1) {
      console.log('🟢 EXCELLENT: Very low error rate');
    } else if (errorRate < 5) {
      console.log('🟡 GOOD: Acceptable error rate');
    } else if (errorRate < 10) {
      console.log('🟠 FAIR: High error rate, investigate issues');
    } else {
      console.log('🔴 POOR: Very high error rate, immediate attention needed');
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const baseUrl = args[0] || 'http://localhost:5000';
  const concurrency = parseInt(args[1]) || 10;
  const duration = parseInt(args[2]) * 1000 || 30000; // Convert to ms

  // Critical endpoints to test
  const endpoints = [
    '/',
    '/api/products',
    '/api/categories',
    '/api/auth/user',
    '/api/events/today/Miami/FL',
    '/api/events/external/Miami/FL',
    '/seller-dashboard',
    '/local-events',
    '/tax-documents',
    '/membership-dashboard',
    '/revenue-dashboard'
  ];

  const tester = new StressTester(baseUrl);
  
  try {
    await tester.runConcurrentTest(endpoints, concurrency, duration);
  } catch (error) {
    console.error('❌ Stress test failed:', error.message);
    process.exit(1);
  }
}

main();