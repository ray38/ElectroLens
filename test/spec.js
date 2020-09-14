const assert = require('assert');
const path = require('path');
const Application = require('spectron').Application;
const electronPath = require('electron');

const titleString = 'ElectroLens';

const app = new Application({
    path: electronPath,
    args: [path.join(__dirname, '..')]
});

describe('ElectroLens', function() {
    this.timeout(2000);

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

    // it('has the correct title', async() => {
    //     const title = await app.client.waitUntilWindowLoaded().getTitle();
    //     return assert.strictEqual(title, titleString);
    // });

    // it('does not have the developer tools open', async() => {
    //     const devToolsAreOpen = await app.client.waitUntilWindowLoaded().browserWindow.isDevToolsOpened();
    //     return assert.strictEqual(devToolsAreOpen, false);
    // });

    // snippet for logging memory utilization during test
    //app.rendererProcess.getProcessMemoryInfo().then((info)=> console.log(info))

});