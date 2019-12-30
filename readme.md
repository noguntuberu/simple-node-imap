# Overview

Simple imap library for node.js. Get new mail notifications and fetch individual messages from mailboxes. Uses IMAP protocol.

An extension of [mail-listener2](https://github.com/chirag04/mail-listener2).


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
  attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments
});

simpleImap.start(); // start listening

// stop listening
//simpleImap.stop();

simpleImap.on("server:connected", function(){
  console.log("imapConnected");
});

simpleImap.on("server:disconnected", function(){
  console.log("imapDisconnected");
});

simpleImap.on("error", function(err){
  console.log(err);
});

simpleImap.on("message:error", function(err){
  console.log('message error', err);
});

simpleImap.on("message", (message, seqno, attributes) => {
  console.log(message);
});

simpleImap.on("message:attachment", function(attachment){
  console.log(attachment);
});

```

## Attachments

Attachments can be streamed or buffered. This feature is based on how [mailparser](https://github.com/andris9/mailparser#attachments) handles attachments.
Setting `attachments: true` will download attachments as buffer objects by default to the project directory.
A specific download directory may be specified by setting `attachmentOptions: { directory: "attachments/"}`.
Attachments may also be streamed using `attachmentOptions: { stream: "true"}`. The `"attachment"` event will be fired every time an attachment is encountered.
Refer to the [mailparser docs](https://github.com/andris9/mailparser#attachment-streaming) for specifics on how to stream attachments.

## License

MIT

## Credit

A special shoutout to [Chirag](https://github.com/chirag04) for creating mail-listener2 and this README which I extended/edited.