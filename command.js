window.Commands = {
    'echo': (context) => {
        // echo input
        const { stdout, args } = context;

        stdout.writeln(args.join(' '));
    },
    'ls': (context) => {
        // list contents in current working directory
        const { stdout, args } = context;

        // string for eval'ing
        let completestring = `window.virtualDrive['']`;
        if(window.directory != '') {
            let workingdirectorysplit = window.directory.slice(1).split('/');

            workingdirectorysplit.forEach(element => {
                // build eval string
                completestring += `['${element}']`;
            });
        }

        if(eval(completestring)) {
            var directory = eval(completestring);
            
            Object.entries(directory).forEach(([item, content]) => {
                if(content instanceof VirtualFile) {
                    stdout.writeln('\033[35;1m' + item + '\033[0m')
                } else {
                    stdout.writeln(item + '/')
                }
            });
        }
    },
    'cd': (context) => {
        // change current working directory
        if(args.length == 0) return;
        const { stdout, args } = context;

        if(args[0] == '..') {
            // handle previous directory path traversal
            var previous = window.directory.split('/').slice(0, -1).join('/');
            window.directory = previous;
            return;
        } else if(args[0] == '.') {
            // handle current directory (just returns)
            return;
        }

        if(window.directory == '') {
            // handle branches off of root
            if(window.virtualDrive[''][args[0]]) {
                if(window.virtualDrive[''][args[0]] instanceof(VirtualFile)) {
                    stdout.writeln('cd: ' + args[0] + ': not a directory.');
                    return;
                }
                window.directory = '/' + args[0];
            } else {
                stdout.writeln('cd: ' + args[0] + ': no such file or directory');
            }
        } else {
            // handle everything else
            let workingdirectorysplit = window.directory.slice(1).split('/');
            
            // string for eval'ing
            let completestring = `window.virtualDrive['']`;
            workingdirectorysplit.forEach(element => {
                // build eval string
                completestring += `['${element}']`;
            });
            // check if directory exists
            if(eval(completestring + `['${args[0]}']`)) {
                if(eval(completestring + `['${args[0]}']`) instanceof(VirtualFile)) {
                    stdout.writeln('cd: ' + args[0] + ': not a directory.');
                    return;
                }
                window.directory = window.directory + '/' + args[0];
            } else {
                stdout.writeln('cd: ' + args[0] + ': no such file or directory');
            }
        }
    },
    'pwd': (context) => {
        // print current working directory
        const { stdout, args } = context;

        if(window.directory == '') {
            term.writeln('/');
        } else {
            term.writeln(window.directory);
        }
    },
    'clear': (context) => {
        const { stdout, args } = context;

        term.reset();
    },
    'su': (context) => {
        const { stdout, args } = context;
        function changeUser(newUser) {
            if(newUser == 'root' && window.usergroups[window.username] != 1001 && context.user != 0)
                return;
            if(users.includes(newUser) && newUser !== username) {
                window.username = newUser;
                return true;
            } else {
                return false;
            }
        }
        
        if(changeUser(args[0]))
            return;
        else
            return;
    },
    'sudo': (context) => {
        const { stdout, args } = context;
        var hasPermission = false;
        if(args.length == 0) return;

        if (window.usergroups[window.username] == 0) {
            hasPermission = true;
        } else if (window.usergroups[window.username] == 1001) {
            hasPermission = true;
        } else {
            hasPermission = false;
        }

        if(hasPermission) {
            if(window.Commands[args[0]]) {
                const Context = {
                    args: args.slice(1),
                    stdout: term,
                    user: 0
                }
                window.Commands[args[0]](Context);
            } else if(window.Packages[args[0]]) {
                const Context = {
                    args: args.slice(1),
                    stdout: term,
                    user: 0
                }
                window.Packages[args[0]](Context);
            } else {
                term.writeln(`sudo: /bin/${args[0]} does not exist.`);
            }
        } else {
            window.showPrompt = false;
            var echocmd = '';
            term.write('enter sudo password: ');
            term.on('key', window.SUDOPASS = function (key, ev) {
                var printable = (
                    !ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey
                );
                if (ev.keyCode == 37 || ev.keyCode == 39) {
                    return;
                }
                if (ev.keyCode == 13) {
                    if(echocmd == '') return;
                    echocmd = echocmd.trim();
                    term._events.key.pop(term._events.key.indexOf(window.SUDOPASS));
                    if(echocmd != 'tux') {
                        term.write('\r\n');
                        window.showPrompt = true; 
                        term.prompt();
                        return;
                    }
                    term.write('\r\n');
                    if(window.Commands[args[0]]) {
                        const Context = {
                            args: args.slice(1),
                            stdout: term,
                            user: 0
                        }
                        window.showPrompt = true;
                        echocmd = '';
                        window.Commands[args[0]](Context);
                        //term.prompt();
                    } else if(window.Packages[args[0]]) {
                        const Context = {
                            args: args.slice(1),
                            stdout: term,
                            user: 0
                        }
                        window.showPrompt = true;
                        echocmd = '';
                        window.Packages[args[0]](Context);
                        //term.prompt();
                    } else {
                        term.writeln(`sudo: /bin/${args[0]} does not exist.`);
                        window.showPrompt = true;
                        term.prompt();
                    }
                    return;
                } else if (ev.keyCode == 38) {
                    return;
                } else if (ev.keyCode == 40) {
                    return;
                } else if (ev.keyCode == 8) {
                    if (echocmd.length > 0) {
                        term.write('\b \b');
                        echocmd = echocmd.substring(0, echocmd.length - 1)
                    }
                } else if (printable) {
                    term.write('*');
                    echocmd += key;
                }
            });
        }
    },
  
    // REPL-Style Commands
    'write': (context) => {
        // print/edit/append contents of a file
        const { stdout, args } = context;
        if(args.length == 1) {
            if(window.directory == '') {
                // handle branches off of root
                if(window.virtualDrive[''][args[0]]) {
                    if(window.virtualDrive[''][args[0]] instanceof(VirtualFile)) {
                        stdout.writeln(window.virtualDrive[''][args[0]].content);
                    } else {
                        stdout.writeln('cat: ' + args[0] + ': is a directory.');
                        return;
                    }
                } else {
                    stdout.writeln('cat: ' + args[0] + ': no such file or directory');
                }
            } else {
                // handle everything else
                let workingdirectorysplit = window.directory.slice(1).split('/');
                
                let completestring = `window.virtualDrive['']`;
                workingdirectorysplit.forEach(element => {
                    completestring += `['${element}']`;
                });


                if(eval(completestring + `['${args[0]}']`)) {
                    if(eval(completestring + `['${args[0]}']`) instanceof(VirtualFile)) {
                        stdout.writeln(eval(completestring + `['${args[0]}']`).content);
                    } else {
                        stdout.writeln('cat: ' + args[0] + ': is a directory.');
                        return;
                    }
                } else {
                    stdout.writeln('cat: ' + args[0] + ': no such file or directory');
                }
            }
        } else if(args.length > 2 && args[0] == '>') {
            if(window.directory == '') {
                // handle branches off of root
                if(window.virtualDrive[''][args[1]]) {
                    if(window.virtualDrive[''][args[1]] instanceof(VirtualFile)) {
                        window.virtualDrive[''][args[1]].write(args.slice(2).join(' '));
                    } else {
                        stdout.writeln('cat: ' + args[1] + ': is a directory.');
                        return;
                    }
                } else {
                    window.virtualDrive[''][args[1]] = new VirtualFile(args[1], args.slice(2).join(' '));
                }
            } else {
                // handle everything else
                let workingdirectorysplit = window.directory.slice(1).split('/');
                
                let completestring = `window.virtualDrive['']`;
                workingdirectorysplit.forEach(element => {
                    completestring += `['${element}']`;
                });


                if(eval(completestring + `['${args[1]}']`)) {
                    if(eval(completestring + `['${args[1]}']`) instanceof(VirtualFile)) {
                        eval(completestring + `['${args[1]}']`).write(args.slice(2).join(' '));
                    } else {
                        stdout.writeln('cat: ' + args[0] + ': is a directory.');
                        return;
                    }
                } else {
                    eval(completestring + `['${args[1]}'] = new VirtualFile('${args[1]}', '${args.slice(2).join(' ')}')`)
                }
            }
        } else if(args.length > 2 && args[0] == '>>') {
            if(window.directory == '') {
                // handle branches off of root
                if(window.virtualDrive[''][args[1]]) {
                    if(window.virtualDrive[''][args[1]] instanceof(VirtualFile)) {
                        window.virtualDrive[''][args[1]].append(args.slice(2).join(' '));
                    } else {
                        stdout.writeln('cat: ' + args[1] + ': is a directory.');
                        return;
                    }
                } else {
                    window.virtualDrive[''][args[1]] = new VirtualFile(args[1], args.slice(2).join(' '));
                }
            } else {
                // handle everything else
                let workingdirectorysplit = window.directory.slice(1).split('/');
                
                let completestring = `window.virtualDrive['']`;
                workingdirectorysplit.forEach(element => {
                    completestring += `['${element}']`;
                });


                if(eval(completestring + `['${args[1]}']`)) {
                    if(eval(completestring + `['${args[1]}']`) instanceof(VirtualFile)) {
                        eval(completestring + `['${args[1]}']`).append(args.slice(2).join(' '));
                    } else {
                        stdout.writeln('cat: ' + args[0] + ': is a directory.');
                        return;
                    }
                } else {
                    eval(completestring + `['${args[1]}'] = new VirtualFile('${args[1]}', '${args.slice(2).join(' ')}')`)
                }
            }
        }
    },

    'echorepl': (context) => {
        const { stdout, args } = context;
        window.showPrompt = false;
        var echocmd = '';
        term.on('key', window.ECHOREPL = function (key, ev) {
            var printable = (
                !ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey
            );
            if (ev.keyCode == 37 || ev.keyCode == 39) {
                return;
            }
            if (ev.keyCode == 13) {
                echocmd = echocmd.trim();
                term.write('\r\n');
                
                term.writeln(echocmd)
                if(echocmd == 'exit') {
                    window.showPrompt = true;
                    echocmd = '';
                    term._events.key.pop(term._events.key.indexOf(window.ECHOREPL))
                    term.prompt();
                    return;
                }
                echocmd = '';
                term.write('> ');
                return;
            } else if (ev.keyCode == 38) {
                return;
            } else if (ev.keyCode == 40) {
                return;
            } else if (ev.keyCode == 8) {
                if (echocmd.length > 0) {
                    term.write('\b \b');
                    echocmd = echocmd.substring(0, echocmd.length - 1)
                }
            } else if (printable) {
                term.write(key);
                echocmd += key;
            }
        });
    },
    'bc': (context) => {
        const { stdout, args } = context;
        window.showPrompt = false;
        var echocmd = '';
        term.on('key', window.BCREPL = function (key, ev) {
            var printable = (
                !ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey
            );
            if (ev.keyCode == 37 || ev.keyCode == 39) {
                return;
            }
            if (ev.keyCode == 13) {
                echocmd = echocmd.trim();
                term.write('\r\n');
                if(echocmd == '') {
                    return;
                }

                if(echocmd == 'exit') {
                    window.showPrompt = true;
                    echocmd = '';
                    term._events.key.pop(term._events.key.indexOf(window.BCREPL))
                    term.prompt();
                    return;
                }
                executeBc(echocmd);
                echocmd = '';
                return;
            } else if (ev.keyCode == 38) {
                return;
            } else if (ev.keyCode == 40) {
                return;
            } else if (ev.keyCode == 8) {
                if (echocmd.length > 0) {
                    term.write('\b \b');
                    echocmd = echocmd.substring(0, echocmd.length - 1)
                }
            } else if (printable) {
                term.write(key);
                echocmd += key;
            }
        });
    },
    
    'js': (context) => {
        const { stdout, args } = context;
        window.showPrompt = false;
        var echocmd = '';
        term.on('key', window.JSREPL = function (key, ev) {
            var printable = (
                !ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey
            );
            if (ev.keyCode == 37 || ev.keyCode == 39) {
                return;
            }
            if (ev.keyCode == 13) {
                echocmd = echocmd.trim();
                term.write('\r\n');
                term.write('> ')
                if (echocmd == '') {
                    return;
                }

                if (echocmd == 'exit') {
                    window.showPrompt = true;
                    echocmd = '';
                    term._events.key.pop(term._events.key.indexOf(window.JSREPL));
                    term.prompt();
                    return;
                }
                try {
                    term.writeln(eval(echocmd));
                } catch(e) {
                    term.writeln(e);
                }
                echocmd = '';
                term.write('> ')
                return;
            } else if (ev.keyCode == 38) {
                return;
            } else if (ev.keyCode == 40) {
                return;
            } else if (ev.keyCode == 8) {
                if (echocmd.length > 0) {
                    term.write('\b \b');
                    echocmd = echocmd.substring(0, echocmd.length - 1);
                }
            } else if (printable) {
                term.write(key);
                echocmd += key;
            }
        });
    }
}


const executeBc = (cmd) => {
    const ADD = '+',
        SUB = '-',
        MUL = '*',
        DIV = '/';
    
    let parts = new Array();
    let OPERATOR;

    if(cmd.includes(ADD)) {
        parts = cmd.split(ADD);
        OPERATOR = ADD;
    } else if(cmd.includes(SUB)) {
        parts = cmd.split(SUB);
        OPERATOR = SUB;
    } else if(cmd.includes(MUL)) {
        parts = cmd.split(MUL);
        OPERATOR = MUL;
    } else if(cmd.includes(DIV)) {
        parts = cmd.split(DIV);
        OPERATOR = DIV;
    } else {
        term.writeln('Syntax Error: ' + cmd);
    }

    if(parts.length == 2) {
        if(parseInt(parts[0]) && parseInt(parts[1])) {
            var statement = eval(`${parseInt(parts[0])}${OPERATOR}${parseInt(parts[1])}`);
            term.writeln(statement);
        } else {
            term.writeln('Syntax Error: ' + cmd);
        }
    } else {
        term.writeln('Syntax Error: ' + cmd);
    }

};
