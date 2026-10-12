import type { ProfilerOnRenderCallback } from 'react';

interface CommitRecord {
  id: string;
  phase: 'mount' | 'update' | 'nested-update';
  actualDuration: number;
  baseDuration: number;
  commitTime: number;
}

let commitCount = 0;
const commitHistory: CommitRecord[] = [];
const SUMMARY_INTERVAL = 20;
const TOP_SLOW_COUNT = 5;

export const onRenderApp: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  if (!__DEV__) return;

  commitCount++;
  const commit: CommitRecord = {
    id,
    phase,
    actualDuration: Number(actualDuration.toFixed(2)),
    baseDuration: Number(baseDuration.toFixed(2)),
    commitTime: Math.round(commitTime),
  };

  commitHistory.push(commit);

  // Log commit detail
  console.log(
    `[Profiler][${id}] Commit #${commitCount} | Phase: ${phase} | Duration: ${commit.actualDuration}ms (base: ${commit.baseDuration}ms)`
  );

  // Every 20 commits: print top 5 slowest commits summary
  if (commitCount % SUMMARY_INTERVAL === 0) {
    const recentCommits = commitHistory.slice(-SUMMARY_INTERVAL);
    const slowest = [...recentCommits]
      .sort((a, b) => b.actualDuration - a.actualDuration)
      .slice(0, TOP_SLOW_COUNT);

    console.log(
      `\n================= [Profiler Summary: Last ${SUMMARY_INTERVAL} Commits (#${commitCount - SUMMARY_INTERVAL + 1} - #${commitCount})] =================`
    );
    console.log(`Top ${TOP_SLOW_COUNT} Slowest Commits:`);
    slowest.forEach((c, idx) => {
      console.log(
        `  ${idx + 1}. Phase: ${c.phase.toUpperCase().padEnd(7)} | Actual: ${c.actualDuration}ms | Base: ${c.baseDuration}ms`
      );
    });
    console.log(
      `========================================================================================\n`
    );
  }
};
