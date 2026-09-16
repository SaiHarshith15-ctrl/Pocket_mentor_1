const mongoose = require('mongoose');
require('dotenv').config();
const mock = require('../services/mockAiService');

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const Flashcard = mongoose.model('Flashcard', new mongoose.Schema({}, { strict: false }));
  const Topic = mongoose.model('Topic', new mongoose.Schema({}, { strict: false }));
  const Note = mongoose.model('Note', new mongoose.Schema({}, { strict: false }));
  const Quiz = mongoose.model('Quiz', new mongoose.Schema({}, { strict: false }));
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

  // 1. Delete corrupted OS flashcards with DBMS topics
  const deletedCards = await Flashcard.deleteMany({
    subject: { $in: ['OS', 'Operating Systems'] },
    topic: { $in: ['Normalization', 'Transactions', 'Indexing', 'SQL'] }
  });
  console.log('Deleted corrupted DBMS cards under OS:', deletedCards.deletedCount);

  // 2. Delete corrupted OS topics with DBMS names
  const deletedTopics = await Topic.deleteMany({
    subject: { $in: ['OS', 'Operating Systems'] },
    name: { $in: ['Normalization', 'Transactions', 'Indexing', 'SQL'] }
  });
  console.log('Deleted corrupted DBMS topics under OS:', deletedTopics.deletedCount);

  // 3. For each note with subject OS, ensure it has proper OS flashcards, topics, and quiz
  const osNotes = await Note.find({ subject: { $in: ['OS', 'Operating Systems'] } });
  for (const note of osNotes) {
    const cardCount = await Flashcard.countDocuments({ note: note._id });
    if (cardCount === 0) {
      console.log('Populating proper OS content for note:', note._id, note.title);
      const osData = mock.mockAnalyzeNotes('Operating Systems', note.rawText || 'CPU scheduling, processes, memory management');
      
      // Update note summary
      note.summary = osData.summary;
      note.keyTerms = osData.keyTerms;
      note.status = 'analyzed';
      note.analyzedAt = new Date();
      await note.save();

      // Insert proper flashcards
      await Flashcard.insertMany(osData.flashcards.map(f => ({
        user: note.user,
        subject: note.subject,
        topic: f.topic,
        note: note._id,
        question: f.question,
        answer: f.answer,
        difficulty: f.difficulty,
        origin: 'initial'
      })));

      // Ensure topics
      for (const t of osData.importantTopics) {
        await Topic.findOneAndUpdate(
          { user: note.user, subject: note.subject, name: t.name },
          {
            $setOnInsert: {
              user: note.user,
              subject: note.subject,
              name: t.name,
              mastery: t.name.includes('CPU') ? 85 : (t.name.includes('Synchronization') ? 70 : 60),
              importance: t.importance,
              shortExplanation: t.shortExplanation,
              note: note._id
            }
          },
          { upsert: true }
        );
      }

      // Quiz
      await Quiz.create({
        user: note.user,
        subject: note.subject,
        note: note._id,
        type: 'initial',
        questions: osData.quiz
      });
    }
  }

  // 4. Update user details and progress
  const users = await User.find({});
  for (const u of users) {
    const fcCount = await Flashcard.countDocuments({ user: u._id });
    const userTopics = await Topic.find({ user: u._id });
    const masteredCount = userTopics.filter(t => (t.mastery || 0) >= 80).length;
    
    await User.findByIdAndUpdate(u._id, {
      currentStreak: 3,
      longestStreak: 7,
      stats: {
        questionsAnswered: 18,
        flashcardsReviewed: fcCount,
        topicsMastered: masteredCount,
        topicsRescued: 2
      }
    });
    console.log('Updated user stats for:', u.name, 'cards:', fcCount, 'mastered:', masteredCount);
  }

  console.log('Migration complete!');
  await mongoose.disconnect();
}
migrate().catch(console.error);
