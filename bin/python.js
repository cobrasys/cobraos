const pyRun = (context) => {
    const { stdout, args } = context;
    
    if(args.length > 0) {
        let code = '';
        if(window.directory == '') {
            // handle branches off of root
            if(window.virtualDrive[''][args[0]]) {
                if(window.virtualDrive[''][args[0]] instanceof(VirtualFile)) {
                    code = window.virtualDrive[''][args[0]].content
                } else {
                    stdout.writeln('python: ' + args[0] + ': is a directory.');
                    return;
                }
            } else {
                stdout.writeln('python: ' + args[0] + ': no such file or directory');
                return;
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
                    code = eval(completestring + `['${args[0]}']`).content;
                } else {
                    stdout.writeln('python: ' + args[0] + ': is a directory.');
                    return;
                }
            } else {
                stdout.writeln('python: ' + args[0] + ': no such file or directory');
                return;
            }
        }

        var output = $('#edoutput');
        
        function outf(text) { 
            stdout.write(text.replace('\n', '\r\n'));
            output.text(output.text() + text);
        } 
        function builtinRead(x) {
            if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
                return
            return Sk.builtinFiles["files"][x];
        }
        
        $('#clearoutput').click(function (e) {
            $('#edoutput').text('');
            $('#mycanvas').hide();
        });

        function runit() { 
        var prog = code;
        Sk.configure({output:outf, read:builtinRead, sysargv: args}); 
        Sk.canvas = "mycanvas";
        if (editor.getValue().indexOf('turtle') > -1 ) {
            $('#mycanvas').show()
        }
        Sk.pre = "edoutput";
        (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = 'mycanvas';
        window.showPrompt = false;
        var myPromise = Sk.misceval.asyncToPromise(function() {
            try {
                return Sk.importMainWithBody('<stdin>', false, prog, true);
            } catch (err) {
                stdout.writeln(err);
            }
        });
        myPromise.then(function(mod) {
            window.showPrompt = true;
            term.prompt();
            console.log('success');
        },
            function(err) {
            console.log(err.toString());
            window.showPrompt = true;
            term.prompt();
        });
        }
        runit()
    } else if(args.length == 0) {
        stdout.writeln("Python 3.7 (webnix, " + new Date() + ")");
        stdout.writeln("[" + navigator.userAgent + "] on " + navigator.platform);
        stdout.writeln('Don\'t type "help", "copyright", "credits" or "license" unless you\'ve assigned something to them');
        window.showPrompt = false;
        var echocmd = '';
        var startPrompt = false;
        term.write('>>> ');
        term.on('key', window.PYREPL = function (key, ev) {
            var printable = (
                !ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey
            );

            if (key == '[C') {
                return;
            }
            if(key == '[D') {
                return;
            }
            if (ev.keyCode == 13) {
                echocmd = echocmd.trim();
                if (echocmd == '') {
                    return;
                }
                term.write('\r\n');
                if (echocmd == 'exit' || echocmd == 'quit()') {
                    window.showPrompt = true;
                    echocmd = '';
                    term._events.key.pop(term._events.key.indexOf(window.PYREPL));
                    term.prompt();
                    return;
                }
                
                re = new RegExp("\\s*print"),
                importre = new RegExp("\\s*import"),
                mls = new RegExp("'''"),
                defre = new RegExp("def.*|class.*"),
                emptyline = new RegExp("^\\s*$"),
                assignment = /^((\s*\(\s*(\s*((\s*((\s*[_a-zA-Z]\w*\s*)|(\s*\(\s*(\s*[_a-zA-Z]\w*\s*,)*\s*[_a-zA-Z]\w*\s*\)\s*))\s*)|(\s*\(\s*(\s*((\s*[_a-zA-Z]\w*\s*)|(\s*\(\s*(\s*[_a-zA-Z]\w*\s*,)*\s*[_a-zA-Z]\w*\s*\)\s*))\s*,)*\s*((\s*[_a-zA-Z]\w*\s*)|(\s*\(\s*(\s*[_a-zA-Z]\w*\s*,)*\s*[_a-zA-Z]\w*\s*\)\s*))\s*\)\s*))\s*,)*\s*((\s*((\s*[_a-zA-Z]\w*\s*)|(\s*\(\s*(\s*[_a-zA-Z]\w*\s*,)*\s*[_a-zA-Z]\w*\s*\)\s*))\s*)|(\s*\(\s*(\s*((\s*[_a-zA-Z]\w*\s*)|(\s*\(\s*(\s*[_a-zA-Z]\w*\s*,)*\s*[_a-zA-Z]\w*\s*\)\s*))\s*,)*\s*((\s*[_a-zA-Z]\w*\s*)|(\s*\(\s*(\s*[_a-zA-Z]\w*\s*,)*\s*[_a-zA-Z]\w*\s*\)\s*))\s*\)\s*))\s*\)\s*)|(\s*\s*(\s*((\s*((\s*[_a-zA-Z]\w*\s*)|(\s*\(\s*(\s*[_a-zA-Z]\w*\s*,)*\s*[_a-zA-Z]\w*\s*\)\s*))\s*)|(\s*\(\s*(\s*((\s*[_a-zA-Z]\w*\s*)|(\s*\(\s*(\s*[_a-zA-Z]\w*\s*,)*\s*[_a-zA-Z]\w*\s*\)\s*))\s*,)*\s*((\s*[_a-zA-Z]\w*\s*)|(\s*\(\s*(\s*[_a-zA-Z]\w*\s*,)*\s*[_a-zA-Z]\w*\s*\)\s*))\s*\)\s*))\s*,)*\s*((\s*((\s*[_a-zA-Z]\w*\s*)|(\s*\(\s*(\s*[_a-zA-Z]\w*\s*,)*\s*[_a-zA-Z]\w*\s*\)\s*))\s*)|(\s*\(\s*(\s*((\s*[_a-zA-Z]\w*\s*)|(\s*\(\s*(\s*[_a-zA-Z]\w*\s*,)*\s*[_a-zA-Z]\w*\s*\)\s*))\s*,)*\s*((\s*[_a-zA-Z]\w*\s*)|(\s*\(\s*(\s*[_a-zA-Z]\w*\s*,)*\s*[_a-zA-Z]\w*\s*\)\s*))\s*\)\s*))\s*\s*))=/;


                Sk.configure({ 
                    output: function(str) {
                        if (str.replace(/\n/g, "") !== "") {
                            stdout.writeln(str);
                        }
                    },
                    read: function (x) {
                        if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
                            throw "File not found: '" + x + "'";
                        }
                        return Sk.builtinFiles["files"][x];
                    },
                    sysargv: [],
                    retainglobals: true
                });
                    
                var lines = echocmd.split('\n'), index = -1, line = 0;
        
                if (lines.length === 1) {
                    if (!assignment.test(lines[0]) && !defre.test(lines[0]) && !importre.test(lines[0]) && lines[0].length > 0) {
                        if (!re.test(lines[0])) {
                            lines.push("evaluationresult = " + lines.pop());
                            lines.push("if not evaluationresult == None: print repr(evaluationresult)");
                        }
                    }
                }


        
                try {
                    if (!lines || /^\s*$/.test(lines)) {
                        return;
                    }
                    else {
                        Sk.importMainWithBody("repl", false, lines.join('\n'));            
                    }
                } catch (err) {
                    stdout.writeln(err);
        
                    if ((index = err.toString().indexOf("on line")) !== -1) {
                        index = parseInt(err.toString().substr(index + 8), 10);
                    }
                    
                    lines.forEach(function (str) {
                        stdout.writeln(++line + (index === line ? ">" : " ") + ": " + str);
                    });
                }

                echocmd = '';
                term.write('>>> ')
                return;
            } else if (key == '[A') {
                return;
            } else if (key == '[B') {
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

window.Packages['python'] = pyRun;