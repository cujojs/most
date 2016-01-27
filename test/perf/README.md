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
v5.5.0

> npm start
> most-perf@0.10.0 filter-map-reduce /Users/brian/Projects/cujojs/most/test/perf
> node ./filter-map-reduce

filter -> map -> reduce 1000000 integers
-------------------------------------------------------
most        331.52 op/s ±  0.74%   (80 samples)
rx 4          1.39 op/s ±  1.05%    (8 samples)
rx 5          4.79 op/s ±  1.40%   (16 samples)
kefir        12.64 op/s ±  0.81%   (33 samples)
bacon         1.01 op/s ±  1.61%    (7 samples)
highland      7.55 op/s ±  3.73%   (22 samples)
lodash       54.80 op/s ±  2.84%   (57 samples)
Array         6.76 op/s ±  2.80%   (21 samples)
-------------------------------------------------------

> most-perf@0.10.0 flatMap /Users/brian/Projects/cujojs/most/test/perf
> node ./flatMap.js

flatMap 1000 x 1000 streams
-------------------------------------------------------
most        173.70 op/s ±  1.06%   (77 samples)
rx 4          0.76 op/s ±  1.85%    (6 samples)
rx 5          7.24 op/s ±  1.17%   (22 samples)
kefir        10.47 op/s ±  0.85%   (28 samples)
bacon         0.86 op/s ±  3.57%    (7 samples)
highland      0.17 op/s ±  6.44%    (5 samples)
lodash       19.12 op/s ±  2.18%   (35 samples)
Array         0.43 op/s ±  0.91%    (6 samples)
-------------------------------------------------------

> most-perf@0.10.0 concatMap /Users/brian/Projects/cujojs/most/test/perf
> node ./concatMap.js

concatMap 1000 x 1000 streams
-------------------------------------------------------
most        120.45 op/s ±  0.70%   (77 samples)
rx 4          1.25 op/s ±  0.66%    (8 samples)
rx 5          7.74 op/s ±  0.90%   (23 samples)
kefir        12.32 op/s ±  0.91%   (32 samples)
bacon         0.90 op/s ±  2.77%    (7 samples)
lodash       19.03 op/s ±  2.66%   (35 samples)
Array         0.44 op/s ±  2.18%    (6 samples)
-------------------------------------------------------

> most-perf@0.10.0 merge /Users/brian/Projects/cujojs/most/test/perf
> node ./merge.js

merge 100000 x 10 streams
-------------------------------------------------------
most        303.24 op/s ±  0.56%   (78 samples)
rx 4          1.24 op/s ±  1.34%    (8 samples)
rx 5          7.70 op/s ±  1.23%   (22 samples)
kefir        14.97 op/s ±  1.10%   (37 samples)
bacon         0.79 op/s ±  3.15%    (6 samples)
highland      0.17 op/s ±  3.99%    (5 samples)
lodash       18.90 op/s ±  1.72%   (35 samples)
Array        14.90 op/s ±  1.78%   (41 samples)
-------------------------------------------------------

> most-perf@0.10.0 zip /Users/brian/Projects/cujojs/most/test/perf
> node ./zip.js

zip 2 x 100000 integers
-------------------------------------------------------
most        117.85 op/s ±  1.30%   (76 samples)
rx 4          4.08 op/s ±  1.92%   (14 samples)
rx 5         21.59 op/s ±  2.76%   (29 samples)
kefir        18.33 op/s ±  0.63%   (44 samples)
bacon         1.10 op/s ±  4.96%    (7 samples)
highland      0.55 op/s ±  3.42%    (6 samples)
lodash       40.62 op/s ±  6.42%   (53 samples)
-------------------------------------------------------

> most-perf@0.10.0 scan /Users/brian/Projects/cujojs/most/test/perf
> node ./scan.js

scan -> reduce 1000000 integers
-------------------------------------------------------
most        361.24 op/s ±  0.66%   (79 samples)
rx 4          1.23 op/s ±  1.60%    (8 samples)
rx 5          4.41 op/s ±  1.12%   (15 samples)
kefir        19.86 op/s ±  0.96%   (27 samples)
bacon         0.81 op/s ±  2.65%    (7 samples)
highland      5.68 op/s ±  6.18%   (18 samples)
lodash       10.22 op/s ±  5.99%   (31 samples)
Array         5.70 op/s ±  5.82%   (19 samples)
-------------------------------------------------------

> most-perf@0.10.0 skipRepeats /Users/brian/Projects/cujojs/most/test/perf
> node ./skipRepeats.js

skipRepeats -> reduce 2 x 1000000 integers
-------------------------------------------------------
most        307.19 op/s ±  0.55%   (79 samples)
rx 4          1.64 op/s ±  0.77%    (9 samples)
rx 5          6.27 op/s ±  1.06%   (19 samples)
kefir        15.57 op/s ±  0.75%   (38 samples)
bacon         1.15 op/s ±  1.38%    (7 samples)
lodash       62.61 op/s ±  3.36%   (65 samples)
Array         8.12 op/s ±  4.06%   (25 samples)
-------------------------------------------------------
```
