// Lightweight test for getProductImageCandidates
const { getProductImageCandidates } = require('../dist/getProductImageCandidates.cjs.js') || require('../src/lib/getProductImageCandidates');

function run() {
  const samples = [
    { article: 'ABC123', images: ['img1.jpg', '/uploads/img2.png'], photo: 'photo.jpg' },
    { article: 'XYZ', photo: '/static/pic/xyz.png' },
    { article: '' },
  ];
  samples.forEach((s, i) => {
    console.log('sample', i, getProductImageCandidates(s));
  });
}

run();
