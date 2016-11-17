require('malta').checkDeps('nodemailer');

var nodemailer = require('nodemailer'),
	fs = require('fs'),
    path = require('path'),
	oldContent = false;

function malta_notify(o, options) {
	var self = this,
		params,
		paramFile = path.dirname(self.tplPath) + '/' + options.configFile,
		exists = fs.existsSync(paramFile),
		transporter,
		mailOptions = {},
		msg = [],
		start = new Date(),
		isEmail = function (email) {
			return email.match(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
		},
        pluginName = path.basename(path.dirname(__filename)),
		doErr = function (e) {
			console.log(('[ERROR on ' + o.name + ' using ' + pluginName + '] :').red());
			console.dir(e);
			self.stop();
		};

    if (!exists) {
        msg = 'file ' + paramFile + ' doesn`t exists'; 
        return function (solve) {
	        solve(o);
			self.notifyAndUnlock(start, msg.red());
		}; 
    }
    
    params = require(paramFile);

    // check
	//
	if (!('to' in options)) {
		msg.push('No `to` parameter provided');
	} else if (!isEmail(options.to)) {
		msg.push('The `to` parameter provided does not contain a valid email');
	}
	if (msg.length) {
		return function (solve) {
	        solve(o);
			self.notifyAndUnlock(start, msg.join("\n").red());
		};
	}

	mailOptions = {
	    from: params.from,
	    to: options.to || '',
	    subject: params.subject.replace(/%fname%/, self.outName)
	};

	transporter = nodemailer.createTransport('smtps://' + encodeURIComponent(params.account) + ':' + params.pwd + '@' + params.smtp);

	mailOptions.txt = params.content.txt.replace(/%content%/, o.content);
	mailOptions.html = params.content.html.replace(/%content%/, o.content);

	if (oldContent && oldContent !== o.content){
		mailOptions.txt += params.oldContent.txt.replace(/%oldContent%/, oldContent);
		mailOptions.html += params.oldContent.html.replace(/%oldContent%/, oldContent);
	}
	 
	return function (solve, reject){
		transporter.sendMail(mailOptions, function(err, info) {
		    err && doErr(err);
		    msg = 'Message sent to ' + options.to + ': ' + info.response;
		    solve(o);
		    self.notifyAndUnlock(start, msg.darkgray());
		    oldContent = o.content;
		});
	};
}
module.exports = malta_notify;