import { createTrigger, TriggerStrategy } from "@activepieces/pieces-framework";
import { HttpRequest, HttpMethod, httpClient } from "@activepieces/pieces-common";
import { plivoCommon, plivoSampleData } from "../common";

export const plivoNewIncomingSms = createTrigger({
    name: 'new_incoming_sms',
    displayName: 'New Incoming SMS',
    description: 'Triggers when a new SMS message is received.\nIn the Plivo Console, you need to set this webhook URL as the Message URL\nfor the Plivo number you want to receive SMS messages on.',
    props: {
        authentication: plivoCommon.authentication,
        //phone_number: plivoCommon.phone_number,
    },
    sampleData: plivoSampleData.incomingSms,
    // 
    type: TriggerStrategy.WEBHOOK,
    async onEnable(context) {
        //const { phone_number } = context.propsValue;
        //const auth_id = context.propsValue['authentication']['username'];
        //const auth_token = context.propsValue['authentication']['password'];
	console.log("New Incoming SMS Trigger Enabled " + context.webhookUrl);
        const request: HttpRequest = {
            method: HttpMethod.POST,
            url: context.webhookUrl,
            headers: {
                "Content-Type": "application/json",
            },
	    body: plivoSampleData.incomingSms
        };
	// TODO response throwing an http response code 400 with code: ENTITY_NOT_FOUND but we can ignore
	try {
            await httpClient.sendRequest(request);
	} catch (error) {
	    console.log("Ignoring error returned from webhookUrl: " + context.webhookUrl);
        }	
	await context.store?.put<PlivoWebhookInformation>('_plivo_new_incoming_sms_url', { webhookUrl: context.webhookUrl });	
    },
    async onDisable(context) {
        //await context.store.put('_new_incoming_sms_trigger', null);
	console.log("New Incoming SMS Trigger Disabled" + context.webhookUrl);
	const response = await context.store?.delete('_plivo_new_incoming_sms_url');
	return;
    },
    async run(context) {
	const message_uuid = context.payload.body.MessageUUID;
	const message_from = context.payload.body.From;
	const message_to = context.payload.body.To;
	console.log(`New Incoming SMS Triggered for message_uuid: ${message_uuid} from: ${message_from} to: ${message_to}`);
	//const { phone_number } = context.propsValue;
	// TODO verify signature
	/*
	const auth_token = context.propsValue['authentication']['password'];
	const plivo_sig_v2 = context.payload.headers['X-Plivo-Signature-V2'];
	const plivo_sig_nonce_v2 = context.payload.headers['X-Plivo-Signature-V2-Nonce'];
	if (plivo_sig_v2 == null) {
		console.log("No X-Plivo-Signature-V2 found in headers");
		return [];
	}
	if (plivo_sig_nonce_v2 == null) {
		console.log("No X-Plivo-Signature-V2-Nonce found in headers");
		return [];
	}
        */
	return [context.payload.body];
    }
});

interface PlivoWebhookInformation {
  webhookUrl: string;
}

