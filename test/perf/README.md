Updated: 4-21-2015

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
├─┬ benchmark@2.0.0-pre
│ ├── lodash-compat@3.6.0
│ └── platform@1.3.0
├── highland@2.4.0
├── kefir@1.3.1
├── lodash@3.7.0
└── rx@2.5.2
```

## Node

```
> nvm current
v0.12.2

> node --version
v0.12.2
```

```
filter -> map -> reduce 1000000 integers
-------------------------------------------------------
most        515.46 op/s ±  0.74%   (81 samples)
rx            1.25 op/s ±  1.16%    (8 samples)
kefir        12.18 op/s ±  4.55%   (32 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      7.57 op/s ±  1.42%   (22 samples)
lodash       31.81 op/s ±  3.00%   (43 samples)
Array         8.18 op/s ±  2.52%   (25 samples)
-------------------------------------------------------
```

```
flatMap 1000 x 1000 streams
-------------------------------------------------------
most        151.77 op/s ±  0.73%   (75 samples)
rx            0.84 op/s ±  1.90%    (7 samples)
kefir        12.70 op/s ±  0.89%   (33 samples)
bacon         1.14 op/s ±  1.46%    (7 samples)
highland      0.15 op/s ±  2.24%    (5 samples)
lodash       32.50 op/s ±  3.33%   (44 samples)
Array         0.44 op/s ±  1.73%    (6 samples)
-------------------------------------------------------
```

```
concatMap 1000 x 1000 streams
-------------------------------------------------------
most        151.20 op/s ±  0.84%   (77 samples)
rx            1.39 op/s ±  0.66%    (8 samples)
kefir        12.05 op/s ±  3.76%   (32 samples)
bacon         1.16 op/s ±  2.12%    (7 samples)
lodash       32.45 op/s ±  3.08%   (45 samples)
Array         0.44 op/s ±  2.76%    (6 samples)
-------------------------------------------------------
```

```
zip 2 x 100000 integers
-------------------------------------------------------
most        114.25 op/s ±  0.65%   (78 samples)
rx            4.00 op/s ±  1.40%   (14 samples)
kefir        38.92 op/s ±  2.48%   (33 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      0.49 op/s ±  4.19%    (6 samples)
lodash       61.35 op/s ±  6.24%   (64 samples)
-------------------------------------------------------
```

```
scan -> reduce 1000000 integers
-------------------------------------------------------
most        340.74 op/s ±  1.39%   (79 samples)
rx            1.40 op/s ±  0.52%    (8 samples)
kefir        21.56 op/s ±  0.83%   (29 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      6.59 op/s ±  2.98%   (20 samples)
lodash       15.38 op/s ±  9.63%   (32 samples)
Array         7.61 op/s ±  5.11%   (23 samples)
-------------------------------------------------------
```

```
skipRepeats -> reduce 2 x 1000000 integers
-------------------------------------------------------
most        307.70 op/s ±  0.63%   (80 samples)
rx            1.52 op/s ±  0.80%    (8 samples)
kefir        15.13 op/s ±  3.99%   (37 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
lodash       52.20 op/s ±  2.54%   (54 samples)
Array        11.95 op/s ±  2.48%   (34 samples)
-------------------------------------------------------
```

## io.js

```
> nvm current
iojs-v1.8.1

>node --version
v1.8.1

```

```
filter -> map -> reduce 1000000 integers
-------------------------------------------------------
most        341.54 op/s ±  0.62%   (83 samples)
rx            1.31 op/s ±  1.09%    (8 samples)
kefir        13.96 op/s ±  1.10%   (36 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      7.66 op/s ±  2.03%   (22 samples)
lodash       11.13 op/s ±  1.80%   (32 samples)
Array         5.75 op/s ±  2.73%   (19 samples)
-------------------------------------------------------
```

```
flatMap 1000 x 1000 streams
-------------------------------------------------------
most        159.23 op/s ±  0.69%   (79 samples)
rx            0.85 op/s ±  1.53%    (7 samples)
kefir        12.93 op/s ±  1.18%   (34 samples)
bacon         1.18 op/s ±  1.80%    (7 samples)
highland      0.17 op/s ±  3.31%    (5 samples)
lodash       32.53 op/s ±  2.59%   (45 samples)
Array         0.45 op/s ±  2.87%    (6 samples)
-------------------------------------------------------
```

```
concatMap 1000 x 1000 streams
-------------------------------------------------------
most        150.02 op/s ±  0.77%   (82 samples)
rx            1.54 op/s ±  0.71%    (8 samples)
kefir        13.27 op/s ±  0.96%   (34 samples)
bacon         1.20 op/s ±  0.81%    (7 samples)
lodash       33.36 op/s ±  4.51%   (45 samples)
Array         0.45 op/s ±  2.90%    (6 samples)
-------------------------------------------------------
```

```
zip 2 x 100000 integers
-------------------------------------------------------
most         41.39 op/s ±  0.73%   (65 samples)
rx            3.92 op/s ±  0.96%   (14 samples)
kefir        38.77 op/s ±  0.91%   (46 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      0.59 op/s ±  3.27%    (6 samples)
lodash       38.22 op/s ±  6.11%   (52 samples)
-------------------------------------------------------
```

```
scan -> reduce 1000000 integers
-------------------------------------------------------
most        309.63 op/s ±  0.82%   (80 samples)
rx            1.50 op/s ±  1.56%    (8 samples)
kefir        22.09 op/s ±  0.63%   (30 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      6.82 op/s ±  2.05%   (20 samples)
lodash        4.69 op/s ±  5.23%   (16 samples)
Array         7.08 op/s ±  5.64%   (22 samples)
-------------------------------------------------------
```

```
skipRepeats -> reduce 2 x 1000000 integers
-------------------------------------------------------
most        309.68 op/s ±  0.66%   (80 samples)
rx            1.60 op/s ±  0.60%    (8 samples)
kefir        17.26 op/s ±  0.88%   (41 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
lodash       12.75 op/s ±  1.82%   (35 samples)
Array         6.54 op/s ±  2.33%   (21 samples)
-------------------------------------------------------
```
