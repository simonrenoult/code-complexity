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
    $ code-complexity /path/to/git/directory --details
```