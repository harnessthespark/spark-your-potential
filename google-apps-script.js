/**
 * Google Apps Script for Spark Your Potential - Ability Recognition Tool
 * This script receives form data and saves it to a Google Sheet
 *
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets: https://sheets.google.com
 * 2. Create a new spreadsheet called "Spark Your Potential Responses"
 * 3. Go to Extensions > Apps Script
 * 4. Delete any default code and paste this entire script
 * 5. Click "Deploy" > "New deployment"
 * 6. Select type: "Web app"
 * 7. Execute as: "Me"
 * 8. Who has access: "Anyone" (this allows the HTML form to send data)
 * 9. Click "Deploy" and copy the Web App URL
 * 10. Paste that URL into the HTML file where it says YOUR_SCRIPT_ID_HERE
 */

// Main function that handles POST requests from the HTML form
function doPost(e) {
  try {
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);

    // Setup headers if this is the first entry
    if (sheet.getLastRow() === 0) {
      setupHeaders(sheet);
    }

    // Prepare the row data
    const rowData = [
      new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' }), // Timestamp
      data['Your name (optional):'] || data.clientName || 'Anonymous',

      // Evidence Collection (5 outcomes)
      data['Outcome #1'] || '',
      data['Outcome #2'] || '',
      data['Outcome #3'] || '',
      data['Outcome #4'] || '',
      data['Outcome #5'] || '',

      // Instinct Audit (3 fields)
      data['When You Knew Before You Knew'] || '',
      data['The Questions Only You Ask'] || '',
      data['What You Notice First'] || '',

      // Effortless Ability
      data['What Feels Easy to You'] || '',
      data['The "Of Course" Moments'] || '',

      // Transformation Mirror
      data['Before'] || '',
      data['After'] || '',

      // What Finds You
      data['The Problem Magnet'] || '',
      data['How Others See You'] || '',

      // AI-Generated Insights
      data['AI Pattern Analysis'] || '',
      data['AI Unlock Pattern'] || '',

      // Recognition Summary
      data["The ability I've been underestimating:"] || '',
      data['The pattern I now see:'] || '',
      data['The transformation I enable:'] || '',
      data["The permission I'm giving myself:"] || ''
    ];

    // Append the data to the sheet
    sheet.appendRow(rowData);

    // Format the new row
    formatNewRow(sheet);

    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      'result': 'success',
      'row': sheet.getLastRow()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      'result': 'error',
      'error': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Setup column headers
function setupHeaders(sheet) {
  const headers = [
    'Timestamp',
    'Client Name',

    // Evidence Collection
    'Outcome #1',
    'Outcome #2',
    'Outcome #3',
    'Outcome #4',
    'Outcome #5',

    // Instinct Audit
    'When You Knew Before You Knew',
    'Questions Only You Ask',
    'What You Notice First',

    // Effortless Ability
    'What Feels Easy',
    '"Of Course" Moments',

    // Transformation Mirror
    'Client Before',
    'Client After',

    // What Finds You
    'Problem Magnet',
    'How Others See You',

    // AI-Generated Insights
    'AI Pattern Analysis',
    'AI Unlock Pattern',

    // Recognition Summary
    'Underestimated Ability',
    'Pattern Recognised',
    'Transformation I Enable',
    'Permission I\'m Giving Myself'
  ];

  sheet.appendRow(headers);

  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#2c3e50');
  headerRange.setFontColor('#ffffff');
  headerRange.setHorizontalAlignment('center');

  // Set column widths
  sheet.setColumnWidth(1, 150); // Timestamp
  sheet.setColumnWidth(2, 120); // Name

  // Set wider columns for text responses
  for (let i = 3; i <= headers.length; i++) {
    sheet.setColumnWidth(i, 250);
  }

  // Freeze header row
  sheet.setFrozenRows(1);
}

// Format the most recently added row
function formatNewRow(sheet) {
  const lastRow = sheet.getLastRow();
  const numColumns = sheet.getLastColumn();

  // Get the range for the new row
  const rowRange = sheet.getRange(lastRow, 1, 1, numColumns);

  // Alternate row colouring for readability
  if (lastRow % 2 === 0) {
    rowRange.setBackground('#f8f9fa');
  }

  // Set text wrapping for all cells
  rowRange.setWrap(true);

  // Set vertical alignment to top
  rowRange.setVerticalAlignment('top');

  // Set borders
  rowRange.setBorder(true, true, true, true, true, true);
}

// Test function - run this to verify the script works
function testSetup() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  if (sheet.getLastRow() === 0) {
    setupHeaders(sheet);
    Logger.log('Headers created successfully');
  }

  // Add test data
  const testData = {
    'clientName': 'Test User',
    'Outcome #1': 'Test outcome 1',
    'Outcome #2': 'Test outcome 2',
    'Outcome #3': 'Test outcome 3',
    'Outcome #4': 'Test outcome 4',
    'Outcome #5': 'Test outcome 5',
    'When You Knew Before You Knew': 'Test instinct',
    'The Questions Only You Ask': 'Test questions',
    'What You Notice First': 'Test noticing patterns',
    'What Feels Easy to You': 'Test easy ability',
    'The "Of Course" Moments': 'Test moments',
    'Before': 'Test before state',
    'After': 'Test after state',
    'The Problem Magnet': 'Test problem',
    'How Others See You': 'Test perception',
    'AI Pattern Analysis': 'Test AI pattern insights from Claude',
    'AI Unlock Pattern': 'Test AI unlock pattern from Claude',
    "The ability I've been underestimating:": 'Test ability',
    'The pattern I now see:': 'Test pattern',
    'The transformation I enable:': 'Test transformation',
    "The permission I'm giving myself:": 'Test permission'
  };

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };

  const result = doPost(mockEvent);
  Logger.log('Test result: ' + result.getContent());
}
