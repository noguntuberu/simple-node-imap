var SimpleImap = require("./");

var simpleImap = new SimpleImap({
  username: "username",
  password: "password",
  host: "host",
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
  mailbox: "INBOX",
  markSeen: false,
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

simpleImap.on("message", (message, seqno, attributes) => {
  console.log(message);
});


