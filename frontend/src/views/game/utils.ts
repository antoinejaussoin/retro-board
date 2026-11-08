import type { Post, PostGroup, VoteType } from 'common';
import groupBy from 'lodash/groupBy';
import sum from 'lodash/sum';
import toPairs from 'lodash/toPairs';

/** Quick-access palette shown above the full emoji picker. */
export const QUICK_REACTION_EMOJIS = [
  '👍',
  '❤️',
  '😄',
  '🎉',
  '🚀',
  '👀',
] as const;

export function countVotes(post: Post, type: VoteType): number {
  return post.votes.filter((v) => v.type === type).length;
}

export interface ReactionCount {
  emoji: string;
  count: number;
}

function orderedReactionCounts(
  totals: Map<string, number>,
): ReactionCount[] {
  const quick = QUICK_REACTION_EMOJIS.map((emoji) => ({
    emoji,
    count: totals.get(emoji) ?? 0,
  })).filter((entry) => entry.count > 0);
  const others = [...totals.entries()]
    .filter(
      ([emoji]) =>
        !(QUICK_REACTION_EMOJIS as readonly string[]).includes(emoji),
    )
    .map(([emoji, count]) => ({ emoji, count }));
  return [...quick, ...others];
}

export function countReactions(post: Post): ReactionCount[] {
  const totals = new Map<string, number>();
  for (const reaction of post.reactions) {
    totals.set(reaction.emoji, (totals.get(reaction.emoji) ?? 0) + 1);
  }
  return orderedReactionCounts(totals);
}

export function countReactionsForGroup(group: PostGroup): ReactionCount[] {
  const totals = new Map<string, number>();
  for (const post of group.posts) {
    for (const reaction of post.reactions) {
      totals.set(reaction.emoji, (totals.get(reaction.emoji) ?? 0) + 1);
    }
  }
  return orderedReactionCounts(totals);
}

export function countVotesForGroup(group: PostGroup, type: VoteType): number {
  return sum(group.posts.map((p) => countVotes(p, type)));
}

export interface VoteEnumeration {
  name: string;
  count: number;
}

export function enumerateVotes(post: Post, type: VoteType): VoteEnumeration[] {
  return toPairs(
    groupBy(
      post.votes.filter((v) => v.type === type),
      (v) => v.userName,
    ),
  ).map((pair) => ({
    name: pair[0],
    count: pair[1].length,
  }));
}

export function sortPostByVote(a: Post, b: Post): number {
  const scoreA = countVotes(a, 'like') - countVotes(a, 'dislike');
  const scoreB = countVotes(b, 'like') - countVotes(b, 'dislike');
  if (scoreA === scoreB) {
    return 0;
  }

  return scoreA < scoreB ? 1 : -1;
}
