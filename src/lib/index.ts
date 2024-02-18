import Statistics from "./statistics/statistics";
import Churns from "./churn/churns";
import Complexities from "./complexity/complexities";

// Expose shared type interfaces
export * from "./types";

// For CommonJS support: require("code-complexity")
export default Statistics;

// For ESM functional-style support: import { analyze } from "code-complexity";
export const analyze = Statistics.compute;
export const analyse = Statistics.compute;

// For ESM object-style: `import { Statistics } from "code-complexity"`
export {
  Statistics,
  // Expose these as they are dependencies for Statistics
  Churns,
  Complexities,
};
