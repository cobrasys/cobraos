const perlRun = async (context) => {
    const { stdout, args } = context;
    window.showPrompt = false;
    let code = '';
    if(window.directory == '') {
        // handle branches off of root
        if(window.virtualDrive[''][args[0]]) {
            if(window.virtualDrive[''][args[0]] instanceof(VirtualFile)) {
                code = window.virtualDrive[''][args[0]].content
            } else {
                stdout.writeln('perl: ' + args[0] + ': is a directory.');
                return;
            }
        } else {
            stdout.writeln('perl: ' + args[0] + ': no such file or directory');
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
                stdout.writeln('perl: ' + args[0] + ': is a directory.');
                return;
            }
        } else {
            stdout.writeln('perl: ' + args[0] + ': no such file or directory');
            return;
        }
    }
    
    function run_perl_code() {

        var was_error = 0;

        if (Perl.state == "Ended") { // in case of error
            Perl.readyCallback = function() { alert(55) };
            Perl.changeState("Ready");
            Perl.start([]);
            was_error = 1;
        }
        
        // global, so it work on setTimeout below
        perl_code = code

        // $|=1; will make print to stdout work even after error.
        perl_code = "$|=1;"+perl_code;

        if (was_error) {
            setTimeout(" Perl.eval( perl_code ); ", 300); // Time to Perl.start ?
        } else {
            Perl.eval(perl_code);
        }

    }
    run_perl_code();

    window.showPrompt = true;
}

window.addEventListener("load", function () {

  if (Perl.state == "Uninitialized") {
     Perl.init(function () {
      window.setTimeout(function () { Perl.start([]); }, 1);
    });
  }

});

window.Packages['perl'] = perlRun;