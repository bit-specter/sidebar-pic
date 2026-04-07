import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const provider: vscode.WebviewViewProvider = {
        resolveWebviewView(webviewView: vscode.WebviewView) {
            webviewView.webview.options = { enableScripts: true };

            const updateDisplay = () => {
                const config = vscode.workspace.getConfiguration('sidebarPic');
                const customTitle = config.get<string>('title', 'PHOTO');
                const url = config.get<string>('imageUrl', '');

                // INI RAHASIANYA: Ganti judul dropdown secara terprogram
                webviewView.description = customTitle; 
                // Atau kalau mau ganti judul utamanya (tergantung versi VS Code):
                webviewView.title = customTitle;

                webviewView.webview.html = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <body style="margin:0; padding:0; display:flex; justify-content:center; overflow:hidden;">
                        <img src="${url}" style="width:100%; height:auto; border-radius: 4px; object-fit: contain;" />
                    </body>
                    </html>
                `;
            };

            updateDisplay();

            // Biar langsung berubah pas Settings diketik
            context.subscriptions.push(
                vscode.workspace.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration('sidebarPic')) {
                        updateDisplay();
                    }
                })
            );
        }
    };

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('sidebarPicView', provider)
    );
}