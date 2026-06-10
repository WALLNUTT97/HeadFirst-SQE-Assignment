import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

const testRoot = path.join(repoRoot, "cypress", "e2e");
const supportRoot = path.join(repoRoot, "cypress", "support");
const fixtureRoot = path.join(repoRoot, "cypress", "fixtures");
const skillRoot = path.join(repoRoot, "skills", "test-analyzer");

const markdownReportPath = path.join(skillRoot, "test-analysis-report.md");
const jsonReportPath = path.join(skillRoot, "test-analysis-report.json");

const testFilePattern = /.(cy|spec).(js|ts|jsx|tsx)$/;
const sourceFilePattern = /.(js|ts|jsx|tsx)$/;
const fixtureFilePattern = /.json$/;

const walkMatchingFiles = (directory, filePattern) => {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return walkMatchingFiles(fullPath, filePattern);
    }

    if (filePattern.test(entry.name)) {
      return [fullPath];
    }

    return [];
  });
};

const extractNames = (content, regex) => {
  return [...content.matchAll(regex)].map((match) => match[1]);
};

const detectCoverageAreas = (filePath, content, additionalText = "") => {
  const searchableText =
    `${filePath} ${content} ${additionalText}`.toLowerCase();

  const rules = [
    {
      area: "API testing",
      keywords: ["cy.request", "/api/", "/rest/", "api"],
    },
    {
      area: "Authentication",
      keywords: ["login", "auth", "token", "register", "seed"],
    },
    {
      area: "Basket",
      keywords: ["basket", "basketitem", "add item", "remove item", "quantity"],
    },
    {
      area: "Checkout",
      keywords: ["checkout", "placeorder", "place order", "orderconfirmation"],
    },
    {
      area: "Address",
      keywords: ["address", "postcode", "zipcode", "zip code", "romania"],
    },
    {
      area: "Delivery",
      keywords: ["delivery", "deliverymethod", "delivery method"],
    },
    {
      area: "Payment",
      keywords: ["payment", "card", "paymentoption", "payment option"],
    },
    {
      area: "Order tracking",
      keywords: ["track", "tracking", "trackingnumber", "tracking number"],
    },
    {
      area: "UI smoke coverage",
      keywords: ["cy.visit", "cy.get", "data-testid"],
    },
    {
      area: "Fixtures / test data",
      keywords: ["cy.fixture", "fixtures", "fixture"],
    },
  ];

  return [
    ...new Set(
      rules
        .filter((rule) =>
          rule.keywords.some((keyword) => searchableText.includes(keyword)),
        )
        .map((rule) => rule.area),
    ),
  ];
};

