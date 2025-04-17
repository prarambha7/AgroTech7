// utils/vectorHelper.js
const { preprocessText } = require('../utils/textHelper');
const calculateTF = (tokens) => {
    const tf = {};
    tokens.forEach((token) => {
      tf[token] = (tf[token] || 0) + 1;
    });
    const totalTokens = tokens.length;
    for (const token in tf) {
      tf[token] = tf[token] / totalTokens;
    }
    console.log("TF Values:", tf);
    return tf;
  };
  
  const calculateIDF = (documents) => {
    const idf = {};
    const totalDocs = documents.length;
  
    documents.forEach((tokens) => {
      const uniqueTokens = new Set(tokens);
      uniqueTokens.forEach((token) => {
        idf[token] = (idf[token] || 0) + 1;
      });
    });
  
    for (const token in idf) {
      idf[token] = Math.log(totalDocs / idf[token]);
    }
    console.log("IDF Values:", idf); 
    return idf;
  };
  
  const generateTFIDFVectors = (documents) => {
    const tokenizedDocs = documents.map(preprocessText);
    const idf = calculateIDF(tokenizedDocs);
  
    const tfIdfVectors = tokenizedDocs.map((tokens) => {
      const tf = calculateTF(tokens);
      const tfIdf = {};
      for (const token in tf) {
        tfIdf[token] = tf[token] * (idf[token] || 0);
      }
      console.log("TF-IDF Vector:", tfIdf); 
      return tfIdf;
    });
  
    console.log("All TF-IDF Vectors:", tfIdfVectors); 
    return tfIdfVectors;
  };
  
  const calculateCosineSimilarity = (vectorA, vectorB) => {
    const dotProduct = Object.keys(vectorA).reduce((sum, key) => {
      return sum + (vectorA[key] || 0) * (vectorB[key] || 0);
    }, 0);
  
    const magnitudeA = Math.sqrt(
      Object.values(vectorA).reduce((sum, value) => sum + value * value, 0)
    );
    const magnitudeB = Math.sqrt(
      Object.values(vectorB).reduce((sum, value) => sum + value * value, 0)
    );
  
    const similarity = magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
    console.log("Cosine Similarity:", similarity); 
    return similarity;
  };
  
  module.exports = { generateTFIDFVectors, calculateCosineSimilarity };
  