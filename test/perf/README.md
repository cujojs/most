Updated: 1-5-2016

Latest performance tests of basic most.js operations.

* [Setup](#setup)
* [Node](#node)

## Setup

```
> uname -a
Darwin Brians-MBP.home 14.5.0 Darwin Kernel Version 14.5.0: Tue Sep  1 21:23:09 PDT 2015; root:xnu-2782.50.1~1/RELEASE_X86_64 x86_64

> npm ls
most-perf@0.10.0 /Users/brian/Projects/cujojs/most/test/perf
├── @reactivex/rxjs@5.0.0-beta.0
├── baconjs@0.7.82
├─┬ benchmark@2.0.0 (git://github.com/bestiejs/benchmark.js.git#ed6169531c314c475f6391b9762b8834e9a25d36)
│ └── platform@1.3.1
├── highland@2.5.1
├── kefir@3.2.0
├── lodash@3.10.1
└── rx@4.0.7
```

## Node

```
> node --version
v5.3.0

> npm start
> most-perf@0.10.0 filter-map-reduce /Users/brian/Projects/cujojs/most/test/perf
> node ./filter-map-reduce

filter -> map -> reduce 1000000 integers
-------------------------------------------------------
most        332.86 op/s ±  1.03%   (80 samples)
rx 4          1.34 op/s ±  2.32%    (8 samples)
rx 5          4.80 op/s ±  1.19%   (16 samples)
kefir        12.56 op/s ±  0.73%   (33 samples)
bacon         0.98 op/s ±  3.28%    (7 samples)
highland      7.42 op/s ±  3.85%   (22 samples)
lodash       54.04 op/s ±  3.47%   (56 samples)
Array         6.77 op/s ±  2.25%   (21 samples)
-------------------------------------------------------

> most-perf@0.10.0 flatMap /Users/brian/Projects/cujojs/most/test/perf
> node ./flatMap.js

flatMap 1000 x 1000 streams
-------------------------------------------------------
most        171.43 op/s ±  1.04%   (76 samples)
rx 4          0.68 op/s ±  9.37%    (6 samples)
rx 5          7.32 op/s ±  0.82%   (22 samples)
kefir        11.72 op/s ±  1.21%   (32 samples)
bacon         0.84 op/s ±  2.93%    (7 samples)
highland      0.18 op/s ±  4.93%    (5 samples)
lodash       18.52 op/s ±  2.07%   (35 samples)
Array         0.42 op/s ±  1.74%    (6 samples)
-------------------------------------------------------

> most-perf@0.10.0 concatMap /Users/brian/Projects/cujojs/most/test/perf
> node ./concatMap.js

concatMap 1000 x 1000 streams
-------------------------------------------------------
most        133.20 op/s ±  0.75%   (74 samples)
rx 4          1.21 op/s ±  1.61%    (8 samples)
rx 5          7.59 op/s ±  1.11%   (22 samples)
kefir        12.36 op/s ±  1.10%   (32 samples)
bacon         0.82 op/s ±  3.54%    (7 samples)
lodash       18.47 op/s ±  2.40%   (34 samples)
Array         0.41 op/s ±  2.45%    (6 samples)
-------------------------------------------------------

> most-perf@0.10.0 zip /Users/brian/Projects/cujojs/most/test/perf
> node ./zip.js

zip 2 x 100000 integers
-------------------------------------------------------
most        118.06 op/s ±  1.48%   (75 samples)
rx 4          4.08 op/s ±  1.33%   (14 samples)
rx 5         21.79 op/s ±  2.63%   (29 samples)
kefir        18.23 op/s ±  1.43%   (25 samples)
bacon         1.05 op/s ±  4.50%    (7 samples)
highland      0.54 op/s ±  1.17%    (6 samples)
lodash       43.21 op/s ±  6.09%   (57 samples)
-------------------------------------------------------

> most-perf@0.10.0 scan /Users/brian/Projects/cujojs/most/test/perf
> node ./scan.js

scan -> reduce 1000000 integers
-------------------------------------------------------
most        363.79 op/s ±  0.89%   (80 samples)
rx 4          1.36 op/s ±  1.52%    (8 samples)
rx 5          4.61 op/s ±  1.12%   (16 samples)
kefir        19.20 op/s ±  0.93%   (26 samples)
bacon         0.81 op/s ±  2.72%    (7 samples)
highland      5.95 op/s ±  3.65%   (18 samples)
lodash       10.45 op/s ±  6.92%   (30 samples)
Array         5.78 op/s ±  5.08%   (19 samples)
-------------------------------------------------------

> most-perf@0.10.0 skipRepeats /Users/brian/Projects/cujojs/most/test/perf
> node ./skipRepeats.js

skipRepeats -> reduce 2 x 1000000 integers
-------------------------------------------------------
most        306.16 op/s ±  0.78%   (79 samples)
rx 4          1.64 op/s ±  1.05%    (9 samples)
rx 5          5.98 op/s ±  0.76%   (19 samples)
kefir        15.98 op/s ±  0.56%   (39 samples)
bacon         1.13 op/s ±  1.82%    (7 samples)
lodash       60.47 op/s ±  3.50%   (62 samples)
Array         8.95 op/s ±  3.03%   (27 samples)
-------------------------------------------------------
```
