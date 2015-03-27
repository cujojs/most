Updated: 2-24-2015

Latest performance tests of basic most.js operations.

* [Setup](#setup)
* [Node](#node)
* [io.js](#iojs)

## Setup

```
> uname -a
Darwin Brians-MBP.home 14.1.0 Darwin Kernel Version 14.1.0: Thu Feb 26 19:26:47 PST 2015; root:xnu-2782.10.73~1/RELEASE_X86_64 x86_64

> npm ls
most-perf@0.10.0 /Users/brian/Projects/cujojs/most/test/perf
├── baconjs@0.7.53
├─┬ benchmark@2.0.0-pre (git+https://github.com/bestiejs/benchmark.js#b392a75170c64485bc5fe574b6ba80f4a88f2638)
│ ├── lodash-compat@3.6.0
│ └── platform@1.3.0
├── highland@2.4.0
├── kefir@1.2.0
├── lodash@3.5.0
└── rx@2.4.6
```

## Node

```
> nvm current
v0.12.1

> node --version
v0.12.1
```

```
filter -> map -> reduce 1000000 integers
-------------------------------------------------------
most        154.25 op/s ± 14.93%   (29 samples)
rx            1.31 op/s ±  1.09%    (8 samples)
kefir        14.34 op/s ±  1.09%   (36 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      7.82 op/s ±  1.18%   (23 samples)
lodash       34.50 op/s ±  2.72%   (60 samples)
Array        10.00 op/s ±  2.85%   (29 samples)
-------------------------------------------------------
```

```
flatMap 1000 x 1000 streams
-------------------------------------------------------
most         65.53 op/s ±  1.27%   (74 samples)
rx            0.83 op/s ±  1.03%    (7 samples)
kefir        12.39 op/s ±  1.44%   (33 samples)
bacon         1.10 op/s ±  2.71%    (7 samples)
highland      0.14 op/s ±  5.10%    (5 samples)
lodash       33.20 op/s ±  1.77%   (38 samples)
Array         0.46 op/s ±  1.21%    (6 samples)
-------------------------------------------------------
```

```
concatMap 1000 x 1000 streams
-------------------------------------------------------
most         63.95 op/s ±  0.78%   (73 samples)
rx            1.49 op/s ±  1.37%    (8 samples)
kefir        13.63 op/s ±  1.25%   (35 samples)
bacon         1.15 op/s ±  1.37%    (7 samples)
lodash       34.35 op/s ±  3.55%   (46 samples)
Array         0.46 op/s ±  2.24%    (6 samples)
-------------------------------------------------------
```

```
zip 2 x 100000 integers
-------------------------------------------------------
most         95.50 op/s ±  1.87%   (63 samples)
rx            3.90 op/s ±  1.08%   (14 samples)
kefir        41.94 op/s ±  0.71%   (36 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      0.50 op/s ±  4.58%    (6 samples)
lodash       49.21 op/s ±  9.49%   (58 samples)
-------------------------------------------------------
```

```
scan -> reduce 1000000 integers
-------------------------------------------------------
most         82.27 op/s ± 19.85%   (21 samples)
rx            1.58 op/s ±  0.38%    (8 samples)
kefir        22.60 op/s ±  0.93%   (30 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      6.62 op/s ±  1.80%   (20 samples)
lodash        8.58 op/s ±  9.17%   (18 samples)
Array         7.78 op/s ±  5.66%   (24 samples)
-------------------------------------------------------
```

```
distinct -> reduce 2 x 1000000 integers
-------------------------------------------------------
most        129.28 op/s ±  7.62%   (40 samples)
rx            1.59 op/s ±  0.55%    (8 samples)
kefir        18.40 op/s ±  0.82%   (26 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
lodash       54.26 op/s ±  2.45%   (57 samples)
Array        11.97 op/s ±  2.24%   (34 samples)
-------------------------------------------------------
```

## io.js

```
> nvm current
iojs-v1.6.2

>node --version
v1.6.2

```

```
filter -> map -> reduce 1000000 integers
-------------------------------------------------------
most        137.19 op/s ± 10.14%   (27 samples)
rx            1.39 op/s ±  1.11%    (8 samples)
kefir        14.17 op/s ±  0.87%   (36 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      7.93 op/s ±  1.66%   (23 samples)
lodash       11.42 op/s ±  1.28%   (32 samples)
Array         5.82 op/s ±  2.10%   (19 samples)
-------------------------------------------------------
```

```
flatMap 1000 x 1000 streams
-------------------------------------------------------
most         64.87 op/s ±  0.66%   (74 samples)
rx            0.85 op/s ±  0.95%    (7 samples)
kefir        12.96 op/s ±  1.23%   (34 samples)
bacon         1.18 op/s ±  0.68%    (7 samples)
highland      0.17 op/s ±  1.64%    (5 samples)
lodash       34.26 op/s ±  3.35%   (45 samples)
Array         0.46 op/s ±  1.61%    (6 samples)
-------------------------------------------------------
```

```
concatMap 1000 x 1000 streams
-------------------------------------------------------
most         64.30 op/s ±  0.60%   (73 samples)
rx            1.69 op/s ±  0.40%    (9 samples)
kefir        13.41 op/s ±  0.92%   (34 samples)
bacon         1.20 op/s ±  0.90%    (7 samples)
lodash       32.94 op/s ±  3.06%   (45 samples)
Array         0.47 op/s ±  1.53%    (6 samples)
-------------------------------------------------------
```

```
zip 2 x 100000 integers
-------------------------------------------------------
most         40.63 op/s ±  0.77%   (64 samples)
rx            3.74 op/s ±  1.68%   (14 samples)
kefir        39.64 op/s ±  0.90%   (34 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      0.60 op/s ±  2.59%    (6 samples)
lodash       38.70 op/s ±  5.67%   (52 samples)
-------------------------------------------------------
```

```
scan -> reduce 1000000 integers
-------------------------------------------------------
most         78.18 op/s ± 20.09%   (21 samples)
rx            1.66 op/s ±  0.75%    (9 samples)
kefir        22.44 op/s ±  1.02%   (30 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      6.59 op/s ±  2.16%   (20 samples)
lodash        4.70 op/s ±  4.99%   (16 samples)
Array         7.20 op/s ±  6.06%   (22 samples)
-------------------------------------------------------
```

```
distinct -> reduce 2 x 1000000 integers
-------------------------------------------------------
most        125.26 op/s ±  8.30%   (36 samples)
rx            1.46 op/s ±  1.41%    (8 samples)
kefir        18.16 op/s ±  0.92%   (25 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
lodash       13.38 op/s ±  1.20%   (37 samples)
Array         6.68 op/s ±  1.37%   (21 samples)
-------------------------------------------------------
```
