'use strict';
import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('doctest-this-file.doctest', () => {
        let path = vscode.window.activeTextEditor.document.uri.path;
        let pythonPath = vscode.workspace.getConfiguration("python").get("path", "python3");
        let output = vscode.window.createOutputChannel("Doctest Results: ");
        let command = [pythonPath, "-m", "doctest", path].join(" ");
        let show_stdout = (err, stdout, stderr) => output.appendLine(stdout);

        output.show();
        output.appendLine("Doctesting " + path);
        exec(command, show_stdout);

    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}