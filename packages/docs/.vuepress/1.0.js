module.exports = [
  {
    title: "Getting Started",
    collapsable: false,
    children: ["installation", "databases"],
  },
  {
    title: "Resources",
    collapsable: false,
    children: prefix("resources", [
      "",
      "fields",
      "file-fields",
      "validation",
      "authorization",
    ]),
  },
  {
    title: "Search",
    collapsable: false,
    children: prefix("search", ["global-search", "scout-integration"]),
  },
  {
    title: "Filters",
    collapsable: false,
    children: prefix("filters", ["defining-filters", "registering-filters"]),
  },
  {
    title: "Lenses",
    collapsable: false,
    children: prefix("lenses", ["defining-lenses", "registering-lenses"]),
  },
  {
    title: "Actions",
    collapsable: false,
    children: prefix("actions", ["defining-actions", "registering-actions"]),
  },
  {
    title: "Metrics",
    collapsable: false,
    children: prefix("metrics", ["defining-metrics", "registering-metrics"]),
  },
  {
    title: "Plugins",
    collapsable: false,
    children: prefix("plugins", [
      "",
      "auth",
      "graphql"
    ])
  },
];

function prefix(prefix, children) {
  return children.map((child) => `${prefix}/${child}`);
}
