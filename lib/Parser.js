/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
 */

class Parser {
    constructor() {
        this.parseResult = {
            attachments: [],
            body: {},
            headers: {}
        };
    }

    getParseResult () {
        return this.parseResult
    }

    parseMessageData(data){
        if (data.type === `attachment`) {
            this.parseAttachment(data);
        }

        if (data.type === 'text') {
            this.parseText(data);
        }
    }

    parseAttachment(data){
        const attachmentInfo = {
            filename: data.filename,
            contentType: data.contentType,
            partId: data.partId,
            attachmentId: data.contentId
        };

        let attachment = [];
        data.content.on('data', data => {
            attachment.push(data);
        });

        data.content.on('end', () => {
            attachment = Buffer.concat(attachment);

            this.parseResult.attachments.push({
                ...attachmentInfo,
                content: Buffer.from(attachment).toString('base64')
            });

            // Must be called.
            data.release();
        })
    }

    parseHeaders(headers) {
        this.parseResult.headers = headers;
    } 

    parseText(data) {
        this.parseResult.body = {
            type: data.type,
            text: data.text,
            html: data.html
        }
    }
}

module.exports = new Parser;