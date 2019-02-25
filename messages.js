exports.chain = [
    (username, days) => `Wow @${username} you have #LearnToCode ${days} days in a row! Keep it up!`,
    (username, days) => `${days} days in a row! Are you some kind of #LearnToCode machine @${username}?`
];

exports.total = [
    (username, days) => `Wow you have #LearnToCode a total of ${days} days @${username}`,
    (username, days) => `Hey #LearnToCode @${username} has been learning for ${days} days`,
    (username, days) => `Guess who has been learning for ${days} days?... its @${username} #LearnToCode`,
    (username, days) => `Want to #LearnToCode? Follow @${username} as they have been doing it for ${days} days`,
    (username, days) => `Keep up the good work @${username}! That's ${days} days trying to #LearnToCode`
];