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
v5.9.0

> npm start

> most-perf@0.10.0 filter-map-reduce /Users/brian/Projects/cujojs/most/test/perf
> node ./filter-map-reduce

filter -> map -> reduce 1000000 integers
-------------------------------------------------------
most        513.41 op/s ±  1.15%   (79 samples)
rx 4          1.26 op/s ±  0.99%    (8 samples)
rx 5          4.47 op/s ±  1.18%   (15 samples)
kefir        12.19 op/s ±  1.10%   (32 samples)
bacon         1.02 op/s ±  1.45%    (7 samples)
highland      7.24 op/s ±  4.37%   (21 samples)
lodash       52.96 op/s ±  3.05%   (55 samples)
Array         6.18 op/s ±  2.91%   (20 samples)
-------------------------------------------------------

> most-perf@0.10.0 flatMap /Users/brian/Projects/cujojs/most/test/perf
> node ./flatMap.js

flatMap 1000 x 1000 streams
-------------------------------------------------------
most        174.33 op/s ±  1.21%   (78 samples)
rx 4          0.70 op/s ±  2.75%    (6 samples)
rx 5          7.10 op/s ±  1.35%   (21 samples)
kefir        11.47 op/s ±  1.51%   (31 samples)
bacon         0.82 op/s ±  2.24%    (7 samples)
highland      0.17 op/s ±  4.69%    (5 samples)
lodash       17.82 op/s ±  2.10%   (33 samples)
Array         0.41 op/s ±  1.26%    (6 samples)
-------------------------------------------------------

> most-perf@0.10.0 concatMap /Users/brian/Projects/cujojs/most/test/perf
> node ./concatMap.js

concatMap 1000 x 1000 streams
-------------------------------------------------------
most        120.22 op/s ±  1.56%   (78 samples)
rx 4          1.11 op/s ±  1.73%    (7 samples)
rx 5          7.27 op/s ±  1.34%   (22 samples)
kefir        12.11 op/s ±  1.61%   (32 samples)
bacon         0.88 op/s ±  3.28%    (7 samples)
lodash       17.53 op/s ±  3.06%   (41 samples)
Array         0.42 op/s ±  2.43%    (6 samples)
-------------------------------------------------------

> most-perf@0.10.0 merge /Users/brian/Projects/cujojs/most/test/perf
> node ./merge.js

merge 100000 x 10 streams
-------------------------------------------------------
most        338.51 op/s ±  1.00%   (80 samples)
rx 4          1.24 op/s ±  2.29%    (8 samples)
rx 5          7.42 op/s ±  1.07%   (22 samples)
kefir        14.16 op/s ±  1.37%   (36 samples)
bacon         0.90 op/s ±  2.40%    (7 samples)
highland      0.18 op/s ±  2.60%    (5 samples)
lodash       17.67 op/s ±  2.62%   (35 samples)
Array        14.16 op/s ±  2.01%   (39 samples)
-------------------------------------------------------

> most-perf@0.10.0 merge-nested /Users/brian/Projects/cujojs/most/test/perf
> node ./merge-nested.js
merge nested streams w/depth 2, 5, 10, 100 (10000 items in each stream)
-------------------------------------------------------
most (depth 2)     9234.43 op/s ±  1.26%   (81 samples)
most (depth 5)     4948.00 op/s ±  0.88%   (84 samples)
most (depth 10)    2758.31 op/s ±  0.84%   (82 samples)
most (depth 100)    235.47 op/s ±  0.95%   (81 samples)
most (depth 1000)    21.14 op/s ±  1.26%   (52 samples)
most (depth 10000)    1.05 op/s ±  1.51%   (10 samples)
rx 4 (depth 2)       40.35 op/s ±  1.23%   (35 samples)
rx 4 (depth 5)       14.83 op/s ±  0.91%   (37 samples)
rx 4 (depth 10)       6.20 op/s ±  0.78%   (19 samples)
rx 4 (depth 100)      0.14 op/s ±  1.73%    (5 samples)
rx 5 (depth 2)      894.07 op/s ±  1.52%   (42 samples)
rx 5 (depth 5)      350.03 op/s ±  1.51%   (43 samples)
rx 5 (depth 10)     142.71 op/s ±  1.65%   (43 samples)
rx 5 (depth 100)      2.30 op/s ±  0.91%   (10 samples)
kefir (depth 2)     354.40 op/s ±  2.14%   (45 samples)
kefir (depth 5)     120.46 op/s ±  1.81%   (42 samples)
kefir (depth 10)     46.48 op/s ±  0.96%   (39 samples)
kefir (depth 100)     0.63 op/s ±  5.42%    (6 samples)
bacon (depth 2)      24.48 op/s ±  6.20%   (33 samples)
bacon (depth 5)      10.63 op/s ±  1.80%   (29 samples)
bacon (depth 10)      4.51 op/s ±  1.56%   (15 samples)
bacon (depth 100)     0.09 op/s ±  5.30%    (5 samples)
highland (depth 2)    2.64 op/s ±  4.23%   (11 samples)
highland (depth 5)    2.79 op/s ±  3.46%   (11 samples)
highland (depth 10)    0.24 op/s ±  2.58%    (5 samples)
-------------------------------------------------------

> most-perf@0.10.0 zip /Users/brian/Projects/cujojs/most/test/perf
> node ./zip.js

zip 2 x 100000 integers
-------------------------------------------------------
most        115.59 op/s ±  1.71%   (74 samples)
rx 4          3.95 op/s ±  2.05%   (14 samples)
rx 5         20.25 op/s ±  2.89%   (28 samples)
kefir        18.10 op/s ±  1.69%   (44 samples)
bacon         1.04 op/s ±  5.34%    (7 samples)
highland      0.54 op/s ±  3.71%    (6 samples)
lodash       36.82 op/s ± 10.06%   (49 samples)
-------------------------------------------------------

> most-perf@0.10.0 scan /Users/brian/Projects/cujojs/most/test/perf
> node ./scan.js

scan -> reduce 1000000 integers
-------------------------------------------------------
most        362.37 op/s ±  0.97%   (80 samples)
rx 4          1.16 op/s ±  0.72%    (7 samples)
rx 5          4.46 op/s ±  1.49%   (15 samples)
kefir        19.38 op/s ±  1.08%   (27 samples)
bacon         0.81 op/s ±  1.36%    (7 samples)
highland      5.83 op/s ±  3.96%   (18 samples)
lodash        9.54 op/s ±  9.10%   (29 samples)
Array         5.60 op/s ±  5.75%   (18 samples)
-------------------------------------------------------

> most-perf@0.10.0 skipRepeats /Users/brian/Projects/cujojs/most/test/perf
> node ./skipRepeats.js

skipRepeats -> reduce 2 x 1000000 integers
-------------------------------------------------------
most        362.55 op/s ±  0.80%   (80 samples)
rx 4          1.34 op/s ±  1.35%    (8 samples)
rx 5          5.87 op/s ±  0.97%   (19 samples)
kefir        15.09 op/s ±  0.86%   (38 samples)
bacon         1.11 op/s ±  3.24%    (7 samples)
lodash       59.36 op/s ±  3.40%   (62 samples)
Array         8.37 op/s ±  3.15%   (25 samples)
-------------------------------------------------------
```
