import Statistics from "../lib";
import { Path } from "../lib/types";
import Cli from "./cli";
import Output from "./output";

export default async function main(): Promise<void> {
  const options = await Cli.parse();
  const statistics: Map<Path, Statistics> = await Statistics.compute(options);
  Cli.cleanup(options);
  Output.render(statistics, options);
}
