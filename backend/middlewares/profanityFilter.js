// List of bad words to filter. In a real app, this would be more extensive.
const bannedWords = ['badword', 'idiot', 'stupid', 'curse', 'offensive', 'spam', 'trash', 'garbage', 'f*ck', 's*it'];

const profanityFilter = (req, res, next) => {
    const { comment } = req.body;
    
    if (!comment) return next();

    const lowerComment = comment.toLowerCase();
    const containsProfanity = bannedWords.some(word => lowerComment.includes(word));

    if (containsProfanity) {
        // Flag the review status as Blocked in the request body for the controller to handle
        req.reviewStatus = 'Blocked';
        req.isFlagged = true;
    } else {
        req.reviewStatus = 'Published';
        req.isFlagged = false;
    }
    
    next();
};

module.exports = profanityFilter;
