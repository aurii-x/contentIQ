const getPosts = require("./posts.js");

module.exports = function () {
  const posts = getPosts();
  const avgRate = posts.length
    ? posts.reduce((acc, p) => acc + p.engagementRate, 0) / posts.length
    : 0;
  const bestPost = posts.length
    ? posts.reduce((best, p) => (p.engagementRate > best.engagementRate ? p : best), posts[0])
    : { topic: "N/A" };

  return { avgRate, bestPost };
};
