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
├── rx@4.1.0
└── xstream@10.0.0
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
most                568.23 op/s ±  1.43%   (80 samples)
rx 4                  1.45 op/s ±  1.48%   (12 samples)
rx 5                 11.38 op/s ±  1.29%   (55 samples)
xstream              18.41 op/s ±  0.91%   (81 samples)
kefir                10.36 op/s ±  1.11%   (51 samples)
bacon                 0.83 op/s ±  1.93%    (9 samples)
highland              4.82 op/s ±  1.90%   (27 samples)
-------------------------------------------------------

> most-perf@0.10.0 flatMap /Users/brian/Projects/cujojs/most/test/perf
> node ./flatMap.js

flatMap 1000 x 1000 streams
-------------------------------------------------------
most                153.71 op/s ±  1.11%   (77 samples)
rx 4                  0.75 op/s ±  2.24%    (8 samples)
rx 5                 27.50 op/s ±  0.96%   (64 samples)
xstream              11.99 op/s ±  0.98%   (57 samples)
kefir                 9.30 op/s ±  1.13%   (47 samples)
bacon                 0.73 op/s ±  1.29%    (8 samples)
highland              0.10 op/s ±  3.44%    (5 samples)
-------------------------------------------------------

> most-perf@0.10.0 concatMap /Users/brian/Projects/cujojs/most/test/perf
> node ./concatMap.js

concatMap 1000 x 1000 streams
-------------------------------------------------------
most                103.87 op/s ±  1.24%   (77 samples)
rx 4                  1.29 op/s ± 11.69%   (11 samples)
rx 5                 29.58 op/s ±  1.12%   (68 samples)
xstream              12.37 op/s ±  0.95%   (59 samples)
kefir                10.13 op/s ±  0.99%   (50 samples)
bacon                 0.70 op/s ±  3.40%    (8 samples)
-------------------------------------------------------

> most-perf@0.10.0 merge /Users/brian/Projects/cujojs/most/test/perf
> node ./merge.js

merge 100000 x 10 streams
-------------------------------------------------------
most                315.04 op/s ±  1.62%   (79 samples)
rx 4                  1.36 op/s ±  1.59%   (11 samples)
rx 5                 30.42 op/s ±  1.00%   (69 samples)
xstream              16.87 op/s ±  1.15%   (75 samples)
kefir                11.63 op/s ±  1.75%   (56 samples)
bacon                 0.74 op/s ±  2.53%    (8 samples)
-------------------------------------------------------

> most-perf@0.10.0 merge-nested /Users/brian/Projects/cujojs/most/test/perf
> node ./merge-nested.js

merge nested streams w/depth 2, 5, 10, 100 (10000 items in each stream)
-------------------------------------------------------
most (depth 2)    11914.82 op/s ±  0.81%   (79 samples)
most (depth 5)     6218.70 op/s ±  1.12%   (78 samples)
most (depth 10)    3524.94 op/s ±  1.19%   (81 samples)
most (depth 100)    305.40 op/s ±  1.89%   (79 samples)
rx 4 (depth 2)       45.61 op/s ±  1.10%   (69 samples)
rx 4 (depth 5)       16.34 op/s ±  0.95%   (73 samples)
rx 4 (depth 10)       6.79 op/s ±  2.28%   (36 samples)
rx 4 (depth 100)      0.18 op/s ±  2.54%    (5 samples)
rx 5 (depth 2)      678.24 op/s ±  1.45%   (79 samples)
rx 5 (depth 5)      268.50 op/s ±  2.52%   (78 samples)
rx 5 (depth 10)      77.43 op/s ±  5.12%   (60 samples)
rx 5 (depth 100)      1.63 op/s ±  5.42%   (13 samples)
xstream (depth 2)   373.53 op/s ±  3.37%   (61 samples)
xstream (depth 5)   152.53 op/s ±  3.18%   (64 samples)
xstream (depth 10)   66.73 op/s ±  2.52%   (63 samples)
xstream (depth 100)    1.32 op/s ±  1.01%   (11 samples)
kefir (depth 2)     218.64 op/s ±  3.61%   (62 samples)
kefir (depth 5)      79.75 op/s ±  2.76%   (62 samples)
kefir (depth 10)     31.82 op/s ±  3.25%   (72 samples)
kefir (depth 100)     0.47 op/s ±  2.10%    (7 samples)
bacon (depth 2)      17.35 op/s ±  3.18%   (48 samples)
bacon (depth 5)       7.33 op/s ±  2.98%   (38 samples)
bacon (depth 10)      3.34 op/s ±  3.44%   (20 samples)
bacon (depth 100)     0.08 op/s ±  3.85%    (5 samples)
highland (depth 2)    1.75 op/s ± 13.30%   (13 samples)
highland (depth 5)    1.78 op/s ±  9.74%   (13 samples)
highland (depth 10)    0.14 op/s ±  2.89%    (5 samples)
-------------------------------------------------------