const analyseTestFile = (filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  const relativePath = path.relative(repoRoot, filePath);

  const describeNames = extractNames(
    content,
    /\bdescribe(?:\.only|\.skip)?\s*\(\s*["']([^"']+)["']/g,
  );

  const testNames = extractNames(
    content,
    /\b(?:it|test)(?:\.only|\.skip)?\s*\(\s*["']([^"']+)["']/g,
  );

  return {
    file: relativePath,
    describeCount: describeNames.length,
    testCount: testNames.length,
    describeNames,
    testNames,
    coverageAreas: detectCoverageAreas(
      relativePath,
      content,
      testNames.join(" "),
    ),
    usesApiRequests: content.includes("cy.request"),
    usesFixtures: content.includes("cy.fixture"),
    usesDataTestIds: content.includes("data-testid"),
  };
};

const analyseSupportFile = (filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  const relativePath = path.relative(repoRoot, filePath);

  const exportedConstFunctions = extractNames(
    content,
    /export const\s+([A-Za-z0-9_]+)\s*=/g,
  );

  const exportedNamedFunctions = extractNames(
    content,
    /export function\s+([A-Za-z0-9_]+)\s*\(/g,
  );

  const exportedFunctions = [
    ...new Set([...exportedConstFunctions, ...exportedNamedFunctions]),
  ];

  return {
    file: relativePath,
    exportedFunctions,
    coverageAreas: detectCoverageAreas(relativePath, content),
    usesApiRequests: content.includes("cy.request"),
    usesFixtures: content.includes("cy.fixture"),
    usesDataTestIds: content.includes("data-testid"),
  };
};

const testFiles = walkMatchingFiles(testRoot, testFilePattern);
const supportFiles = walkMatchingFiles(supportRoot, sourceFilePattern);
const fixtureFiles = walkMatchingFiles(fixtureRoot, fixtureFilePattern).map(
  (filePath) => path.relative(repoRoot, filePath),
);

const analysedFiles = testFiles.map(analyseTestFile);
const analysedSupportFiles = supportFiles.map(analyseSupportFile);

const totalDescribeBlocks = analysedFiles.reduce(
  (total, file) => total + file.describeCount,
  0,
);

const totalTests = analysedFiles.reduce(
  (total, file) => total + file.testCount,
  0,
);

const allCoverageAreas = [
  ...new Set([
    ...analysedFiles.flatMap((file) => file.coverageAreas),
    ...analysedSupportFiles.flatMap((file) => file.coverageAreas),
  ]),
];

const usesApiRequests =
  analysedFiles.some((file) => file.usesApiRequests) ||
  analysedSupportFiles.some((file) => file.usesApiRequests);

const usesFixtures =
  analysedFiles.some((file) => file.usesFixtures) ||
  analysedSupportFiles.some((file) => file.usesFixtures) ||
  fixtureFiles.length > 0;

const usesDataTestIds =
  analysedFiles.some((file) => file.usesDataTestIds) ||
  analysedSupportFiles.some((file) => file.usesDataTestIds);

const recommendations = [];

if (analysedFiles.length === 0) {
  recommendations.push(
    "No Cypress test files were found. Add Cypress tests under cypress/e2e.",
  );
}

if (totalTests <= 1) {
  recommendations.push(
    "Add more focused scenarios around negative checkout paths, validation errors, and edge cases.",
  );
}

if (!usesApiRequests) {
  recommendations.push(
    "Add or expose API-driven test coverage using cy.request for critical backend flows.",
  );
}

if (!allCoverageAreas.includes("UI smoke coverage")) {
  recommendations.push(
    "Add a small number of UI smoke tests for the most business-critical user journeys.",
  );
}

if (!allCoverageAreas.includes("Payment")) {
  recommendations.push(
    "Add payment-specific validation, including invalid card data and expired card scenarios.",
  );
}

if (!allCoverageAreas.includes("Address")) {
  recommendations.push(
    "Add address validation scenarios for missing required fields, invalid postcodes, and unsupported country data.",
  );
}

if (!usesFixtures) {
  recommendations.push(
    "Use fixtures and typed test data to make test data easier to maintain.",
  );
}

if (!usesDataTestIds) {
  recommendations.push(
    "Add data-testid selectors to important UI elements to improve UI test stability.",
  );
}

recommendations.push(
  "Add API schema or contract validation for key checkout responses.",
);

recommendations.push(
  "Add test tags such as @smoke, @api, @checkout, and @regression for easier CI selection.",
);

recommendations.push(
  "Publish Cypress screenshots, videos, and machine-readable reports as CI artifacts.",
);

const report = {
  generatedAt: new Date().toISOString(),
  roots: {
    tests: path.relative(repoRoot, testRoot),
    support: path.relative(repoRoot, supportRoot),
    fixtures: path.relative(repoRoot, fixtureRoot),
  },
  summary: {
    testFiles: analysedFiles.length,
    supportFiles: analysedSupportFiles.length,
    fixtureFiles: fixtureFiles.length,
    describeBlocks: totalDescribeBlocks,
    testCases: totalTests,
    coverageAreas: allCoverageAreas,
    usesApiRequests,
    usesFixtures,
    usesDataTestIds,
  },
  files: analysedFiles,
  supportFiles: analysedSupportFiles,
  fixtureFiles,
  recommendations,
  notes: {
    performance:
      "The skill scans Cypress test, support, and fixture files instead of the full application repository, keeping runtime fast.",
    tokenUsage:
      "The generated Markdown and JSON summaries can be provided to an AI assistant instead of sending the full repository.",
    accuracy:
      "Test counts are calculated directly from test source files. Coverage areas are inferred from test files and supporting helper code, so they should be treated as guidance rather than full code coverage.",
  },
};

const markdownLines = [];

markdownLines.push("# Test Analyzer Report");
markdownLines.push("");
markdownLines.push(`Generated: ${report.generatedAt}`);
markdownLines.push("");
markdownLines.push("## Summary");
markdownLines.push("");
markdownLines.push(`- Test files found: ${report.summary.testFiles}`);
markdownLines.push(`- Support files found: ${report.summary.supportFiles}`);
markdownLines.push(`- Fixture files found: ${report.summary.fixtureFiles}`);
markdownLines.push(`- Describe blocks found: ${report.summary.describeBlocks}`);
markdownLines.push(`- Test cases found: ${report.summary.testCases}`);
markdownLines.push(
  `- Coverage areas detected: ${
    report.summary.coverageAreas.length > 0
      ? report.summary.coverageAreas.join(", ")
      : "None detected"
  }`,
);
markdownLines.push(`- Uses API requests: ${usesApiRequests ? "Yes" : "No"}`);
markdownLines.push(`- Uses fixtures: ${usesFixtures ? "Yes" : "No"}`);
markdownLines.push(
  `- Uses data-testid selectors: ${usesDataTestIds ? "Yes" : "No"}`,
);
markdownLines.push("");
markdownLines.push("## Test Files");
markdownLines.push("");

if (analysedFiles.length > 0) {
  analysedFiles.forEach((file) => {
    markdownLines.push(`### ${file.file}`);
    markdownLines.push("");
    markdownLines.push(`- Test cases: ${file.testCount}`);
    markdownLines.push(`- Describe blocks: ${file.describeCount}`);
    markdownLines.push(
      `- Coverage areas: ${
        file.coverageAreas.length > 0
          ? file.coverageAreas.join(", ")
          : "None detected"
      }`,
    );
    markdownLines.push(
      `- Uses API requests directly: ${file.usesApiRequests ? "Yes" : "No"}`,
    );
    markdownLines.push(
      `- Uses fixtures directly: ${file.usesFixtures ? "Yes" : "No"}`,
    );
    markdownLines.push(
      `- Uses data-testid selectors directly: ${
        file.usesDataTestIds ? "Yes" : "No"
      }`,
    );
    markdownLines.push("");
    markdownLines.push("#### Test Names");
    markdownLines.push("");

    if (file.testNames.length > 0) {
      file.testNames.forEach((testName) => {
        markdownLines.push(`- ${testName}`);
      });
    } else {
      markdownLines.push("- None found");
    }

    markdownLines.push("");
  });
} else {
  markdownLines.push("- None found");
  markdownLines.push("");
}

markdownLines.push("## Support Files");
markdownLines.push("");

if (analysedSupportFiles.length > 0) {
  analysedSupportFiles.forEach((file) => {
    markdownLines.push(`### ${file.file}`);
    markdownLines.push("");
    markdownLines.push(
      `- Exported functions: ${
        file.exportedFunctions.length > 0
          ? file.exportedFunctions.join(", ")
          : "None detected"
      }`,
    );
    markdownLines.push(
      `- Coverage areas: ${
        file.coverageAreas.length > 0
          ? file.coverageAreas.join(", ")
          : "None detected"
      }`,
    );
    markdownLines.push(
      `- Uses API requests: ${file.usesApiRequests ? "Yes" : "No"}`,
    );
    markdownLines.push(`- Uses fixtures: ${file.usesFixtures ? "Yes" : "No"}`);
    markdownLines.push(
      `- Uses data-testid selectors: ${file.usesDataTestIds ? "Yes" : "No"}`,
    );
    markdownLines.push("");
  });
} else {
  markdownLines.push("- None found");
  markdownLines.push("");
}

markdownLines.push("## Fixtures");
markdownLines.push("");

if (fixtureFiles.length > 0) {
  fixtureFiles.forEach((fixtureFile) => {
    markdownLines.push(`- ${fixtureFile}`);
  });
} else {
  markdownLines.push("- None found");
}

markdownLines.push("");
markdownLines.push("## Recommendations");
markdownLines.push("");

recommendations.forEach((recommendation) => {
  markdownLines.push(`- ${recommendation}`);
});

markdownLines.push("");
markdownLines.push("## Performance, Token Usage, and Accuracy");
markdownLines.push("");
markdownLines.push("### Performance");
markdownLines.push("");
markdownLines.push(
  "The skill scans only Cypress test, support, and fixture files instead of analysing the full Juice Shop repository. This keeps the analysis quick and avoids unnecessary file reads.",
);
markdownLines.push("");
markdownLines.push("### Token Usage");
markdownLines.push("");
markdownLines.push(
  "The generated Markdown and JSON reports are compact summaries. These can be shared with an AI assistant instead of sending the full repository, which reduces token usage and keeps the AI context focused.",
);
markdownLines.push("");
markdownLines.push("### Accuracy");
markdownLines.push("");
markdownLines.push(
  "The number of test files, describe blocks, and test cases is calculated directly from the Cypress test source files.",
);
markdownLines.push("");
markdownLines.push(
  "Support files and fixtures are also scanned so that helper-based test suites are not under-reported. This is important when the main spec file calls reusable flow/helper functions and the API requests live outside the spec file.",
);
markdownLines.push("");
markdownLines.push(
  "Coverage areas are inferred from file names, test names, exported helper names, and keywords such as basket, checkout, payment, address, and delivery. These inferred areas are useful for quick review, but they are not a replacement for full code coverage, mutation testing, or human QE review.",
);
markdownLines.push("");
markdownLines.push("## Proposed Next Steps");
markdownLines.push("");
markdownLines.push("### For the Skill");
markdownLines.push("");
markdownLines.push(
  "- Add support for test tags such as @smoke, @api, @checkout, and @regression.",
);
markdownLines.push(
  "- Add trend reporting so teams can see how test coverage changes over time.",
);
markdownLines.push(
  "- Add CI integration so the report is generated automatically during pull requests.",
);
markdownLines.push("- Add flaky test detection using CI run history.");
markdownLines.push("- Add risk scoring by product area.");
markdownLines.push(
  "- Add deeper parsing of Cypress commands and API endpoints.",
);
markdownLines.push("");
markdownLines.push("### For the Test Suite");
markdownLines.push("");
markdownLines.push("- Add negative checkout scenarios.");
markdownLines.push("- Add invalid address and invalid payment scenarios.");
markdownLines.push("- Add empty basket checkout validation.");
markdownLines.push("- Add API schema validation for critical responses.");
markdownLines.push(
  "- Add more UI smoke coverage using stable data-testid selectors.",
);
markdownLines.push(
  "- Add CI artifacts such as screenshots, videos, and XML reports.",
);

fs.mkdirSync(skillRoot, { recursive: true });
fs.writeFileSync(markdownReportPath, markdownLines.join("\n"));
fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));

console.log("Test analysis complete.");
console.log(`Markdown report written to: ${markdownReportPath}`);
console.log(`JSON report written to: ${jsonReportPath}`);
