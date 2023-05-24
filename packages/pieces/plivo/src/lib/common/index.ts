import { Property, BasicAuthPropertyValue } from "@activepieces/pieces-framework";
import { HttpMethod, HttpMessageBody, httpClient, AuthenticationType } from "@activepieces/pieces-common";

export const plivoCommon = {
    authentication: Property.BasicAuth({
        description: 'The authentication to use to connect to Plivo',
        displayName: 'Authentication',
        required: true,
        username: {
            displayName: 'Auth ID',
            description: 'The account Auth ID to use to connect to Plivo',
        },
        password: {
            displayName: 'Auth Token',
            description: 'The account Auth Token to use to connect to Plivo',
        }
    }),
    phone_number: Property.Dropdown({
        description: 'The phone number to send the message from',
        displayName: 'From',
        required: true,
        refreshers: ['authentication'],
        options: async (propsValue) => {
            if (!propsValue['authentication']) {
                return {
                    disabled: true,
                    placeholder: 'connect your account first',
                    options: [],
                };
            }

            const basicAuthProperty = propsValue['authentication'] as BasicAuthPropertyValue;
	    // TODO no pagination support yet, limited to the first 20 numbers, ideally we should concat all the pages and/or filter with properties like sms_enabled, ... etc
            const response = await callPlivoApi<{ incoming_phone_numbers: { number: string, alias: string, 
		    					sms_enabled: boolean, voice_enabled: boolean, mms_enabled: boolean,
	    						tendlc_registration_status: string, toll_free_sms_verification: string
	    					}[] }>(HttpMethod.GET, 'Number', {
                					auth_id: basicAuthProperty.username,
                					auth_token: basicAuthProperty.password
            });
            return {
                disabled: false,
                options: response.body.incoming_phone_numbers.map((number: any) => ({
                    value: number.phone_number,
                    label: describeNumberLabel(number),
                })),
            }
        }
    })
}

export const plivoSampleData = {
	incomingSms: {
		"MessageUUID": "8c3920d3-f2ac-481b-a83e-639a69dadd63",
		"Text": "Hello from Plivo!",
		"From": "+1234567899",
		"To": "+1234567890",
		"Type": "sms",
		"Units": 1,
		"TotalRate": "0.005",
		"TotalAmount": "0.005",
		"MessageIntent": "optin",
		"PowerpackUUID": ""
	}
};

const describeNumberLabel = (number: any) => {
	let alias = number.alias || number.phone_number;
	let features = Array<string>();
	if (number.sms_enabled) {
		features.push('sms');
	}
	if (number.voice_enabled) {
		features.push('voice');
	}
	if (number.mms_enabled) {
		features.push('mms');
	}
	if (number.tendlc_registration_status === 'COMPLETED') {
		features.push('10dlc verified');
	}
	if (number.toll_free_sms_verification === 'VERIFIED') {
		features.push('tollfree verified');
	}
	return alias + ' (' + features.join(',') + ')';
}


export const callPlivoApi = async <T extends HttpMessageBody>(method: HttpMethod, path: string, auth: { auth_id: string, auth_token: string }, body?: any) => {
    return await httpClient.sendRequest<T>({
        method,
        url: `https://api.plivo.com/v1/Account/${auth.auth_id}/${path}`,
        authentication: {
            type: AuthenticationType.BASIC,
            username: auth.auth_id,
            password: auth.auth_token,
        },
        headers: {
            'Content-Type': 'application/json',
        },
	body: body,
    });
}
