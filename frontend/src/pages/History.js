import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { History as HistoryIcon, BookOpen, Brain, Languages, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const History = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const [quizzesRes, studyRes, transRes] = await Promise.all([
        axios.get(`${API}/quiz/history`),
        axios.get(`${API}/study/history`),
        axios.get(`${API}/translate/history`),
      ]);
      setQuizzes(quizzesRes.data);
      setStudySessions(studyRes.data);
      setTranslations(transRes.data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-6" data-testid="history-page">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-6">
            <HistoryIcon className="w-8 h-8 text-primary-foreground" strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4" data-testid="history-title">
            Learning History
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Review your past quizzes, study sessions, and translations
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20" data-testid="loading-indicator">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="quizzes" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-14 rounded-full p-1 bg-muted" data-testid="history-tabs">
              <TabsTrigger value="quizzes" className="rounded-full" data-testid="quizzes-tab">
                <BookOpen className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Quizzes ({quizzes.length})
              </TabsTrigger>
              <TabsTrigger value="study" className="rounded-full" data-testid="study-tab">
                <Brain className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Study ({studySessions.length})
              </TabsTrigger>
              <TabsTrigger value="translations" className="rounded-full" data-testid="translations-tab">
                <Languages className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Translations ({translations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quizzes" className="mt-8 space-y-6" data-testid="quizzes-content">
              {quizzes.length === 0 ? (
                <Card className="bg-card border-border/50">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No quizzes taken yet. Start by creating your first quiz!</p>
                  </CardContent>
                </Card>
              ) : (
                quizzes.map((quiz, index) => (
                  <Card key={index} className="bg-card border-border/50 hover:shadow-lg transition-all duration-300" data-testid={`quiz-item-${index}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="font-serif text-xl mb-2">{quiz.subject}</CardTitle>
                          <CardDescription>
                            <span className="capitalize">{quiz.difficulty}</span> • {quiz.questions.length} questions
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {new Date(quiz.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {quiz.questions.slice(0, 2).map((q, qIndex) => (
                          <div key={qIndex} className="text-sm text-muted-foreground">
                            <span className="font-medium">Q{qIndex + 1}:</span> {q.question.substring(0, 80)}...
                          </div>
                        ))}
                        {quiz.questions.length > 2 && (
                          <p className="text-sm text-muted-foreground italic">+{quiz.questions.length - 2} more questions</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="study" className="mt-8 space-y-6" data-testid="study-content">
              {studySessions.length === 0 ? (
                <Card className="bg-card border-border/50">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No study sessions yet. Start learning with Study Buddy!</p>
                  </CardContent>
                </Card>
              ) : (
                studySessions.map((session, index) => (
                  <Card key={index} className="bg-card border-border/50 hover:shadow-lg transition-all duration-300" data-testid={`study-item-${index}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="font-serif text-xl flex-1">{session.concept}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-3">
                        {session.explanation}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="translations" className="mt-8 space-y-6" data-testid="translations-content">
              {translations.length === 0 ? (
                <Card className="bg-card border-border/50">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No translations yet. Try the Language Tutor!</p>
                  </CardContent>
                </Card>
              ) : (
                translations.map((trans, index) => (
                  <Card key={index} className="bg-card border-border/50 hover:shadow-lg transition-all duration-300" data-testid={`translation-item-${index}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="font-serif text-xl mb-2">{trans.phrase}</CardTitle>
                          <CardDescription className="text-base">
                            {trans.source_lang} → {trans.target_lang}
                          </CardDescription>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(trans.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Translation:</p>
                          <p className="text-lg font-medium">{trans.translation}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Cultural Context:</p>
                          <p className="text-muted-foreground line-clamp-2">{trans.cultural_context}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default History;