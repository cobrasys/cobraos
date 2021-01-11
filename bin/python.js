const pyRun = (context) => {
    const { stdout, args } = context;
    
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
    
	function outf(text) { 
        stdout.write(text.replace('\n', '\r\n'));
    } 
    function builtinRead(x) {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
                throw "File not found: '" + x + "'";
        return Sk.builtinFiles["files"][x];
    }
    
    // Here's everything you need to run a python program in skulpt
    // grab the code from your textarea
    // get a reference to your pre element for output
    // configure the output function
    // call Sk.importMainWithBody()
    function runit() { 
       var prog = code;
       Sk.pre = "output";
       Sk.configure({output:outf, read:builtinRead}); 
       (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = 'mycanvas';
       var myPromise = Sk.misceval.asyncToPromise(function() {
           return Sk.importMainWithBody("<stdin>", false, prog, true);
       });
       myPromise.then(function(mod) {
           console.log('success');
       },
           function(err) {
           console.log(err.toString());
       });
    }
    runit()
}

window.Packages['python'] = pyRun;