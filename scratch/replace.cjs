const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/PetTransport.jsx',
  'src/pages/WalkingServices.jsx',
  'src/pages/HostelServices.jsx',
  'src/pages/PetInsurance.jsx',
  'src/pages/BreedingDirectory.jsx',
  'src/pages/ServiceBooking.jsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '../', file); 
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Add import if not present
  if (!content.includes('import ScrollReveal')) {
    content = content.replace(/(import .*?;[\r\n]+)(?=const |function |export )/, `$1import ScrollReveal from '../components/ScrollReveal.jsx';\n`);
  }
  
  // Replace <section with <ScrollReveal variant="fade"
  content = content.replace(/<section(\s|>)/g, '<ScrollReveal variant="fade"$1');
  
  // Replace </section> with </ScrollReveal>
  content = content.replace(/<\/section>/g, '</ScrollReveal>');
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Processed: ${file}`);
});
