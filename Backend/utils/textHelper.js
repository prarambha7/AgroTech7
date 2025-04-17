// utils/textHelper.js
const stopWords = [
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 
  'in', 'is', 'it', 'its', 'of', 'on', 'or', 'the', 'this', 'to', 
  'was', 'with', 'fresh', 'organic', 'high-quality', 'premium', 
  'rich', 'natural', 'sweet', 'creamy', 'tangy', 'crunchy', 
  'harvested', 'grown', 'sourced', 'cultivated', 'produced', 
  'prepared', 'directly', 'locally', 'region', 'farms', 'fields', 
  'many', 'various', 'several'
];
const preprocessText = (text) => {
  const processedText = text
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, '') 
  .split(/\s+/) 
  .filter((word) => word && !stopWords.includes(word)); 

console.log("Preprocessed Text:", processedText); 
return processedText;
};

module.exports = { preprocessText };
