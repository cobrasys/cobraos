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

window.hostname = localStorage.hostname ? localStorage.hostname : 'localhost';
window.username = 'user';

window.users = ['root', 'user'];

window.usergroups = {
    'root': 0,
    'user': 100
}

window.userInfo = {
    'root': {
        homeDirectory: '',
        env: {
            'TERM': 'xterm',
            'PATH': '/bin:/usr/bin:/sbin:/usr/local/bin',
            'HOME': '/',
            'SHELL': '/bin/cbrsh',
            'HISTSIZE': '200',
            'HISTFILE': ''
        },
    },
    'user': {
        homeDirectory: '/home/user',
        env: {
            'TERM': 'xterm',
            'PATH': '/bin:/usr/bin:/sbin:/usr/local/bin',
            'HOME': '/',
            'SHELL': '/bin/cbrsh',
            'HISTSIZE': '200',
            'HISTFILE': ''
        },
    },
}



window.loginTime = {
    'user': new Date(),
}

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

        },
        'home': {
            'user': {
                'readme.txt': new VirtualFile('readme.txt', 'hello')
            }
        },
        'tmp': {},
        'usr': {},
        'sbin': {},
        'dev': {},
        'sys': {},
        'mnt': {},
        'tmp': {},
        'var': {},
    },
}

Object.entries(window.Commands).forEach(([name, func]) => {
    window.virtualDrive['']['bin'][name] = new VirtualFile(name, func.toString());
});

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
    
    window.directory = window.userInfo[username].homeDirectory;

    term.prompt = function () {
        shellprompt = '\033[32;1m' + username + '@' + hostname + '\033[0m: \033[31;1m~' + (directory == window.userInfo[username].homeDirectory ? '' : (directory == '' ? '/' : directory)) + '\033[0m \033[34;1m' + (window.username == 'root' ? '#' : '$') + '\033[0m ';
        term.write('' + shellprompt);
    };
    term.writeln('');
    term.prompt();

    /*term.on("paste", function(data) {
        command += data;
        term.write(data);
    });*/
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
                cur = commandHistory.length;
                command = "";
                return;
            }
            term.write('\r\n')
            // Hmmmm
            let args = new Array(command.split(' ')[0]);
            const argSs = command.split(' ');
            args = parseStringArguments(argSs);
            
            commandHistory.push(command);

            const historyre = /^![0-9]+$/g;
            if(historyre.test(command)){
                let req = command.replace('!', '');
                console.log(req);
                let index = parseInt(req) - 1;
                console.log(index);
                if(window.Commands[commandHistory[index]]) {
                    const Context = {
                        args: args.slice(1),
                        stdout: term,
                        user: window.usergroups[window.username]
                    }
                    window.Commands[commandHistory[index]](Context);
                } else if(window.Packages[commandHistory[index]]) {
                    const Context = {
                        args: args.slice(1),
                        stdout: term,
                        user: window.usergroups[window.username]
                    }
                    window.Packages[commandHistory[index]](Context);
                } else {
                    term.writeln(`/bin/${commandHistory[index]} does not exist.`);
                }
                cur = commandHistory.length;
                command = "";
                term.prompt();
                return;
            }

            if(window.Commands[args[0]]) {
                const Context = {
                    args: args.slice(1),
                    stdout: term,
                    user: window.usergroups[window.username]
                }
                window.Commands[args[0]](Context);
            } else if(window.Packages[args[0]]) {
                const Context = {
                    args: args.slice(1),
                    stdout: term,
                    user: window.usergroups[window.username]
                }
                window.Packages[args[0]](Context);
            } else {
                term.writeln(`/bin/${args[0]} does not exist.`);
            }

            if(!window.showPrompt) {
                cur = commandHistory.length;
                command = "";
            }
            if (!loadingBar && window.showPrompt) {
                term.prompt();
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
