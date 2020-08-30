var versions = ["1.0"];

module.exports = (options = {}, context) => ({
  extendPageData($page) {
    const { regularPath, frontmatter } = $page;

    frontmatter.meta = [];

    versions.forEach(function(version) {
      if ($page.regularPath.includes("/" + version + "/")) {
        frontmatter.meta.push({
          name: "docsearch:version",
          content: version + ".0"
        });
      }
    });
  }
});
