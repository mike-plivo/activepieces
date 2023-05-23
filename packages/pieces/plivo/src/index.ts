import { createPiece } from "@activepieces/pieces-framework";
import packageJson from "../package.json";
import { plivoSendSms } from './lib/actions/send-sms';
import { plivoNewIncomingSms } from './lib/triggers/new-incoming-sms';

export const plivo = createPiece({
  name: "plivo",
  displayName: "Plivo",
  logoUrl: "https://cdn.activepieces.com/pieces/plivo.png",
  version: packageJson.version,
  authors: ['mike_plivo'],
  actions: [plivoSendSms],
  triggers: [plivoNewIncomingSms],
});

