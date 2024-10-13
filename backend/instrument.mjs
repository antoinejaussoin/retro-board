import * as Sentry from "@sentry/node";
import packageJson from './package.json' assert { type: 'json' };

const { version } = packageJson;
const useSentry = !!process.env.SENTRY_URL&& process.env.SENTRY_URL!== 'NO_SENTRY';

if (useSentry) {
	console.log('Sentry is enabled', version);
	Sentry.init({
		dsn: process.env.SENTRY_URL,
		release: `backend@${version}`,
	});	
} else {
	console.log('Sentry is disabled', version);
}
