'use strict';
import CaseService from '../framework/service/case/caseservice';
import TaskService from '../framework/service/task/taskservice';
import TestCase from '../framework/test/testcase';
import ExampleTestTenant from './Exampletesttenants';
import RepositoryService from '../framework/service/case/repositoryservice';
import { assertCasePlanState, assertPlanItemState } from '../framework/test/assertions';
import Case from '../framework/cmmn/case';
import CaseTeam from '../framework/cmmn/caseteam';
import CaseTeamMember, { CaseOwner } from '../framework/cmmn/caseteammember';
import CaseFileService from '../framework/service/case/casefileservice';
import { getTestDetailsData, getEventData, getVenueData } from './dataGeneration';

const repositoryService = new RepositoryService();
const caseService = new CaseService();
const taskService = new TaskService();
const amsterdamTenant = new ExampleTestTenant();
const casefileservice = new CaseFileService();

const definition = 'Hackathon.xml';
const tenant = amsterdamTenant.name;
const requestor = amsterdamTenant.requestor;
const principal = amsterdamTenant.principal;

export default class TestHackathon extends TestCase {
    async onPrepareTest() {
        await amsterdamTenant.create();
        await repositoryService.validateAndDeploy(principal, definition, tenant);
    }
    async run() {
        const caseTeam = new CaseTeam([new CaseTeamMember(requestor), new CaseOwner(principal)]);

        // principal starts the case
        const startCase = { tenant, definition, caseTeam, debug: true };
        const caseInstanceId = await caseService.startCase(principal, startCase) as Case; 

        // Team Details task should be in Active
        const SubmitRequestTask = await assertPlanItemState(principal, caseInstanceId, 'Team Details', 0, 'Active');
        const TestDetailsData = getTestDetailsData()

        // Team Details humantask should be completed
        await taskService.completeTask(principal, SubmitRequestTask, TestDetailsData);
        await assertPlanItemState(principal, caseInstanceId, 'Team Details', 0, 'Completed');

        // Select Event task should be in Active
        const SelectEventTask = await assertPlanItemState(principal, caseInstanceId, 'Select Event', 0, 'Active');
        const SelectEventData = getEventData(true);

        // Select Event humantask should be completed
        await taskService.completeTask(principal, SelectEventTask, SelectEventData);
        await assertPlanItemState(principal, caseInstanceId, 'Select Event', 0, 'Completed');

        // Event Selection stage should be in active
        await assertPlanItemState(principal, caseInstanceId, 'Event Selection', 0, 'Active');

        // Request Event humantask should be in active
        const RequestEventTask = await assertPlanItemState(principal, caseInstanceId, 'Request Event', 0, 'Active');
        const RequestEventData = {TestDetailsData, SelectEventData}

        // Request Event humantask should be completed
        await taskService.completeTask(principal, RequestEventTask, RequestEventData);
        await assertPlanItemState(principal, caseInstanceId, 'Request Event', 0, 'Completed');

        if(RequestEventData.SelectEventData.Event.HodPermission.HodAccepted === true)
        {
            // Hod Accepted milestone should be completed
            await assertPlanItemState(principal, caseInstanceId, 'Hod Accepted', 0, 'Completed');
            
            // Choose Venue humantask should be in active
            const ChooseVenueTask = await assertPlanItemState(principal, caseInstanceId, 'Choose Venue', 0, 'Active');
            const ChooseVenueData = getVenueData(true);

            // Choose Venue humantask should be completed
            await taskService.completeTask(principal, ChooseVenueTask, ChooseVenueData);
            await assertPlanItemState(principal, caseInstanceId, 'Choose Venue', 0, 'Completed');

            // Request Venue humantask should be in active
            const RequestVenueTask = await assertPlanItemState(principal, caseInstanceId, 'Request Venue', 0, 'Active');
            const RequestVenueData = getVenueData(true);

            // Request Venue humantask should be completed
            await taskService.completeTask(principal, RequestVenueTask, RequestVenueData);
            await assertPlanItemState(principal, caseInstanceId, 'Request Venue', 0, 'Completed');

            if(RequestVenueData.VenueSelection.CouchPermission.couchApproval === true)
            {
                // Couch Accepted milestone should be completed
                await assertPlanItemState(principal, caseInstanceId, 'Couch Accepted', 0, 'Completed');

                // Completed milestone should be completed
                await assertPlanItemState(principal, caseInstanceId, 'Completed', 0, 'Completed');
            }
            else
            {   // Couch Rejected milestone should be completed
                await assertPlanItemState(principal, caseInstanceId, 'Couch Rejected', 0, 'Completed');
            } 
        }
        else{
             // Hod Rejected milestone should be completed
             await assertPlanItemState(principal, caseInstanceId, 'Hod Rejected', 0, 'Completed');
        }
        const CaseFilesDetails = await casefileservice.getCaseFile(principal, caseInstanceId);
        console.log(JSON.stringify(CaseFilesDetails, undefined, 2));

        
    }
}