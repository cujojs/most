Updated: 5-5-2015

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
├── highland@2.5.0
├── kefir@2.1.0
├── lodash@3.8.0
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
most        526.02 op/s ±  0.67%   (78 samples)
rx            1.10 op/s ±  4.66%    (7 samples)
kefir        13.08 op/s ±  2.29%   (34 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      7.25 op/s ±  3.55%   (22 samples)
lodash       33.09 op/s ±  2.81%   (57 samples)
Array         9.91 op/s ±  1.79%   (29 samples)
-------------------------------------------------------
```

```
flatMap 1000 x 1000 streams
-------------------------------------------------------
most        162.47 op/s ±  0.88%   (80 samples)
rx            0.82 op/s ±  1.34%    (7 samples)
kefir        13.07 op/s ±  1.29%   (34 samples)
bacon         1.15 op/s ±  2.64%    (7 samples)
highland      0.14 op/s ±  5.72%    (5 samples)
lodash       27.80 op/s ±  3.15%   (38 samples)
Array         0.45 op/s ±  1.33%    (6 samples)
-------------------------------------------------------
```

```
concatMap 1000 x 1000 streams
-------------------------------------------------------
most        156.99 op/s ±  0.78%   (77 samples)
rx            1.44 op/s ±  2.09%    (8 samples)
kefir        11.79 op/s ±  4.88%   (30 samples)
bacon         1.18 op/s ±  2.85%    (7 samples)
lodash       29.10 op/s ±  4.02%   (51 samples)
Array         0.44 op/s ±  2.57%    (6 samples)
-------------------------------------------------------
```

```
zip 2 x 100000 integers
-------------------------------------------------------
most        120.09 op/s ±  0.41%   (76 samples)
rx            3.47 op/s ±  0.82%   (13 samples)
kefir        39.57 op/s ±  2.44%   (34 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      0.50 op/s ±  1.62%    (6 samples)
lodash       36.25 op/s ±  6.63%   (49 samples)
-------------------------------------------------------
```

```
scan -> reduce 1000000 integers
-------------------------------------------------------
most        348.22 op/s ±  0.82%   (79 samples)
rx            1.35 op/s ±  1.96%    (8 samples)
kefir        19.57 op/s ±  1.37%   (27 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      6.72 op/s ±  2.94%   (21 samples)
lodash       17.30 op/s ± 10.50%   (33 samples)
Array         7.63 op/s ±  5.77%   (24 samples)
-------------------------------------------------------
```

```
skipRepeats -> reduce 2 x 1000000 integers
-------------------------------------------------------
most        312.23 op/s ±  0.50%   (80 samples)
rx            1.43 op/s ±  0.82%    (8 samples)
kefir        17.50 op/s ±  1.05%   (42 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
lodash       55.32 op/s ±  2.17%   (57 samples)
Array        12.46 op/s ±  2.22%   (35 samples)
-------------------------------------------------------
```

## io.js

```
> nvm current
iojs-v2.0.0

>node --version
v2.0.0

```

```
filter -> map -> reduce 1000000 integers
-------------------------------------------------------
most        345.75 op/s ±  0.65%   (80 samples)
rx            1.35 op/s ±  2.45%    (8 samples)
kefir        14.98 op/s ±  1.15%   (37 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      7.66 op/s ±  2.21%   (22 samples)
lodash       34.76 op/s ±  2.10%   (59 samples)
Array         9.24 op/s ±  2.31%   (27 samples)
-------------------------------------------------------
```

```
flatMap 1000 x 1000 streams
-------------------------------------------------------
most        161.21 op/s ±  1.03%   (80 samples)
rx            0.87 op/s ±  1.05%    (7 samples)
kefir        12.67 op/s ±  1.40%   (33 samples)
bacon         1.18 op/s ±  0.95%    (7 samples)
highland      0.18 op/s ±  5.14%    (5 samples)
lodash       28.57 op/s ±  4.38%   (51 samples)
Array         0.43 op/s ±  2.78%    (6 samples)
-------------------------------------------------------
```

```
concatMap 1000 x 1000 streams
-------------------------------------------------------
most        153.88 op/s ±  1.07%   (76 samples)
rx            1.64 op/s ±  0.99%    (9 samples)
kefir        13.86 op/s ±  1.36%   (35 samples)
bacon         1.26 op/s ±  1.59%    (8 samples)
lodash       28.82 op/s ±  4.69%   (51 samples)
Array         0.45 op/s ±  1.28%    (6 samples)
-------------------------------------------------------
```

```
zip 2 x 100000 integers
-------------------------------------------------------
most        120.52 op/s ±  0.58%   (77 samples)
rx            3.92 op/s ±  1.07%   (14 samples)
kefir        37.41 op/s ±  2.89%   (33 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      0.58 op/s ±  3.75%    (6 samples)
lodash       42.22 op/s ±  2.36%   (46 samples)
-------------------------------------------------------
```

```
scan -> reduce 1000000 integers
-------------------------------------------------------
most        309.84 op/s ±  0.73%   (79 samples)
rx            1.51 op/s ±  2.46%    (8 samples)
kefir        21.37 op/s ±  0.78%   (29 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      6.59 op/s ±  2.12%   (20 samples)
lodash        8.39 op/s ±  9.04%   (25 samples)
Array         7.25 op/s ±  5.23%   (23 samples)
-------------------------------------------------------
```

```
skipRepeats -> reduce 2 x 1000000 integers
-------------------------------------------------------
most        306.93 op/s ±  0.71%   (79 samples)
rx            1.58 op/s ±  1.98%    (8 samples)
kefir        19.57 op/s ±  0.85%   (27 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
lodash       54.29 op/s ±  2.98%   (57 samples)
Array        11.16 op/s ±  2.34%   (32 samples)
-------------------------------------------------------
```
