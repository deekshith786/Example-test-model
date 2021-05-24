'use strict';

import CaseService from '../../../../framework/service/case/caseservice';
import TaskService from '../../../../framework/service/task/taskservice';
import TestCase from '../../../../framework/test/testcase';
import WorldWideTestTenant from '../../../worldwidetesttenant';
import RepositoryService from '../../../../framework/service/case/repositoryservice';
import Case from '../../../../framework/cmmn/case';
import { assertPlanItemState } from '../../../../framework/test/assertions';
import DebugService from '../../../../framework/service/case/debugservice';

const repositoryService = new RepositoryService();
const definition = 'smtptest.xml';

const caseService = new CaseService();
const debugService = new DebugService();
const worldwideTenant = new WorldWideTestTenant();
const tenant = worldwideTenant.name;
const user = worldwideTenant.sender;

export default class TestSMTP extends TestCase {
    async onPrepareTest() {
        await worldwideTenant.create();
        await repositoryService.validateAndDeploy(user, definition, tenant);
    }

    async run() {
        const inputs = {
            content: {
                // to: ['john1@johns.com', {email: 'john2@johns.com', name: 'John Two'}, 'john3@johns.com', ''],
                to: { email: 'john2@johns.com', name: 'John Two' },
                // to: [],
                from: { email: 'pete@petes.com', name: 'PetyRules4ever' },
                // replyTo: "joost",
                subject: 'none',
                body: 'We\'re inside the body of the html of the email; we\'re not the email body itself;<p style="color:blue"><h2>Nevertheless</h2> we still <b>support</b> markup</p>',
                attachments: [{
                    fileName: 'my-attachment.html',
                    content: 'c29tZSBiYXNlIDY0IGNvZGVkIHN0cmluZw=='
                }],
                invite: {
                    start: '2021-01-13T19:30:10Z',
                    end: '2021-01-13T21:40:00Z',
                    required: [
                        { email: 'pete@petes.com', name: 'PetyRules4ever' },
                        { email: 'john2@johns.com', name: 'John Two' }
                    ],
                    optional: [{ email: 'noshow@nowhere.com', name: 'The nowhere man' }],
                    timeZone: 'Europe/Paris',
                    meetingName: "Let's have a chat",
                    uid: 'Globally-Unique-Meeting-Id', // Use this same id to update the meeting later on
                    description: "I think we need to address the following topics: 1, 2 and 3. Perhaps we can skip 3?"
                }
            }
        }
        const startCase = { tenant, definition, inputs };
        const caseInstance = await caseService.startCase(user, startCase) as Case;

        const sendMailTask = 'Send mail';

        const taskId = await caseService.getCase(user, caseInstance).then(v => v.planitems.find(i => i.name === sendMailTask)?.id);
        if (!taskId) {
            throw new Error(`Expecting a task with name ${sendMailTask} to be available in the case, but it was not found`);
        }

        try {
            await assertPlanItemState(user, caseInstance, sendMailTask, 0, 'Completed', 10);
        } catch (notFoundError) {
            // If the test fails after 10 calls, get the events for the task and see if we can print any logging info
            await debugService.getParsedEvents(taskId, user).then(events => {
                console.log("Found events " + JSON.stringify(events, undefined, 2));
            });
            throw notFoundError;
        }

        console.log('\n\n\t\tCase ID:\t\t' + caseInstance.id);
    }
}

