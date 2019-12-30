var MailListener = require("./");

var mailListener = new MailListener({
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

mailListener.start();

mailListener.on("server:connected", () => {
  console.log("imapConnected");
});

mailListener.on("server:disconnected", () => {
  console.log("imapDisconnected");
});

mailListener.on("error", function(err){
  console.log(err);
});

mailListener.on("message:error", function(err){
  console.log('message error', err);
});

mailListener.on("message", (message, seqno, attributes) => {
  console.log(message);
});

mailListener.on("message:attachment", function(attachment){
  console.log(attachment);
});

