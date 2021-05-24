import TestCase from './framework/test/testcase';
import Config from './config';
import TestHackathon from './tests/testHackathon';
function findTestsFromCommandLineArguments(): Array<string> {
    const time = process.argv[2];
    if (time && !isNaN(Number(time))) {
        console.log('Setting CQRS wait time to ' + time)
        Config.CafienneService.cqrsWaitTime = Number(time);
        return process.argv.slice(3);
    } else {
        return process.argv.slice(2);
    }
}

class TestClasses {
    private testsByName: any = {
    }
    private static testList: Array<any> = [];

    constructor(public list: Array<Function>) {
        list.forEach(f => {
            this.testsByName[f.name] = f
            TestClasses.testList.push({ name: f.name.toLowerCase(), test: f })
        });
    }

    static getTestClass(name: string) {
        const t = TestClasses.testList.find(t => t.name === name.toLowerCase());
        return t.test;
    }
}

class TestResult {
    name: string;
    started: Date = new Date();
    ended: Date = new Date();
    constructor(public test: TestCase) {
        this.name = test.name;
    }
    finished() {
        this.ended = new Date();
    }

    toString() {
        return `${this.name} (${(this.ended.getTime() - this.started.getTime())} ms)`;
    }
}

class TestResults {
    list: Array<TestResult> = [];
    constructor() { }
    addTest(result: TestResult) {
        this.list.push(result);
    }

    toString() {
        return this.list.map(test => `  - ${test}\n`).join('');
    }
}

const AllTestCases = new TestClasses([
    TestHackathon
]);


function getTestCaseInstances(testDeclarations: Array<any>, onlyDefaults: boolean) {
    // Filter out undefined tests (e.g., because trailing comma is first one)
    return testDeclarations.filter(test => test).map(test => {
        if (test instanceof TestCase) return test;
        if (typeof (test) === 'function') {
            return new test();
        }
        throw new Error('Test ' + test + ' of type "' + typeof (test) + '" cannot be converted to a TestCase');
    }).filter((test: TestCase) => !onlyDefaults || test.isDefaultTest); // Filter out tests that should not be run by default
}

async function runTests(testDeclarations: Array<any>, onlyDefaults: boolean) {
    const tests: Array<TestCase> = getTestCaseInstances(testDeclarations, onlyDefaults);
    const results = new TestResults();
    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        const result = new TestResult(test);
        const calculatedWhitespace = '                               '.substring(test.name.length)
        try {
            console.log(`\n
##########################################################
#                                                        #
#      PREPARING TEST:  "${test.name}"${calculatedWhitespace}#
#                                                        #
##########################################################
                        `);
            const preparationDone = await test.onPrepareTest();
            console.log(`\n
##########################################################
#                                                        #
#      STARTING TEST:   "${test.name}"${calculatedWhitespace}#
#                                                        #
##########################################################
                        `);
            const testRun = await test.run();
            console.log(`\n
##########################################################
#                                                        #
#      CLOSING TEST:    "${test.name}"${calculatedWhitespace}#
#                                                        #
##########################################################
                        `);
            const closeDone = await test.onCloseTest();
            result.finished();
            results.addTest(result);
        } catch (error) {
            const resultString = results.list.length == 0 ? '' : `  Succesful tests:\n${results.toString()}\n`;
            throw new TestError(error, `\n\nTest ${i + 1} "${test.name}" failed.\n${resultString}\nTest ${i + 1} "${test.name}" failed.\n${error.constructor.name}: ${error.message}\n`);
        }
    }
    return results;
}

const commandLineTestNames = findTestsFromCommandLineArguments();
const commandLineTestClasses = commandLineTestNames.map(TestClasses.getTestClass)
const runDefaultTests = commandLineTestClasses.length > 0 ? false : true;
const testDeclarations = runDefaultTests ? AllTestCases.list : commandLineTestClasses;

const startTime = new Date();
console.log(`=========\n\nStarting ${testDeclarations.length} test cases at ${startTime}\n`);

runTests(testDeclarations, runDefaultTests).then(results => {
    const endTime = new Date();
    console.log(`\n=========\n\nTesting completed in ${endTime.getTime() - startTime.getTime()} milliseconds at ${endTime}\nResults:\n${results.toString()}`);
    process.exit(0)
}).catch(e => {
    console.error(e);
    process.exit(-1);
});

class TestError extends Error {
    constructor(public error: Error, message: string) {
        super(message);
    }
}
