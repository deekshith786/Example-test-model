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
import { getTestDetailsData, getEventData, getVenueData, getReleaseofEventNotificationData, getRequestResourceData, getDesigningData, getInvitingGuestsData, getFeedbackData } from './dataGeneration';
import logger from '../framework/logger';

const repositoryService = new RepositoryService();
const caseService = new CaseService();
const taskService = new TaskService();
const exampleTenant = new ExampleTestTenant();
const casefileservice = new CaseFileService();

const definition = 'Hackathon.xml';
const tenant = exampleTenant.name;
const coach = exampleTenant.coach;
const HoD = exampleTenant.hod;
const designer = exampleTenant.designer;
const manager = exampleTenant.manager;
const principal = exampleTenant.principal;

export default class TestHackathon extends TestCase {
    async onPrepareTest() {
        await exampleTenant.create();
        await repositoryService.validateAndDeploy(principal, definition, tenant);
    }
    async run() {
        const caseTeam = new CaseTeam([new CaseTeamMember(HoD, ['HoD']), new CaseTeamMember(coach, ['Coach']), new CaseTeamMember(designer, ['Designer']), new CaseTeamMember(manager, ['Manager']), new CaseOwner(principal)]);

        // principal starts the case
        const startCase = { tenant, definition, caseTeam, debug: true };
        const caseInstanceId = await caseService.startCase(principal, startCase) as Case; 
        
        // Release of Event Notification task should be in Active
        const ReleaseofEventNotificationTask = await assertPlanItemState(principal, caseInstanceId, 'Release of Event Notification', 0, 'Active');
        const ReleaseofEventNotificationData = getReleaseofEventNotificationData()

        // Release of Event Notification humantask should be completed
        await taskService.completeTask(principal, ReleaseofEventNotificationTask, ReleaseofEventNotificationData);
        await assertPlanItemState(principal, caseInstanceId, 'Release of Event Notification', 0, 'Completed');

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
        console.log('\nEvent selection stage should be active');

        // Approve Event Request humantask should be in active
        const RequestEventTask = await assertPlanItemState(HoD, caseInstanceId, 'Approve Event Request', 0, 'Active');
        const RequestEventData = {TestDetailsData, SelectEventData}

        // Approve Event Request humantask should be completed
        await taskService.completeTask(HoD, RequestEventTask, RequestEventData);
        await assertPlanItemState(HoD, caseInstanceId, 'Approve Event Request', 0, 'Completed');

        if(RequestEventData.SelectEventData.Event.HodPermission.HodAccepted === true)
        {
            // HoD Accepted milestone should be completed
            await assertPlanItemState(principal, caseInstanceId, 'HoD Accepted', 0, 'Completed');
            
            // Choose Venue humantask should be in active
            const ChooseVenueTask = await assertPlanItemState(principal, caseInstanceId, 'Choose Venue', 0, 'Active');
            const ChooseVenueData = getVenueData(true);

            // Choose Venue humantask should be completed
            await taskService.completeTask(principal, ChooseVenueTask, ChooseVenueData);
            await assertPlanItemState(principal, caseInstanceId, 'Choose Venue', 0, 'Completed');

            // Request Venue humantask should be in active
            const RequestVenueTask = await assertPlanItemState(coach, caseInstanceId, 'Request Venue', 0, 'Active');
            const RequestVenueData = getVenueData(true);

            // Request Venue humantask should be completed
            await taskService.completeTask(coach, RequestVenueTask, RequestVenueData);
            await assertPlanItemState(coach, caseInstanceId, 'Request Venue', 0, 'Completed');

            if(RequestVenueData.VenueSelection.CouchPermission.couchApproval === true)
            {
                // Couch Accepted milestone should be completed
                await assertPlanItemState(principal, caseInstanceId, 'Couch Accepted', 0, 'Completed');

                // Completed milestone should be completed
                await assertPlanItemState(principal, caseInstanceId, 'Completed', 0, 'Completed');

                // Request Resource task should be in active
                const RequestResourceTask = await assertPlanItemState(manager, caseInstanceId, 'Request Resource', 0, 'Active');
                const RequestResourceData = getRequestResourceData();

                // Request Resource humantask should be completed
                await taskService.completeTask(manager, RequestResourceTask, RequestResourceData);
                await assertPlanItemState(manager, caseInstanceId, 'Request Resource', 0, 'Completed');

                // Designing humantask should be in active
                const DesigningTask = await assertPlanItemState(designer, caseInstanceId, 'Designing', 0, 'Active');
                const DesigningData = getDesigningData();

                // Designing humantask should be completed
                await taskService.completeTask(designer, DesigningTask, DesigningData);
                await assertPlanItemState(designer, caseInstanceId, 'Designing', 0, 'Completed');
               
                // Marketing of events milestone should be completed
                await assertPlanItemState(principal, caseInstanceId, 'Marketing of events', 0, 'Completed');
               
                // Inviting Guests humantask should be in active
                const InvitingGuestsTask = await assertPlanItemState(manager, caseInstanceId, 'Inviting Guests', 0, 'Active');
                const InvitingGuestsData = getInvitingGuestsData();

                // Inviting Guests humantask should be completed
                await taskService.completeTask(manager, InvitingGuestsTask, InvitingGuestsData);
                await assertPlanItemState(manager, caseInstanceId, 'Inviting Guests', 0, 'Completed');
                                
                // Successfully event execution milestone should be completed 
                await assertPlanItemState(principal, caseInstanceId, 'Successfully event execution', 0, 'Completed');
            
                // Feedback humantask should be in active
                const FeedbackTask = await assertPlanItemState(manager, caseInstanceId, 'Feedback', 0, 'Active');
                const FeedbackData = getFeedbackData();

                // Feedback humantask should be completed
                await taskService.completeTask(manager, FeedbackTask, FeedbackData);
                await assertPlanItemState(manager, caseInstanceId, 'Feedback', 0, 'Completed');                            
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