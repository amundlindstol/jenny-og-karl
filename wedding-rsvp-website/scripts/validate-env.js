#!/usr/bin/env node

/**
 * Environment validation script for production deployment
 * Validates that all required environment variables are set and properly formatted
 */

const requiredEnvVars = [
  'GOOGLE_SHEETS_PRIVATE_KEY',
  'GOOGLE_SHEETS_CLIENT_EMAIL', 
  'GOOGLE_SHEETS_SPREADSHEET_ID',
  'NEXT_PUBLIC_WEDDING_DATE',
  'NEXT_PUBLIC_VENUE_NAME'
];

const optionalEnvVars = [
  'NEXT_PUBLIC_VENUE_ADDRESS'
];

function validateEnvironment() {
  console.log('🔍 Validating environment configuration...\n');
  
  let hasErrors = false;
  
  // Check required variables
  console.log('Required Environment Variables:');
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      console.log(`❌ ${varName}: Missing`);
      hasErrors = true;
    } else if (value.includes('your_') || value.includes('...')) {
      console.log(`❌ ${varName}: Contains placeholder values`);
      hasErrors = true;
    } else {
      console.log(`✅ ${varName}: Set`);
    }
  });
  
  console.log('\nOptional Environment Variables:');
  optionalEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      console.log(`⚠️  ${varName}: Not set (optional)`);
    } else {
      console.log(`✅ ${varName}: Set`);
    }
  });
  
  // Validate specific formats
  console.log('\nFormat Validation:');
  
  // Validate Google Sheets private key format
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  if (privateKey) {
    if (privateKey.includes('BEGIN PRIVATE KEY') && privateKey.includes('END PRIVATE KEY')) {
      console.log('✅ GOOGLE_SHEETS_PRIVATE_KEY: Valid format');
    } else {
      console.log('❌ GOOGLE_SHEETS_PRIVATE_KEY: Invalid format (should include BEGIN/END markers)');
      hasErrors = true;
    }
  }
  
  // Validate email format
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  if (clientEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(clientEmail)) {
      console.log('✅ GOOGLE_SHEETS_CLIENT_EMAIL: Valid format');
    } else {
      console.log('❌ GOOGLE_SHEETS_CLIENT_EMAIL: Invalid email format');
      hasErrors = true;
    }
  }
  
  // Validate spreadsheet ID format
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (spreadsheetId) {
    if (spreadsheetId.length > 20 && !spreadsheetId.includes('your_')) {
      console.log('✅ GOOGLE_SHEETS_SPREADSHEET_ID: Valid format');
    } else {
      console.log('❌ GOOGLE_SHEETS_SPREADSHEET_ID: Invalid format or placeholder value');
      hasErrors = true;
    }
  }
  
  // Validate date format
  const weddingDate = process.env.NEXT_PUBLIC_WEDDING_DATE;
  if (weddingDate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(weddingDate)) {
      console.log('✅ NEXT_PUBLIC_WEDDING_DATE: Valid format (YYYY-MM-DD)');
    } else {
      console.log('❌ NEXT_PUBLIC_WEDDING_DATE: Invalid format (should be YYYY-MM-DD)');
      hasErrors = true;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (hasErrors) {
    console.log('❌ Environment validation failed!');
    console.log('Please fix the issues above before deploying to production.');
    process.exit(1);
  } else {
    console.log('✅ Environment validation passed!');
    console.log('Your application is ready for production deployment.');
  }
}

// Load environment variables from .env file if running locally
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config();
  } catch (error) {
    // dotenv not available, continue without it
  }
}

validateEnvironment();