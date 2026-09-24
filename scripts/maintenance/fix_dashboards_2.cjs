const fs = require('fs');
const path = require('path');
const dir = 'e:/PET SHOP/src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Dashboard.jsx'));

files.forEach(f => {
  let code = fs.readFileSync(path.join(dir, f), 'utf8');
  let orig = code;
  
  code = code.replace(/<aside className="([^"]+)"/g, (match, classes) => {
    let newClasses = classes;
    
    // Remove duplicates if already applied by accident
    newClasses = newClasses.replace(/w-full lg:w-full lg:w-(\d+)/g, 'w-full lg:w-$1');
    
    // Ensure we don't double replace
    if (!newClasses.includes('w-full')) {
      newClasses = newClasses.replace(/\bw-64\b/g, 'w-full lg:w-64');
      newClasses = newClasses.replace(/\bw-72\b/g, 'w-full lg:w-72');
      newClasses = newClasses.replace(/\bw-80\b/g, 'w-full lg:w-80');
    }
    
    if (!newClasses.includes('lg:sticky')) {
      newClasses = newClasses.replace(/\bsticky\b/g, 'relative lg:sticky');
      newClasses = newClasses.replace(/\btop-\[104px\]\b/g, 'lg:top-[104px]');
      newClasses = newClasses.replace(/\btop-0\b/g, 'lg:top-0');
    }
    
    if (!newClasses.includes('h-auto')) {
      newClasses = newClasses.replace(/\bh-\[calc\(100vh-104px\)\]\b/g, 'h-auto lg:h-[calc(100vh-104px)]');
      newClasses = newClasses.replace(/\bh-screen\b/g, 'h-auto lg:h-screen');
    }
    
    return `<aside className="${newClasses}"`;
  });
  
  // Also check if any other fixed container is causing overflow
  // e.g. <main className="flex-1 min-w-0"> is usually good.
  
  if (orig !== code) {
    fs.writeFileSync(path.join(dir, f), code);
    console.log('Updated ' + f);
  }
});
