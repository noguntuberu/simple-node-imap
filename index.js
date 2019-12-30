var Imap = require('imap');
var EventEmitter = require('events').EventEmitter;
var MailParser = require("mailparser").MailParser;
var fs = require("fs");
var path = require('path');
var async = require('async');

class MailListener extends EventEmitter {
  constructor(options) {
    super();
    this.uids = [];
    this.isFetchingUnreadMails = false;
    this.setCofigurationOptions(options);
    this.instantiateImap(options);
    this.setEventListeners();

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
    this.markSeen = options.markSeen || true;
    this.mailbox = options.mailbox || "INBOX";
    this.fetchUnreadOnStart = options.fetchUnreadOnStart || true;
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
    this.imap.on('error', () => this.imapError());
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
          let attributes = null;
          let messageBuffer = Buffer.alloc(2084, '');

          parser.on('end', mail => {
            mail.message = messageBuffer.toString('UTF-8');

            if (!this.mailParserOptions.streamAttachments && mail.attachments && this.attachments) {
              async.each(mail.attachments, attachment => {
                const specifiedFilePath = this.attachmentOptions.directory + attachment.generatedFileName;
                fs.writeFile(specifiedFilePath, attachment.content, err => {
                  if (err) this.emit('message:error', err);
                  else {
                    attachment.path = path.resolve(specifiedFilePath);
                    this.emit('message:attachment', attachment);
                  }
                });
              }, err => this.emit('message', mail, sequenceNumber, attributes));
            } else this.emit('message', mail, sequenceNumber, attributes);
          });

          parser.on('attachment', attachment => this.emit('message:attachment', attachment));

          message.on('body', (stream, info) => {
            stream.on('data', chunk => {
              messageBuffer =  Buffer.concat([messageBuffer, chunk]);
            });
            stream.once('end', () => {
              parser.write(messageBuffer);
              parser.end();
            })
          });

          message.on('attributes', attr => attributes = attr);
        });

        messageFetchQuery.on('error', err => this.emit('message:error', err));
      }
    });
  }
}

module.exports = MailListener;