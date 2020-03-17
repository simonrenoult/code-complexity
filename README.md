# code-complexity

> Measure projects complexity based on files sloc and commit count.

[![Build Status][travis-image]][travis-url]
[![Coverage Status][coverage-image]][coverage-url]
[![Style Status][style-image]][style-url]
[![NPM Version][npm-image]][npm-url]

## Usage

```sh
$ npx code-complexity <path-to-git-directory>
```

## Help

```sh
  Usage: code-complexity <dir> [options]
  
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
    --excludes <strings>   List of strings (comma separated) used in filenames to exclude
                           (executed after '--includes') (default: [])
    --includes <strings>   List of strings (comma separated) used in filenames to include
                           (executed before '--excludes') (default: [])
    -h, --help             display help for command
  
  Examples:
  
    $ code-complexity <dir>
    $ code-complexity <dir> --limit 3
    $ code-complexity <dir> --details
    $ code-complexity <dir> --min 10 --max 50
    $ code-complexity <dir> --sort complexity
    $ code-complexity <dir> --excludes lib,test
    $ code-complexity <dir> --includes users
    $ code-complexity <dir> --details --limit 10 --sort complexity --excludes test
```

## Output

```sh
$ npx code-complexity . --details --sort complexity --limit 10 

test/code-complexity.test.ts 535 (commits: 5, sloc: 107)
src/cli.ts 402 (commits: 6, sloc: 67)
src/services/prepare-stdout.ts 348 (commits: 4, sloc: 87)
src/services/compute-complexity.ts 108 (commits: 4, sloc: 27)
src/services/count-commits-per-file.ts 83 (commits: 1, sloc: 83)
src/services/compute-complexity-per-file.ts 36 (commits: 1, sloc: 36)
.eslintrc.js 19 (commits: 1, sloc: 19)
```

## Troubleshooting

+ `Error: stdout maxBuffer exceeded`: use the flag `--since` to limit the number of commits to analyze.

[travis-image]:https://img.shields.io/travis/simonrenoult/code-complexity/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/simonrenoult/code-complexity
[style-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[style-url]: https://prettier.io/
[coverage-image]: https://img.shields.io/codecov/c/github/simonrenoult/code-complexity.svg?style=flat-square
[coverage-url]: https://codecov.io/gh/simonrenoult/code-complexity/branch/master
[npm-image]: https://img.shields.io/npm/v/code-complexity.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/code-complexity
