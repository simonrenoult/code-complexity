import Statistics from ".";
import Cli from "../io/cli";
import { Command, Path } from "./types";

export default async function main(params: Command): Promise<any> {
  const options = await Cli.parse(params);
  const statistics: Map<Path, Statistics> = await Statistics.compute(options);

  Cli.cleanup(options);

  const values = JSON.parse(JSON.stringify(Array.from(statistics.values())));

  return values;
};