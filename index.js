const nodemailer = require('nodemailer'),
	fs = require('fs'),
    path = require('path');

function malta_notify(o, options) {
    
	const self = this,
		paramFile = path.dirname(self.tplPath) + '/' + options.configFile,
		exists = fs.existsSync(paramFile),
		start = new Date(),
		isEmail = function (email) {
			return email.match(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
		},
        pluginName = path.basename(path.dirname(__filename));

    let params,
        transporter,
        mailOptions = {},
        msg = [];

    if (!exists) {
        return solve => {
	        solve(o);
			self.notifyAndUnlock(start, `file ${paramFile} doesn\`t exists`.red());
		}; 
    }
    
    params = require(paramFile);

    // check
	//
    if (!('to' in options)) msg.push('The `to` parameter is mandatory in plugin parameters')
    
    msg = ['account', 'pwd', 'from', 'smtp', 'port', 'subject'].reduce((acc, field) => {
        if (!(field in params)) acc.push(`The "${field}" parameter is mandatory in config file`)
        return acc
    }, [])
    
    if (!('to' in options)) {
		msg.push('No `to` parameter provided');
	} else if (!isEmail(options.to)) {
		msg.push('The `to` parameter provided does not contain a valid email');
	}
	if (msg.length) {
		return solve => {
	        solve(o);
			self.notifyAndUnlock(start, msg.join("\n").red());
		};
    }

	mailOptions = {
	    from: params.from,
	    to: options.to || '',
	    subject: params.subject.replace(/%fname%/, self.outName)
	};

    transporter = nodemailer.createTransport({
        host: params.smtp,
        port: params.port,
        secure: params.port == 465,
        auth: {
            user: params.account, 
            pass: params.pwd,
        },
      });

	mailOptions.txt = params.content.txt.replace(/%content%/, o.content);
    mailOptions.html = params.content.html.replace(/%content%/, o.content);
    

	return (solve, reject) => {
        
		transporter.sendMail(mailOptions, (err, info) => {
            err && console.log(err)
            err && self.doErr(err, o, pluginName);
			msg = `plugin ${pluginName.white()} sent message to ${mailOptions.to} (${info.response})`;
			err
                ? reject(`Plugin ${pluginName} error:\n${JSON.stringify(err)}`)
                : solve(o);
			self.notifyAndUnlock(start, msg);
		});
	};
}
module.exports = malta_notify;