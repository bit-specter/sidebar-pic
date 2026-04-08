import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let activeWebviewView: vscode.WebviewView | undefined;
    let lastRenderedState = '';
    let lastInvalidUrlNotified = '';

    const escapeHtml = (value: string) =>
        value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

    const getDirectoryPath = (filePath: string) => {
        const normalizedPath = filePath.replace(/\\/g, '/');
        const lastSeparator = normalizedPath.lastIndexOf('/');
        return lastSeparator > 0 ? normalizedPath.slice(0, lastSeparator) : normalizedPath;
    };

    const validateImageUrl = (value: string): string | null => {
        const trimmed = value.trim();

        if (!trimmed) {
            return 'Image URL cannot be empty.';
        }

        if (!/^https?:\/\/\S+$/i.test(trimmed)) {
            return 'Please enter a valid URL starting with http:// or https://';
        }

        if (/\/\/([\w-]+\.)?google\.[^/]+\/imgres/i.test(trimmed)) {
            return 'Google image result links are not direct image URLs. Use the direct image file URL instead.';
        }

        return null;
    };

    const provider: vscode.WebviewViewProvider = {
        resolveWebviewView(webviewView: vscode.WebviewView) {
            activeWebviewView = webviewView;
            webviewView.webview.options = { enableScripts: true };

            const updateDisplay = () => {
                const config = vscode.workspace.getConfiguration('sidebarPic');
                const customTitle = config.get<string>('title', 'PHOTO');
                const remoteUrl = config.get<string>('imageUrl', '');
                const localImagePath = config.get<string>('localImagePath', '');
                const remoteUrlError = validateImageUrl(remoteUrl);

                let imageSource = '';
                let errorMessage = '';

                if (localImagePath && activeWebviewView) {
                    const localImageUri = vscode.Uri.file(localImagePath);
                    const imageDirectory = getDirectoryPath(localImagePath);
                    webviewView.webview.options = {
                        enableScripts: true,
                        localResourceRoots: [vscode.Uri.file(imageDirectory)]
                    };
                    imageSource = activeWebviewView.webview.asWebviewUri(localImageUri).toString();
                } else if (!remoteUrlError) {
                    imageSource = remoteUrl.trim();
                    webviewView.webview.options = { enableScripts: true };
                    lastInvalidUrlNotified = '';
                } else {
                    errorMessage = remoteUrlError;

                    if (remoteUrl.trim() && remoteUrl !== lastInvalidUrlNotified) {
                        lastInvalidUrlNotified = remoteUrl;
                        void vscode.window.showWarningMessage(`Sidebar Pic: ${remoteUrlError}`);
                    }
                }

                webviewView.description = customTitle; 
                webviewView.title = customTitle;

                const renderState = `${customTitle}::${imageSource}::${errorMessage}`;
                if (renderState === lastRenderedState) {
                    return;
                }
                lastRenderedState = renderState;

                const fallbackMessage = escapeHtml(
                    errorMessage || 'Unable to load image. Please use a direct image URL or choose a local image.'
                );

                const imageMarkup = imageSource
                    ? `<img src="${escapeHtml(imageSource)}" style="width:100%; height:auto; border-radius: 4px; object-fit: contain;" onerror="this.style.display='none';document.getElementById('sidebar-pic-error').style.display='flex';" />`
                    : '';

                webviewView.webview.html = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <body style="margin:0; padding:8px; display:flex; justify-content:center; overflow:hidden;">
                        ${imageMarkup}
                        <div id="sidebar-pic-error" style="display:${imageSource ? 'none' : 'flex'};align-items:center;justify-content:center;text-align:center;width:100%;min-height:120px;border:1px dashed var(--vscode-editorWidget-border);border-radius:6px;color:var(--vscode-descriptionForeground);font-size:12px;line-height:1.5;padding:8px;box-sizing:border-box;">
                            ${fallbackMessage}
                        </div>
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
                    return validateImageUrl(value);
                }
            });

            if (typeof nextUrl === 'string') {
                const trimmed = nextUrl.trim();
                if (trimmed !== currentUrl.trim()) {
                    await config.update('imageUrl', trimmed, vscode.ConfigurationTarget.Global);
                }
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
            const selectedPath = picked[0].fsPath;
            const currentPath = config.get<string>('localImagePath', '');
            if (selectedPath !== currentPath) {
                await config.update('localImagePath', selectedPath, vscode.ConfigurationTarget.Global);
            }
        }),
        vscode.commands.registerCommand('sidebarPic.clearLocalImage', async () => {
            const config = vscode.workspace.getConfiguration('sidebarPic');
            const currentPath = config.get<string>('localImagePath', '');
            if (currentPath) {
                await config.update('localImagePath', '', vscode.ConfigurationTarget.Global);
            }
        })
    );
}