Latest performance tests of basic most.js operations.

* [Setup](#setup)
* [Node](#node)

## Setup

```
> uname -a
Darwin Brians-MBP.home 16.3.0 Darwin Kernel Version 16.3.0: Thu Nov 17 20:23:58 PST 2016; root:xnu-3789.31.2~1/RELEASE_X86_64 x86_64

> npm ls
most-perf@0.10.0 /Users/brian/Projects/cujojs/most/test/perf
├── @reactivex/rxjs@5.0.1
├── baconjs@0.7.89
├── benchmark@2.1.0 (git://github.com/bestiejs/benchmark.js.git#308cc4c82df602b21bc7775075d43836969a8b16)
├── highland@2.10.1
├── kefir@3.6.1
└── rx@4.1.0
```

## Node

```
> node --version
v6.9.2

> npm start

> most-perf@0.10.0 start /Users/brian/Projects/cujojs/most/test/perf
> npm run filter-map-reduce && npm run flatMap && npm run concatMap && npm run merge && npm run merge-nested && npm run zip && npm run scan && npm run slice && npm run skipRepeats


> most-perf@0.10.0 filter-map-reduce /Users/brian/Projects/cujojs/most/test/perf
> node ./filter-map-reduce

filter -> map -> reduce 1000000 integers
-------------------------------------------------------
most                566.42 op/s ±  1.07%   (80 samples)
rx 4                  1.53 op/s ±  1.71%   (12 samples)
rx 5                 11.86 op/s ±  1.04%   (57 samples)
kefir                10.50 op/s ±  0.83%   (51 samples)
bacon                 0.83 op/s ±  0.71%    (9 samples)
highland              5.41 op/s ±  2.31%   (30 samples)
-------------------------------------------------------

> most-perf@0.10.0 flatMap /Users/brian/Projects/cujojs/most/test/perf
> node ./flatMap.js

flatMap 1000 x 1000 streams
-------------------------------------------------------
most                155.35 op/s ±  0.88%   (76 samples)
rx 4                  0.74 op/s ±  1.00%    (8 samples)
rx 5                 27.81 op/s ±  1.40%   (64 samples)
kefir                 9.17 op/s ±  1.20%   (46 samples)
bacon                 0.72 op/s ±  2.07%    (8 samples)
highland              0.10 op/s ±  5.00%    (5 samples)
-------------------------------------------------------

> most-perf@0.10.0 concatMap /Users/brian/Projects/cujojs/most/test/perf
> node ./concatMap.js

concatMap 1000 x 1000 streams
-------------------------------------------------------
most                112.08 op/s ±  0.92%   (81 samples)
rx 4                  1.40 op/s ±  1.20%   (11 samples)
rx 5                 29.61 op/s ±  1.32%   (68 samples)
kefir                10.12 op/s ±  0.79%   (50 samples)
bacon                 0.75 op/s ±  1.99%    (8 samples)
-------------------------------------------------------

> most-perf@0.10.0 merge /Users/brian/Projects/cujojs/most/test/perf
> node ./merge.js

merge 100000 x 10 streams
-------------------------------------------------------
most                319.92 op/s ±  1.11%   (77 samples)
rx 4                  1.31 op/s ±  3.18%   (11 samples)
rx 5                 30.96 op/s ±  1.00%   (70 samples)
kefir                11.88 op/s ±  0.91%   (57 samples)
bacon                 0.77 op/s ±  1.59%    (8 samples)
-------------------------------------------------------

> most-perf@0.10.0 merge-nested /Users/brian/Projects/cujojs/most/test/perf
> node ./merge-nested.js

merge nested streams w/depth 2, 5, 10, 100 (10000 items in each stream)
-------------------------------------------------------
most (depth 2)    10641.61 op/s ±  2.09%   (75 samples)
most (depth 5)     5720.64 op/s ±  0.93%   (81 samples)
most (depth 10)    3241.54 op/s ±  0.87%   (83 samples)
most (depth 100)    300.55 op/s ±  0.82%   (82 samples)
rx 4 (depth 2)       44.58 op/s ±  1.01%   (68 samples)
rx 4 (depth 5)       16.31 op/s ±  1.22%   (73 samples)
rx 4 (depth 10)       7.05 op/s ±  0.83%   (37 samples)
rx 4 (depth 100)      0.18 op/s ±  3.47%    (5 samples)
rx 5 (depth 2)      674.53 op/s ±  0.78%   (82 samples)
rx 5 (depth 5)      274.46 op/s ±  1.01%   (79 samples)
rx 5 (depth 10)     111.72 op/s ±  1.79%   (81 samples)
rx 5 (depth 100)      1.93 op/s ±  1.99%   (14 samples)
kefir (depth 2)     302.75 op/s ±  3.20%   (77 samples)
kefir (depth 5)     106.11 op/s ±  2.40%   (77 samples)
kefir (depth 10)     38.21 op/s ±  1.90%   (61 samples)
kefir (depth 100)     0.54 op/s ±  2.26%    (7 samples)
bacon (depth 2)      22.32 op/s ±  2.60%   (54 samples)
bacon (depth 5)       9.42 op/s ±  1.86%   (47 samples)
bacon (depth 10)      4.16 op/s ±  1.67%   (24 samples)
bacon (depth 100)     0.09 op/s ±  2.20%    (5 samples)
highland (depth 2)    2.13 op/s ±  9.62%   (15 samples)
highland (depth 5)    2.08 op/s ± 11.69%   (15 samples)
highland (depth 10)    0.18 op/s ±  5.32%    (5 samples)
-------------------------------------------------------

> most-perf@0.10.0 zip /Users/brian/Projects/cujojs/most/test/perf
> node ./zip.js

zip 2 x 100000 integers
-------------------------------------------------------
most                116.40 op/s ±  2.73%   (73 samples)
rx 4                  2.84 op/s ±  1.18%   (18 samples)
rx 5                  0.24 op/s ±  1.72%    (6 samples)
kefir                 0.53 op/s ± 44.33%    (8 samples)
bacon                 0.12 op/s ±  2.41%    (5 samples)
highland              0.07 op/s ± 13.24%    (5 samples)
-------------------------------------------------------

> most-perf@0.10.0 scan /Users/brian/Projects/cujojs/most/test/perf
> node ./scan.js

scan -> reduce 1000000 integers
-------------------------------------------------------
most                326.53 op/s ±  1.16%   (79 samples)
rx 4                  1.43 op/s ±  1.74%   (12 samples)
rx 5                 11.99 op/s ±  0.96%   (57 samples)
kefir                15.15 op/s ±  1.10%   (69 samples)
bacon                 0.69 op/s ±  2.89%    (8 samples)
highland              5.68 op/s ±  2.90%   (31 samples)
-------------------------------------------------------

> most-perf@0.10.0 slice /Users/brian/Projects/cujojs/most/test/perf
> node ./slice.js

skip(n/4) -> take(n/2) 1000000 integers
-------------------------------------------------------
most                122.43 op/s ±  0.94%   (77 samples)
rx 4                  2.34 op/s ±  1.27%   (16 samples)
rx 5                 49.55 op/s ±  1.42%   (74 samples)
kefir                11.63 op/s ±  6.18%   (57 samples)
bacon                 0.98 op/s ±  1.02%    (9 samples)
highland              6.96 op/s ±  2.28%   (37 samples)
-------------------------------------------------------

> most-perf@0.10.0 skipRepeats /Users/brian/Projects/cujojs/most/test/perf
> node ./skipRepeats.js

skipRepeats -> reduce 2 x 1000000 integers
-------------------------------------------------------
most                330.64 op/s ±  4.07%   (74 samples)
rx 4                  1.80 op/s ±  0.64%   (13 samples)
rx 5                 12.20 op/s ±  0.97%   (58 samples)
kefir                12.83 op/s ±  0.89%   (61 samples)
bacon                 0.93 op/s ±  1.57%    (9 samples)
-------------------------------------------------------
```
