var SimpleImap = require("./");

var simpleImap = new SimpleImap({
  username: "softwaredirector@nacoss.org.ng",
  password: "nathaneil.nacoss.0110",
  host: "mail.nacoss.org.ng",
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

