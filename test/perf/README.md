Latest performance tests of basic most.js operations.

* [Setup](#setup)
* [Node](#node)

## Setup

```
> uname -a
Linux laptop 4.14.56-1-MANJARO #1 SMP PREEMPT Tue Jul 17 13:20:49 UTC 2018 x86_64 GNU/Linux

> npm ls
most-perf@0.10.0 /Users/brian/Projects/cujojs/most/test/perf
├── @reactivex/rxjs@5.0.1
├── baconjs@2.0.9
├── benchmark@2.1.0 (git://github.com/bestiejs/benchmark.js.git#308cc4c82df602b21bc7775075d43836969a8b16)
├── highland@2.10.1
├── kefir@3.6.1
├── rx@4.1.0
├── rxjs@6.2.2
└── xstream@11.0.0
```

## Node

```
> node --version
v8.11.3

> npm start

> most-perf@0.10.0 start /home/juan/code/most/test/perf
> npm run filter-map-reduce && npm run flatMap && npm run concatMap && npm run merge && npm run merge-nested && npm run zip && npm run scan && npm run slice && npm run skipRepeats && npm run switch


> most-perf@0.10.0 filter-map-reduce /home/juan/code/most/test/perf
> node ./filter-map-reduce

filter -> map -> reduce 1000000 integers
-------------------------------------------------------
most                443.42 op/s ±  1.55%   (81 samples)
rx 4                  1.95 op/s ±  0.91%   (14 samples)
rx 5                101.69 op/s ±  1.46%   (78 samples)
rx 6                 99.22 op/s ±  1.67%   (76 samples)
xstream              21.84 op/s ±  1.66%   (54 samples)
kefir                12.71 op/s ± 11.05%   (64 samples)
bacon                 1.49 op/s ±  3.78%   (12 samples)
highland              8.32 op/s ±  2.68%   (42 samples)
-------------------------------------------------------

> most-perf@0.10.0 flatMap /home/juan/code/most/test/perf
> node ./flatMap.js

flatMap 1000 x 1000 streams
-------------------------------------------------------
most                 51.04 op/s ±  2.55%   (60 samples)
rx 4                  0.91 op/s ±  0.91%    (9 samples)
rx 5                 28.59 op/s ±  3.06%   (39 samples)
rx 6                  9.86 op/s ±  2.98%   (46 samples)
xstream              17.35 op/s ±  1.51%   (80 samples)
kefir                14.62 op/s ±  1.34%   (68 samples)
bacon                 0.60 op/s ±  6.28%    (7 samples)
highland              0.14 op/s ±  1.92%    (5 samples)
-------------------------------------------------------

> most-perf@0.10.0 concatMap /home/juan/code/most/test/perf
> node ./concatMap.js

concatMap 1000 x 1000 streams
-------------------------------------------------------
most                 46.87 op/s ±  2.12%   (72 samples)
rx 4                  1.87 op/s ±  2.04%   (14 samples)
rx 5                 32.73 op/s ±  2.50%   (54 samples)
rx 6                 10.37 op/s ±  2.75%   (48 samples)
xstream              16.52 op/s ±  1.48%   (77 samples)
kefir                15.09 op/s ±  1.61%   (70 samples)
bacon                 0.60 op/s ±  5.44%    (7 samples)
-------------------------------------------------------

> most-perf@0.10.0 merge /home/juan/code/most/test/perf
> node ./merge.js

merge 100000 x 10 streams
-------------------------------------------------------
most                158.95 op/s ± 26.00%   (42 samples)
rx 4                  1.47 op/s ±  0.97%   (12 samples)
rx 5                 73.64 op/s ±  1.45%   (84 samples)
rx 6                 73.29 op/s ±  1.61%   (83 samples)
xstream              34.92 op/s ±  2.67%   (80 samples)
kefir                16.30 op/s ±  1.57%   (75 samples)
bacon                 1.53 op/s ±  2.61%   (12 samples)
-------------------------------------------------------

> most-perf@0.10.0 merge-nested /home/juan/code/most/test/perf
> node ./merge-nested.js

merge nested streams w/depth 2, 5, 10, 100 (10000 items in each stream)
-------------------------------------------------------
most (depth 2)     4081.32 op/s ±  5.18%   (37 samples)
most (depth 5)     1946.29 op/s ±  1.42%   (86 samples)
most (depth 10)    1048.74 op/s ±  1.67%   (85 samples)
most (depth 100)    109.99 op/s ±  1.55%   (47 samples)
rx 4 (depth 2)       52.33 op/s ±  1.78%   (63 samples)
rx 4 (depth 5)       20.34 op/s ±  1.34%   (51 samples)
rx 4 (depth 10)       8.77 op/s ±  0.89%   (45 samples)
rx 4 (depth 100)      0.28 op/s ±  1.38%    (6 samples)
rx 5 (depth 2)      915.47 op/s ±  3.35%   (48 samples)
rx 5 (depth 5)      351.37 op/s ±  1.66%   (84 samples)
rx 5 (depth 10)     149.04 op/s ±  1.61%   (81 samples)
rx 5 (depth 100)      3.12 op/s ±  2.01%   (20 samples)
rx 6 (depth 2)     2227.96 op/s ±  1.88%   (81 samples)
rx 6 (depth 5)     1137.70 op/s ±  1.70%   (85 samples)
rx 6 (depth 10)     633.41 op/s ±  1.61%   (85 samples)
rx 6 (depth 100)     72.52 op/s ±  1.48%   (83 samples)
xstream (depth 2)  1161.94 op/s ±  1.61%   (85 samples)
xstream (depth 5)   386.63 op/s ±  1.54%   (84 samples)
xstream (depth 10)  145.77 op/s ±  1.58%   (83 samples)
xstream (depth 100)    2.10 op/s ±  1.53%   (15 samples)
kefir (depth 2)     430.45 op/s ±  1.05%   (74 samples)
kefir (depth 5)     134.08 op/s ±  0.88%   (75 samples)
kefir (depth 10)     49.35 op/s ±  1.02%   (74 samples)
kefir (depth 100)     0.56 op/s ±  6.31%    (7 samples)
bacon (depth 2)      37.17 op/s ±  4.95%   (62 samples)
bacon (depth 5)      18.09 op/s ±  0.99%   (48 samples)
bacon (depth 10)      8.63 op/s ±  1.15%   (44 samples)
bacon (depth 100)     0.21 op/s ±  4.69%    (6 samples)
highland (depth 2)    3.18 op/s ±  2.91%   (20 samples)
highland (depth 5)    3.24 op/s ±  1.56%   (20 samples)
highland (depth 10)    0.24 op/s ±  0.53%    (6 samples)
-------------------------------------------------------

> most-perf@0.10.0 zip /home/juan/code/most/test/perf
> node ./zip.js

zip 2 x 100000 integers
-------------------------------------------------------
most                118.80 op/s ±  1.70%   (73 samples)
rx 4                  6.29 op/s ±  1.36%   (34 samples)
rx 5                  0.26 op/s ±  1.01%    (6 samples)
rx 6                  0.26 op/s ±  0.94%    (6 samples)
kefir                 0.72 op/s ± 53.21%    (9 samples)
bacon                 0.08 op/s ± 20.15%    (5 samples)
highland              0.09 op/s ±  4.77%    (5 samples)
-------------------------------------------------------

> most-perf@0.10.0 scan /home/juan/code/most/test/perf
> node ./scan.js

scan -> reduce 1000000 integers
-------------------------------------------------------
most                352.54 op/s ±  1.40%   (84 samples)
rx 4                  1.80 op/s ±  0.61%   (13 samples)
rx 5                 24.30 op/s ±  2.04%   (59 samples)
rx 6                 22.70 op/s ±  1.53%   (55 samples)
xstream              19.15 op/s ±  1.69%   (48 samples)
kefir                18.15 op/s ± 18.11%   (52 samples)
bacon                 1.02 op/s ±  8.28%    (9 samples)
highland              8.98 op/s ±  1.81%   (45 samples)
-------------------------------------------------------

> most-perf@0.10.0 slice /home/juan/code/most/test/perf
> node ./slice.js

skip(n/4) -> take(n/2) 1000000 integers
-------------------------------------------------------
most                240.56 op/s ±  1.55%   (78 samples)
rx 4                  2.76 op/s ±  0.81%   (18 samples)
rx 5                135.79 op/s ±  1.52%   (78 samples)
rx 6                130.55 op/s ±  1.48%   (75 samples)
xstream              22.15 op/s ±  1.30%   (52 samples)
kefir                15.62 op/s ±  6.37%   (75 samples)
bacon                 1.79 op/s ±  2.15%   (13 samples)
highland              9.45 op/s ±  2.62%   (46 samples)
-------------------------------------------------------

> most-perf@0.10.0 skipRepeats /home/juan/code/most/test/perf
> node ./skipRepeats.js

skipRepeats -> reduce 2 x 1000000 integers
-------------------------------------------------------
most                370.98 op/s ±  1.51%   (80 samples)
rx 4                  2.15 op/s ±  0.71%   (15 samples)
rx 5                 25.46 op/s ±  2.39%   (62 samples)
rx 6                 25.99 op/s ±  1.43%   (63 samples)
xstream              52.31 op/s ±  2.28%   (81 samples)
kefir                19.12 op/s ± 19.47%   (53 samples)
bacon                 1.65 op/s ±  3.17%   (13 samples)
-------------------------------------------------------

> most-perf@0.10.0 switch /home/juan/code/most/test/perf
> node ./switch.js

switch 10000 x 1000 streams
-------------------------------------------------------
most               1673.19 op/s ±  1.27%   (75 samples)
rx 4                116.50 op/s ± 12.05%   (81 samples)
rx 5                  3.56 op/s ± 11.17%   (20 samples)
rx 6                  7.48 op/s ±  2.04%   (40 samples)
xstream               1.64 op/s ±  2.02%   (13 samples)
kefir                 1.64 op/s ±  3.56%   (12 samples)
bacon                 0.02 op/s ±  5.20%    (5 samples)
-------------------------------------------------------