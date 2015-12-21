Updated: 12-21-2015

Latest performance tests of basic most.js operations.

* [Setup](#setup)
* [Node](#node)

## Setup

```
> uname -a
Darwin Brians-MBP.home 14.5.0 Darwin Kernel Version 14.5.0: Tue Sep  1 21:23:09 PDT 2015; root:xnu-2782.50.1~1/RELEASE_X86_64 x86_64

> npm ls
most-perf@0.10.0 /Users/brian/Projects/cujojs/most/test/perf
├── @reactivex/rxjs@5.0.0-alpha.12
├── baconjs@0.7.82
├─┬ benchmark@2.0.0-pre invalid (git://github.com/bestiejs/benchmark.js.git#d996372edec2da9f7265b0d9d5138542d0b756ec)
│ ├── lodash-compat@3.10.1
│ └── platform@1.3.0
├── highland@2.5.1
├── kefir@3.1.0
├── lodash@3.10.1
└── rx@4.0.7
```

## Node

```
> node --version
v5.2.0

> npm start

filter -> map -> reduce 1000000 integers
-------------------------------------------------------
most        324.79 op/s ±  1.14%   (78 samples)
rx 4          1.29 op/s ±  2.03%    (8 samples)
rx 5          4.38 op/s ±  0.89%   (15 samples)
kefir        12.22 op/s ±  0.92%   (32 samples)
bacon         1.01 op/s ±  1.44%    (7 samples)
highland      7.20 op/s ±  3.58%   (21 samples)
lodash       77.10 op/s ±  4.16%   (64 samples)
Array         6.59 op/s ±  2.67%   (21 samples)
-------------------------------------------------------

flatMap 1000 x 1000 streams
-------------------------------------------------------
most        166.95 op/s ±  0.97%   (79 samples)
rx 4          0.69 op/s ±  1.55%    (6 samples)
rx 5          7.05 op/s ±  1.23%   (21 samples)
kefir        11.17 op/s ±  0.95%   (30 samples)
bacon         0.86 op/s ±  2.51%    (7 samples)
highland      0.17 op/s ±  5.13%    (5 samples)
lodash       20.99 op/s ±  3.69%   (39 samples)
Array         0.41 op/s ±  4.18%    (6 samples)
-------------------------------------------------------

concatMap 1000 x 1000 streams
-------------------------------------------------------
most        129.19 op/s ±  0.87%   (81 samples)
rx 4          1.21 op/s ±  1.15%    (7 samples)
rx 5          7.34 op/s ±  0.83%   (22 samples)
kefir        11.96 op/s ±  1.30%   (32 samples)
bacon         0.85 op/s ±  3.29%    (7 samples)
lodash       21.17 op/s ±  2.86%   (39 samples)
Array         0.41 op/s ±  2.15%    (6 samples)
-------------------------------------------------------

zip 2 x 100000 integers
-------------------------------------------------------
most        113.11 op/s ±  1.62%   (74 samples)
rx 4          3.52 op/s ±  1.05%   (13 samples)
rx 5         21.43 op/s ±  2.25%   (29 samples)
kefir        18.26 op/s ±  1.73%   (26 samples)
bacon         1.05 op/s ±  4.98%    (7 samples)
highland      0.53 op/s ±  5.41%    (6 samples)
lodash       42.31 op/s ±  8.25%   (52 samples)
-------------------------------------------------------

scan -> reduce 1000000 integers
-------------------------------------------------------
most        352.49 op/s ±  0.91%   (77 samples)
rx 4          1.29 op/s ±  1.77%    (8 samples)
rx 5          4.50 op/s ±  1.11%   (15 samples)
kefir        19.14 op/s ±  1.52%   (27 samples)
bacon         0.80 op/s ±  3.15%    (6 samples)
highland      5.86 op/s ±  4.13%   (18 samples)
lodash       38.86 op/s ±  6.39%   (52 samples)
Array         5.54 op/s ±  6.27%   (18 samples)
-------------------------------------------------------

skipRepeats -> reduce 2 x 1000000 integers
-------------------------------------------------------
most        298.58 op/s ±  0.93%   (82 samples)
rx 4          1.59 op/s ±  1.29%    (8 samples)
rx 5          5.74 op/s ±  0.74%   (18 samples)
kefir        15.24 op/s ±  3.05%   (38 samples)
bacon         1.12 op/s ±  1.70%    (7 samples)
lodash       81.87 op/s ±  3.98%   (63 samples)
Array         8.39 op/s ±  2.50%   (25 samples)
-------------------------------------------------------
```
