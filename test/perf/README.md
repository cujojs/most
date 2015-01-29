Updated: 1-29-2015

Latest performance tests of basic most.js operations.

```
> uname -a
Darwin bcavalier-2.home 14.0.0 Darwin Kernel Version 14.0.0: Fri Sep 19 00:26:44 PDT 2014; root:xnu-2782.1.97~2/RELEASE_X86_64 x86_64

> node --version
v0.11.15

> npm ls
most-perf@0.10.0 /Users/brian/Projects/cujojs/most/test/perf
├── baconjs@0.7.42
├─┬ benchmark@2.0.0-pre (git+https://github.com/bestiejs/benchmark.js#042f1b21a7420f50aa554af4d62375ca9cab9bc1)
│ ├── lodash-compat@3.0.0
│ └── platform@1.3.0
├── highland@2.3.0
├── kefir@0.5.3
├── lodash@3.0.0
└── rx@2.3.24
```

```
filter -> map -> reduce 1000000 integers
-------------------------------------------------------
most       113.36 op/s ± 16.23%   (35 samples)
rx           0.65 op/s ±  1.74%    (6 samples)
kefir       11.43 op/s ±  1.24%   (30 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland     5.69 op/s ±  1.57%   (18 samples)
lodash      22.25 op/s ±  2.39%   (41 samples)
Array        7.47 op/s ±  3.52%   (23 samples)
-------------------------------------------------------
```

```
flatMap 1000 x 1000 streams
-------------------------------------------------------
most        56.47 op/s ±  1.68%   (80 samples)
rx           0.37 op/s ±  7.42%    (5 samples)
kefir        9.87 op/s ±  1.69%   (27 samples)
bacon        0.84 op/s ±  4.20%    (7 samples)
highland     0.08 op/s ±  5.43%    (5 samples)
lodash      28.73 op/s ±  3.52%   (38 samples)
Array        0.39 op/s ±  3.32%    (5 samples)
-------------------------------------------------------
```

```
concatMap 1000 x 1000 streams
-------------------------------------------------------
most        53.70 op/s ±  1.89%   (80 samples)
rx           0.66 op/s ±  3.56%    (6 samples)
kefir       10.56 op/s ±  2.12%   (29 samples)
bacon        0.97 op/s ±  2.25%    (7 samples)
lodash      25.99 op/s ±  5.61%   (47 samples)
Array        0.38 op/s ±  3.41%    (5 samples)
-------------------------------------------------------
```

```
zip 2 x 100000 integers
-------------------------------------------------------
most        74.36 op/s ±  1.78%   (66 samples)
rx           1.84 op/s ±  1.26%    (9 samples)
kefir       35.16 op/s ±  0.99%   (41 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland     0.27 op/s ±  2.03%    (5 samples)
lodash      25.67 op/s ±  5.99%   (47 samples)
-------------------------------------------------------
```

```
scan -> reduce 1000000 integers
-------------------------------------------------------
most        70.53 op/s ± 18.44%   (27 samples)
rx           0.71 op/s ±  3.55%    (6 samples)
kefir       17.17 op/s ±  2.43%   (40 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland     4.88 op/s ±  5.06%   (16 samples)
lodash      14.20 op/s ±  4.83%   (39 samples)
Array        5.96 op/s ±  5.04%   (19 samples)
-------------------------------------------------------
```