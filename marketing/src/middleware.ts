import { addYears } from 'date-fns';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { type NextRequest, NextResponse } from 'next/server';
import parse from 'url-parse';

// https://www.retrospected.com/?campaignid=19686942887&creative=648178043912&device=c&keyword=retro

const COOKIE_NAME = 'retro_aw';

export type TrackingInfo = {
  campaignId: string;
  creativeId: string;
  device: string;
  keyword: string;
  gclid: string;
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const url = parse(request.url, true);

  if (url.query?.campaignid && url.query.creative) {
    const host = url.host;
    const tracking: Partial<TrackingInfo> = {
      campaignId: url.query.campaignid,
      creativeId: url.query.creative,
      device: url.query.device,
      keyword: url.query.keyword,
      gclid: url.query.gclid,
    };

    const cookie: ResponseCookie = {
      name: COOKIE_NAME,
      value: JSON.stringify(tracking),
      expires: addYears(new Date(), 1),
      domain: host.includes('localhost')
        ? undefined
        : process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
    };

    response.cookies.set(cookie);
  }

  return response;
}
