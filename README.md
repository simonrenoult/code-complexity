# code-complexity

> Measure projects complexity based of files sloc and commit number.


## Install

```console
$ npm install --global code-complexity
```


## Usage

```sh
  Usage: code-complexity <dir>

  Measure projects complexity based of files sloc and commit number.

  Options:

    -l, --limit [limit]  Limit the number of files to output
    -d, --details        Show the number of commit and computed sloc
    -c, --commit         Show the number of commits
    -s, --sloc           Show the computed sloc
    --sort [sort]        Sort results by commit, complexity, file or sloc
    --min [min]          Exclude results below <min>
    --max [max]          Exclude results above <max>
    -h, --help           output usage information

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