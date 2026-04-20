import { run } from './cli/run';

run().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('Fatal error:', message);
  process.exit(1);
});
