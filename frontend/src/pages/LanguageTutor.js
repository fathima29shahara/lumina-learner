import React, { useState } from 'react';
import axios from 'axios';
import { Languages, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LanguageTutor = () => {
  const [phrase, setPhrase] = useState('');
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [loading, setLoading] = useState(false);
  const [translation, setTranslation] = useState(null);

  const languages = [
    'Spanish', 'French', 'German', 'Italian', 'Portuguese',
    'Chinese', 'Japanese', 'Korean', 'Arabic', 'Russian',
    'Hindi', 'English'
  ];

  const translatePhrase = async (e) => {
    e.preventDefault();
    if (!phrase.trim()) {
      toast.error('Please enter a phrase to translate');
      return;
    }

    setLoading(true);
    setTranslation(null);

    try {
      const response = await axios.post(`${API}/translate`, {
        phrase,
        source_lang: sourceLang,
        target_lang: targetLang,
      });
      setTranslation(response.data);
      toast.success('Translation complete!');
    } catch (error) {
      console.error('Error translating:', error);
      toast.error('Failed to translate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setTranslation(null);
    setPhrase('');
  };

  return (
    <div className="min-h-screen py-12 px-6" data-testid="language-tutor-page">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary rounded-full mb-6 border-2 border-primary">
            <Languages className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4" data-testid="language-tutor-title">
            Language Tutor
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Translate phrases and learn cultural context
          </p>
        </div>

        {!translation && (
          <Card className="bg-card border-border/50 shadow-lg" data-testid="translation-form-card">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Translate & Learn</CardTitle>
              <CardDescription>Enter a phrase or idiom to get translation with cultural context</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={translatePhrase} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sourceLang" className="text-base font-medium">From</Label>
                    <Select value={sourceLang} onValueChange={setSourceLang}>
                      <SelectTrigger className="h-12 text-base rounded-lg border-2" data-testid="source-lang-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang} value={lang} data-testid={`source-lang-${lang.toLowerCase()}`}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetLang" className="text-base font-medium">To</Label>
                    <Select value={targetLang} onValueChange={setTargetLang}>
                      <SelectTrigger className="h-12 text-base rounded-lg border-2" data-testid="target-lang-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang} value={lang} data-testid={`target-lang-${lang.toLowerCase()}`}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phrase" className="text-base font-medium">Phrase or Idiom</Label>
                  <Input
                    id="phrase"
                    data-testid="phrase-input"
                    type="text"
                    placeholder="e.g., Break a leg, It's raining cats and dogs"
                    value={phrase}
                    onChange={(e) => setPhrase(e.target.value)}
                    className="h-12 text-base rounded-lg border-2"
                  />
                </div>

                <Button
                  type="submit"
                  data-testid="translate-button"
                  disabled={loading}
                  className="w-full h-14 text-base rounded-full font-medium hover:-translate-y-1 transition-all duration-300 shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    'Translate & Explain'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {translation && (
          <div className="space-y-6" data-testid="translation-display">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardDescription className="text-sm uppercase tracking-wide mb-2">Original Phrase</CardDescription>
                <CardTitle className="font-serif text-2xl" data-testid="original-phrase">{translation.phrase}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="bg-secondary border-border/50">
              <CardHeader>
                <CardDescription className="text-sm uppercase tracking-wide mb-2">
                  Translation ({translation.target_lang})
                </CardDescription>
                <CardTitle className="font-serif text-3xl" data-testid="translated-phrase">{translation.translation}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="font-serif text-xl mb-4">Cultural Context</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-lg max-w-none">
                  <div className="whitespace-pre-wrap text-foreground leading-relaxed" data-testid="cultural-context">
                    {translation.cultural_context}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={reset}
              data-testid="new-translation-button"
              variant="outline"
              className="w-full h-14 text-base rounded-full font-medium hover:-translate-y-1 transition-all duration-300 border-2"
            >
              Translate Another Phrase
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageTutor;