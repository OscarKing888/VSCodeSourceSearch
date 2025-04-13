import * as vscode from 'vscode';
import { SearchProvider } from './searchProvider';

export function activate(context: vscode.ExtensionContext) {
    const searchProvider = new SearchProvider();
    
    let disposable = vscode.commands.registerCommand('vscode-source-search.search', () => {
        searchProvider.showSearch();
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {} 