import React, { useState } from 'react';
import axios from 'axios';
import { Brain, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StudyBuddy = () => {
  const [concept, setConcept] = useState('');
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);

  const getExplanation = async (e) => {
    e.preventDefault();
    if (!concept.trim()) {
      toast.error('Please enter a concept to study');
      return;
    }

    setLoading(true);
    setExplanation(null);

    try {
      const response = await axios.post(`${API}/study/explain`, {
        concept,
      });
      setExplanation(response.data);
      toast.success('Explanation generated!');
    } catch (error) {
      console.error('Error getting explanation:', error);
      toast.error('Failed to get explanation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setExplanation(null);
    setConcept('');
  };

  return (
    <div className="min-h-screen py-12 px-6" data-testid="study-buddy-page">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-full mb-6">
            <Brain className="w-8 h-8 text-accent-foreground" strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4" data-testid="study-buddy-title">
            Study Buddy
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Get clear, step-by-step explanations for any concept
          </p>
        </div>

        {!explanation && (
          <Card className="bg-card border-border/50 shadow-lg" data-testid="study-form-card">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">What do you want to learn?</CardTitle>
              <CardDescription>Enter any concept, topic, or question you'd like explained</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={getExplanation} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="concept" className="text-base font-medium">Concept or Topic</Label>
                  <Input
                    id="concept"
                    data-testid="concept-input"
                    type="text"
                    placeholder="e.g., Explain photosynthesis, How does gravity work?"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    className="h-12 text-base rounded-lg border-2"
                  />
                </div>

                <Button
                  type="submit"
                  data-testid="explain-button"
                  disabled={loading}
                  className="w-full h-14 text-base rounded-full font-medium hover:-translate-y-1 transition-all duration-300 shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Explanation...
                    </>
                  ) : (
                    'Get Explanation'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {explanation && (
          <div className="space-y-6" data-testid="explanation-display">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">{explanation.concept}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {new Date(explanation.timestamp).toLocaleString()}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border/50">
              <CardContent className="pt-6">
                <div className="prose prose-lg max-w-none">
                  <div className="whitespace-pre-wrap text-foreground leading-relaxed" data-testid="explanation-content">
                    {explanation.explanation}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={reset}
              data-testid="new-concept-button"
              variant="outline"
              className="w-full h-14 text-base rounded-full font-medium hover:-translate-y-1 transition-all duration-300 border-2"
            >
              Learn Another Concept
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyBuddy;