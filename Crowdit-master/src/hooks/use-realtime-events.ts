'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { env } from '@/lib/env';
import { getSorobanServer } from '@/lib/soroban';

interface RpcEventTopicSegment {
  _value?: string;
}

interface RpcEventRecord {
  id?: string;
  ledger?: number;
  topic?: RpcEventTopicSegment[] | string[];
}

interface EventsResponse {
  events?: RpcEventRecord[];
}

interface LedgerResponse {
  sequence: number;
}

interface RpcServerWithEvents {
  getLatestLedger: () => Promise<LedgerResponse>;
  getEvents: (options: unknown) => Promise<EventsResponse>;
}

function getTopicValues(event: RpcEventRecord): string[] {
  return (event.topic ?? []).map((segment) =>
    typeof segment === 'string' ? segment : segment?._value ?? '',
  );
}

export function useRealtimeEvents(campaignId?: number) {
  const queryClient = useQueryClient();
  const latestLedgerRef = useRef<number | null>(null);
  const seenEventIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!env.contractId) {
      return;
    }

    let cancelled = false;
    let intervalId: number | null = null;
    const server = getSorobanServer() as unknown as RpcServerWithEvents;

    const syncEvents = async () => {
      try {
        if (latestLedgerRef.current === null) {
          const latestLedger = await server.getLatestLedger();
          latestLedgerRef.current = latestLedger.sequence;
          return;
        }

        const response = await server.getEvents({
          startLedger: latestLedgerRef.current,
          filters: [
            {
              type: 'contract',
              contractIds: [env.contractId],
            },
          ],
          pagination: {
            limit: 25,
          },
        });

        const events = response.events ?? [];

        for (const event of events) {
          if (!event.id || seenEventIdsRef.current.has(event.id)) {
            continue;
          }

          seenEventIdsRef.current.add(event.id);
          const topics = getTopicValues(event);

          if (topics.includes('campaign_backed')) {
            void queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            void queryClient.invalidateQueries({ queryKey: ['recentActivity'] });
            void queryClient.invalidateQueries({ queryKey: ['rewardBalance'] });
            if (campaignId) {
              void queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
            }
            toast.success('New contribution confirmed', {
              description: 'Campaign progress was refreshed from the latest ledger.',
            });
          }

          if (topics.includes('campaign_created')) {
            void queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            toast('A new campaign just launched', {
              description: 'Browse the latest Crowdit project without refreshing.',
            });
          }

          if (topics.includes('funds_claimed')) {
            void queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            if (campaignId) {
              void queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
            }
            toast.success('Campaign funds claimed', {
              description: 'The campaign state has been updated live.',
            });
          }

          if (topics.includes('refund_processed')) {
            void queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            if (campaignId) {
              void queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
            }
            toast.success('Refund processed', {
              description: 'Recent contribution and totals were refreshed.',
            });
          }
        }

        const latestEventLedger = events.reduce<number | null>((current, event) => {
          if (typeof event.ledger !== 'number') {
            return current;
          }

          return current === null ? event.ledger : Math.max(current, event.ledger);
        }, null);

        if (latestEventLedger !== null) {
          latestLedgerRef.current = latestEventLedger + 1;
        }
      } catch (error) {
        if (!cancelled) {
          toast.error('Live updates paused', {
            description:
              error instanceof Error ? error.message : 'Unable to read the latest chain events.',
          });
        }
      }
    };

    void syncEvents();
    intervalId = window.setInterval(() => {
      void syncEvents();
    }, 5_000);

    return () => {
      cancelled = true;
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [campaignId, queryClient]);
}
