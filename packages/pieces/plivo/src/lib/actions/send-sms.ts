import { createAction, Property } from "@activepieces/pieces-framework";
import { HttpMethod } from "@activepieces/pieces-common";
import { callPlivoApi, plivoCommon } from "../common";

export const plivoSendSms = createAction({
    name: 'send_sms',
    description: 'Send a new SMS message',
    displayName: 'Send SMS',
    props: {
        authentication: plivoCommon.authentication,
        /*from: plivoCommon.phone_number,*/
        from: Property.ShortText({
            description: 'The phone number to send the message from',
            displayName: 'From',
            required: true,
        }),
        to: Property.ShortText({
            description: 'The phone number to send the message to',
            displayName: 'To',
            required: true,
        }),
        body: Property.ShortText({
            description: 'The text to send in the message',
            displayName: 'Text',
            required: true,
        })
    },
    async run(context) {
        const { body, to, from } = context.propsValue;
        const auth_id = context.propsValue['authentication']!['username']!;
        const auth_token = context.propsValue['authentication']!['password']!;
        return await callPlivoApi(HttpMethod.POST, 'Message/', { auth_id, auth_token }, {
            src: from,
	    dst: to,
	    text: body,
	    type: 'sms',
        });

    }
});

