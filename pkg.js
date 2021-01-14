
var __gpp = document.createElement('script');

__gpp.setAttribute('src','bin/g++.js');

document.head.appendChild(__gpp);

var __py = document.createElement('script');

__py.setAttribute('src','bin/python.js');

document.head.appendChild(__py);

let localPackageList = [
    'java',
    'g++',
    'python'
];

window.Packages = {};

window.Packages.wget = function(context) {
	const { stdout, args } = context;
    if(args.length == 1) {
        window.showPrompt = false;
        fetch(args[0]).then(response => response.text())
      .then(data => { 
            term.write(data); 
            window.showPrompt = true
            term.write('\r\n')
            term.prompt()
        });
    }
	
}
