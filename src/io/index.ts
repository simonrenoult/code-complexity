import Cli from "./cli";
import Output from "./output";
import { Path } from "../lib/types";
import Statistics from "../lib";

export default async function main(): Promise<void> {
  const options = await Cli.parse();
  const statistics: Map<Path, Statistics> = await Statistics.compute(options);
  Cli.cleanup(options);
  Output.render(statistics, options);
}
