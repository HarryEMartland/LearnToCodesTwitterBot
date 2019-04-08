exports.chain = [
    (username, days) => `Wow @${username} you have been learning to code ${days} days in a row! Keep it up!`,
    (username, days) => `${days} days in a row! Are you some kind of learning machine @${username}?`
];

exports.total = [
    (username, days) => `Wow you have been learning a total of ${days} days @${username}`,
    (username, days) => `Hey all, @${username} has been learning for ${days} days`,
    (username, days) => `Guess who has been learning for ${days} days?... its @${username}`,
    (username, days) => `Want to learn to code? Follow @${username} as they have been doing it for ${days} days`,
    (username, days) => `Keep up the good work @${username}! That's ${days} days learning to code`
];