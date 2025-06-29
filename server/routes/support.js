
import express from 'express';

const router = express.Router();


router.get('/faqs', (req, res) => {
  
  const faqs = [
    { question: "How do I schedule a session?", answer: "Go to the scheduling page and fill out the form." },
    { question: "How do I contact my therapist?", answer: "Use the contact form in the support section." }
  ];
  res.json(faqs);
});

export default router;
