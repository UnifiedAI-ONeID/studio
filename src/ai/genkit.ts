
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

if (process.env.NODE_ENV === 'production') {
  const {NodeSDK} = require('@opentelemetry/sdk-node');
  const {
    OTLPTraceExporter,
  } = require('@opentelemetry/exporter-trace-otlp-http');
  const {
    getNodeAutoInstrumentations,
  } = require('@opentelemetry/auto-instrumentations-node');

  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter(),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();
}

export const ai = genkit({
  plugins: [googleAI()],
  // @ts-ignore
  model: 'googleai/gemini-1.5-flash-latest',
});

