const fs = require('fs');
const path = require('path');

const oldStr = fs.readFileSync('frontend/src/app/page.tsx', 'utf8');
const newStr = fs.readFileSync('src/app/page.tsx', 'utf8');

function extractHeroSection(str) {
  const startStr = 'function HeroSection() {';
  let startIdx = str.indexOf(startStr);
  if (startIdx === -1) {
     // fallback if it was exported or styled differently
    startIdx = str.indexOf('function HeroSection');
    if (startIdx === -1) return null;
  }
  let braces = 0;
  let inString = false;
  let stringChar = null;
  
  // Find the first opening brace after function decl
  let firstBraceIdx = str.indexOf('{', startIdx);
  braces = 1;
  
  for (let i = firstBraceIdx + 1; i < str.length; i++) {
    const char = str[i];
    
    // basic string skip
    if ((char === '"' || char === "'" || char === '`') && str[i-1] !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = null;
      }
    }
    
    if (!inString) {
      if (char === '{') {
         braces++;
      } else if (char === '}') {
        braces--;
        if (braces === 0) {
          return str.substring(startIdx, i + 1); // Exact chunk
        }
      }
    }
  }
}

const customHero = extractHeroSection(oldStr);
const genericHero = extractHeroSection(newStr);

if (customHero && genericHero) {
   let mergedStr = newStr.replace(genericHero, customHero);
   
   // Apply Header text transformation
   // The brand mark is ':/' or ':/ Back to top'
   mergedStr = mergedStr.replace(/:(\/)/g, 'aether');
   
   // To make sure 'aether Back to top' looks okay:
   mergedStr = mergedStr.replace('aether Back to top', 'Back to top');

   // Update any 'hello@portfol.io' text to 'hello@aether.ai' based on context logic
   mergedStr = mergedStr.replace('hello@portfol.io', 'INFO@AETHER.AI');

   fs.writeFileSync('frontend/src/app/page.tsx', mergedStr, 'utf8');
   console.log('Merge complete!');
} else {
   console.log('Failed to match section bounds.');
   console.log('Custom Hero length: ', customHero ? customHero.length : 0);
   console.log('Generic Hero length:', genericHero ? genericHero.length : 0);
}
