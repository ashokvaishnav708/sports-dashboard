import { MATCH_STATUS } from "../validation/matches";

export function getMatchStatus(
  startTime: string,
  endTime: string,
  now = new Date(),
) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  if (now < start) {
    return MATCH_STATUS.SCHEDULED;
  }

  if (now >= end) {
    return MATCH_STATUS.FINISHED;
  }

  return MATCH_STATUS.LIVE;
}

// export async function syncMatchStatus(match, updateStatus);