> most-perf@0.10.0 zip /Users/brian/Projects/cujojs/most/test/perf
> node ./zip.js

zip 2 x 100000 integers
-------------------------------------------------------
most                 91.66 op/s ±  3.23%   (61 samples)
rx 4                  2.15 op/s ±  2.07%   (15 samples)
rx 5                  0.20 op/s ±  1.33%    (5 samples)
kefir                 0.46 op/s ± 51.48%    (7 samples)
bacon                 0.10 op/s ±  8.01%    (5 samples)
highland              0.06 op/s ±  7.44%    (5 samples)
-------------------------------------------------------

> most-perf@0.10.0 scan /Users/brian/Projects/cujojs/most/test/perf
> node ./scan.js

scan -> reduce 1000000 integers
-------------------------------------------------------
most                304.14 op/s ±  1.02%   (75 samples)
rx 4                  1.19 op/s ±  2.28%   (10 samples)
rx 5                 10.06 op/s ±  2.30%   (50 samples)
xstream               7.87 op/s ±  1.25%   (40 samples)
kefir                12.76 op/s ±  2.15%   (59 samples)
bacon                 0.59 op/s ±  4.14%    (7 samples)
highland              4.91 op/s ±  3.29%   (27 samples)
-------------------------------------------------------

> most-perf@0.10.0 slice /Users/brian/Projects/cujojs/most/test/perf
> node ./slice.js

skip(n/4) -> take(n/2) 1000000 integers
-------------------------------------------------------
most                101.20 op/s ±  1.77%   (65 samples)
rx 4                  2.00 op/s ±  1.90%   (14 samples)
rx 5                 40.24 op/s ±  1.81%   (62 samples)
xstream              17.89 op/s ±  2.65%   (42 samples)
kefir                 9.87 op/s ±  7.09%   (51 samples)
bacon                 0.84 op/s ±  2.23%    (9 samples)
highland              6.17 op/s ±  2.67%   (33 samples)
-------------------------------------------------------

> most-perf@0.10.0 skipRepeats /Users/brian/Projects/cujojs/most/test/perf
> node ./skipRepeats.js

skipRepeats -> reduce 2 x 1000000 integers
-------------------------------------------------------
most                327.55 op/s ±  1.01%   (76 samples)
rx 4                  1.60 op/s ±  1.40%   (12 samples)
rx 5                 10.71 op/s ±  1.74%   (52 samples)
xstream              18.89 op/s ±  1.82%   (47 samples)
kefir                10.99 op/s ±  2.19%   (53 samples)
bacon                 0.73 op/s ±  1.89%    (8 samples)
-------------------------------------------------------

> most-perf@0.10.0 switch /Users/brian/Projects/cujojs/most/test/perf
> node ./switch.js

switch 10000 x 1000 streams
-------------------------------------------------------
most               1426.42 op/s ±  1.28%   (81 samples)
rx 5                  1.65 op/s ±  6.74%   (12 samples)
rx 4                 95.93 op/s ±  3.47%   (72 samples)
xstream               1.32 op/s ±  5.03%   (11 samples)
kefir                 1.05 op/s ±  1.37%   (10 samples)
bacon                 0.03 op/s ±  1.75%    (5 samples)
-------------------------------------------------------
```
