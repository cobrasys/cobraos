document.getElementById('input-file')
  .addEventListener('change', getFile)

function getFile(event) {
	const input = event.target
  if ('files' in input && input.files.length > 0) {
	  placeFileContent(
      document.getElementById('content-target'),
      input.files[0])
      window.currentFilename = input.files[0].name;
  }
}

function uploadFile() {
	window.currentFilename = window.currentFilename ? window.currentFilename : 'newfile';
    	window.currentFilecontent = window.editor.getValue();
	if(window.directory == '') {
        // handle branches off of root
        if(window.virtualDrive[''][window.currentFilename]) {
            if(window.virtualDrive[''][window.currentFilename] instanceof(VirtualFile)) {
                window.virtualDrive[''][window.currentFilename].write(window.currentFilecontent);
            } else {
                stdout.writeln('failed: ' + window.currentFilename + ': is a directory.');
                return;
            }
        } else {
            window.virtualDrive[''][window.currentFilename] = new VirtualFile(window.currentFilename, window.currentFilecontent);
        }
    } else {
        // handle everything else
        let workingdirectorysplit = window.directory.slice(1).split('/');
        
        let completestring = `window.virtualDrive['']`;
        workingdirectorysplit.forEach(element => {
            completestring += `['${element}']`;
        });


        if(eval(completestring + `['${window.currentFilename}']`)) {
            if(eval(completestring + `['${window.currentFilename}']`) instanceof(VirtualFile)) {
                eval(completestring + `['${window.currentFilename}']`).write(window.currentFilecontent);
            } else {
                stdout.writeln('failed: ' + window.currentFilename + ': is a directory.');
                return;
            }
        } else {
            eval(completestring + `['${window.currentFilename}'] = new VirtualFile('${window.currentFilename}', '${window.currentFilecontent}')`)
        }
    }
}

function placeFileContent(target, file) {
	readFileContent(file).then(content => {
  	target.value = content
  }).catch(error => console.log(error))
}

function readFileContent(file) {
	const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = event => resolve(event.target.result)
    reader.onerror = error => reject(error)
    reader.readAsText(file)
  })
}
