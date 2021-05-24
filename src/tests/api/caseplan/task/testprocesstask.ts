'use strict';

import CaseService from '../../../../framework/service/case/caseservice';
import TestCase from '../../../../framework/test/testcase';
import WorldWideTestTenant from '../../../worldwidetesttenant';
import RepositoryService from '../../../../framework/service/case/repositoryservice';
import CasePlanService from '../../../../framework/service/case/caseplanservice';
import CaseFileService from '../../../../framework/service/case/casefileservice';
import Case from '../../../../framework/cmmn/case';
import MockServer from '../../../../framework/mock/mockserver';
import PostMock from '../../../../framework/mock/postmock';
import { assertCaseFileContent, assertPlanItemState } from '../../../../framework/test/assertions';

const repositoryService = new RepositoryService();
const definition = 'processtasktest.xml';

const caseService = new CaseService();
const casePlanService = new CasePlanService();
const caseFileService = new CaseFileService();
const worldwideTenant = new WorldWideTestTenant();
const tenant = worldwideTenant.name;
const user = worldwideTenant.sender;

const mockPort = 18083;
const mock = new MockServer(mockPort);
new PostMock(mock, '/get/code/:code', call => {
    const code = Number(call.req.params['code']);
    call.onContent((body: string) => {
        console.log(`Returning ${code} with ${body}`);
        call.res.status(code).write(body);
        call.res.end();
    })
    // call.fail(400, 'Bullls')
})

export default class TestProcessTask extends TestCase {
    async onPrepareTest() {
        await mock.start();
        await worldwideTenant.create();
        await repositoryService.validateAndDeploy(user, definition, tenant);
    }

    async run() {
        const inputs = {
            HTTPConfig: {
                port: mockPort
            }
        }

        const startCase = { tenant, definition, inputs };

        // Starts the case with user
        let caseInstance = await caseService.startCase(user, startCase) as Case;

        // Get case details
        caseInstance = await caseService.getCase(user, caseInstance);

        const okServiceInput = {
            code: 200,
            payload: {
                description: "Great to see this work"
            }
        }

        await caseFileService.createCaseFileItem(user, caseInstance, 'ServiceInput', okServiceInput);
        await casePlanService.makePlanItemTransition(user, caseInstance, 'Get OK', 'Occur');

        await assertPlanItemState(user, caseInstance, 'Get Object Response', 0, 'Completed', 5);

        await caseFileService.getCaseFile(user, caseInstance).then(file => {
            console.log("Case File " + JSON.stringify(file, undefined, 2));
        })

        await assertCaseFileContent(user, caseInstance, 'ResponseMessage', 'OK');
        await assertCaseFileContent(user, caseInstance, 'SuccessObject', okServiceInput.payload);
        await assertCaseFileContent(user, caseInstance, 'ErrorOutcome', undefined);

        const failureServiceInput = {
            code: 500,
            payload: 'If you feed me with errors, I will return them'
        }
        await caseFileService.updateCaseFileItem(user, caseInstance, 'ServiceInput', failureServiceInput);
        await casePlanService.makePlanItemTransition(user, caseInstance, 'Get Error', 'Occur');

        await assertPlanItemState(user, caseInstance, 'Get Error Response', 0, 'Failed', 5);

        await caseFileService.getCaseFile(user, caseInstance).then(file => {
            console.log("Case File " + JSON.stringify(file, undefined, 2));
        })

        await assertCaseFileContent(user, caseInstance, 'ResponseMessage', 'Internal Server Error');
        await assertCaseFileContent(user, caseInstance, 'SuccessObject', okServiceInput.payload);
        await assertCaseFileContent(user, caseInstance, 'ErrorOutcome', failureServiceInput.payload);
        await assertCaseFileContent(user, caseInstance, 'ErrorCode', failureServiceInput.code);

        console.log(`\nCase ID: ${caseInstance.id}\n`);

        // In the end, stop the mock service, such that the test completes.
        await mock.stop();
    }
}
