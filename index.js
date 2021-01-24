const https = require('https')
const cheerio = require('cheerio');
const aws = require('aws-sdk');
const ses = new aws.SES({ region: process.env.AWS_REGION });
const url = process.env.APT_URL

exports.handler = function (event, context, callback) {
    
    // run the check only during working hours
    const localDate = (new Date).toLocaleString('en-US', { timeZone: 'America/Chicago' });
    const localHours = (new Date(localDate)).getHours();

    if (localHours > 18 && localHours < 9) {
        return;
    }

    https.get(url, (res) => {

        let body = ''
        res.on('data', (d) => {
            body += d;
        });

        // page retieved
        res.on('end', () => {

            const availability = getAvailability(body)

            callback(null, {
                'res.statusCode': res.statusCode,
                'result': JSON.stringify(availability)
            })

        })

        // TODO if apt found - only one email should be send, not the one per each sheduler call
        // TODO if apt found but it doesn't fit - exclude it from the list to don't get spammed
        const getAvailability = (body) => {
            const $ = cheerio.load(body)
            const apartments = []
            let availability = null
            let context = `#floorplanlist`

            // 2, 4, 6 - magic numbers refers to positions in the list for 1 bedroom apts wth fenced yard
            for (i = 2; i <= 6; i = i + 2) {
                let apartment = {}
                apartment.type = $(`[data-selenium-id='FPlan_${i}] > a`, context).text()
                apartment.price = $(`[data-selenium-id='Rent_${i}]`, context).text()
                apartments.push(apartment)

                if (apartment.price !== 'Call for Details') {
                    availability = `${apartment.type} for ${apartment.price}`
                }
            }

            if(availability === null) {
                return;
            }

            const message = {
                'subject': 'Fenced Yard Is Available!',
                'text': `${availability}<br><a href="${url}">check here</a>` 
            }

            sendMail(message)

            return ({ availability, apartments })
        }

        const sendMail = async (message) => {
            const {text, subject} = message
            const params = {
                Destination: {
                    ToAddresses: [process.env.MY_EMAIL],
                },
                Message: {
                    Body: {
                        Html: { Data: text},
                    },

                    Subject: { Data: subject},
                },
                Source: process.env.MY_EMAIL,
            };

            return ses.sendEmail(params).promise()
        }

    }).on('error', (e) => {
        callback(Error(e))
    })
}