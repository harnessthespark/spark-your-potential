/**
 * SPARK YOUR POTENTIAL - GOOGLE SHEETS INTEGRATION
 *
 * This Google Apps Script saves client responses to a Google Sheet.
 * Perfect for collecting and analysing client ability recognition data.
 *
 * SETUP INSTRUCTIONS:
 * ==================
 *
 * 1. CREATE A GOOGLE SHEET:
 *    - Go to https://sheets.google.com
 *    - Create a new spreadsheet
 *    - Name it "Spark Your Potential Responses"
 *    - Copy the Spreadsheet ID from the URL
 *      (it's the long string between /d/ and /edit)
 *
 * 2. SET UP THIS SCRIPT:
 *    - Go to Extensions > Apps Script in your Google Sheet
 *    - Delete any code in the editor
 *    - Paste this entire script
 *    - Click the settings icon (⚙️) on the left
 *    - Replace YOUR_SPREADSHEET_ID_HERE below with your actual Spreadsheet ID
 *
 * 3. DEPLOY AS WEB APP:
 *    - Click "Deploy" > "New deployment"
 *    - Click "Select type" > "Web app"
 *    - Description: "Spark Your Potential Form Handler"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (required for form submissions)
 *    - Click "Deploy"
 *    - Authorise the script when prompted
 *    - Copy the Web App URL
 *
 * 4. UPDATE YOUR HTML FILE:
 *    - Open ability-recognition-visual.html
 *    - Find line 741: const GOOGLE_SHEETS_URL = '...';
 *    - Replace YOUR_SCRIPT_ID_HERE with your Web App URL
 *    - Save the file
 *
 * 5. TEST IT:
 *    - Open your HTML file in a browser
 *    - Fill in some responses
 *    - Click "Save to Google Sheets"
 *    - Check your Google Sheet for the new row
 *
 * TROUBLESHOOTING:
 * ===============
 * - If you get "Authorization required", re-deploy the script
 * - If nothing saves, check the browser console for errors
 * - Make sure "Who has access" is set to "Anyone"
 * - The script creates columns automatically on first run
 */

// ⚙️ CONFIGURATION - REPLACE WITH YOUR SPREADSHEET ID
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'Responses';

/**
 * Handles POST requests from the HTML form
 */
function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);

    // Get or create the spreadsheet
    const sheet = getOrCreateSheet();

    // Prepare the row data
    const rowData = prepareRowData(data);

    // Append to sheet
    sheet.appendRow(rowData);

    // Return success
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Data saved successfully' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Return error
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Gets or creates the responses sheet with headers
 */
function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);

    // Add headers
    const headers = [
      'Timestamp',
      'Client Name',
      // Evidence Collection
      'Outcome #1',
      'Outcome #2',
      'Outcome #3',
      'Outcome #4',
      'Outcome #5',
      // Instinct Radar
      'When You Knew Before You Knew',
      'The Questions Only You Ask',
      // Effortless Ability
      'What Feels Easy to You',
      'The "Of Course" Moments',
      // Transformation Mirror
      'Before',
      'After',
      // What Finds You
      'The Problem Magnet',
      'How Others See You',
      // Recognition Summary
      "The ability I've been underestimating:",
      'The pattern I now see:',
      'The transformation I enable:',
      "The permission I'm giving myself:"
    ];

    sheet.appendRow(headers);

    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#2c3e50');
    headerRange.setFontColor('#ffffff');

    // Auto-resize columns
    sheet.autoResizeColumns(1, headers.length);
  }

  return sheet;
}

/**
 * Prepares row data in the correct order
 */
function prepareRowData(data) {
  return [
    new Date(data.timestamp),
    data.clientName || 'Anonymous',
    // Evidence Collection
    data['Outcome #1'] || '',
    data['Outcome #2'] || '',
    data['Outcome #3'] || '',
    data['Outcome #4'] || '',
    data['Outcome #5'] || '',
    // Instinct Radar
    data['When You Knew Before You Knew'] || '',
    data['The Questions Only You Ask'] || '',
    // Effortless Ability
    data['What Feels Easy to You'] || '',
    data['The "Of Course" Moments'] || '',
    // Transformation Mirror
    data['Before'] || '',
    data['After'] || '',
    // What Finds You
    data['The Problem Magnet'] || '',
    data['How Others See You'] || '',
    // Recognition Summary
    data["The ability I've been underestimating:"] || '',
    data['The pattern I now see:'] || '',
    data['The transformation I enable:'] || '',
    data["The permission I'm giving myself:"] || ''
  ];
}

/**
 * Test function - run this to verify your setup
 * Click the "Run" button after selecting this function
 */
function testSetup() {
  try {
    // Test spreadsheet access
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('✓ Spreadsheet access successful: ' + spreadsheet.getName());

    // Test sheet creation
    const sheet = getOrCreateSheet();
    Logger.log('✓ Sheet ready: ' + sheet.getName());

    // Test data insertion
    const testData = {
      timestamp: new Date().toISOString(),
      clientName: 'Test Client',
      'Outcome #1': 'Test outcome data',
      "The ability I've been underestimating:": 'Test ability'
    };

    const rowData = prepareRowData(testData);
    sheet.appendRow(rowData);
    Logger.log('✓ Test row added successfully');

    Logger.log('\n✓✓✓ SETUP COMPLETE! ✓✓✓');
    Logger.log('Your Google Sheets integration is working correctly.');
    Logger.log('Now deploy this script as a Web App and copy the URL to your HTML file.');

  } catch (error) {
    Logger.log('✗ Setup failed: ' + error.toString());
    Logger.log('Please check:');
    Logger.log('1. SPREADSHEET_ID is correct (line 51)');
    Logger.log('2. You have edit access to the spreadsheet');
    Logger.log('3. The spreadsheet exists');
  }
}

/**
 * Creates a sample analysis dashboard in a new sheet
 * Run this after collecting some responses
 */
function createAnalysisDashboard() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let dashboard = spreadsheet.getSheetByName('Analysis Dashboard');

  if (!dashboard) {
    dashboard = spreadsheet.insertSheet('Analysis Dashboard');

    // Add analysis sections
    dashboard.getRange('A1').setValue('SPARK YOUR POTENTIAL - ANALYSIS DASHBOARD');
    dashboard.getRange('A1:E1').merge().setFontSize(16).setFontWeight('bold').setBackground('#667eea').setFontColor('#ffffff');

    dashboard.getRange('A3').setValue('Total Responses:');
    dashboard.getRange('B3').setFormula('=COUNTA(Responses!B:B)-1');

    dashboard.getRange('A4').setValue('Latest Response:');
    dashboard.getRange('B4').setFormula('=MAX(Responses!A:A)');

    dashboard.getRange('A6').setValue('Most Common Patterns:');
    dashboard.getRange('A6:E6').merge().setFontWeight('bold').setBackground('#f39c12').setFontColor('#ffffff');

    Logger.log('✓ Analysis dashboard created');
  }
}
