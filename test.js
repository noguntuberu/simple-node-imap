var SimpleImap = require("./");

var simpleImap = new SimpleImap({
  username: "test_username",
  password: "********",
  host: "your_host",
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
  mailbox: "INBOX",
  markSeen: true,
  fetchUnreadOnStart: true,
  attachments: true,
  // attachmentOptions: { directory: "attachments/" }
});

simpleImap.start();

simpleImap.on("server:connected", () => {
  console.log("imapConnected");
});

simpleImap.on("server:disconnected", () => {
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

