'use strict';
import * as vscode from 'vscode';
import { exec } from 'child_process';

class DocTestOutputProvider implements vscode.TextDocumentContentProvider {
    public static uri = vscode.Uri.parse('doctest:/doctest/output')

    static scheme = 'doctest';
    /// The URI of the currently doctested python file
    private uri: vscode.Uri;
    /// The doctest output of the currently tested python file
    private doctestOutput = '<Doctest Output>'

    private _onDidChange = new vscode.EventEmitter<vscode.Uri>()

    static encodeLocation(uri: vscode.Uri) {
        return uri.with({ scheme: DocTestOutputProvider.scheme })
    }

    run_doctest() {
        let pythonPath = vscode.workspace.getConfiguration("python").get("path", "python3");
        let command = [pythonPath, "-m", "doctest", this.uri.fsPath].join(" ");
        exec(command, { timeout: 10000 }, (err, stdout, stderr) => {
            this.doctestOutput = stdout + stderr
            this._onDidChange.fire(DocTestOutputProvider.uri)
        })
    }

    get onDidChange() {
        return this._onDidChange.event;
    }

    provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken) {
        return '<pre>' + this.doctestOutput + '</pre>'
    }

    update(uri: vscode.Uri) {
        if (uri.fsPath.endsWith('.py')) {
            this.uri = uri
            this.run_doctest()
        }
    }

    dispose() { }
}

export function activate(context: vscode.ExtensionContext) {

    const provider = new DocTestOutputProvider()

    const providerRegistration = vscode.workspace.registerTextDocumentContentProvider(DocTestOutputProvider.scheme, provider)

    const commandRegistration = vscode.commands.registerTextEditorCommand('doctest-this-file.doctest', editor => {
        vscode.commands.executeCommand('vscode.previewHtml', DocTestOutputProvider.uri, vscode.ViewColumn.Two, 'Doctest Output')
        provider.update(editor.document.uri)
    });

    context.subscriptions.push(
        provider,
        providerRegistration,
        commandRegistration
    );
}

// this method is called when your extension is deactivated
export function deactivate() {
}