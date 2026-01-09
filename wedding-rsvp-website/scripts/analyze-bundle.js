#!/usr/bin/env node

/**
 * Bundle analysis script for performance optimization
 * Analyzes the Next.js build output and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');

function analyzeBundle() {
  console.log('📊 Analyzing bundle size and performance...\n');
  
  const buildDir = path.join(process.cwd(), '.next');
  
  if (!fs.existsSync(buildDir)) {
    console.log('❌ Build directory not found. Please run "npm run build" first.');
    process.exit(1);
  }
  
  // Analyze static files
  analyzeStaticFiles();
  
  // Analyze JavaScript bundles
  analyzeJavaScriptBundles();
  
  // Provide optimization recommendations
  provideRecommendations();
}

function analyzeStaticFiles() {
  console.log('📁 Static Files Analysis:');
  
  const staticDir = path.join(process.cwd(), '.next', 'static');
  if (!fs.existsSync(staticDir)) {
    console.log('   No static files found.');
    return;
  }
  
  const files = getAllFiles(staticDir);
  const fileSizes = files.map(file => {
    const stats = fs.statSync(file);
    const relativePath = path.relative(staticDir, file);
    return {
      path: relativePath,
      size: stats.size,
      sizeKB: Math.round(stats.size / 1024 * 100) / 100
    };
  });
  
  // Sort by size (largest first)
  fileSizes.sort((a, b) => b.size - a.size);
  
  console.log('   Largest files:');
  fileSizes.slice(0, 10).forEach(file => {
    const sizeColor = file.sizeKB > 100 ? '🔴' : file.sizeKB > 50 ? '🟡' : '🟢';
    console.log(`   ${sizeColor} ${file.path}: ${file.sizeKB} KB`);
  });
  
  const totalSize = fileSizes.reduce((sum, file) => sum + file.size, 0);
  console.log(`   Total static files size: ${Math.round(totalSize / 1024 * 100) / 100} KB\n`);
}

function analyzeJavaScriptBundles() {
  console.log('📦 JavaScript Bundles Analysis:');
  
  const chunksDir = path.join(process.cwd(), '.next', 'static', 'chunks');
  if (!fs.existsSync(chunksDir)) {
    console.log('   No JavaScript chunks found.');
    return;
  }
  
  const jsFiles = getAllFiles(chunksDir).filter(file => file.endsWith('.js'));
  const bundleSizes = jsFiles.map(file => {
    const stats = fs.statSync(file);
    const relativePath = path.relative(chunksDir, file);
    return {
      path: relativePath,
      size: stats.size,
      sizeKB: Math.round(stats.size / 1024 * 100) / 100
    };
  });
  
  // Sort by size (largest first)
  bundleSizes.sort((a, b) => b.size - a.size);
  
  console.log('   Bundle sizes:');
  bundleSizes.forEach(bundle => {
    const sizeColor = bundle.sizeKB > 200 ? '🔴' : bundle.sizeKB > 100 ? '🟡' : '🟢';
    console.log(`   ${sizeColor} ${bundle.path}: ${bundle.sizeKB} KB`);
  });
  
  const totalBundleSize = bundleSizes.reduce((sum, bundle) => sum + bundle.size, 0);
  console.log(`   Total JavaScript size: ${Math.round(totalBundleSize / 1024 * 100) / 100} KB\n`);
}

function provideRecommendations() {
  console.log('💡 Optimization Recommendations:');
  
  const recommendations = [
    {
      category: 'Images',
      items: [
        'Use Next.js Image component for automatic optimization',
        'Convert images to WebP format when possible',
        'Implement lazy loading for images below the fold'
      ]
    },
    {
      category: 'JavaScript',
      items: [
        'Use dynamic imports for components not needed on initial load',
        'Remove unused dependencies and code',
        'Consider code splitting for large components'
      ]
    },
    {
      category: 'CSS',
      items: [
        'Remove unused CSS classes',
        'Use CSS-in-JS or CSS modules to avoid global styles',
        'Minimize critical CSS and defer non-critical styles'
      ]
    },
    {
      category: 'Caching',
      items: [
        'Implement proper cache headers for static assets',
        'Use service workers for offline functionality',
        'Cache API responses when appropriate'
      ]
    },
    {
      category: 'Performance',
      items: [
        'Minimize third-party scripts',
        'Use preload/prefetch for critical resources',
        'Optimize Google Fonts loading'
      ]
    }
  ];
  
  recommendations.forEach(category => {
    console.log(`\n   ${category.category}:`);
    category.items.forEach(item => {
      console.log(`   • ${item}`);
    });
  });
  
  console.log('\n📈 Performance Monitoring:');
  console.log('   • Monitor Core Web Vitals in production');
  console.log('   • Set up performance budgets');
  console.log('   • Use Lighthouse CI for continuous monitoring');
  console.log('   • Track bundle size changes in CI/CD');
}

function getAllFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        traverse(fullPath);
      } else {
        files.push(fullPath);
      }
    });
  }
  
  traverse(dir);
  return files;
}

// Run the analysis
analyzeBundle();