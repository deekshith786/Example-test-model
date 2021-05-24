'use strict';

import CaseService from '../../../framework/service/case/caseservice';
import TestCase from '../../../framework/test/testcase';
import WorldWideTestTenant from '../../worldwidetesttenant';

const caseService = new CaseService();
const worldwideTenant = new WorldWideTestTenant();
const user = worldwideTenant.sender;
const tenant = worldwideTenant.name;

export default class TestUsersCaseAPI extends TestCase {
    async onPrepareTest() {
        await worldwideTenant.create();
    }

    async run() {
        const allMyCases = await caseService.getCases(user, { numberOfResults: 10000 });

        const myCompletedCases = await caseService.getCases(user, { state: 'Completed', tenant, numberOfResults: 10000 });
        const myActiveCases = await caseService.getCases(user, { state: 'Active', tenant, numberOfResults: 10000 });

        console.log("All my cases: ", allMyCases.length);
        console.log("My completed cases: ", myCompletedCases.length);
        console.log("My active cases: ", myActiveCases.length);
    }
}
