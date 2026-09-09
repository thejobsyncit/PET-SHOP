const fs = require('fs');
const path = require('path');
const dir = 'e:/PET SHOP/src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Dashboard.jsx'));

files.forEach(f => {
  let code = fs.readFileSync(path.join(dir, f), 'utf8');
  let orig = code;
  
  // Fix flex container to stack on mobile
  code = code.replace(/selection:text-\[#0F2E23\] flex"/g, 'selection:text-[#0F2E23] flex flex-col lg:flex-row"');
  
  // Fix sidebar widths
  code = code.replace(/w-80 shrink-0/g, 'w-full lg:w-80 shrink-0');
  code = code.replace(/w-64 shrink-0/g, 'w-full lg:w-64 shrink-0');
  code = code.replace(/w-80 bg-white/g, 'w-full lg:w-80 bg-white');
  code = code.replace(/w-64 bg-white/g, 'w-full lg:w-64 bg-white');
  code = code.replace(/className="w-80/g, 'className="w-full lg:w-80');
  code = code.replace(/className="w-64/g, 'className="w-full lg:w-64');
  
  if (orig !== code) {
    fs.writeFileSync(path.join(dir, f), code);
    console.log('Updated ' + f);
  }
});
