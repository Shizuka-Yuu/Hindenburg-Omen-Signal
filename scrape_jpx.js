import { chromium } from 'playwright';

async function run() {
  console.log('Starting Playwright for JPX scraper...');
  const browser = await chromium.launch({
    headless: true
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });
  
  const page = await context.newPage();
  
  // Navigate to JPX equities summary page to establish cookies/session
  const jpxUrl = 'https://www.jpx.co.jp/english/markets/equities/summary/index.html';
  console.log(`Navigating to ${jpxUrl}...`);
  
  try {
    await page.goto(jpxUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('Waiting for elements to load...');
    await page.waitForTimeout(5000);
    
    // 1. Fetch JPX Market Data (Prime, Standard, Growth) and Index Price from the page context to bypass CDN blocking
    console.log('Fetching JPX data from browser context...');
    const jpxData = await page.evaluate(async () => {
      const fetchJson = async (url) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      };
      
      const fetchText = async (url) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.text();
      };
      
      const [statusData, priceData, timeData] = await Promise.all([
        fetchJson('/market/indices/e_indices_status3.txt'),
        fetchJson('/market/indices/e_indices_stock_price3.1.txt'),
        fetchText('/market/indices/e_indices_status3.time.txt')
      ]);
      
      return { statusData, priceData, timeData };
    });
    
    console.log('Successfully fetched JPX files.');
    
    // 2. Fetch Nikkei 225 from Yahoo Finance API
    console.log('Fetching Nikkei 225 closing price from Yahoo Finance API...');
    let nikkei225Close = 0;
    try {
      const n225Res = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EN225?interval=1d&range=1d');
      if (n225Res.ok) {
        const n225Data = await n225Res.json();
        const meta = n225Data?.chart?.result?.[0]?.meta;
        const quote = n225Data?.chart?.result?.[0]?.indicators?.quote?.[0];
        
        // Use regularMarketPrice or last close price from quotes
        nikkei225Close = meta?.regularMarketPrice || quote?.close?.[0] || 0;
        console.log(`Nikkei 225 close price: ${nikkei225Close}`);
      } else {
        console.warn(`Failed to fetch Nikkei 225. Status: ${n225Res.status}`);
      }
    } catch (e) {
      console.warn('Error fetching Nikkei 225 from Yahoo Finance API:', e);
    }
    
    // 3. Parse and process JPX data
    const { statusData, priceData, timeData } = jpxData;
    
    const formattedDate = parseJPXTime(timeData);
    if (!formattedDate) {
      throw new Error(`Failed to parse JPX update time: ${timeData}`);
    }
    console.log(`Parsed JPX update time: ${formattedDate}`);
    
    const prime = parseMarketData(statusData?.Stocks?.MarketPrime);
    const standard = parseMarketData(statusData?.Stocks?.MarketStandard);
    const growth = parseMarketData(statusData?.Stocks?.MarketGrowth);
    
    const topixClose = cleanNumber(priceData?.MainStockIndex?.Topix?.currentPrice);
    const growth250Close = cleanNumber(priceData?.MainStockIndex?.TseGrowth250Index?.currentPrice);
    
    console.log(`TOPIX Close: ${topixClose}`);
    console.log(`Growth 250 Close: ${growth250Close}`);
    
    // Construct payload
    const payload = {
      type: 'jpx',
      date: formattedDate,
      prime,
      standard,
      growth,
      indices: {
        nikkei225: nikkei225Close,
        topix: topixClose,
        growth250: growth250Close
      }
    };
    
    console.log('Constructed JPX Payload:', JSON.stringify(payload, null, 2));
    
    // 4. Post to GAS Webapp
    const gasUrl = process.env.GAS_WEBAPP_URL;
    if (gasUrl) {
      console.log(`Sending JPX data to GAS Web App URL: ${gasUrl}`);
      const response = await fetch(gasUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const responseText = await response.text();
      console.log(`GAS Response Status: ${response.status}`);
      console.log(`GAS Response Body: ${responseText}`);
    } else {
      console.log('GAS_WEBAPP_URL environment variable is not set. Skipping POST request.');
    }
    
  } catch (error) {
    console.error('Error during scraping JPX data:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

function parseJPXTime(timeStr) {
  if (!timeStr) return null;
  const cleaned = timeStr.trim();
  if (cleaned.length < 12) return null;
  
  const year = cleaned.substring(0, 4);
  const month = cleaned.substring(4, 6);
  const day = cleaned.substring(6, 8);
  const hour = cleaned.substring(8, 10);
  const minute = cleaned.substring(10, 12);
  
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

const cleanNumber = (val) => {
  if (val === undefined || val === null || val === '') return 0;
  const cleaned = String(val).replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

function parseMarketData(marketObj) {
  if (!marketObj) {
    return {
      volume: 0,
      turnover: 0,
      marketValue: 0,
      advanced: 0,
      declined: 0,
      unchanged: 0,
      unknown: 0,
      listedCompanies: 0,
      listedIssues: 0
    };
  }
  
  return {
    volume: cleanNumber(marketObj.volume),
    turnover: cleanNumber(marketObj.turnover),
    marketValue: cleanNumber(marketObj.marketValue),
    advanced: cleanNumber(marketObj.risenStockAmount),
    declined: cleanNumber(marketObj.fallenStockAmount),
    unchanged: cleanNumber(marketObj.unchangedStockAmount),
    unknown: cleanNumber(marketObj.NoncomparableStockAmount),
    listedCompanies: cleanNumber(marketObj.listedCompanyAmount),
    listedIssues: cleanNumber(marketObj.stockAmount)
  };
}

run();
