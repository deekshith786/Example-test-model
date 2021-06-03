import User from "../framework/user";
import TenantUser, { TenantOwner } from "../framework/tenant/tenantuser";
import Tenant from "../framework/tenant/tenant";
import PlatformService from "../framework/service/platform/platformservice";

const platformService = new PlatformService();

/**
 * Simple test tenant to avoid duplicate code
 */
export default class ExampleTestTenant {
    coach = new TenantUser('coach', ['Coach'], 'coach', 'coach@college.com');
    principal = new TenantOwner('principal', ['Principal'], 'principal', 'principal@college.com');
    manager = new TenantUser('manager', ['manager'], 'manager', 'manager@college.com');
    designer = new TenantUser('designer', ['designer'], 'designer', 'designer@college.com');
    hod = new TenantUser('Hod', ['HOD'], 'Hod', 'Hod@college.com');
    tenant: Tenant = new Tenant(this.name, [this.coach, this.principal, this.hod, this.designer, this.manager ]);

    constructor(public readonly name: string = 'Example-Test-Tenant', public platformAdmin: User = new User('admin')) {

    }

    /**
     * Creates the tenant, and logs in for requestor and manager.
     */
    async create() {
        await this.platformAdmin.login();
        await platformService.createTenant(this.platformAdmin, this.tenant);
        await this.coach.login();
        await this.principal.login();
        await this.hod.login();
        await this.manager.login();
        await this.designer.login();

    }
}