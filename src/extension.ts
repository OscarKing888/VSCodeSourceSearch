import * as vscode from 'vscode';
import { SearchProvider } from './searchProvider';

export function activate(context: vscode.ExtensionContext) {
    const searchProvider = new SearchProvider();
    
    let disposable = vscode.commands.registerCommand('vscode-source-search.search', () => {
        searchProvider.showSearch();
    });

    let searchSelectedDisposable = vscode.commands.registerCommand('vscode-source-search.searchSelected', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const text = editor.document.getText(selection);
            if (text) {
                searchProvider.showSearch(text);
                searchProvider.performSearch(text);
                console.log(`Searching for selected text: "${text}"`);                
            } else {
                vscode.window.showInformationMessage('Please select some text to search');
            }
        }
    });

    context.subscriptions.push(disposable, searchSelectedDisposable);
}

export function deactivate() {} 