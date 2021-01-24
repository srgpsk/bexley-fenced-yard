# Dogs stuff
## Check for fenced yard apartments availability in my apartments complex


1. Install AWS CLI or [deploy with ZIP file](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html). 
All the not native external dependecies like Cheerio should be uploaded.
Upload is under Function Code > Actions.  

2. [Create a "lambda function"](https://docs.aws.amazon.com/lambda/latest/dg/getting-started-create-function.html).

3. Create Environment variables (below on the same page where the function editor is) 

- MY_EMAIL
- APT_URL

4. In Basic settings increase Timeout - 10 sec is enough (on the same page below)

5. Create IAM user (acc with limited access), IAM policy and assign it to execution role, confirm SES identity - all those to send emails [docs](https://aws.amazon.com/premiumsupport/knowledge-center/lambda-send-email-ses/)

Make sure everything is authorized to run and runs under the same `process.env.AWS_REGION`. 

It will fail otherwise.

6. Set `testRun` to `true`

7. `Deploy` && `Test`

Make sure emails are not ending up in the Spam folder. (or go and do all the stuff to have valid mail sender) 

8. [Schedule](https://docs.aws.amazon.com/eventbridge/latest/userguide/run-lambda-schedule.html) a test for the function call e.g. "every 5 min"

9. Finally.

- Make sure everything is working.

- Set `testRun` to `false`. Deploy!

- Re-schedule the function call to every 30 min.

10. Done.


P.S. They could just allow current residents to apply to waiting lists and I won't have todo all of this.