// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const insertText = (val) => {
        const editor = vscode.window.activeTextEditor;
        const selection = editor.selection;
        const lineOfSelectedVar = selection.active.line;
        editor.edit((editBuilder) => {
            editBuilder.insert(new vscode.Position(lineOfSelectedVar + 1, 0), val);
        })
    }
    const getAllLogStatements = () => {
        const editor = vscode.window.activeTextEditor;
        const document = editor.document;
        const documentText = document.getText();

        let logStatements = [];
        const logRegx = /console.(log|debug|info|warn|error|assert|dir|dirxm|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\((.*)\);?/g;
        let match;
        while (match = logRegx.exec(documentText)) {
            let matchRange = new vscode.Range(
                document.positionAt(match.index),
                document.positionAt(match.index + match[0].length)
            )
            if (!matchRange.isEmpty) logStatements.push(matchRange);
        }
        return logStatements;
    }

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "code-helper" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('code-helper.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from code-helper!');
	});
    
    let insertLog = vscode.commands.registerCommand('code-helper.insertLog',()=>{
        const editor = vscode.window.activeTextEditor;
        const selection  = editor.selection;
        const text = editor.document.getText(selection);
        const logToInseert = `conslog.log('${text}:',${text});\n`;
        text ? insertText(logToInseert) : insertText('console.log();');        
    })
    const deleteAllLog = vscode.commands.registerCommand('code-helper.deleteAllConsoles',()=>{
        const editor = vscode.window.activeTextEditor;
        if(!editor) return;
        let wordspaceEdit = new vscode.WorkspaceEdit();
        const document = editor.document;
        const logStatements = getAllLogStatements();

        logStatements.forEach(log => {
            wordspaceEdit.delete(document.uri,log);
        });
        vscode.workspace.applyEdit(wordspaceEdit).then(()=>{
            vscode.window.showInformationMessage(`${logStatements.length} console deleted`);
        })
    })

    const removeComments = vscode.commands.registerCommand('code-helper.removeComments',()=>{
        const editor = vscode.window.activeTextEditor;
        editor.edit(editBuilder=>{
            let text = editor.document.getText();
            text = text.replace(/((\/\*([\w\W]+?)\*\/)|(\/\/(.(?!"\)))+)|(^\s*(?=\r?$)\n))/gm, '')
                .replace(/(^\s*(?=\r?$)\n)/gm, '')
                .replace(/\\n\\n\?/gm, '');
            const end = new vscode.Position(editor.document.lineCount+1,0);
            editBuilder.replace(new vscode.Range(new vscode.Position(0,0),end),text);
            vscode.commands.executeCommand('editor.action.formatDocument');
        })
    });
	context.subscriptions.push(disposable);
    context.subscriptions.push(insertLog);
    context.subscriptions.push(deleteAllLog);
    context.subscriptions.push(removeComments);
}

// this method is called when your extension is deactivated
export function deactivate() {}
