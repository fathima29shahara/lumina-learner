import React, { useState } from 'react';
import axios from 'axios';
import { BookOpen, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const QuizBuilder = () => {
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const generateQuiz = async (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    setLoading(true);
    setQuiz(null);
    setSelectedAnswers({});
    setShowResults(false);

    try {
      const response = await axios.post(`${API}/quiz/generate`, {
        subject,
        difficulty,
        num_questions: numQuestions,
      });
      setQuiz(response.data);
      toast.success('Quiz generated successfully!');
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answer,
    });
  };

  const submitQuiz = () => {
    setShowResults(true);
    const correctCount = quiz.questions.filter(
      (q, index) => selectedAnswers[index] === q.correct_answer
    ).length;
    toast.success(`You scored ${correctCount} out of ${quiz.questions.length}!`);
  };

  const resetQuiz = () => {
    setQuiz(null);
    setSelectedAnswers({});
    setShowResults(false);
    setSubject('');
  };

  return (
    <div className="min-h-screen py-12 px-6" data-testid="quiz-builder-page">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-6">
            <BookOpen className="w-8 h-8 text-primary-foreground" strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4" data-testid="quiz-builder-title">
            Quiz Builder
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Generate personalized quizzes on any subject with AI
          </p>
        </div>

        {!quiz && (
          <Card className="bg-card border-border/50 shadow-lg" data-testid="quiz-form-card">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Create Your Quiz</CardTitle>
              <CardDescription>Enter a subject and customize your quiz settings</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={generateQuiz} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-base font-medium">Subject</Label>
                  <Input
                    id="subject"
                    data-testid="subject-input"
                    type="text"
                    placeholder="e.g., Physics basics, World History, JavaScript..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="h-12 text-base rounded-lg border-2"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">Difficulty Level</Label>
                  <RadioGroup value={difficulty} onValueChange={setDifficulty} data-testid="difficulty-selector">
                    <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-input hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="easy" id="easy" data-testid="difficulty-easy" />
                      <Label htmlFor="easy" className="flex-1 cursor-pointer font-normal">Easy - Basic concepts</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-primary bg-secondary/30">
                      <RadioGroupItem value="medium" id="medium" data-testid="difficulty-medium" />
                      <Label htmlFor="medium" className="flex-1 cursor-pointer font-normal">Medium - Intermediate level</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-input hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="hard" id="hard" data-testid="difficulty-hard" />
                      <Label htmlFor="hard" className="flex-1 cursor-pointer font-normal">Hard - Advanced topics</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numQuestions" className="text-base font-medium">Number of Questions</Label>
                  <Input
                    id="numQuestions"
                    data-testid="num-questions-input"
                    type="number"
                    min="3"
                    max="10"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                    className="h-12 text-base rounded-lg border-2"
                  />
                </div>

                <Button
                  type="submit"
                  data-testid="generate-quiz-button"
                  disabled={loading}
                  className="w-full h-14 text-base rounded-full font-medium hover:-translate-y-1 transition-all duration-300 shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Quiz...
                    </>
                  ) : (
                    'Generate Quiz'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {quiz && (
          <div className="space-y-6" data-testid="quiz-display">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">{quiz.subject}</CardTitle>
                <CardDescription className="text-base">
                  Difficulty: <span className="capitalize font-medium">{quiz.difficulty}</span> • {quiz.questions.length} Questions
                </CardDescription>
              </CardHeader>
            </Card>

            {quiz.questions.map((question, qIndex) => (
              <Card key={qIndex} className="bg-card border-border/50 hover:shadow-lg transition-all duration-300" data-testid={`question-card-${qIndex}`}>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">
                    <span className="text-muted-foreground mr-2">Q{qIndex + 1}.</span>
                    {question.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {question.options.map((option, oIndex) => {
                    const isSelected = selectedAnswers[qIndex] === option;
                    const isCorrect = option === question.correct_answer;
                    const showCorrect = showResults && isCorrect;
                    const showIncorrect = showResults && isSelected && !isCorrect;

                    return (
                      <button
                        key={oIndex}
                        data-testid={`question-${qIndex}-option-${oIndex}`}
                        onClick={() => !showResults && handleAnswerSelect(qIndex, option)}
                        disabled={showResults}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-300 ${
                          showCorrect
                            ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                            : showIncorrect
                            ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                            : isSelected
                            ? 'border-primary bg-secondary'
                            : 'border-input hover:border-primary hover:bg-secondary/30'
                        } ${showResults ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" strokeWidth={2} />}
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            ))}

            <div className="flex gap-4">
              {!showResults && (
                <Button
                  onClick={submitQuiz}
                  data-testid="submit-quiz-button"
                  disabled={Object.keys(selectedAnswers).length !== quiz.questions.length}
                  className="flex-1 h-14 text-base rounded-full font-medium hover:-translate-y-1 transition-all duration-300 shadow-lg"
                >
                  Submit Quiz
                </Button>
              )}
              <Button
                onClick={resetQuiz}
                data-testid="new-quiz-button"
                variant="outline"
                className="flex-1 h-14 text-base rounded-full font-medium hover:-translate-y-1 transition-all duration-300 border-2"
              >
                {showResults ? 'Create New Quiz' : 'Cancel'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizBuilder;