// File: backend/utils/tfidfSimilarity.js

const natural = require('natural');
const TfIdf = natural.TfIdf;

/**
 * Computes cosine similarity manually
 */
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * TF-IDF + Cosine Similarity
 */
module.exports = function tfidfSimilarity(text1, text2) {
  const tfidf = new TfIdf();
  tfidf.addDocument(text1);
  tfidf.addDocument(text2);

  const allTerms = tfidf.listTerms(0).map(term => term.term);
  const vec1 = allTerms.map(term => tfidf.tfidf(term, 0));
  const vec2 = allTerms.map(term => tfidf.tfidf(term, 1));

  return cosineSimilarity(vec1, vec2);
};
