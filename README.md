# code-complexity

> Measure the churn/complexity score. Higher scores reveal hotspots where
> refactorings should happen.

[![Build Status][travis-image]][travis-url]
[![Coverage Status][coverage-image]][coverage-url]
[![Style Status][style-image]][style-url]
[![NPM Version][npm-image]][npm-url]

Quoting Michael Feathers (source [here][michael-feathers-source]):

*Often when we refactor, we look at local areas of code. If we take a wider
view, using information from our version control systems, we can get a better
sense of the effects of our refactoring efforts.*


Note: `code-complexity` currently measures complexity using lines of code count.
While imperfect, this measure gives a good enough idea of what's going on.

## Usage

```sh
$ npx code-complexity <path-to-git-directory or URL> [options]
```

## Help

```text
    Usage: code-complexity <target> [options]

    Measure the churn/complexity score. Higher values mean hotspots where refactorings should happen.

    Options:
      -V, --version                         output the version number
      --filter <strings>                    list of globs (comma separated) to filter
      -cs, --complexity-strategy [strategy] choose the complexity strategy to analyze your codebase with (allowed values: sloc, cyclomatic, halstead).
      -f, --format [format]                 format results using table, json or csv
      -l, --limit [limit]                   limit the number of files to output
      -i, --since [since]                   limit analysis to commits more recent in age than date
      -u, --until [until]                   limit analysis to commits older in age than date
      -s, --sort [sort]                     sort results (allowed valued: score, churn, complexity or file)
      -h, --help                            display help for command

    Examples:

    $ code-complexity .
    $ code-complexity https://github.com/simonrenoult/code-complexity
    $ code-complexity foo --limit 3
    $ code-complexity ../foo --sort score
    $ code-complexity /foo/bar --filter 'src/**,!src/front/**'
    $ code-complexity . --limit 10 --sort score
    $ code-complexity . --limit 10 --modules 
    $ code-complexity . --limit 10 --sort score -cs halstead
    $ code-complexity . --since=2021-06-01 --limit 100
    $ code-complexity . --since=2021-04-01 --until=2021-07-01
```

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

## Notes

- The Halstead metrics are a [collection of several metrics](https://en.wikipedia.org/wiki/Halstead_complexity_measures), we use the "volume" metric.
- We only currently support Halstead and Cyclomatic for JavaScript and TypeScript

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
