Updated: 2-24-2015

Latest performance tests of basic most.js operations.

* [Setup](#setup)
* [Node](#node)
* [io.js](#iojs)

## Setup

```
> uname -a
Darwin Brians-MBP.home 14.1.0 Darwin Kernel Version 14.1.0: Mon Dec 22 23:10:38 PST 2014; root:xnu-2782.10.72~2/RELEASE_X86_64 x86_64

> npm ls
most-perf@0.10.0 /Users/brian/Projects/cujojs/most/test/perf
├── baconjs@0.7.49
├─┬ benchmark@2.0.0-pre (git+https://github.com/bestiejs/benchmark.js#8a6e1fa2ed06624512c75a998f0aaf6377054862)
│ ├── lodash-compat@3.3.0
│ └── platform@1.3.0
├── highland@2.3.0
├── kefir@1.1.0
├── lodash@3.3.0
└── rx@2.4.1
```

## Node

```
> nvm current
v0.12.0

> node --version
v0.12.0
```

```
filter -> map -> reduce 1000000 integers
-------------------------------------------------------
most        141.95 op/s ± 17.08%   (27 samples)
rx            1.31 op/s ±  1.04%    (8 samples)
kefir        13.80 op/s ±  3.27%   (35 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      7.04 op/s ±  3.62%   (21 samples)
lodash       28.23 op/s ±  2.69%   (50 samples)
Array        10.24 op/s ±  1.86%   (29 samples)
-------------------------------------------------------
```

```
flatMap 1000 x 1000 streams
-------------------------------------------------------
most         66.36 op/s ±  0.84%   (75 samples)
rx            0.88 op/s ±  1.20%    (7 samples)
kefir        12.83 op/s ±  1.26%   (33 samples)
bacon         1.12 op/s ±  2.11%    (7 samples)
highland      0.15 op/s ± 11.78%    (5 samples)
lodash       33.70 op/s ±  3.29%   (44 samples)
Array         0.47 op/s ±  1.72%    (6 samples)
-------------------------------------------------------
```

```
concatMap 1000 x 1000 streams
-------------------------------------------------------
most         64.71 op/s ±  0.72%   (73 samples)
rx            1.53 op/s ±  0.62%    (8 samples)
kefir        13.72 op/s ±  1.12%   (35 samples)
bacon         1.22 op/s ±  0.98%    (8 samples)
lodash       33.44 op/s ±  3.30%   (46 samples)
Array         0.47 op/s ±  1.81%    (6 samples)
-------------------------------------------------------
```

```
zip 2 x 100000 integers
-------------------------------------------------------
most         96.30 op/s ±  1.85%   (63 samples)
rx            4.18 op/s ±  1.20%   (15 samples)
kefir        42.36 op/s ±  0.88%   (36 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      0.47 op/s ±  1.25%    (6 samples)
lodash       37.66 op/s ±  5.65%   (52 samples)
-------------------------------------------------------
```

```
scan -> reduce 1000000 integers
-------------------------------------------------------
most         80.00 op/s ± 16.48%   (22 samples)
rx            1.35 op/s ±  5.54%    (8 samples)
kefir        22.65 op/s ±  1.03%   (30 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      7.32 op/s ±  1.78%   (22 samples)
lodash       11.73 op/s ± 16.36%   (24 samples)
Array         7.98 op/s ±  5.10%   (24 samples)
-------------------------------------------------------
```

```
distinct -> reduce 2 x 1000000 integers
-------------------------------------------------------
most        127.57 op/s ±  7.98%   (37 samples)
rx            1.56 op/s ±  0.49%    (8 samples)
kefir        18.74 op/s ±  0.62%   (26 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
lodash       53.53 op/s ±  2.93%   (57 samples)
Array        12.26 op/s ±  2.63%   (35 samples)
-------------------------------------------------------
```

## io.js

```
> nvm current
iojs-v1.3.0

>node --version
v1.3.0

```

```
filter -> map -> reduce 1000000 integers
-------------------------------------------------------
most        145.15 op/s ± 20.06%   (26 samples)
rx            1.33 op/s ±  0.93%    (8 samples)
kefir        13.67 op/s ±  1.31%   (35 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      7.58 op/s ±  1.90%   (22 samples)
lodash       10.46 op/s ±  1.42%   (30 samples)
Array         5.76 op/s ±  2.23%   (19 samples)
-------------------------------------------------------
```

```
flatMap 1000 x 1000 streams
-------------------------------------------------------
most         63.99 op/s ±  0.80%   (73 samples)
rx            0.87 op/s ±  0.63%    (7 samples)
kefir        13.05 op/s ±  1.36%   (34 samples)
bacon         1.17 op/s ±  1.25%    (7 samples)
highland      0.18 op/s ±  3.20%    (5 samples)
lodash       33.73 op/s ±  2.07%   (38 samples)
Array         0.47 op/s ±  2.58%    (6 samples)
-------------------------------------------------------
```

```
concatMap 1000 x 1000 streams
-------------------------------------------------------
most         63.10 op/s ±  0.75%   (72 samples)
rx            1.56 op/s ±  1.37%    (8 samples)
kefir        13.82 op/s ±  0.96%   (35 samples)
bacon         1.23 op/s ±  1.33%    (8 samples)
lodash       33.08 op/s ±  3.32%   (48 samples)
Array         0.47 op/s ±  1.27%    (6 samples)
-------------------------------------------------------
```

```
zip 2 x 100000 integers
-------------------------------------------------------
most         39.23 op/s ±  0.86%   (62 samples)
rx            3.96 op/s ±  1.19%   (14 samples)
kefir        39.79 op/s ±  1.16%   (34 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      0.60 op/s ±  1.90%    (6 samples)
lodash       40.66 op/s ±  5.52%   (52 samples)
-------------------------------------------------------
```

```
scan -> reduce 1000000 integers
-------------------------------------------------------
most         79.63 op/s ± 15.61%   (23 samples)
rx            1.63 op/s ±  0.53%    (9 samples)
kefir        22.47 op/s ±  1.07%   (30 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      6.73 op/s ±  3.06%   (20 samples)
lodash        4.50 op/s ±  5.82%   (16 samples)
Array         7.35 op/s ±  5.53%   (23 samples)
-------------------------------------------------------
```

```
distinct -> reduce 2 x 1000000 integers
-------------------------------------------------------
most        129.67 op/s ±  7.17%   (36 samples)
rx            1.72 op/s ±  0.54%    (9 samples)
kefir        17.90 op/s ±  0.73%   (25 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
lodash       13.44 op/s ±  1.07%   (37 samples)
Array         6.60 op/s ±  1.78%   (21 samples)
-------------------------------------------------------
```
