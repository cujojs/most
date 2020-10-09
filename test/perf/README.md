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
most                442.99 op/s ±  1.01%   (85 samples)
rx 4                  1.95 op/s ±  0.37%   (14 samples)
rx 5                103.44 op/s ±  0.92%   (81 samples)
rx 6                 98.88 op/s ±  1.51%   (77 samples)
xstream              21.60 op/s ±  0.73%   (55 samples)
kefir                14.11 op/s ± 10.89%   (72 samples)
bacon                 1.51 op/s ±  3.88%   (12 samples)
highland              8.65 op/s ±  2.75%   (44 samples)
-------------------------------------------------------

> most-perf@0.10.0 flatMap /home/juan/code/most/test/perf
> node ./flatMap.js

flatMap 1000 x 1000 streams
-------------------------------------------------------
most                 51.93 op/s ±  2.38%   (62 samples)
rx 4                  0.91 op/s ±  1.23%    (9 samples)
rx 5                 31.85 op/s ±  1.10%   (54 samples)
rx 6                 10.10 op/s ±  2.30%   (47 samples)
xstream              17.41 op/s ±  1.21%   (82 samples)
kefir                16.78 op/s ±  0.94%   (80 samples)
bacon                 0.61 op/s ±  6.00%    (7 samples)
highland              0.14 op/s ±  2.34%    (5 samples)
-------------------------------------------------------

> most-perf@0.10.0 concatMap /home/juan/code/most/test/perf
> node ./concatMap.js

concatMap 1000 x 1000 streams
-------------------------------------------------------
most                 52.01 op/s ±  4.35%   (40 samples)
rx 4                  1.82 op/s ±  0.86%   (14 samples)
rx 5                 26.90 op/s ±  1.33%   (46 samples)
rx 6                 10.82 op/s ±  2.47%   (50 samples)
xstream              16.80 op/s ±  1.21%   (79 samples)
kefir                16.53 op/s ±  0.79%   (79 samples)
bacon                 0.60 op/s ±  6.17%    (7 samples)
-------------------------------------------------------

> most-perf@0.10.0 merge /home/juan/code/most/test/perf
> node ./merge.js

merge 100000 x 10 streams
-------------------------------------------------------
most                159.18 op/s ± 25.88%   (43 samples)
rx 4                  1.51 op/s ±  1.02%   (12 samples)
rx 5                 74.69 op/s ±  1.00%   (86 samples)
rx 6                 76.16 op/s ±  0.71%   (88 samples)
xstream              38.17 op/s ±  1.62%   (64 samples)
kefir                17.49 op/s ±  1.88%   (83 samples)
bacon                 1.53 op/s ±  2.75%   (12 samples)
-------------------------------------------------------

> most-perf@0.10.0 merge-nested /home/juan/code/most/test/perf
> node ./merge-nested.js

merge nested streams w/depth 2, 5, 10, 100 (10000 items in each stream)
-------------------------------------------------------
most (depth 2)     6088.23 op/s ± 15.66%   (45 samples)
most (depth 5)     2015.35 op/s ±  0.78%   (89 samples)
most (depth 10)    1102.96 op/s ±  0.77%   (90 samples)
most (depth 100)    351.16 op/s ±  1.19%   (85 samples)
rx 4 (depth 2)       54.18 op/s ±  1.26%   (84 samples)
rx 4 (depth 5)       20.67 op/s ±  1.48%   (53 samples)
rx 4 (depth 10)       8.64 op/s ±  0.36%   (45 samples)
rx 4 (depth 100)      0.28 op/s ±  0.88%    (6 samples)
rx 5 (depth 2)      944.78 op/s ±  2.70%   (51 samples)
rx 5 (depth 5)      381.93 op/s ±  0.56%   (88 samples)
rx 5 (depth 10)     156.86 op/s ±  0.97%   (81 samples)
rx 5 (depth 100)      3.00 op/s ±  2.15%   (19 samples)
rx 6 (depth 2)     2323.60 op/s ±  0.93%   (86 samples)
rx 6 (depth 5)     1195.30 op/s ±  0.46%   (90 samples)
rx 6 (depth 10)     648.01 op/s ±  0.97%   (87 samples)
rx 6 (depth 100)     73.82 op/s ±  1.03%   (86 samples)
xstream (depth 2)  1188.25 op/s ±  1.05%   (87 samples)
xstream (depth 5)   397.85 op/s ±  1.15%   (87 samples)
xstream (depth 10)  150.90 op/s ±  0.90%   (87 samples)
xstream (depth 100)    2.22 op/s ±  2.23%   (16 samples)
kefir (depth 2)     465.83 op/s ±  1.45%   (85 samples)
kefir (depth 5)     147.50 op/s ±  1.19%   (85 samples)
kefir (depth 10)     52.65 op/s ±  1.46%   (81 samples)
kefir (depth 100)     0.62 op/s ± 10.64%    (8 samples)
bacon (depth 2)      39.17 op/s ±  4.49%   (64 samples)
bacon (depth 5)      19.09 op/s ±  1.54%   (52 samples)
bacon (depth 10)      9.11 op/s ±  0.91%   (47 samples)
bacon (depth 100)     0.20 op/s ±  3.08%    (6 samples)
highland (depth 2)    3.15 op/s ±  2.60%   (20 samples)
highland (depth 5)    3.18 op/s ±  1.47%   (20 samples)
highland (depth 10)    0.23 op/s ±  0.48%    (6 samples)
-------------------------------------------------------

