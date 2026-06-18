% qhull_benchmark.m
%
% Times Delaunay triangulation of uniform random points in 2D and 3D.
% MATLAB, Octave, and numbl all compute delaunayn via Qhull, so this is a
% direct, apples-to-apples comparison with the qhull-wasm benchmark running
% in the browser (https://concept-collection.github.io/qhull-wasm-demo/).
%
% Run with:  matlab -batch qhull_benchmark   |   octave qhull_benchmark.m
%            numbl run qhull_benchmark.m
%
% Note: native and browser runs use different random points, but the timing
% is dominated by N and dimension, not the specific sample, so totals compare.

sizes = [1000 5000 20000 50000];

fprintf('Qhull Delaunay benchmark\n');
fprintf('%-8s %12s %12s\n', 'N', '2D (ms)', '3D (ms)');
fprintf('%s\n', repmat('-', 1, 34));

for k = 1:numel(sizes)
  n = sizes(k);

  P2 = rand(n, 2);
  t = tic; delaunayn(P2); ms2 = toc(t) * 1000;

  P3 = rand(n, 3);
  t = tic; delaunayn(P3); ms3 = toc(t) * 1000;

  fprintf('%-8d %12.1f %12.1f\n', n, ms2, ms3);
end
