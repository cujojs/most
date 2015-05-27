Updated: 5-27-2015

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
├── baconjs@0.7.60
├─┬ benchmark@2.0.0-pre (git+https://github.com/bestiejs/benchmark.js#b392a75170c64485bc5fe574b6ba80f4a88f2638)
│ ├── lodash-compat@3.6.0
│ └── platform@1.3.0
├── highland@2.5.1
├── kefir@2.5.0
├── lodash@3.9.3
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
most        510.69 op/s ±  0.86%   (79 samples)
rx            1.33 op/s ±  1.15%    (8 samples)
kefir        13.89 op/s ±  1.16%   (35 samples)
bacon         1.40 op/s ±  1.38%    (8 samples)
highland      7.67 op/s ±  2.57%   (23 samples)
lodash       33.77 op/s ±  2.85%   (59 samples)
Array        10.38 op/s ±  1.85%   (30 samples)
-------------------------------------------------------
```

```
flatMap 1000 x 1000 streams
-------------------------------------------------------
most        150.99 op/s ±  0.87%   (76 samples)
rx            0.84 op/s ±  2.80%    (7 samples)
kefir        14.40 op/s ±  0.88%   (37 samples)
bacon         1.20 op/s ±  1.81%    (7 samples)
highland      0.15 op/s ±  7.07%    (5 samples)
lodash       27.86 op/s ±  3.14%   (38 samples)
Array         0.43 op/s ± 11.39%    (6 samples)
-------------------------------------------------------
```

```
concatMap 1000 x 1000 streams
-------------------------------------------------------
most        151.32 op/s ±  0.95%   (77 samples)
rx            1.66 op/s ±  1.67%    (9 samples)
kefir        13.08 op/s ±  2.51%   (33 samples)
bacon         1.24 op/s ±  2.41%    (8 samples)
lodash       28.81 op/s ±  4.19%   (51 samples)
Array         0.45 op/s ±  2.12%    (6 samples)
-------------------------------------------------------
```

```
zip 2 x 100000 integers
-------------------------------------------------------
most        113.71 op/s ±  0.65%   (74 samples)
rx            4.22 op/s ±  1.47%   (15 samples)
kefir        21.50 op/s ±  2.45%   (29 samples)
bacon         1.53 op/s ±  4.93%    (8 samples)
highland      0.48 op/s ±  5.40%    (6 samples)
lodash       38.71 op/s ±  6.53%   (42 samples)
-------------------------------------------------------
```

```
scan -> reduce 1000000 integers
-------------------------------------------------------
most        345.62 op/s ±  0.79%   (81 samples)
rx            1.60 op/s ±  0.95%    (8 samples)
kefir        22.45 op/s ±  1.33%   (30 samples)
bacon         1.10 op/s ±  1.55%    (7 samples)
highland      6.39 op/s ±  3.23%   (20 samples)
lodash        8.60 op/s ±  9.22%   (25 samples)
Array         7.98 op/s ±  6.65%   (24 samples)
-------------------------------------------------------
```

```
skipRepeats -> reduce 2 x 1000000 integers
-------------------------------------------------------
most        307.73 op/s ±  0.90%   (81 samples)
rx            1.60 op/s ±  0.74%    (8 samples)
kefir        18.56 op/s ±  1.53%   (26 samples)
bacon         1.56 op/s ±  2.63%    (8 samples)
lodash       56.66 op/s ±  2.72%   (59 samples)
Array        12.75 op/s ±  2.13%   (36 samples)
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
most        339.79 op/s ±  0.75%   (83 samples)
rx            1.30 op/s ±  1.94%    (8 samples)
kefir        14.24 op/s ±  1.68%   (36 samples)
bacon         1.47 op/s ±  1.80%    (8 samples)
highland      7.89 op/s ±  2.10%   (23 samples)
lodash       33.97 op/s ±  2.84%   (59 samples)
Array         8.90 op/s ±  2.37%   (27 samples)
-------------------------------------------------------
```

```
flatMap 1000 x 1000 streams
-------------------------------------------------------
most        159.85 op/s ±  0.95%   (80 samples)
rx            0.83 op/s ±  1.94%    (7 samples)
kefir        14.84 op/s ±  1.54%   (38 samples)
bacon         1.27 op/s ±  2.13%    (8 samples)
highland      0.18 op/s ±  3.89%    (5 samples)
lodash       28.83 op/s ±  4.25%   (51 samples)
Array         0.45 op/s ±  1.57%    (6 samples)
-------------------------------------------------------
```

```
concatMap 1000 x 1000 streams
-------------------------------------------------------
most        152.28 op/s ±  1.45%   (79 samples)
rx            1.62 op/s ±  1.03%    (8 samples)
kefir        16.23 op/s ±  1.10%   (40 samples)
bacon         1.28 op/s ±  1.79%    (8 samples)
lodash       28.36 op/s ±  4.57%   (51 samples)
Array         0.45 op/s ±  2.20%    (6 samples)
-------------------------------------------------------
```

```
zip 2 x 100000 integers
-------------------------------------------------------
most        116.82 op/s ±  0.76%   (75 samples)
rx            4.02 op/s ±  1.50%   (14 samples)
kefir        20.61 op/s ±  0.91%   (28 samples)
bacon         1.61 op/s ±  4.58%    (8 samples)
highland      0.59 op/s ±  1.42%    (6 samples)
lodash       35.80 op/s ±  6.06%   (50 samples)
-------------------------------------------------------
```

```
scan -> reduce 1000000 integers
-------------------------------------------------------
most        308.76 op/s ±  0.91%   (80 samples)
rx            1.58 op/s ±  1.58%    (8 samples)
kefir        24.82 op/s ±  0.95%   (33 samples)
bacon         1.18 op/s ±  1.68%    (7 samples)
highland      6.63 op/s ±  2.59%   (20 samples)
lodash        8.17 op/s ±  9.39%   (25 samples)
Array         7.22 op/s ±  5.05%   (22 samples)
-------------------------------------------------------
```

```
skipRepeats -> reduce 2 x 1000000 integers
-------------------------------------------------------
most        307.51 op/s ±  0.76%   (79 samples)
rx            1.61 op/s ±  0.80%    (8 samples)
kefir        20.77 op/s ±  1.28%   (28 samples)
bacon         1.64 op/s ±  2.71%    (9 samples)
lodash       53.28 op/s ±  2.71%   (56 samples)
Array        10.69 op/s ±  2.77%   (31 samples)
-------------------------------------------------------
```
