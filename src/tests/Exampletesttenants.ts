import User from "../framework/user";
import TenantUser, { TenantOwner } from "../framework/tenant/tenantuser";
import Tenant from "../framework/tenant/tenant";
import PlatformService from "../framework/service/platform/platformservice";

const platformService = new PlatformService();

/**
 * Simple test tenant to avoid duplicate code
 */
export default class AmsterdamTestTenant {
    requestor = new TenantUser('request-user', ['Requestor'], 'requestor', 'requestor@amd.com');
    principal = new TenantOwner('manager', ['Manager'], 'manager', 'manager@amd.com')
    employee = new TenantUser('employee', ['Employee'], 'employee', 'employee@amd.com');
    tenant: Tenant = new Tenant(this.name, [this.requestor, this.principal, this.employee]);

    constructor(public readonly name: string = 'Example-Test-Tenant', public platformAdmin: User = new User('admin')) {

    }

    /**
     * Creates the tenant, and logs in for requestor and manager.
     */
    async create() {
        await this.platformAdmin.login();
        await platformService.createTenant(this.platformAdmin, this.tenant);
        await this.requestor.login();
        await this.principal.login();
        await this.employee.login();
    }
}