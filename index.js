const Twitter = require('twitter');
const moment = require('moment');
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const messages = require('./messages');

const env = process.env;
const SINCE_TIME_DURATION = env.SINCE_TIME_DURATION || 1;
const SINCE_TIME_UNIT = env.SINCE_TIME_UNIT || "hours";

const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

function updateTotal(tweet) {
    const params = {
        TableName: "LearnToCodesTwitterBot",
        Key: {
            "handle": tweet.user.id_str,
        },
        UpdateExpression: "ADD #count :increment, #chain :reset SET #screen_name = :screen_name, #last_tweet_date = :last_tweet_date",
        ExpressionAttributeNames: {
            "#count": "count",
            "#chain": "chain",
            "#screen_name": "screen_name",
            "#last_tweet_date": "last_tweet_date"
        },
        ExpressionAttributeValues: {
            ":increment": 1,
            ":reset": 0,
            ":screen_name": tweet.user.screen_name,
            ":last_tweet_date": tweet.created_at.startOf("day").valueOf(),
            ":yesterdays_date": tweet.created_at.startOf("day").subtract(1, 'days').valueOf(),
        },
        ConditionExpression: "#last_tweet_date < :yesterdays_date",
        ReturnValues: "UPDATED_NEW"
    };
    return docClient.update(params).promise().then(function (response) {
        let totalCount = response.Attributes.count;
        if (totalCount % 5 === 0) {
            let toTweet = randomTotalMessages()(tweet.user.screen_name, totalCount);
            console.log("TWEET: " + toTweet);
            console.log(JSON.stringify({totalTweet: 1}));
            return client.post('statuses/update', {
                status: toTweet,
                in_reply_to_status_id: tweet.id_str
            });
        }
    }).catch(e => {
    });
}

function updateChain(tweet) {
    const params = {
        TableName: "LearnToCodesTwitterBot",
        Key: {
            "handle": tweet.user.id_str,
        },
        UpdateExpression: "ADD #count :increment, #chain :increment SET #screen_name = :screen_name, #last_tweet_date = :last_tweet_date",
        ExpressionAttributeNames: {
            "#count": "count",
            "#chain": "chain",
            "#screen_name": "screen_name",
            "#last_tweet_date": "last_tweet_date"
        },
        ExpressionAttributeValues: {
            ":increment": 1,
            ":screen_name": tweet.user.screen_name,
            ":last_tweet_date": tweet.created_at.startOf("day").valueOf(),
            ":yesterdays_date": tweet.created_at.startOf("day").subtract(1, 'days').valueOf(),
        },
        ConditionExpression: "attribute_not_exists(#last_tweet_date) OR #last_tweet_date = :yesterdays_date",
        ReturnValues: "UPDATED_NEW"
    };
    return docClient.update(params).promise().then(function (response) {
        let chainCount = response.Attributes.chain;
        if (chainCount > 1 && isFibonacci(chainCount)) {
            let toTweet = randomChainMessage()(tweet.user.screen_name, chainCount);
            console.log("TWEET: " + toTweet);
            console.log(JSON.stringify({chainTweet: 1}));
            return client.post('statuses/update', {
                status: toTweet,
                in_reply_to_status_id: tweet.id_str
            });
        }
    }).catch(e => {
    });
}

function randomChainMessage() {
    return messages.chain[Math.floor(Math.random() * messages.chain.length)];
}

function randomTotalMessages() {
    return messages.total[Math.floor(Math.random() * messages.total.length)];
}

function isPerfectSquare(x) {
    let s = Math.sqrt(x);
    return (s * s === x);
}

function isFibonacci(n) {
    return isPerfectSquare(5 * n * n + 4) ||
        isPerfectSquare(5 * n * n - 4);
}

exports.handler = function (event, context, callback) {

    return findTweets("#LearnToCode")
        .then(tweets => {
            console.log(JSON.stringify({"foundTweets": tweets.length}));
            return Promise.all(tweets.map(tweet => {
                return Promise.all([updateTotal(tweet), updateChain(tweet)]);
            }));
        }).catch(function (error) {
            console.error(error);
            callback(error, null);
        })
        .then(function () {
            callback(null, null);
        });

};

function findTweets(query) {
    return client.get('search/tweets', {q: query, count: 100})
        .then(function (tweets) {
            return tweets.statuses
                .filter((tweet) => tweet.user.screen_name !== 'LearnToCodes')
                .filter(function (tweet) {
                    tweet.created_at = moment(tweet.created_at, "ddd MMM DD HH:mm:ss ZZ YYYY");
                    return tweet.created_at.isAfter(moment().subtract(SINCE_TIME_DURATION, SINCE_TIME_UNIT));
                })
        });
}