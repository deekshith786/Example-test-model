import CaseTeam from "../../cmmn/caseteam";
import Tenant from "../../tenant/tenant";

/**
 * Wrapper for the StartCase command 
 */
export default interface StartCase {
    /**
     * The reference to the definition of the case to start
     */
    definition: string;
    /**
     * Optional values for the input parameters of the case
     */
    inputs?: any;
    /**
     * Optional case team
     */
    caseTeam?: CaseTeam;
    /**
     * Optional id for the case instance to start.
     * If not specified, the server will create one.
     */
    caseInstanceId?: string;
    /**
     * The tenant in which to start the case.
     * If the Case service has a default tenant, this field need not be set.
     */
    tenant?: string | Tenant;
    /**
     * Whether or not to start the case in debug mode.
     */
    debug?: boolean;
}