import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let activeWebviewView: vscode.WebviewView | undefined;

    const escapeHtml = (value: string) =>
        value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

    const provider: vscode.WebviewViewProvider = {
        resolveWebviewView(webviewView: vscode.WebviewView) {
            activeWebviewView = webviewView;
            webviewView.webview.options = { enableScripts: true };

            const updateDisplay = () => {
                const config = vscode.workspace.getConfiguration('sidebarPic');
                const customTitle = config.get<string>('title', 'PHOTO');
                const remoteUrl = config.get<string>('imageUrl', '');
                const localImagePath = config.get<string>('localImagePath', '');

                let imageSource = remoteUrl;

                if (localImagePath && activeWebviewView) {
                    const localImageUri = vscode.Uri.file(localImagePath);
                    const normalizedPath = localImagePath.replace(/\\/g, '/');
                    const lastSeparator = normalizedPath.lastIndexOf('/');
                    const imageDirectory = lastSeparator > 0 ? normalizedPath.slice(0, lastSeparator) : normalizedPath;
                    webviewView.webview.options = {
                        enableScripts: true,
                        localResourceRoots: [vscode.Uri.file(imageDirectory)]
                    };
                    imageSource = activeWebviewView.webview.asWebviewUri(localImageUri).toString();
                }

                webviewView.description = customTitle; 
                webviewView.title = customTitle;

                webviewView.webview.html = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <body style="margin:0; padding:0; display:flex; justify-content:center; overflow:hidden;">
                        <img src="${escapeHtml(imageSource)}" style="width:100%; height:auto; border-radius: 4px; object-fit: contain;" />
                    </body>
                    </html>
                `;
            };

            updateDisplay();

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

    context.subscriptions.push(
        vscode.commands.registerCommand('sidebarPic.setTitle', async () => {
            const config = vscode.workspace.getConfiguration('sidebarPic');
            const currentTitle = config.get<string>('title', 'PHOTO');

            const nextTitle = await vscode.window.showInputBox({
                title: 'Sidebar Pic: Set title',
                prompt: 'Enter sidebar title',
                value: currentTitle,
                ignoreFocusOut: true
            });

            if (typeof nextTitle === 'string') {
                await config.update('title', nextTitle.trim() || 'PHOTO', vscode.ConfigurationTarget.Global);
            }
        }),
        vscode.commands.registerCommand('sidebarPic.setImageUrl', async () => {
            const config = vscode.workspace.getConfiguration('sidebarPic');
            const currentUrl = config.get<string>('imageUrl', '');

            const nextUrl = await vscode.window.showInputBox({
                title: 'Sidebar Pic: Set image URL',
                prompt: 'Enter a direct image URL',
                value: currentUrl,
                ignoreFocusOut: true,
                validateInput: (value: string) => {
                    const trimmed = value.trim();

                    if (!trimmed) {
                        return 'Image URL cannot be empty.';
                    }

                    if (!/^https?:\/\/\S+$/i.test(trimmed)) {
                        return 'Please enter a valid URL starting with http:// or https://';
                    }

                    return null;
                }
            });

            if (typeof nextUrl === 'string') {
                await config.update('imageUrl', nextUrl.trim(), vscode.ConfigurationTarget.Global);
            }
        }),
        vscode.commands.registerCommand('sidebarPic.selectLocalImage', async () => {
            const picked = await vscode.window.showOpenDialog({
                canSelectMany: false,
                canSelectFolders: false,
                canSelectFiles: true,
                openLabel: 'Use image',
                filters: {
                    Images: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg']
                }
            });

            if (!picked || picked.length === 0) {
                return;
            }

            const config = vscode.workspace.getConfiguration('sidebarPic');
            await config.update('localImagePath', picked[0].fsPath, vscode.ConfigurationTarget.Global);
        }),
        vscode.commands.registerCommand('sidebarPic.clearLocalImage', async () => {
            const config = vscode.workspace.getConfiguration('sidebarPic');
            await config.update('localImagePath', '', vscode.ConfigurationTarget.Global);
        })
    );
}