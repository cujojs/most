Updated: 1-15-2015

Latest performance tests of basic most.js operations.

```
> uname -a
Darwin bcavalier-2.home 14.0.0 Darwin Kernel Version 14.0.0: Fri Sep 19 00:26:44 PDT 2014; root:xnu-2782.1.97~2/RELEASE_X86_64 x86_64

> node --version
v0.11.14

> npm ls
most-perf@0.10.0 /Users/brian/Projects/cujojs/most/test/perf
├── baconjs@0.7.42
├─┬ benchmark@2.0.0-pre (git+https://github.com/bestiejs/benchmark.js#fc3ff3d865602b742ac2ef08e69d934815e08d36)
│ └── platform@1.3.0
├── highland@2.3.0
├── kefir@0.5.3
├── lodash@3.0.0-pre (git+https://github.com/lodash/lodash#de13d3866589b7ee2b7bbb96ff7fb7d4245fc875)
└── rx@2.3.23
```

```
filter -> map -> reduce 1000000 integers
-------------------------------------------------------
most       110.49 op/s ± 18.60%   (33 samples)
rx           0.59 op/s ±  0.82%    (6 samples)
kefir       10.47 op/s ±  1.64%   (29 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland     5.20 op/s ±  2.31%   (17 samples)
lodash      20.66 op/s ±  2.64%   (38 samples)
Array        5.78 op/s ±  2.82%   (19 samples)
-------------------------------------------------------
```

```
flatMap 1000 x 1000 streams
-------------------------------------------------------
most        53.26 op/s ±  1.65%   (81 samples)
rx           0.33 op/s ±  7.98%    (5 samples)
kefir        9.33 op/s ±  1.61%   (26 samples)
bacon        0.84 op/s ±  1.44%    (7 samples)
highland     0.07 op/s ±  7.22%    (5 samples)
lodash      17.08 op/s ±  4.03%   (32 samples)
Array        0.37 op/s ±  1.44%    (5 samples)
-------------------------------------------------------
```

```
concatMap 1000 x 1000 streams
-------------------------------------------------------
most        53.01 op/s ±  2.00%   (81 samples)
rx           0.64 op/s ±  2.35%    (6 samples)
kefir       10.10 op/s ±  2.02%   (28 samples)
bacon        0.81 op/s ±  2.67%    (7 samples)
lodash      16.35 op/s ±  4.90%   (44 samples)
Array        0.37 op/s ±  1.59%    (5 samples)
-------------------------------------------------------
```

```
zip 2 x 100000 integers
-------------------------------------------------------
most        73.86 op/s ±  2.04%   (69 samples)
rx           1.12 op/s ±  1.77%    (7 samples)
kefir       29.88 op/s ±  5.17%   (39 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland     0.24 op/s ±  2.64%    (5 samples)
lodash      27.45 op/s ±  8.98%   (50 samples)
-------------------------------------------------------
```

```
scan -> reduce 1000000 integers
-------------------------------------------------------
most        28.26 op/s ±  1.43%   (67 samples)
rx           0.54 op/s ±  2.86%    (6 samples)
kefir       16.53 op/s ±  1.74%   (41 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland     4.51 op/s ±  4.64%   (15 samples)
lodash      11.43 op/s ± 10.10%   (34 samples)
Array        3.67 op/s ±  3.12%   (14 samples)
-------------------------------------------------------
```