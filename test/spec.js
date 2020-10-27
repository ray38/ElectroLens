const assert = require('assert');
const path = require('path');
const Application = require('spectron').Application;
const electronPath = require('electron');
const titleString = 'ElectroLens';

const app = new Application({
    path: electronPath,
    args: [path.join(__dirname, '..')]
});

describe('ElectroLens Tests', function() {
    this.timeout(100000);

    beforeEach(() => {
        return app.start();
    });

    afterEach(() => {
        if (app && app.isRunning()) {
            return app.stop();
        }
    });

    it('shows an initial window', async() => {
        const count = await app.client.getWindowCount();
        return assert.strictEqual(count,1); //example used equal, deprecated
    });

    it('has the correct title', async() => {
        await app.client.waitUntilWindowLoaded();
        const title = await app.client.getTitle();
        return assert.strictEqual(title, titleString);
    });

    it('has a disabled submit button', async() => {
        await app.client.waitUntilWindowLoaded();
        const submitDisabled = await (await app.client.$('#formSubmitButton')).getProperty('disabled');
        return assert.strictEqual(submitDisabled, true);
    });

    it('load benzene', async() => {
        await app.client.waitUntilWindowLoaded();
        await (await app.client.$('#boolSpatiallyResolvedData')).click();
        var sampleData = path.join(__dirname, 'C6H6_B3LYP_0_0_0_all_descriptors.csv');
        const remoteFilePath = await app.client.uploadFile(sampleData);
        await (await app.client.$('#view1SpatiallyResolvedDataFilename')).setValue(remoteFilePath);
        const beforeClick = Date.now();
        await (await app.client.$('#formSubmitButton')).click();

        await app.client.waitUntil(async () => {
            if (await (await app.client.$('#container')).getAttribute('loadstatus') === '1') {
                console.log(Date.now()-beforeClick);
                return true;
            }
        }, {
            timeout: 60000,
            timeoutMsg: 'expected text to be different after 1 min'
        });
    });

    it('load nanoparticle', async() => {
        await app.client.waitUntilWindowLoaded();
        await (await app.client.$('#boolSpatiallyResolvedData')).click();
        var sampleData = path.join(__dirname, 'C6H6_B3LYP_0_0_0_all_descriptors.csv');
        const remoteFilePath = await app.client.uploadFile(sampleData);
        await (await app.client.$('#view1SpatiallyResolvedDataFilename')).setValue(remoteFilePath);
        const beforeClick = Date.now();
        await (await app.client.$('#formSubmitButton')).click();

        await app.client.waitUntil(async () => {
            if (await (await app.client.$('#container')).getAttribute('loadstatus') === '1') {
                console.log(Date.now()-beforeClick);
                return true;
            }
        }, {
            timeout: 60000,
            timeoutMsg: 'expected text to be different after 1 min'
        });
        // await app.client.waitUntilWindowLoaded();
        // await (await app.client.$('#boolMolecularData')).click();
        // var sampleData = path.join(__dirname, 'nanoparticle_with_water.csv');
        // const remoteFilePath = await app.client.uploadFile(sampleData);
        // await (await app.client.$('#view1MolecularDataFilename')).setValue(remoteFilePath);
        // const beforeClick = Date.now();
        // await (await app.client.$('#formSubmitButton')).click();

        // await app.client.waitUntil(async () => {
        //     if (await (await app.client.$('#container')).getAttribute('loadstatus') === '1') {
        //         console.log(Date.now()-beforeClick);
        //         return true;
        //     }
        // }, {
        //     timeout: 60000,
        //     timeoutMsg: 'expected text to be different after 1 min'
        // });
    })
    
    //app.rendererProcess.getProcessMemoryInfo().then((info)=> console.log(info))


});