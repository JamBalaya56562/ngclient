// Local-only validation: limit concurrent workers; keep every test and the normal test timeout.
export default { test: { maxWorkers: 2 } };
