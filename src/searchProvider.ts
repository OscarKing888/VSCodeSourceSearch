import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class SearchProvider {
    private searchPanel: vscode.WebviewPanel | undefined;
    private searchResults: vscode.TreeDataProvider<any>;
    private currentSearch: string = '';
    private searchHistory: string[] = [];

    constructor() {
        this.searchResults = new SearchResultsProvider();
    }

    public showSearch(initialText: string = '') {
        if (!this.searchPanel) {
            this.searchPanel = vscode.window.createWebviewPanel(
                'sourceSearch',
                'Source Search',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            this.searchPanel.webview.html = this.getWebviewContent(initialText);
            this.searchPanel.onDidDispose(() => {
                this.searchPanel = undefined;
            });

            this.searchPanel.webview.onDidReceiveMessage(async message => {
                switch (message.command) {
                    case 'search':
                        this.currentSearch = message.text;
                        this.searchHistory.push(message.text);
                        await this.performSearch(message.text);
                        break;
                }
            });
        } else {
            this.searchPanel.reveal(vscode.ViewColumn.One);
            if (initialText) {
                this.searchPanel.webview.postMessage({
                    command: 'setSearchText',
                    text: initialText
                });
            }
        }
    }

    private async performSearch(searchText: string) {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder is open');
            return;
        }

        const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
        const results = await this.searchInDirectory(workspaceRoot, searchText);
        
        if (this.searchPanel) {
            this.searchPanel.webview.postMessage({
                command: 'searchResults',
                results: results
            });
        }
    }

    private async searchInDirectory(dir: string, searchText: string): Promise<any[]> {
        const results: any[] = [];
        const files = await fs.promises.readdir(dir);

        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = await fs.promises.stat(fullPath);

            if (stat.isDirectory()) {
                results.push(...await this.searchInDirectory(fullPath, searchText));
            } else if (stat.isFile() && this.isSearchableFile(file)) {
                const content = await fs.promises.readFile(fullPath, 'utf-8');
                const lines = content.split('\n');
                
                lines.forEach((line, index) => {
                    if (line.includes(searchText)) {
                        results.push({
                            file: fullPath,
                            line: index + 1,
                            content: line.trim()
                        });
                    }
                });
            }
        }

        return results;
    }

    private isSearchableFile(filename: string): boolean {
        const searchableExtensions = ['.ts', '.js', '.html', '.css', '.json', '.md'];
        return searchableExtensions.some(ext => filename.endsWith(ext));
    }

    private getWebviewContent(initialText: string = ''): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Source Search</title>
                <style>
                    body {
                        padding: 20px;
                        font-family: var(--vscode-font-family);
                    }
                    .search-container {
                        margin-bottom: 20px;
                    }
                    input {
                        width: 100%;
                        padding: 8px;
                        margin-bottom: 10px;
                    }
                    .results {
                        border: 1px solid var(--vscode-panel-border);
                        padding: 10px;
                        max-height: 400px;
                        overflow-y: auto;
                    }
                    .result-item {
                        margin-bottom: 10px;
                        padding: 5px;
                        border-bottom: 1px solid var(--vscode-panel-border);
                    }
                </style>
            </head>
            <body>
                <div class="search-container">
                    <input type="text" id="searchInput" placeholder="Enter search text..." value="${initialText}">
                    <button onclick="search()">Search</button>
                </div>
                <div id="results" class="results"></div>

                <script>
                    const vscode = acquireVsCodeApi();
                    let currentResults = [];

                    document.getElementById('searchInput').addEventListener('keypress', function(e) {
                        if (e.key === 'Enter') {
                            search();
                        }
                    });

                    function search() {
                        const searchText = document.getElementById('searchInput').value;
                        vscode.postMessage({
                            command: 'search',
                            text: searchText
                        });
                    }

                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.command) {
                            case 'searchResults':
                                currentResults = message.results;
                                displayResults();
                                break;
                            case 'setSearchText':
                                document.getElementById('searchInput').value = message.text;
                                search();
                                break;
                        }
                    });

                    function displayResults() {
                        const resultsDiv = document.getElementById('results');
                        resultsDiv.innerHTML = '';
                        
                        currentResults.forEach(result => {
                            const div = document.createElement('div');
                            div.className = 'result-item';
                            div.innerHTML = \`
                                <div><strong>\${result.file}</strong> (Line \${result.line})</div>
                                <div>\${result.content}</div>
                            \`;
                            resultsDiv.appendChild(div);
                        });
                    }

                    // Auto-search if initial text is provided
                    if ("${initialText}") {
                        search();
                    }
                </script>
            </body>
            </html>
        `;
    }
}

class SearchResultsProvider implements vscode.TreeDataProvider<any> {
    getTreeItem(element: any): vscode.TreeItem {
        return new vscode.TreeItem(element.label);
    }

    getChildren(element?: any): Thenable<any[]> {
        return Promise.resolve([]);
    }
} 