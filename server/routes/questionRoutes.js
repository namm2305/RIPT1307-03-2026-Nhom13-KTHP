const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getQuestions,
    getQuestionById,
    voteQuestion,
    getComments,
    addComment,
    voteComment,
    deleteComment
} = require('../controllers/questionController');

router.get('/', getQuestions);
router.get('/:id', getQuestionById);
router.put('/:id/vote', protect, voteQuestion);
router.get('/:id/comments', getComments);
router.post('/:id/comments', protect, addComment);
router.put('/:id/comments/:commentId/vote', protect, voteComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;
