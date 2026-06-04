import { chromium } from 'playwright';

async function run() {
  console.log('Starting Playwright...');
  const browser = await chromium.launch({
    headless: true
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });
  
  const page = await context.newPage();
  
  const targetUrl = 'https://www.wsj.com/market-data/stocks';
  console.log(`Navigating to ${targetUrl}...`);
  
  try {
    // Wait for the page to load
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Wait for tables to appear, adding extra delay to ensure dynamic content loads
    console.log('Waiting for elements to load...');
    await page.waitForTimeout(5000);
    
    // Extract tables
    const tableData = await page.evaluate(() => {
      const tables = Array.from(document.querySelectorAll('table'));
      
      return tables.map((table, tableIdx) => {
        // Try to get headers
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.innerText.trim());
        
        // Get all rows
        const trs = Array.from(table.querySelectorAll('tr'));
        const rows = trs.map(tr => {
          const cells = Array.from(tr.querySelectorAll('td, th')).map(td => td.innerText.trim());
          return cells;
        }).filter(r => r.length > 0);
        
        return {
          tableIdx,
          headers,
          rows
        };
      });
    });
    
    console.log(`Found ${tableData.length} tables on the page.`);
    
    // Find the Markets Diary table
    // The Markets Diary table should contain rows with text like "Issues", "Advancing", "Declining", "New Highs", "Share Volume"
    let diaryTable = null;
    for (const t of tableData) {
      const fullText = JSON.stringify(t.rows).toLowerCase();
      if (
        (fullText.includes('advancing') || fullText.includes('advances')) &&
        fullText.includes('declining') &&
        fullText.includes('new highs') &&
        fullText.includes('share volume')
      ) {
        diaryTable = t;
        break;
      }
    }
    
    if (!diaryTable) {
      console.error('Could not find Markets Diary table automatically. Printing all table headers for debugging:');
      tableData.forEach(t => {
        console.log(`Table ${t.tableIdx} Headers:`, t.headers);
        console.log(`Table ${t.tableIdx} First Row:`, t.rows[0]);
      });
      throw new Error('Markets Diary table not found');
    }
    
    console.log(`Found Markets Diary Table at index ${diaryTable.tableIdx}:`);
    console.log(JSON.stringify(diaryTable.rows, null, 2));
    
    // Parse the table rows dynamically
    const parsedData = parseDiaryTable(diaryTable.rows);
    console.log('Parsed Data:', JSON.stringify(parsedData, null, 2));
    
    // Send to Google Apps Script if URL is provided
    const gasUrl = process.env.GAS_WEBAPP_URL;
    if (gasUrl) {
      console.log(`Sending data to GAS Web App URL: ${gasUrl}`);
      const response = await fetch(gasUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parsedData)
      });
      
      const responseText = await response.text();
      console.log(`GAS Response Status: ${response.status}`);
      console.log(`GAS Response Body: ${responseText}`);
    } else {
      console.log('GAS_WEBAPP_URL environment variable is not set. Skipping POST request.');
    }
    
  } catch (error) {
    console.error('Error during scraping:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

function parseDiaryTable(rows) {
  // We need to identify columns for NYSE and Nasdaq.
  // The header row is usually the first row or contains "NYSE" and "Nasdaq"
  let nyseColIdx = -1;
  let nasdaqColIdx = -1;
  
  // Find column indexes for NYSE and Nasdaq
  // Some rows might contain headers like ["DIARY", "NYSE", "Nasdaq", ...]
  for (const row of rows) {
    const isHeaderRow = row.some(cell => cell.toLowerCase().includes('nyse') || cell.toLowerCase().includes('nasdaq'));
    if (isHeaderRow) {
      row.forEach((cell, idx) => {
        const cellLower = cell.toLowerCase();
        if (cellLower.includes('nyse') && !cellLower.includes('arca') && !cellLower.includes('amex') && !cellLower.includes('mkt')) {
          nyseColIdx = idx;
        } else if (cellLower.includes('nasdaq')) {
          nasdaqColIdx = idx;
        }
      });
      break;
    }
  }
  
  // Fallbacks if not found explicitly by headers
  if (nyseColIdx === -1) nyseColIdx = 1;
  if (nasdaqColIdx === -1) nasdaqColIdx = 2; // Nasdaq is usually the next column (or column 2 / 3)
  
  console.log(`Detected columns - NYSE Index: ${nyseColIdx}, Nasdaq Index: ${nasdaqColIdx}`);
  
  const nyDateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = nyDateFormatter.formatToParts(new Date());
  const year = parts.find(p => p.type === 'year').value;
  const month = parts.find(p => p.type === 'month').value;
  const day = parts.find(p => p.type === 'day').value;
  const formattedDate = `${year}-${month}-${day}`;

  const result = {
    date: formattedDate,
    nyse: {
      issues: {},
      new_highs_lows: {},
      share_volume: {}
    },
    nasdaq: {
      issues: {},
      new_highs_lows: {},
      share_volume: {}
    }
  };
  
  let currentSection = ''; // 'issues', 'new_highs_lows', 'share_volume'
  
  for (const row of rows) {
    if (row.length === 0) continue;
    
    const label = row[0].trim();
    const labelLower = label.toLowerCase();
    
    // Check if this row changes the current section
    if (labelLower.includes('issues') && !labelLower.includes('new') && !labelLower.includes('volume')) {
      currentSection = 'issues';
      continue;
    } else if (labelLower.includes('issues at') || labelLower.includes('new highs') || labelLower.includes('new lows')) {
      currentSection = 'new_highs_lows';
    } else if (labelLower.includes('share volume') || labelLower.includes('volume')) {
      currentSection = 'share_volume';
      continue;
    }
    
    // Clean and parse numbers
    const cleanNumber = (val) => {
      if (!val) return 0;
      // Remove commas, spaces, % etc.
      const cleaned = val.replace(/,/g, '').trim();
      const num = parseInt(cleaned, 10);
      return isNaN(num) ? 0 : num;
    };
    
    const nyseVal = cleanNumber(row[nyseColIdx]);
    const nasdaqVal = cleanNumber(row[nasdaqColIdx]);
    
    if (currentSection === 'issues') {
      if (labelLower.includes('advancing') || labelLower.includes('advances')) {
        result.nyse.issues.advancing = nyseVal;
        result.nasdaq.issues.advancing = nasdaqVal;
      } else if (labelLower.includes('declining') || labelLower.includes('declines')) {
        result.nyse.issues.declining = nyseVal;
        result.nasdaq.issues.declining = nasdaqVal;
      } else if (labelLower.includes('unchanged')) {
        result.nyse.issues.unchanged = nyseVal;
        result.nasdaq.issues.unchanged = nasdaqVal;
      } else if (labelLower.includes('total')) {
        result.nyse.issues.total = nyseVal;
        result.nasdaq.issues.total = nasdaqVal;
      }
    } else if (currentSection === 'new_highs_lows') {
      if (labelLower.includes('high')) {
        result.nyse.new_highs_lows.new_highs = nyseVal;
        result.nasdaq.new_highs_lows.new_highs = nasdaqVal;
      } else if (labelLower.includes('low')) {
        result.nyse.new_highs_lows.new_lows = nyseVal;
        result.nasdaq.new_highs_lows.new_lows = nasdaqVal;
      }
    } else if (currentSection === 'share_volume') {
      if (labelLower.includes('total')) {
        result.nyse.share_volume.total = nyseVal;
        result.nasdaq.share_volume.total = nasdaqVal;
      } else if (labelLower.includes('advancing') || labelLower.includes('advances')) {
        result.nyse.share_volume.advancing = nyseVal;
        result.nasdaq.share_volume.advancing = nasdaqVal;
      } else if (labelLower.includes('declining') || labelLower.includes('declines')) {
        result.nyse.share_volume.declining = nyseVal;
        result.nasdaq.share_volume.declining = nasdaqVal;
      } else if (labelLower.includes('unchanged')) {
        result.nyse.share_volume.unchanged = nyseVal;
        result.nasdaq.share_volume.unchanged = nasdaqVal;
      }
    }
  }
  
  return result;
}

run();
