import * as vscode from 'vscode';
import { initServer, closeServer } from './server';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('mp-release.openPreview', (url?) => {
    closeServer();
    initServer();
  });
  let disposable2 = vscode.commands.registerCommand('mp-release.closePreview', (url?) => {
    closeServer();
  });
  context.subscriptions.push(disposable);
  context.subscriptions.push(disposable2);
}

export function deactivate() { }