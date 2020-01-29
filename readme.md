# Overview

Simple imap module for node.js.

## Use

Install

`npm install simple-node-imap`


JavaScript Code:


```javascript

var SimpleImap = require("simple-node-imap");

var simpleImap = new SimpleImap({
  username: "imap-username",
  password: "imap-password",
  host: "imap-host",
  port: 993, // imap port
  tls: true,
  connTimeout: 10000, // Default by node-imap
  authTimeout: 5000, // Default by node-imap,
  debug: console.log, // Or your custom function with only one incoming argument. Default: null
  tlsOptions: { rejectUnauthorized: false },
  mailbox: "INBOX", // mailbox to monitor
  searchFilter: ["UNSEEN", "FLAGGED"], // the search filter being used after an IDLE notification has been retrieved
  markSeen: true, // all fetched email willbe marked as seen and not fetched next time
  fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
  mailParserOptions: {streamAttachments: true}, // options to be passed to mailParser lib.
  attachments: true, // download attachments as they are encountered to the project directory
});

simpleImap.start(); // start listening


simpleImap.on("server:connected", () => {
  console.log("imapConnected");
});

simpleImap.on("server:disconnected", () => {
  console.log("imapDisconnected");
});

simpleImap.on("error", err => {
  console.log(err);
});

//
simpleImap.on("message", message => {
  console.log(message);
});


// stop listening
simpleImap.stop();

```

## Attachments

Attachments are converted into base64 strings.

## License

MIT