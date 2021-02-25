"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const server_1 = require("./server");
function activate(context) {
    let disposable = vscode.commands.registerCommand('mp-release.openPreview', (url) => {
        server_1.closeServer();
        server_1.initServer();
    });
    let disposable2 = vscode.commands.registerCommand('mp-release.closePreview', (url) => {
        server_1.closeServer();
    });
    context.subscriptions.push(disposable);
    context.subscriptions.push(disposable2);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map