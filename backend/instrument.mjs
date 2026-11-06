import * as Sentry from "@sentry/node";
import packageJson from './package.json' with { type: 'json' };

const { version } = packageJson;
const useSentry = !!process.env.SENTRY_URL&& process.env.SENTRY_URL!== 'NO_SENTRY';

if (useSentry) {
	console.log('Sentry is enabled', version);
	Sentry.init({
		dsn: process.env.SENTRY_URL,
		release: `backend@${version}`,
		// The default loader wraps every ESM import. OpenAI resolves
		// `openai/_shims/auto/runtime` through its own package name, and that
		// wrapper makes the shim registry initialize twice and crash on boot.
		registerEsmLoaderHooks: { onlyIncludeInstrumentedModules: true },
	});	
} else {
	console.log('Sentry is disabled', version);
}
