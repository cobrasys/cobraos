import { JSCPP } from "./gpp/cpp.js";

export default {
    Run: function (context) {
        const { stdout, args } = context;

        let code = '';
        if(window.directory == '') {
            // handle branches off of root
            if(window.virtualDrive[''][args[0]]) {
                if(window.virtualDrive[''][args[0]] instanceof(VirtualFile)) {
                    code = window.virtualDrive[''][args[0]].content
                } else {
                    stdout.writeln('g++: ' + args[0] + ': is a directory.');
                    return;
                }
            } else {
                stdout.writeln('g++: ' + args[0] + ': no such file or directory');
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
                    stdout.writeln('g++: ' + args[0] + ': is a directory.');
                    return;
                }
            } else {
                stdout.writeln('g++: ' + args[0] + ': no such file or directory');
                return;
            }
        }
        var input = "";
        var config = {
            stdio: {
                write: function(s) {
                    term.write(s.replace('\n', '\r\n'));
                }
            },
            unsigned_overflow: "error" // can be "error"(default), "warn" or "ignore"
        };
        var exitCode = JSCPP.run(code, input, config);
	
    }
}
