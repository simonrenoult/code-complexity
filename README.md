# code-complexity

> Measure the churn/complexity score. Higher values mean hotspots where 
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
$ npx code-complexity <path-to-git-directory or URL>
```

## Help

```text
    Usage: code-complexity <dir> [options]
    
    Measure the churn/complexity score. Higher values mean hotspots where refactorings should happen.
    
    Options:
      -V, --version          output the version number
      --filter <strings>     list of globs (comma separated) to filter
      -f, --format [format]  format results using table or json
      -l, --limit [limit]    limit the number of files to output
      -i, --since [since]    limit the age of the commit analyzed
      -s, --sort [sort]      sort results (allowed valued: score,
                             churn, complexity or file)
      -h, --help             display help for command
    
    Examples:
    
    $ code-complexity .
    $ code-complexity https://github.com/simonrenoult/code-complexity
    $ code-complexity foo --limit 3
    $ code-complexity ../foo --sort score
    $ code-complexity /foo/bar --filter 'src/**,!src/front/**'
    $ code-complexity . --limit 10 --sort score
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

## Troubleshooting

+ `Error: stdout maxBuffer exceeded`: use the flag `--since` to limit the number of commits to analyze.

[michael-feathers-source]:https://www.stickyminds.com/article/getting-empirical-about-refactoring
[travis-image]:https://img.shields.io/travis/simonrenoult/code-complexity/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/simonrenoult/code-complexity
[style-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[style-url]: https://prettier.io/
[coverage-image]: https://img.shields.io/codecov/c/github/simonrenoult/code-complexity.svg?style=flat-square
[coverage-url]: https://codecov.io/gh/simonrenoult/code-complexity/branch/master
[npm-image]: https://img.shields.io/npm/v/code-complexity.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/code-complexity
