# code-complexity

> Measure projects complexity based on files sloc and commit count.

[![Build Status][travis-image]][travis-url]
[![Coverage Status][coverage-image]][coverage-url]
[![Style Status][style-image]][style-url]
[![NPM Version][npm-image]][npm-url]


## Install

```console
$ npm install --global code-complexity
```


## Usage

```sh
  Usage: code-complexity <dir>

  Measure projects complexity based on files sloc and commit count.

  Options:

    -l, --limit [limit]    Limit the number of files to output
    -d, --details          Show the number of commit and computed sloc
    -c, --commit           Show the number of commits
    -s, --sloc             Show the computed sloc
    -i, --since [since]    Limit the age of the commit analyzed
    -n, --no-first-parent  Do not use the git-log flag '--first-parent' when counting commits
    --sort [sort]          Sort results by commit, complexity, file or sloc
    --min [min]            Exclude results below <min>
    --max [max]            Exclude results above <max>
    -h, --help             output usage information

  Examples:

    $ code-complexity /path/to/git/directory
    $ code-complexity /path/to/git/directory --limit 3
    $ code-complexity /path/to/git/directory --details
    $ code-complexity /path/to/git/directory --min 10 --max 50
```

## Output

```sh
$ code-complexity . --details

src/code-complexity.js 53 (commits: 1, sloc: 53)
src/cli.js 16 (commits: 1, sloc: 16)
```


[travis-image]:https://img.shields.io/travis/simonrenoult/code-complexity/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/simonrenoult/code-complexity
[style-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[style-url]: https://prettier.io/
[coverage-image]: https://img.shields.io/codecov/c/github/simonrenoult/code-complexity.svg?style=flat-square
[coverage-url]: https://codecov.io/gh/simonrenoult/code-complexity/branch/master
[npm-image]: https://img.shields.io/npm/v/code-complexity.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/code-complexity
