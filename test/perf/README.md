Updated: 2-10-2015

Latest performance tests of basic most.js operations.

* [Setup](#setup)
* [Node](#node)
* [io.js](#iojs)

## Setup

```
> uname -a
Darwin bcavalier-2.home 14.0.0 Darwin Kernel Version 14.0.0: Fri Sep 19 00:26:44 PDT 2014; root:xnu-2782.1.97~2/RELEASE_X86_64 x86_64

> npm ls
most-perf@0.10.0 /Users/brian/Projects/cujojs/most/test/perf
├── baconjs@0.7.43
├─┬ benchmark@2.0.0-pre (git+https://github.com/bestiejs/benchmark.js#042f1b21a7420f50aa554af4d62375ca9cab9bc1)
│ ├── lodash-compat@3.1.0
│ └── platform@1.3.0
├── highland@2.3.0
├── kefir@1.0.0
├── lodash@3.1.0
└── rx@2.3.25
```

## Node

```
> node --version
v0.12.0
```

```
filter -> map -> reduce 1000000 integers
-------------------------------------------------------
most        115.80 op/s ± 17.13%   (35 samples)
rx            1.01 op/s ±  1.59%    (7 samples)
kefir        11.24 op/s ±  1.13%   (29 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      5.59 op/s ±  1.46%   (18 samples)
lodash       20.55 op/s ±  3.08%   (37 samples)
Array         7.57 op/s ±  2.90%   (23 samples)
-------------------------------------------------------
```

```
flatMap 1000 x 1000 streams
-------------------------------------------------------
most         55.59 op/s ±  1.49%   (81 samples)
rx        FAILED: TypeError: undefined is not a function
kefir         9.85 op/s ±  1.51%   (27 samples)
bacon         0.91 op/s ±  0.99%    (7 samples)
highland      0.09 op/s ±  4.91%    (5 samples)
lodash       26.74 op/s ±  3.84%   (37 samples)
Array         0.38 op/s ±  2.38%    (5 samples)
-------------------------------------------------------
```

```
concatMap 1000 x 1000 streams
-------------------------------------------------------
most         54.37 op/s ±  1.13%   (80 samples)
rx        FAILED: TypeError: undefined is not a function
kefir        10.57 op/s ±  1.35%   (28 samples)
bacon         0.90 op/s ±  2.02%    (7 samples)
lodash       26.04 op/s ±  6.09%   (47 samples)
Array         0.37 op/s ±  2.18%    (5 samples)
-------------------------------------------------------
```

```
zip 2 x 100000 integers
-------------------------------------------------------
most         74.21 op/s ±  2.10%   (67 samples)
rx            2.09 op/s ±  1.17%   (10 samples)
kefir        33.45 op/s ±  1.21%   (40 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      0.27 op/s ±  2.75%    (5 samples)
lodash       27.99 op/s ±  3.67%   (38 samples)
-------------------------------------------------------
```

```
scan -> reduce 1000000 integers
-------------------------------------------------------
most         70.08 op/s ± 19.71%   (27 samples)
rx            0.96 op/s ±  1.54%    (7 samples)
kefir        16.49 op/s ±  2.48%   (39 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      4.79 op/s ±  2.95%   (16 samples)
lodash       14.65 op/s ±  4.41%   (39 samples)
Array         5.71 op/s ±  4.65%   (18 samples)
-------------------------------------------------------
```

## io.js

```
> iojs --version
v1.1.0
```

```
filter -> map -> reduce 1000000 integers
-------------------------------------------------------
most        113.73 op/s ± 18.00%   (34 samples)
rx            0.82 op/s ±  1.38%    (7 samples)
kefir        11.07 op/s ±  1.28%   (30 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      5.65 op/s ±  1.60%   (18 samples)
lodash        7.77 op/s ±  2.10%   (24 samples)
Array         3.94 op/s ±  2.26%   (14 samples)
-------------------------------------------------------
```

```
flatMap 1000 x 1000 streams
-------------------------------------------------------
most         56.82 op/s ±  1.53%   (84 samples)
rx        FAILED: TypeError: undefined is not a function
kefir        10.01 op/s ±  1.92%   (28 samples)
bacon         0.90 op/s ±  2.18%    (7 samples)
highland      0.09 op/s ±  3.37%    (5 samples)
lodash       26.72 op/s ±  3.96%   (37 samples)
Array         0.38 op/s ±  1.70%    (5 samples)
-------------------------------------------------------
```

```
concatMap 1000 x 1000 streams
-------------------------------------------------------
most         54.75 op/s ±  1.01%   (81 samples)
rx        FAILED: TypeError: undefined is not a function
kefir        10.99 op/s ±  1.46%   (30 samples)
bacon         0.84 op/s ±  4.66%    (7 samples)
lodash       25.94 op/s ±  4.66%   (47 samples)
Array         0.38 op/s ±  0.85%    (5 samples)
-------------------------------------------------------
```

```
zip 2 x 100000 integers
-------------------------------------------------------
most         31.71 op/s ±  1.25%   (72 samples)
rx            1.89 op/s ±  0.72%    (9 samples)
kefir        29.54 op/s ±  1.42%   (37 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      0.31 op/s ±  2.20%    (5 samples)
lodash       27.03 op/s ±  6.89%   (50 samples)
-------------------------------------------------------
```

```
scan -> reduce 1000000 integers
-------------------------------------------------------
most         68.82 op/s ± 16.96%   (27 samples)
rx            0.77 op/s ±  1.96%    (6 samples)
kefir        17.68 op/s ±  1.13%   (43 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      4.77 op/s ±  4.02%   (16 samples)
lodash        3.41 op/s ±  6.45%   (13 samples)
Array         5.31 op/s ±  8.13%   (18 samples)
-------------------------------------------------------
```