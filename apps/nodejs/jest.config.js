module.exports = {
  coverageDirectory: "coverage",
  collectCoverageFrom: ["server.js"],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
};
