// Simple backend test using native fetch
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:5001';
const ENDPOINTS = {
  root: '/',
  events: '/events',
  api: '/api/events'  // Common alternative API path
};

console.log('Testing backend connection...');

async function testEndpoint(url) {
  console.log(`\n🔍 Testing endpoint: ${url}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json,text/html',
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));
    
    const contentType = response.headers.get('content-type') || '';
    let data;
    
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.log('Response is not JSON. Content type:', contentType);
      console.log('First 200 characters of response:', text.substring(0, 200));
      return { isHtml: text.trim().startsWith('<!doctype') };
    }
    
    console.log(`✅ ${url} is accessible`);
    console.log('Status:', response.status);
    
    if (data) {
      const events = Array.isArray(data) ? data : (data.events || []);
      if (events.length > 0) {
        console.log(`📊 Found ${events.length} events`);
        console.log('Sample event:', {
          id: events[0]._id || events[0].id,
          name: events[0].name,
          date: events[0].date,
          location: events[0].location?.name || events[0].location,
          price: events[0].price
        });
        return { success: true, events: events.length };
      } else if (Array.isArray(events)) {
        console.log('ℹ️  No events found (empty array)');
        return { success: true, events: 0 };
      } else {
        console.log('ℹ️  Response data:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
        return { success: true, data: data };
      }
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testBackend() {
  const results = {};
  
  // Test root endpoint
  results.root = await testEndpoint(API_BASE_URL + ENDPOINTS.root);
  
  // Test /events endpoint
  results.events = await testEndpoint(API_BASE_URL + ENDPOINTS.events);
  
  // Test /api/events endpoint (common alternative)
  results.apiEvents = await testEndpoint(API_BASE_URL + ENDPOINTS.api);
  
  // Print summary
  console.log('\n=== Test Results ===');
  console.log(`Root endpoint (${ENDPOINTS.root}):`, 
    results.root?.success ? '✅ Accessible' : '❌ Failed');
    
  console.log(`Events endpoint (${ENDPOINTS.events}):`, 
    results.events?.success ? `✅ Found ${results.events.events || 0} events` : '❌ Failed');
    
  console.log(`API Events endpoint (${ENDPOINTS.api}):`, 
    results.apiEvents?.success ? `✅ Found ${results.apiEvents.events || 0} events` : '❌ Not found');
  
  // Check if any endpoint returned HTML
  const htmlEndpoints = [
    results.root?.isHtml && 'Root',
    results.events?.isHtml && 'Events',
    results.apiEvents?.isHtml && 'API Events'
  ].filter(Boolean);
  
  if (htmlEndpoints.length > 0) {
    console.log('\n⚠️  Some endpoints returned HTML instead of JSON:');
    htmlEndpoints.forEach(ep => console.log(`- ${ep} endpoint might be redirecting to a login page or showing an error`));
  }
  
  // Provide troubleshooting tips if no endpoints worked
  if (!results.events?.success && !results.apiEvents?.success) {
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure your backend server is running');
    console.log('2. Check if the port number is correct (current:', API_BASE_URL, ')');
    console.log('3. Try accessing these URLs directly in your browser:');
    console.log(`   - ${API_BASE_URL}${ENDPOINTS.events}`);
    console.log(`   - ${API_BASE_URL}${ENDPOINTS.api}`);
    console.log('4. Check your backend server logs for any errors');
    console.log('5. Verify CORS is properly configured on the backend');
  }
}

testBackend();
