var term,
    protocol,
    socketURL,
    socket,
    pid,
    charWidth,
    charHeight;
var asciTitleEnabled = true;
var loadingBar = false;
var clicks = 0;
var commandHistory = [];
var cur = 0;
var command = "";

var __pkg = document.createElement('script');

__pkg.setAttribute('src','pkg.js');

document.head.appendChild(__pkg);


class VirtualFile {
    constructor(name, content) {
        this.name = name;
        this.content = content;
    }
    write(content) {
        this.content = content;
    }
    read() {
        return content;
    }
    append(content) {
        this.content += '\r\n' + content;
    }
}

window.awaitStdin = false;
window.stdin = {
    content: '',
    read: () => {
        let r = window.stdin.content;
        window.stdin.content = '';
        return r;
    }
}

window.showPrompt = true;

window.virtualDrive = {
    '':  {
        'bin': {
            'ls': new VirtualFile('ls', '\x16' * 59),
            'echo': new VirtualFile('echo', '\x20' * 49),
            'cd': new VirtualFile('cd', '\x23' * 52),
        },
        'home': {
            'webnix': {
                'readme.txt': new VirtualFile('readme.txt', 'hello')
            }
        },
        'hello.cpp': new VirtualFile('hello.cpp', `
#include <iostream>
using namespace std;
int main() {
    cout << "Hello World!" << endl;
    return 0;
}
        `),
        'hello.py': new VirtualFile('hello.py', `
import uuid

print(uuid.uuidv4())
        `),
    },
}

function closepopup() {
    var popup = document.getElementById("popup");
    popup.style.display = "none";
}
var terminalContainer = document.getElementById('terminal-container');

function setTerminalSize() {
    var cols = parseInt(window.innerWidth / charWidth);
    var rows = parseInt(window.innerHeight / charHeight);
    //var width = window.innerWidth.toString() + 'px';
    //var height = window.innerHeight.toString() + 'px';
    if (cols < 86) {
        
        asciTitleEnabled = false;
    }
    else {
        asciTitleEnabled = true;
    }

    //terminalContainer.style.width = width;
    //terminalContainer.style.height = height;

    //term.resize(cols, rows);
}

createTerminal();

window.addEventListener('resize', function (event) {
    setTerminalSize();
});


function createTerminal() {
    command = "";
    while (terminalContainer.children.length) {
        terminalContainer.removeChild(terminalContainer.children[0]);
    }
    term = new Terminal({
        cursorBlink: "block",
        scrollback: 1000,
        tabStopWidth: 8
    });


    term.open(terminalContainer);

    runVM();
}

function runVM() {
    setTerminalSize();

    var shellprompt;
    window.directory = '';

    term.prompt = function () {
        shellprompt = '\033[32;1mroot@webnix\033[0m: \033[31;1m~' + directory + '\033[0m \033[34;1m#\033[0m ';
        term.write('' + shellprompt);
    };
    term.writeln('');
    term.prompt();

    term.on('key', function (key, ev) {
        if(!window.showPrompt) return;
        var printable = (
            !ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey
        );
        if (loadingBar) return;
        
        if (key == '[C') {
            return;
        }
        if(key == '[D') {
            return;
        }
        if (ev.keyCode == 39) {
            return;
        }
        if (ev.keyCode == 13) {
            command = command.trim();
            if(command == '') {
                term.writeln(' ')
                term.prompt();
                commandHistory.push(command);
                cur = commandHistory.length;
                command = "";
                return;
            }
            term.write('\r\n')
            // Hmmmm
            const args = command.split(' ');

            if(window.Commands[args[0]]) {
                const Context = {
                    args: args.slice(1),
                    stdout: term
                }
                window.Commands[args[0]](Context);
            } else if(window.Packages[args[0]]) {
                const Context = {
                    args: args.slice(1),
                    stdout: term
                }
                window.Packages[args[0]](Context);
            } else {
                term.writeln(`/bin/${args[0]} does not exist.`);
            }

            if(!window.showPrompt) {
                commandHistory.push(command);
                cur = commandHistory.length;
                command = "";
            }
            if (!loadingBar && window.showPrompt) {
                term.prompt();
                commandHistory.push(command);
                cur = commandHistory.length;
                command = "";
            }

        } else if (key == '[A') {
            if (commandHistory.length > 0) {
                cur = Math.max(0, cur - 1);
                var i = 0;
                while (i < command.length) {
                    term.write('\b \b');
                    i++;
                }
                term.write(commandHistory[cur])
                command = commandHistory[cur]
            }
        } else if (key == '[B') {
            if (commandHistory.length > 0) {
                cur = Math.min(commandHistory.length, cur + 1);
                var i = 0;
                while (i < command.length) {
                    term.write('\b \b');
                    i++;
                }
                if (cur == commandHistory.length) {
                    term.write("")
                    command = ""
                }
                else {
                    term.write(commandHistory[cur])
                    command = commandHistory[cur]
                }
            }
        } else if (ev.keyCode == 8) {
            if (command.length > 0) {
                term.write('\b \b');
                command = command.substring(0, command.length - 1)
            }
        } else if (printable) {
            term.write(key);
            command += key;
        }
    });

    term.on('paste', function (data, ev) {
        term.write(data);
        command += data;
    });
}
