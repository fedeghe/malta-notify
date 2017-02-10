This plugin can be used on all files  

Options :  
    - **configFile** : path for a json file that is expected to contain all information needed to send the email, this path is relative to the template folder:  
``` json
{
    "smtp" : "smtp.xxxxxxxx.com",
    "account" : "xxxxxxxxxxxxxxxxx@gmail.com",
    "pwd": "xxxxxxxxxxxxxx",
    "from" : "'xxxxxxx yyyyyyy 👥'' <xxxxxxxxxxx@gmail.com>",
    "subject" : "%fname% compiled",
    "content" : {
        "txt" : "The new content is :\n\n\n%content%",
        "html" : "<b>The new  content is:</b><br/><br/><br/><textarea style=\"width:100%;height:500px;background-color:#444;color:#0f0;font-size:2em\">%content%</textarea>"
    },
    "oldContent" : {
        "txt" : "The old content was :\n\n\n%oldContent%",
        "html" : "<b>The old content was:</b><br/><br/><br/><textarea style=\"width:100%;height:500px;background-color:#444;color:#ff0;font-size:2em\">%oldContent%</textarea>"
    }  
}
```
then the destination address: 
    - **to** : a valid email address  

Sample usage:  
```
malta app/source/index.js public/docs -plugins=malta-notify[configFile:\"mailer/params.json\",to:\"fedeghe@gmail.com\"]
```
or in the .json file :
```
"app/source/index.js" : "public/docs -plugins=malta-notify[configFile:\"mailer/params.json\",to:\"fedeghe@gmail.com\"]"
```
or in a script : 
``` js
var Malta = require('malta');
Malta.get().check([
    'app/source/index.js',
    'public/docs',
    '-plugins=malta-notify[configFile:\"mailer/params.json\",to:\"fedeghe@gmail.com\"]',
    '-options=showPath:false,watchInterval:500,verbose:0'
    ]).start(function (o) {
        var s = this;
        console.log('name : ' + o.name)
        console.log("content : \n" + o.content);
        'plugin' in o && console.log("plugin : " + o.plugin);
        console.log('=========');
    });
```