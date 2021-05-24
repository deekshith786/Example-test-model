import User from '../../user';
import CafienneService from '../cafienneservice';
import Case from '../../cmmn/case';
import { checkJSONResponse } from '../response';

const cafienneService = new CafienneService();

export default class RequestService {
    async requestCase(casePath: string = '', inputs: any, caseInstanceId?: string, debug?: boolean, expectedStatusCode: number = 200) {
        console.log("Anonymously requesting Case[" + casePath + "]");
        const url = `/request/case/${casePath}`;
        const response = await cafienneService.post(url, User.NONE, { inputs, caseInstanceId, debug });
        const msg = `Anonymously requesting Case is not expected to succeed`;
        const json = await checkJSONResponse(response, msg, expectedStatusCode);

        // Hack: copy "StartCaseResponse.caseInstanceId" to "Case.id" in the json prior to instantiating Case.
        // TODO: consider whether it is better to work with a "StartCaseResponse" object instead
        if (response.ok) {
            json.id = json.caseInstanceId;
            const caseInstance = <Case>json;
            console.log(`Created case instance with id: \t${caseInstance.id}`);
            return caseInstance;
        } else {
            return response;
        }
    }
}