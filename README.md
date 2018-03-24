# code-complexity

> List code source files you should focus on.


## Install

```console
$ npm install --global code-complexity
```


## Usage

```sh
  Usage: code-complexity <dir>

  Options:

    -l, --limit [limit]  Limit the number of files to output
    -d, --details        Show the number of commit and computed sloc
    -h, --help           output usage information

  Examples:

    $ code-complexity /path/to/git/directory
    $ code-complexity /path/to/git/directory --limit 3
    $ code-complexity /path/to/git/directory --limit 10 --details
```

## Output

```sh
$ code-complexity . --details

src/code-complexity.js 53 (commits: 1, sloc: 53)
src/cli.js 16 (commits: 1, sloc: 16)
```