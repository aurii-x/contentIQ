module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/vendor");
  eleventyConfig.addFilter("json", (val) => JSON.stringify(val));
  eleventyConfig.addFilter("pct", (val) => (val * 100).toFixed(2) + "%");
  eleventyConfig.addFilter("sum", (arr, key) => arr.reduce((acc, item) => acc + (item[key] || 0), 0));

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
  };
};