> most-perf@0.10.0 zip /home/juan/code/most/test/perf
> node ./zip.js

zip 2 x 100000 integers
-------------------------------------------------------
most                126.54 op/s ±  1.65%   (78 samples)
rx 4                  6.46 op/s ±  1.27%   (35 samples)
rx 5                  0.26 op/s ±  0.75%    (6 samples)
rx 6                  0.26 op/s ±  0.68%    (6 samples)
kefir                 0.74 op/s ± 53.83%    (9 samples)
bacon                 0.08 op/s ± 21.13%    (5 samples)
highland              0.09 op/s ±  4.67%    (5 samples)
-------------------------------------------------------

> most-perf@0.10.0 scan /home/juan/code/most/test/perf
> node ./scan.js

scan -> reduce 1000000 integers
-------------------------------------------------------
most                351.48 op/s ±  0.88%   (84 samples)
rx 4                  1.85 op/s ±  0.43%   (14 samples)
rx 5                 26.23 op/s ±  2.00%   (65 samples)
rx 6                 24.97 op/s ±  1.67%   (62 samples)
xstream              20.97 op/s ±  1.20%   (53 samples)
kefir                19.06 op/s ± 17.83%   (54 samples)
bacon                 1.02 op/s ±  9.01%    (9 samples)
highland              9.04 op/s ±  1.80%   (45 samples)
-------------------------------------------------------

> most-perf@0.10.0 slice /home/juan/code/most/test/perf
> node ./slice.js

skip(n/4) -> take(n/2) 1000000 integers
-------------------------------------------------------
most                250.26 op/s ±  0.68%   (89 samples)
rx 4                  2.80 op/s ±  0.51%   (18 samples)
rx 5                139.49 op/s ±  1.01%   (81 samples)
rx 6                135.73 op/s ±  0.53%   (89 samples)
xstream              25.76 op/s ±  0.59%   (60 samples)
kefir                15.98 op/s ±  6.22%   (78 samples)
bacon                 1.82 op/s ±  2.15%   (13 samples)
highland              9.69 op/s ±  2.25%   (47 samples)
-------------------------------------------------------

> most-perf@0.10.0 skipRepeats /home/juan/code/most/test/perf
> node ./skipRepeats.js

skipRepeats -> reduce 2 x 1000000 integers
-------------------------------------------------------
most                372.24 op/s ±  1.04%   (86 samples)
rx 4                  2.15 op/s ±  0.60%   (15 samples)
rx 5                 27.13 op/s ±  1.22%   (66 samples)
rx 6                 25.03 op/s ±  1.25%   (62 samples)
xstream              54.87 op/s ±  2.64%   (86 samples)
kefir                20.27 op/s ± 17.96%   (57 samples)
bacon                 1.63 op/s ±  3.50%   (12 samples)
-------------------------------------------------------

> most-perf@0.10.0 switch /home/juan/code/most/test/perf
> node ./switch.js

switch 10000 x 1000 streams
-------------------------------------------------------
most               1815.98 op/s ±  1.65%   (84 samples)
rx 4                130.78 op/s ±  1.07%   (86 samples)
rx 5                  3.72 op/s ±  9.37%   (21 samples)
rx 6                  7.06 op/s ±  1.90%   (38 samples)
xstream               1.80 op/s ±  1.31%   (13 samples)
kefir                 1.62 op/s ±  1.61%   (12 samples)
bacon                 0.02 op/s ±  5.26%    (5 samples)
-------------------------------------------------------
Done in 1124.62s.