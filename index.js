var Imap = require('imap');
var EventEmitter = require('events').EventEmitter;
var MailParser = require("mailparser").MailParser;
var Parser = require('./lib/Parser');

class SimpleImapMail extends EventEmitter {
  constructor(options) {
    super();
    this.uids = [];
    this.isFetchingUnreadMails = false;
    this.setCofigurationOptions(options);
    this.instantiateImap(options);
    this.setEventListeners();

    this.parsedMessage;
  }

  instantiateImap(options) {
    this.imap = new Imap({
      xoauth2: options.xoauth2,
      user: options.username,
      password: options.password,
      host: options.host,
      port: options.port,
      tls: options.tls,
      tlsOptions: options.tlsOptions || {},
      connTimeout: options.connTimeout || null,
      authTimeout: options.authTimeout || null,
      debug: options.debug || null
    });
  }

  processSearchFilterValue(value) {
    if (Array.isArray(value) == true && value.length > 0) {
      return value;
    }

    if (typeof value === 'string') {
      return [value];
    }

    return ['UNSEEN']
  }

  setCofigurationOptions(options) {
    this.markSeen = options.markSeen === true;
    this.mailbox = options.mailbox || "INBOX";
    this.fetchUnreadOnStart = options.fetchUnreadOnStart === true;
    this.mailParserOptions = options.mailParserOptions || {};
    this.attachmentOptions = options.attachmentOptions || {};
    this.attachments = options.attachments || false;
    this.searchFilter = this.processSearchFilterValue(options.searchFilter);

    //
    this.attachmentOptions.directory = (this.attachmentOptions.directory ? this.attachmentOptions.directory : '');

    if (options.attachments && options.attachmentOptions && options.attachmentOptions.stream) {
      this.mailParserOptions.streamAttachments = true;
    }
  }

  setEventListeners() {
    this.imap.once('ready', () => this.imapReady());
    this.imap.once('close', () => this.imapClose());
    this.imap.on('error', (error) => this.imapError(error));
  }

  /** */
  start() {
    this.imap.connect();
  };

  stop() {
    this.imap.end();
  };

  /** */


  imapReady() {
    this.imap.openBox(this.mailbox, false, (err, mailbox) => {
      if (err) {
        this.emit('error', err);
      } else {
        this.emit('server:connected');
        if (this.fetchUnreadOnStart) {
          this.parseUnreadMessages();
        }
        this.imap.on('mail', () => this.imapMail());
        this.imap.on('update', () => this.imapMail());
      }
    });
  }

  imapClose() {
    this.emit('server:disconnected');
  }

  imapError(err) {
    this.emit('error', err);
  }

  imapMail() {
    this.parseUnreadMessages();
  }
  
  parseUnreadMessages() {
    this.imap.search(this.searchFilter, (err, results) => {
      if (err) this.emit('error', err);

      //
      results.forEach(result => this.getMessage(result));
    });
  }

  getMessage(uid) {
    this.imap.search([['UID', uid]], (err, results) => {
      if (err) this.emit('message:error', err);

      if (results.length > 0) {
        let messageFetchQuery = this.imap.fetch(results[0], {
          markSeen: true,
          bodies: ''
        });

        messageFetchQuery.on('message', (message, sequenceNumber) => {
          let parser = new MailParser(this.mailParserOptions);

          message.on('body', body => {
            body.pipe(parser);
          })

          parser.on('headers', headers => Parser.parseHeaders(headers));

          parser.on('data', data => Parser.parseMessageData(data));

          parser.on('end', () => {
            this.emit('message', Parser.getParseResult());
          })

          parser.on('error', error => this.emit('error', error));
        });

        messageFetchQuery.on('error', err => this.emit('message:error', err));
      }
    });
  }
}

module.exports = SimpleImapMail;