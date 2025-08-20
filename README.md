# code-complexity

> Measure the churn/complexity score. Higher scores reveal hotspots where
> refactorings should happen.

[![Style Status][style-image]][style-url]
[![NPM Version][npm-image]][npm-url]

Quoting Michael Feathers (source [here][michael-feathers-source]):

*Often when we refactor, we look at local areas of code. If we take a wider
view, using information from our version control systems, we can get a better
sense of the effects of our refactoring efforts.*

Note: `code-complexity` currently measures complexity using either:
- lines of code count (for most languages)
- cyclomatic complexity (JavaScript/TypeScript)
- halstead complexity (JavaScript/TypeScript)

## Usage

```sh
$ npx code-complexity <path-to-git-directory or URL> [options]
```

## Help

```text
Usage: code-complexity <target> [options]

Options:
  -V, --version                                          output the version number
  --filter <strings>                                     list of globs (comma separated) to filter
  -cs, --complexity-strategy [sloc|cyclomatic|halstead]  choose the complexity strategy to analyze your codebase with (default: "sloc")
  -f, --format [table|json|csv]                          format results
  -l, --limit [limit]                                    limit the number of files to output
  -i, --since [since]                                    limit analysis to commits more recent in age than date
  -u, --until [until]                                    limit analysis to commits older in age than date
  -s, --sort [score|churn|complexity|file]               sort results (allowed valued: score, churn, complexity or file)
  -d, --directories                                      display values for directories instead of files
  -mb, --max-buffer [maxBuffer]                          set the max buffer size for git log (in bytes)
  -h, --help                                             display help for command

Examples:

$ code-complexity .
$ code-complexity https://github.com/simonrenoult/code-complexity
$ code-complexity foo --limit 3
$ code-complexity ../foo --sort score
$ code-complexity /foo/bar --filter 'src/**,!src/front/**'
$ code-complexity . --limit 10 --sort score
$ code-complexity . --limit 10 --directories
$ code-complexity . --limit 10 --sort score -cs halstead
$ code-complexity . --since=2021-06-01 --limit 100
$ code-complexity . --since=2021-04-01 --until=2021-07-01
$ code-complexity . --max-buffer 64000000
```

## Which strategy should you choose?

Currently, `code-complexity` supports three strategies:
- `sloc`
- `cyclomatic` (JavaScript/TypeScript only)
- `halstead` (JavaScript/TypeScript only)

`sloc` is the default strategy since it works on pretty much any language.
It's a basic source code line count. One could think that it's not super helpful, but I have found that length is a 
decent starting point.

`cyclomatic` is a more advanced strategy that uses the [cyclomatic complexity][cyclomatic]
of functions. Basically, the more nesting you have, the more complex your function is.

`halstead` is a more advanced strategy that uses the [halstead complexity][halstead]`.
It will evaluate complexity based on the number of operands, operators and operands per operator.
Basically, the more diverse operators you have, the more complex your function is.

None is better than the other ;)

My own workflow is usually to poke around with one of them, look at the underlying
code and then decide if the complexity is worth refactoring.

[cyclomatic]: https://en.wikipedia.org/wiki/Cyclomatic_complexity
[halstead]: https://en.wikipedia.org/wiki/Halstead_complexity_measures

## Output

```sh
$ npx code-complexity https://github.com/simonrenoult/code-complexity --sort=score --limit=3

┌──────────────────────────────┬────────────┬───────┬───────┐
│ file                         │ complexity │ churn │ score │
├──────────────────────────────┼────────────┼───────┼───────┤
│ src/cli.ts                   │ 103        │ 8     │ 824   │
├──────────────────────────────┼────────────┼───────┼───────┤
│ test/code-complexity.test.ts │ 107        │ 7     │ 749   │
├──────────────────────────────┼────────────┼───────┼───────┤
│ .idea/workspace.xml          │ 123        │ 6     │ 738   │
└──────────────────────────────┴────────────┴───────┴───────┘
```

## Special thanks

A special thanks to a few contributors that helped me make `code-complexity` better.

- Alexander Dormann (alexdo) for fixing the `ENOBUFS` (and apologies for stealing your code).
- Scott Brooks (scottamplitude) for initiating the work on complexity strategies

[michael-feathers-source]:https://www.stickyminds.com/article/getting-empirical-about-refactoring
[travis-image]:https://img.shields.io/travis/simonrenoult/code-complexity/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/simonrenoult/code-complexity
[style-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[style-url]: https://prettier.io/
[coverage-image]: https://img.shields.io/codecov/c/github/simonrenoult/code-complexity.svg?style=flat-square
[coverage-url]: https://codecov.io/gh/simonrenoult/code-complexity/branch/master
[npm-image]: https://img.shields.io/npm/v/code-complexity.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/code-complexity
